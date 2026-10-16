"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/content/en";

type T = Dictionary["timer"];
type SoundId = keyof T["sounds"];
type Status = "idle" | "loading" | "running" | "paused" | "done";
type Settings = { minutes: number; rounds: number; inner: boolean; innerAt: number; outerSound: SoundId; innerSound: SoundId };

const SOUND_IDS: SoundId[] = ["gong", "bowl", "tingsha", "rin"];
const DEFAULTS: Settings = { minutes: 5, rounds: 6, inner: true, innerAt: 50, outerSound: "gong", innerSound: "tingsha" };
const PRESETS = [1, 3, 5, 10, 15];
const MAX_MINUTES = 90;
const MAX_ROUNDS = 60; // 0 = until stopped
const HORIZON = 15 * 60; // seconds of gongs scheduled ahead, so throttled background tabs keep ringing
const STORE = "gong-timer";

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

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return DEFAULTS;
    const s = { ...DEFAULTS, ...JSON.parse(raw) } as Settings;
    if (!SOUND_IDS.includes(s.outerSound)) s.outerSound = DEFAULTS.outerSound;
    if (!SOUND_IDS.includes(s.innerSound)) s.innerSound = DEFAULTS.innerSound;
    s.minutes = clamp(Math.round(s.minutes) || DEFAULTS.minutes, 1, MAX_MINUTES);
    s.rounds = clamp(Math.round(s.rounds) || 0, 0, MAX_ROUNDS);
    s.innerAt = clamp(Math.round(s.innerAt / 5) * 5 || 50, 5, 95);
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
  const sources = useRef(new Set<AudioBufferSourceNode>());
  const run = useRef({ start: 0, until: 0, settings: DEFAULTS });
  const timers = useRef<{ raf: number; tick: number }>({ raf: 0, tick: 0 });
  const wake = useRef<WakeLockSentinel | null>(null);
  const previewSrc = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => setS(loadSettings()), []);
  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(s));
    } catch {}
  }, [s]);

  const update = (patch: Partial<Settings>) => setS((prev) => ({ ...prev, ...patch }));

  const ctx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === "closed") ctxRef.current = new AudioContext();
    return ctxRef.current;
  }, []);

  const load = useCallback(
    async (ids: SoundId[]) => {
      const ac = ctx();
      await Promise.all(
        ids
          .filter((id) => !buffers.current.has(id))
          .map(async (id) => {
            const res = await fetch(`/sounds/${id}.mp3`);
            if (!res.ok) throw new Error(`sound ${id}: ${res.status}`);
            buffers.current.set(id, await ac.decodeAudioData(await res.arrayBuffer()));
          }),
      );
    },
    [ctx],
  );

  const play = useCallback((id: SoundId, when: number) => {
    const ac = ctxRef.current;
    const buf = buffers.current.get(id);
    if (!ac || !buf) return null;
    const src = ac.createBufferSource();
    src.buffer = buf;
    src.connect(ac.destination);
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
    const len = cfg.minutes * 60;
    const total = cfg.rounds ? cfg.rounds * len : Infinity;
    const end = Math.min(ac.currentTime - start + HORIZON, total);
    let t = run.current.until;
    while (t <= end) {
      const round = Math.floor(t / len + 1e-9);
      const offset = t - round * len;
      if (offset < 1e-6) {
        play(cfg.outerSound, start + t);
        if (t === total) break;
        t = cfg.inner ? t + (len * cfg.innerAt) / 100 : t + len;
      } else {
        play(cfg.innerSound, start + t);
        t = (round + 1) * len;
      }
    }
    run.current.until = t === total ? Infinity : t;
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
      const total = cfg.rounds ? cfg.rounds * cfg.minutes * 60 : Infinity;
      if (e >= total) {
        setElapsed(total);
        setStatus("done");
        stopLoops();
        releaseWake();
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
    setStatus("loading");
    previewSrc.current?.stop();
    stopSources();
    try {
      const ac = ctx();
      await ac.resume();
      await load([s.outerSound, s.innerSound]);
      run.current = { start: ac.currentTime + 0.15, until: 0, settings: s };
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
    stopLoops();
    releaseWake();
    setStatus("paused");
  }

  async function resume() {
    await ctxRef.current?.resume();
    setStatus("running");
    startLoops();
    holdWake();
  }

  function reset() {
    stopLoops();
    stopSources();
    releaseWake();
    ctxRef.current?.resume();
    setElapsed(0);
    setStatus("idle");
  }

  async function preview(id: SoundId) {
    if (status !== "idle" && status !== "done") return;
    try {
      const ac = ctx();
      await ac.resume();
      await load([id]);
      previewSrc.current?.stop();
      previewSrc.current = play(id, ac.currentTime);
    } catch {
      setError(true);
    }
  }

  // Re-take the wake lock when the page becomes visible again; clean up on unmount.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && status === "running") holdWake();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [status]);
  useEffect(
    () => () => {
      stopLoops();
      releaseWake();
      ctxRef.current?.close().catch(() => {});
    },
    [],
  );

  // What the dial shows: the live run's settings while active, the form otherwise.
  const active = status === "running" || status === "paused" || status === "done";
  const cfg = active ? run.current.settings : s;
  const len = cfg.minutes * 60;
  const totalRounds = cfg.rounds;
  const round = active ? Math.min(Math.floor(elapsed / len), totalRounds ? totalRounds - 1 : Infinity) : 0;
  const inRound = active ? elapsed - round * len : 0;
  const progress = status === "done" ? 1 : inRound / len;
  const innerSec = (len * cfg.innerAt) / 100;
  const nextInner = cfg.inner && inRound < innerSec;
  const isLast = totalRounds > 0 && round === totalRounds - 1;
  const nextLabel = nextInner ? t.nextInner : isLast ? t.nextEnd : t.nextRound;
  const nextIn = nextInner ? innerSec - inRound : len - inRound;
  const roundText = totalRounds
    ? t.roundOf.replace("{n}", String(round + 1)).replace("{total}", String(totalRounds))
    : t.round.replace("{n}", String(round + 1));
  const marker = point(cfg.innerAt / 100);
  const locked = status !== "idle" && status !== "done";

  return (
    <div className="gt">
      <div className="gt-dial">
        <svg viewBox="0 0 340 340" aria-hidden="true">
          <circle className="track" cx="170" cy="170" r={R} />
          <circle
            className="arc"
            cx="170"
            cy="170"
            r={R}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            transform="rotate(-90 170 170)"
          />
          <circle className="mark outer" cx="170" cy={170 - R} r="9" />
          {cfg.inner && <circle className="mark inner" cx={marker.x} cy={marker.y} r="6" />}
        </svg>
        <div className="gt-face">
          {status === "done" ? (
            <p className="gt-done">{t.done}</p>
          ) : (
            <>
              <div className="gt-time">{fmt(active ? len - inRound : len)}</div>
              <div className="gt-round">{active ? roundText : totalRounds ? t.roundsTotal.replace("{n}", String(totalRounds)) : t.endless}</div>
              {active && (
                <div className="gt-next">
                  {nextLabel} {fmt(nextIn)}
                </div>
              )}
              {!active && totalRounds > 0 && <div className="gt-next">{t.total} {fmt(totalRounds * len)}</div>}
            </>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {status === "done" ? t.done : active ? roundText : ""}
        </p>
      </div>

      <div className="gt-controls">
        {status === "idle" || status === "loading" ? (
          <button className="btn primary gt-go" type="button" onClick={start} disabled={status === "loading"}>
            {status === "loading" ? t.loading : t.start}
          </button>
        ) : status === "done" ? (
          <button className="btn primary gt-go" type="button" onClick={start}>
            {t.again}
          </button>
        ) : (
          <>
            <button className="btn primary gt-go" type="button" onClick={status === "running" ? pause : resume}>
              {status === "running" ? t.pause : t.resume}
            </button>
            <button className="btn" type="button" onClick={reset}>
              {t.stop}
            </button>
          </>
        )}
        {error && <p className="form-msg" role="alert">{t.error}</p>}
      </div>

      <form className="gt-panel" onSubmit={(e) => e.preventDefault()}>
        <fieldset disabled={locked}>
          <div className="gt-row">
            <span className="gt-label" id="gt-len">{t.length}</span>
            <div className="stepper" role="group" aria-labelledby="gt-len">
              <button type="button" aria-label={t.shorter} onClick={() => update({ minutes: clamp(s.minutes - 1, 1, MAX_MINUTES) })} disabled={s.minutes <= 1}>
                −
              </button>
              <output aria-live="polite">
                {s.minutes} <small>{t.min}</small>
              </output>
              <button type="button" aria-label={t.longer} onClick={() => update({ minutes: clamp(s.minutes + 1, 1, MAX_MINUTES) })} disabled={s.minutes >= MAX_MINUTES}>
                +
              </button>
            </div>
            <div className="chips" role="group" aria-label={t.presets}>
              {PRESETS.map((m) => (
                <button type="button" key={m} className="chip" aria-pressed={s.minutes === m} onClick={() => update({ minutes: m })}>
                  {m} {t.min}
                </button>
              ))}
            </div>
          </div>

          <div className="gt-row">
            <span className="gt-label" id="gt-rounds">{t.rounds}</span>
            <div className="stepper" role="group" aria-labelledby="gt-rounds">
              <button type="button" aria-label={t.fewer} onClick={() => update({ rounds: clamp((s.rounds || 1) - 1, 1, MAX_ROUNDS) })} disabled={s.rounds === 1}>
                −
              </button>
              <output aria-live="polite">{s.rounds || "∞"}</output>
              <button type="button" aria-label={t.more} onClick={() => update({ rounds: clamp(s.rounds + 1, 1, MAX_ROUNDS) })} disabled={s.rounds >= MAX_ROUNDS}>
                +
              </button>
            </div>
            <label className="check">
              <input type="checkbox" checked={s.rounds === 0} onChange={(e) => update({ rounds: e.target.checked ? 0 : DEFAULTS.rounds })} />
              {t.endless}
            </label>
          </div>

          <div className="gt-row">
            <label className="check gt-label">
              <input type="checkbox" checked={s.inner} onChange={(e) => update({ inner: e.target.checked })} />
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
                  {t.innerAtValue.replace("{time}", fmt((s.minutes * 60 * s.innerAt) / 100))}
                  {s.innerAt === 50 && ` · ${t.halfway}`}
                </span>
              </div>
            )}
          </div>

          <SoundPicker
            legend={t.outerSound}
            dot="outer"
            name="outer-sound"
            value={s.outerSound}
            names={t.sounds}
            onPick={(id) => {
              update({ outerSound: id });
              preview(id);
            }}
          />
          {s.inner && (
            <SoundPicker
              legend={t.innerSound}
              dot="inner"
              name="inner-sound"
              value={s.innerSound}
              names={t.sounds}
              onPick={(id) => {
                update({ innerSound: id });
                preview(id);
              }}
            />
          )}
          <p className="small">{t.hint}</p>
        </fieldset>
      </form>
    </div>
  );
}

function SoundPicker({
  legend,
  dot,
  name,
  value,
  names,
  onPick,
}: {
  legend: string;
  dot: "outer" | "inner";
  name: string;
  value: SoundId;
  names: T["sounds"];
  onPick: (id: SoundId) => void;
}) {
  return (
    <fieldset className="gt-row gt-sounds">
      <legend className="gt-label">
        <span className={`dot ${dot}`} aria-hidden="true" />
        {legend}
      </legend>
      <div className="chips">
        {SOUND_IDS.map((id) => (
          <label className="chip" key={id}>
            <input type="radio" name={name} value={id} checked={value === id} onChange={() => onPick(id)} onClick={() => value === id && onPick(id)} />
            {names[id]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
