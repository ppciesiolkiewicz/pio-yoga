"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/content/en";

type T = Dictionary["timer"];
type Status = "idle" | "loading" | "running" | "paused" | "done";
type Settings = {
  minutes: number;
  rounds: number;
  inner: boolean;
  innerAt: number;
  /** Seconds of silence between rounds. The inner gong is placed within the round only. */
  rest: number;
};

// Fixed sounds (files in public/sounds): a round starts with BEGIN, the inner gong is INNER,
// and END closes a round before a break and at the finish. With no break, the next BEGIN
// stands in for END so two gongs never ring at once.
const BEGIN = "gong";
const INNER = "deepBowl";
const END = "bowl";
type SoundId = typeof BEGIN | typeof INNER | typeof END;
const SOUND_IDS: SoundId[] = [BEGIN, INNER, END];

const DEFAULTS: Settings = {
  minutes: 5,
  rounds: 0,
  inner: true,
  innerAt: 50,
  rest: 0,
};
const PRESETS = [1, 3, 5, 10, 15, 30];
const MAX_MINUTES = 90;
const MAX_ROUNDS = 60; // 0 = until stopped
const MAX_REST = 600;
const REST_STEP = 5;
const HORIZON = 15 * 60; // seconds of gongs scheduled ahead, so throttled background tabs keep ringing
const STORE = "gong-timer-v3";

const R = 150;
const C = 2 * Math.PI * R;

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function fmt(seconds: number) {
  const s = Math.max(0, Math.ceil(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

function point(fraction: number) {
  const a = fraction * 2 * Math.PI - Math.PI / 2;
  return { x: 170 + R * Math.cos(a), y: 170 + R * Math.sin(a) };
}

/** The gongs of round `k` (0-based), in seconds from the start of the run. */
function roundGongs(cfg: Settings, k: number) {
  const len = cfg.minutes * 60;
  const base = k * (len + cfg.rest);
  const last = cfg.rounds > 0 && k === cfg.rounds - 1;
  const gongs: { t: number; id: SoundId }[] = [{ t: base, id: BEGIN }];
  if (cfg.inner) gongs.push({ t: base + (len * cfg.innerAt) / 100, id: INNER });
  if (cfg.rest > 0 || last) gongs.push({ t: base + len, id: END });
  return gongs;
}

/** Seconds from the first gong to the last; Infinity until stopped. */
function totalLength(cfg: Settings) {
  return cfg.rounds
    ? cfg.rounds * (cfg.minutes * 60 + cfg.rest) - cfg.rest
    : Infinity;
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return DEFAULTS;
    const s = { ...DEFAULTS, ...JSON.parse(raw) } as Settings;
    s.minutes = clamp(
      Math.round(s.minutes) || DEFAULTS.minutes,
      1,
      MAX_MINUTES,
    );
    s.rounds = clamp(Math.round(s.rounds) || 0, 0, MAX_ROUNDS);
    s.innerAt = clamp(Math.round(s.innerAt / 5) * 5 || 50, 5, 95);
    s.rest = clamp(Math.round(s.rest) || 0, 0, MAX_REST);
    return s;
  } catch {
    return DEFAULTS;
  }
}

export default function GongTimer({ t }: { t: T }) {
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const buffers = useRef(new Map<SoundId, AudioBuffer>());
  const pending = useRef(new Map<SoundId, Promise<void>>());
  const sources = useRef(new Set<AudioBufferSourceNode>());
  // `k`/`i`: the next gong to schedule (round, index within roundGongs).
  const run = useRef({ start: 0, k: 0, i: 0, settings: DEFAULTS });
  const timers = useRef<{ raf: number; tick: number }>({ raf: 0, tick: 0 });
  const wake = useRef<WakeLockSentinel | null>(null);
  // Audio goes out through a hidden <audio> element: mobile browsers keep media elements
  // playing with the screen locked, but suspend a bare AudioContext.
  const out = useRef<AudioNode | null>(null);
  const media = useRef<HTMLAudioElement | null>(null);

  useEffect(() => setS(loadSettings()), []);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(s));
    } catch {}
  }, [s]);

  const update = (patch: Partial<Settings>) =>
    setS((prev) => ({ ...prev, ...patch }));

  const ctx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      const ac = new AudioContext();
      ctxRef.current = ac;
      out.current = ac.destination;
      media.current = null;
      try {
        const dest = ac.createMediaStreamDestination();
        const el = new Audio();
        el.srcObject = dest.stream;
        out.current = dest;
        media.current = el;
      } catch {}
    }
    return ctxRef.current;
  }, []);

  /** Resume audio output; call from a user gesture. Falls back to direct output if the media element is refused. */
  const wakeAudio = useCallback(async () => {
    const ac = ctx();
    try {
      (
        navigator as Navigator & { audioSession?: { type: string } }
      ).audioSession!.type = "playback";
    } catch {}
    await ac.resume();
    if (media.current) {
      try {
        await media.current.play();
      } catch {
        media.current = null;
        out.current = ac.destination;
      }
    }
    return ac;
  }, [ctx]);

  const load = useCallback(
    async (ids: SoundId[]) => {
      const ac = ctx();
      await Promise.all(
        ids
          .filter((id) => !buffers.current.has(id))
          .map((id) => {
            let p = pending.current.get(id);
            if (!p) {
              p = (async () => {
                const res = await fetch(`/sounds/${id}.mp3`);
                if (!res.ok) throw new Error(`sound ${id}: ${res.status}`);
                buffers.current.set(
                  id,
                  await ac.decodeAudioData(await res.arrayBuffer()),
                );
              })();
              // A failed load can be retried by the next caller.
              p.catch(() => pending.current.delete(id));
              pending.current.set(id, p);
            }
            return p;
          }),
      );
    },
    [ctx],
  );

  // Load every sound in the background once the page has finished loading, so Start and the
  // sound previews respond instantly. The audio context starts suspended until the first tap,
  // which is allowed; decoding works without it running. Errors stay quiet here and surface
  // only if Start or a preview still can't load a sound.
  useEffect(() => {
    let cancelled = false;
    let idle = 0;
    const run = () => {
      if (cancelled) return;
      load(SOUND_IDS).catch(() => {});
    };
    const schedule = () => {
      idle =
        typeof window.requestIdleCallback === "function"
          ? window.requestIdleCallback(run, { timeout: 2000 })
          : window.setTimeout(run, 200);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (typeof window.cancelIdleCallback === "function")
        window.cancelIdleCallback(idle);
      clearTimeout(idle);
    };
  }, [load]);

  const play = useCallback((id: SoundId, when: number) => {
    const ac = ctxRef.current;
    const buf = buffers.current.get(id);
    if (!ac || !buf) return null;
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.connect(out.current ?? ac.destination);
    src.onended = () => sources.current.delete(src);
    src.start(when);
    sources.current.add(src);
    return src;
  }, []);

  /** Schedule every gong up to `horizon` seconds ahead of the audio clock. */
  const schedule = useCallback(() => {
    const ac = ctxRef.current;
    if (!ac) return;
    const { start, settings: cfg } = run.current;
    const end = ac.currentTime - start + HORIZON;
    let { k, i } = run.current;
    while (!cfg.rounds || k < cfg.rounds) {
      const gongs = roundGongs(cfg, k);
      if (i >= gongs.length) {
        k++;
        i = 0;
        continue;
      }
      if (gongs[i].t > end) break;
      play(gongs[i].id, start + gongs[i].t);
      i++;
    }
    run.current.k = k;
    run.current.i = i;
  }, [play]);

  const stopSources = () => {
    for (const src of sources.current) {
      try {
        src.stop();
      } catch {}
    }
    sources.current.clear();
  };

  const releaseWake = () => {
    wake.current?.release().catch(() => {});
    wake.current = null;
  };
  const holdWake = async () => {
    try {
      wake.current = (await navigator.wakeLock?.request("screen")) ?? null;
    } catch {}
  };

  const stopLoops = () => {
    cancelAnimationFrame(timers.current.raf);
    clearInterval(timers.current.tick);
  };

  const startLoops = useCallback(() => {
    stopLoops();
    const frame = () => {
      const ac = ctxRef.current;
      if (!ac) return;
      const { start, settings: cfg } = run.current;
      const e = Math.max(0, ac.currentTime - start);
      const total = totalLength(cfg);
      if (e >= total) {
        setElapsed(total);
        setStatus("done");
        stopLoops();
        releaseWake();
        // Let the final gong ring out before releasing the media element.
        const finished = run.current;
        setTimeout(
          () => run.current === finished && media.current?.pause(),
          15000,
        );
        return;
      }
      setElapsed(e);
      timers.current.raf = requestAnimationFrame(frame);
    };
    timers.current.raf = requestAnimationFrame(frame);
    timers.current.tick = window.setInterval(schedule, 1000);
  }, [schedule]);

  async function start() {
    setError(false);
    // Usually the background preload has finished; only show "Loading sounds…" if it hasn't.
    if (!SOUND_IDS.every((id) => buffers.current.has(id))) setStatus("loading");
    stopSources();
    try {
      const ac = await wakeAudio();
      await load(SOUND_IDS);
      run.current = { start: ac.currentTime + 0.15, k: 0, i: 0, settings: s };
      schedule();
      setElapsed(0);
      setStatus("running");
      startLoops();
      holdWake();
    } catch {
      setError(true);
      setStatus("idle");
    }
  }

  async function pause() {
    await ctxRef.current?.suspend();
    media.current?.pause();
    stopLoops();
    releaseWake();
    setStatus("paused");
  }

  async function resume() {
    await wakeAudio();
    setStatus("running");
    startLoops();
    holdWake();
  }

  function reset() {
    stopLoops();
    stopSources();
    releaseWake();
    media.current?.pause();
    ctxRef.current?.resume();
    setElapsed(0);
    setStatus("idle");
  }

  // Back in view: re-take the wake lock, restart audio if the system suspended it, and
  // top up the schedule (background intervals may have been throttled).
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== "visible" || status !== "running")
        return;
      holdWake();
      const ac = ctxRef.current;
      if (ac && ac.state !== "running") ac.resume().catch(() => {});
      media.current?.play().catch(() => {});
      schedule();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [status, schedule]);
  useEffect(
    () => () => {
      stopLoops();
      releaseWake();
      media.current?.pause();
      ctxRef.current?.close().catch(() => {});
    },
    [],
  );

  // What the dial shows: the live run's settings while active, the form otherwise.
  const active =
    status === "running" || status === "paused" || status === "done";
  const cfg = active ? run.current.settings : s;
  const len = cfg.minutes * 60;
  const cycle = len + cfg.rest;
  const totalRounds = cfg.rounds;
  const round = active
    ? Math.min(
        Math.floor(elapsed / cycle),
        totalRounds ? totalRounds - 1 : Infinity,
      )
    : 0;
  const inRound = active ? elapsed - round * cycle : 0;
  const resting = status !== "done" && inRound >= len;
  const progress =
    status === "done" ? 1 : resting ? 1 - (inRound - len) / cfg.rest : inRound / len;
  const innerSec = (len * cfg.innerAt) / 100;
  const nextInner = cfg.inner && inRound < innerSec;
  const isLast = totalRounds > 0 && round === totalRounds - 1;
  const nextLabel = nextInner
    ? t.nextInner
    : isLast
      ? t.nextEnd
      : cfg.rest
        ? t.nextBreak
        : t.nextRound;
  const nextIn = nextInner ? innerSec - inRound : len - inRound;
  const roundText = totalRounds
    ? t.roundOf
        .replace("{n}", String(round + 1))
        .replace("{total}", String(totalRounds))
    : t.round.replace("{n}", String(round + 1));
  const marker = point(cfg.innerAt / 100);
  const locked = status !== "idle" && status !== "done";

  return (
    <div className="gt">
      <div className="gt-dial">
        <svg viewBox="0 0 340 340" aria-hidden="true">
          <circle className="track" cx="170" cy="170" r={R} />
          <circle
            className={resting ? "arc rest" : "arc"}
            cx="170"
            cy="170"
            r={R}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            transform="rotate(-90 170 170)"
          />
          <circle className="mark outer" cx="170" cy={170 - R} r="9" />
          {cfg.inner && (
            <circle className="mark inner" cx={marker.x} cy={marker.y} r="6" />
          )}
        </svg>
        <div className="gt-face">
          {status === "done" ? (
            <p className="gt-done">{t.done}</p>
          ) : (
            <>
              <div className="gt-time">
                {fmt(active ? (resting ? cycle - inRound : len - inRound) : len)}
              </div>
              <div className="gt-round">
                {resting
                  ? t.inBreak
                  : active
                  ? roundText
                  : totalRounds
                    ? t.roundsTotal.replace("{n}", String(totalRounds))
                    : t.endless}
              </div>
              {active && !resting && (
                <div className="gt-next">
                  {nextLabel} {fmt(nextIn)}
                </div>
              )}
              {!active && totalRounds > 0 && (
                <div className="gt-next">
                  {t.total} {fmt(totalLength(cfg))}
                </div>
              )}
            </>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {status === "done"
            ? t.done
            : resting
              ? t.inBreak
              : active
                ? roundText
                : ""}
        </p>
      </div>

      <div className="gt-controls">
        {status === "idle" || status === "loading" ? (
          <button
            className="btn primary gt-go"
            type="button"
            onClick={start}
            disabled={status === "loading"}
          >
            {status === "loading" ? t.loading : t.start}
          </button>
        ) : status === "done" ? (
          <button className="btn primary gt-go" type="button" onClick={start}>
            {t.again}
          </button>
        ) : (
          <>
            <button
              className="btn primary gt-go"
              type="button"
              onClick={status === "running" ? pause : resume}
            >
              {status === "running" ? t.pause : t.resume}
            </button>
            <button className="btn" type="button" onClick={reset}>
              {t.stop}
            </button>
          </>
        )}
        {error && (
          <p className="form-msg" role="alert">
            {t.error}
          </p>
        )}
      </div>

      <form className="gt-panel" onSubmit={(e) => e.preventDefault()}>
        <fieldset disabled={locked}>
          <div className="gt-row">
            <span className="gt-label" id="gt-len">
              {t.length}
            </span>
            <div className="stepper" role="group" aria-labelledby="gt-len">
              <button
                type="button"
                aria-label={t.shorter}
                onClick={() =>
                  update({ minutes: clamp(s.minutes - 1, 1, MAX_MINUTES) })
                }
                disabled={s.minutes <= 1}
              >
                −
              </button>
              <NumberField
                label={t.length}
                value={s.minutes}
                min={1}
                max={MAX_MINUTES}
                unit={t.min}
                onCommit={(minutes) => update({ minutes })}
              />
              <button
                type="button"
                aria-label={t.longer}
                onClick={() =>
                  update({ minutes: clamp(s.minutes + 1, 1, MAX_MINUTES) })
                }
                disabled={s.minutes >= MAX_MINUTES}
              >
                +
              </button>
            </div>
            <div className="chips" role="group" aria-label={t.presets}>
              {PRESETS.map((m) => (
                <button
                  type="button"
                  key={m}
                  className="chip"
                  aria-pressed={s.minutes === m}
                  onClick={() => update({ minutes: m })}
                >
                  {m} {t.min}
                </button>
              ))}
            </div>
          </div>

          <div className="gt-row">
            <span className="gt-label" id="gt-rounds">
              {t.rounds}
            </span>
            <div className="stepper" role="group" aria-labelledby="gt-rounds">
              <button
                type="button"
                aria-label={t.fewer}
                onClick={() =>
                  update({ rounds: clamp((s.rounds || 1) - 1, 1, MAX_ROUNDS) })
                }
                disabled={s.rounds === 1}
              >
                −
              </button>
              <NumberField
                label={t.rounds}
                value={s.rounds}
                min={1}
                max={MAX_ROUNDS}
                empty="∞"
                onCommit={(rounds) => update({ rounds })}
              />
              <button
                type="button"
                aria-label={t.more}
                onClick={() =>
                  update({ rounds: clamp(s.rounds + 1, 1, MAX_ROUNDS) })
                }
                disabled={s.rounds >= MAX_ROUNDS}
              >
                +
              </button>
            </div>
            <label className="check">
              <input
                type="checkbox"
                checked={s.rounds === 0}
                onChange={(e) =>
                  update({ rounds: e.target.checked ? 0 : DEFAULTS.rounds })
                }
              />
              {t.endless}
            </label>
          </div>

          <div className="gt-row">
            <label className="check gt-label">
              <input
                type="checkbox"
                checked={s.inner}
                onChange={(e) => update({ inner: e.target.checked })}
              />
              {t.inner}
            </label>
            {s.inner && (
              <div className="gt-range">
                <input
                  type="range"
                  min={5}
                  max={95}
                  step={5}
                  value={s.innerAt}
                  aria-label={t.innerAt}
                  aria-valuetext={`${fmt((s.minutes * 60 * s.innerAt) / 100)} (${s.innerAt}%)`}
                  onChange={(e) => update({ innerAt: Number(e.target.value) })}
                />
                <span>
                  {t.innerAtValue.replace(
                    "{time}",
                    fmt((s.minutes * 60 * s.innerAt) / 100),
                  )}
                  {s.innerAt === 50 && ` · ${t.halfway}`}
                </span>
              </div>
            )}
          </div>

          <div className="gt-row">
            <span className="gt-label" id="gt-rest">
              {t.rest}
            </span>
            <div className="stepper" role="group" aria-labelledby="gt-rest">
              <button
                type="button"
                aria-label={t.restShorter}
                onClick={() =>
                  update({ rest: clamp(s.rest - REST_STEP, 0, MAX_REST) })
                }
                disabled={s.rest <= 0}
              >
                −
              </button>
              <NumberField
                label={t.rest}
                value={s.rest}
                min={0}
                max={MAX_REST}
                unit={t.sec}
                onCommit={(rest) => update({ rest })}
              />
              <button
                type="button"
                aria-label={t.restLonger}
                onClick={() =>
                  update({ rest: clamp(s.rest + REST_STEP, 0, MAX_REST) })
                }
                disabled={s.rest >= MAX_REST}
              >
                +
              </button>
            </div>
          </div>

          <p className="small">{t.hint}</p>
        </fieldset>
      </form>
    </div>
  );
}

/** A number you can type straight into. Commits on blur or Enter, clamped to min–max; Escape cancels.
 *  With `empty`, a value of 0 shows that placeholder (∞ for "until I stop"). */
function NumberField({
  label,
  value,
  min,
  max,
  unit,
  empty,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  empty?: string;
  onCommit: (n: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (empty && value === 0 ? "" : String(value));
  const commit = () => {
    if (draft === null) return;
    const n = parseInt(draft, 10);
    if (!Number.isNaN(n)) onCommit(clamp(n, min, max));
    setDraft(null);
  };
  return (
    <label className="num">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        enterKeyHint="done"
        autoComplete="off"
        aria-label={label}
        value={shown}
        placeholder={empty}
        size={String(max).length}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) =>
          setDraft(
            e.target.value.replace(/\D/g, "").slice(0, String(max).length),
          )
        }
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          } else if (e.key === "Escape") {
            setDraft(null);
            e.currentTarget.blur();
          }
        }}
      />
      {unit && <small>{unit}</small>}
    </label>
  );
}
