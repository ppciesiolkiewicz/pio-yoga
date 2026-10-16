import { Fragment } from "react";
import type { BlockType, Item, Part, Pose, Round, Step, Tag } from "@/content/flows";
import { getPiece, isUse } from "@/content/flows";

const TYPE_LABEL: Record<BlockType, string> = {
  arrive: "Arrive",
  warmup: "Warm-up",
  sun: "Sun salutations",
  drill: "Drill",
  flow: "Flow",
  core: "Core",
  peak: "Peak",
  release: "Release",
  cooldown: "Cool-down",
  rest: "Rest",
  closing: "Closing",
};

const TAG_LABEL: Record<Tag, string> = {
  optional: "optional",
  dynamic: "dynamic",
  peak: "peak",
  unsure: "?",
};

const key = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function names(items: Item[]): string[] {
  return items.flatMap((i) => (typeof i === "string" ? [key(i)] : "group" in i ? names(i.group) : [key(i.n)]));
}

/** Renders "a → b → c" with styled arrows. */
export function Text({ s }: { s: string }) {
  const parts = s.split("→");
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="arr" aria-label="then">→</span>}
          {p.trim()}
        </Fragment>
      ))}
    </>
  );
}

function Tags({ tags }: { tags?: Tag[] }) {
  if (!tags?.length) return null;
  return (
    <>
      {tags.map((t) => (
        <span
          key={t}
          className={`tag tag-${t}`}
          title={t === "unsure" ? "Check this: I wasn't sure of the handwriting" : undefined}
        >
          {TAG_LABEL[t]}
        </span>
      ))}
    </>
  );
}

function ItemList({ items, prev }: { items: Item[]; prev?: Set<string> | null }) {
  return (
    <ul className="items">
      {items.map((it, i) => (
        <ItemRow key={i} item={it} prev={prev} />
      ))}
    </ul>
  );
}

function ItemRow({ item, prev }: { item: Item; prev?: Set<string> | null }) {
  if (typeof item !== "string" && "group" in item) {
    const bracket = Boolean(item.label) || !item.title;
    return (
      <li className={bracket ? "grp grp-bracket" : "grp"}>
        {item.title && <span className="grp-title">{item.title}</span>}
        <ItemList items={item.group} prev={prev} />
        {item.label && <span className="grp-label">{item.label}</span>}
      </li>
    );
  }
  const pose: Pose = typeof item === "string" ? { n: item } : item;
  const state = prev ? (prev.has(key(pose.n)) ? "repeat" : "new") : "";
  return (
    <li className={`pose ${state}`}>
      <span className="dot" aria-hidden="true" />
      <span className="pbody">
        <span className="nm">
          <Text s={pose.n} />
          {state === "new" && <span className="sr-only"> (new this round)</span>}
        </span>
        <Tags tags={pose.tags} />
        {pose.note && <span className="pnote">{pose.note}</span>}
      </span>
    </li>
  );
}

function Stairs({ step, total }: { step: number; total: number }) {
  const w = 6;
  const gap = 2;
  const h = 14;
  return (
    <svg
      className="stairs"
      width={total * (w + gap)}
      height={h}
      viewBox={`0 0 ${total * (w + gap)} ${h}`}
      aria-hidden="true"
    >
      {Array.from({ length: total }, (_, i) => {
        const bh = ((i + 1) / total) * h;
        return (
          <rect
            key={i}
            x={i * (w + gap)}
            y={h - bh}
            width={w}
            height={bh}
            rx={1.5}
            fill={i < step ? "var(--tone)" : "var(--line)"}
          />
        );
      })}
    </svg>
  );
}

function Ladder({ rounds }: { rounds: Round[] }) {
  let prev: Set<string> | null = null;
  return (
    <div className="ladder">
      {rounds.map((r, i) => {
        const cur = new Set(names(r.items));
        const before: Set<string> | null = prev;
        const shares = before !== null && [...cur].some((n) => before.has(n));
        prev = cur;
        return (
          <section className="round" key={i} aria-label={`Round ${i + 1}`}>
            <header className="round-head">
              <Stairs step={i + 1} total={rounds.length} />
              <span>Round {i + 1}</span>
            </header>
            {r.note && <p className="bnote">{r.note}</p>}
            <ItemList items={r.items} prev={shares ? before : null} />
            {r.after && (
              <p className="after">
                <Text s={r.after} />
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

export function StepView({ step }: { step: Step }) {
  if (step.kind === "vinyasa") {
    return (
      <div className="vin">
        <span className="vin-chip">Vinyasa</span>
        {step.note && (
          <span className="vin-note">
            <Text s={step.note} />
          </span>
        )}
      </div>
    );
  }
  if (step.kind === "words") {
    return (
      <div className="blk" data-type="closing">
        <div className="blk-head">
          <span className="type">{TYPE_LABEL.closing}</span>
        </div>
        <blockquote className="words">
          {step.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </blockquote>
      </div>
    );
  }
  if (step.kind === "ladder") {
    return (
      <div className="blk blk-ladder" data-type="ladder">
        <div className="blk-head">
          <span className="type">Ladder · {step.rounds.length} rounds</span>
          <h4>{step.title}</h4>
        </div>
        {step.note && <p className="bnote">{step.note}</p>}
        <Ladder rounds={step.rounds} />
      </div>
    );
  }
  return (
    <div className="blk" data-type={step.type}>
      <div className="blk-head">
        <span className="type">{TYPE_LABEL[step.type]}</span>
        {step.title && <h4>{step.title}</h4>}
      </div>
      {step.note && <p className="bnote">{step.note}</p>}
      <ItemList items={step.items} />
    </div>
  );
}

/** The role colour of a class part (used for its dot on the timeline). */
export function partType(part: Part): string {
  const step = isUse(part) ? getPiece(part.use).steps[0] : part;
  if (!step) return "flow";
  if (step.kind === "block") return step.type;
  if (step.kind === "words") return "closing";
  return step.kind;
}

// --- phases: every class runs Arrive → Warm up → Build → Peak → Close ------------
export type Phase = "arrive" | "warm" | "build" | "peak" | "close";
export const PHASES: Phase[] = ["arrive", "warm", "build", "peak", "close"];
export const PHASE_LABEL: Record<Phase, string> = {
  arrive: "Arrive",
  warm: "Warm up",
  build: "Build",
  peak: "Peak",
  close: "Close",
};

/** Phase of a step type; null means "stays in the phase before it" (vinyasa, drills, mid-class release). */
function phaseOf(type: string): Phase | null {
  switch (type) {
    case "arrive":
      return "arrive";
    case "warmup":
    case "sun":
      return "warm";
    case "flow":
    case "ladder":
    case "core":
      return "build";
    case "peak":
      return "peak";
    case "cooldown":
    case "rest":
    case "closing":
      return "close";
    default:
      return null;
  }
}

export type NumberedPart = { part: Part; n: number | null; type: string; phase: Phase };
export type PhaseGroup = { phase: Phase; items: NumberedPart[] };

/** Splits a class into consecutive phase groups and numbers every part except vinyasas. */
export function groupByPhase(parts: Part[]): PhaseGroup[] {
  const groups: PhaseGroup[] = [];
  let n = 0;
  for (const part of parts) {
    const type = partType(part);
    const last = groups[groups.length - 1];
    const phase = phaseOf(type) ?? last?.phase ?? "warm";
    const item: NumberedPart = { part, n: type === "vinyasa" ? null : ++n, type, phase };
    if (last && last.phase === phase) last.items.push(item);
    else groups.push({ phase, items: [item] });
  }
  return groups;
}

/** A class part: either an inline step, or a building block shown in place with a link to the library. */
export function PartView({ part }: { part: Part }) {
  if (!isUse(part)) return <StepView step={part} />;
  const piece = getPiece(part.use);
  return (
    <div className="uses">
      <a className="uses-link" href={`#block-${piece.id}`}>
        <span aria-hidden="true">◇</span> Building block: {piece.title}
      </a>
      {part.note && <p className="bnote">{part.note}</p>}
      {piece.steps.map((s, i) => (
        <StepView key={i} step={s} />
      ))}
    </div>
  );
}
