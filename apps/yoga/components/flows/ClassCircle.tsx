import type { PhaseGroup } from "./FlowParts";
import { PHASE_LABEL } from "./FlowParts";

type Props = {
  slug: string;
  groups: PhaseGroup[];
  variant?: "full" | "mini";
  centre?: [string, string?];
};

/**
 * A class drawn as a circle: one dot per part, clockwise from the gong at the top,
 * on arcs coloured by phase. In the full version every dot links to its step.
 */
export default function ClassCircle({ slug, groups, variant = "full", centre }: Props) {
  const full = variant === "full";
  const size = full ? 260 : 72;
  const c = size / 2;
  const R = full ? 98 : 27;
  const dotR = full ? 11 : 3.4;
  const gap = full ? 38 : 44; // degrees left open at the top for the gong

  const dots = groups.flatMap((g) => g.items.filter((i) => i.n !== null).map((i) => ({ ...i, phase: g.phase })));
  const count = dots.length;
  const step = count > 1 ? (360 - gap) / (count - 1) : 0;
  const angleOf = (i: number) => -90 + gap / 2 + i * step;
  const pt = (deg: number, r = R) => {
    const a = (deg * Math.PI) / 180;
    return [c + r * Math.cos(a), c + r * Math.sin(a)] as const;
  };
  const arc = (a1: number, a2: number) => {
    const [x1, y1] = pt(a1);
    const [x2, y2] = pt(a2);
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${a2 - a1 > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };

  // one arc per consecutive phase run, padded towards its neighbours
  const runs: { phase: string; from: number; to: number }[] = [];
  dots.forEach((d, i) => {
    const last = runs[runs.length - 1];
    if (last && last.phase === d.phase) last.to = i;
    else runs.push({ phase: d.phase, from: i, to: i });
  });
  const pad = Math.min(step * 0.38, 10);

  const label = `${count} parts: ${groups.map((g) => PHASE_LABEL[g.phase]).join(", ")}`;
  const [gx, gy] = pt(-90);

  return (
    <svg
      className={full ? "circle" : "circle circle-mini"}
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={label}
    >
      <circle cx={c} cy={c} r={R} fill="none" stroke="var(--line)" strokeWidth={full ? 1.5 : 1} />
      {runs.map((r, i) => (
        <path
          key={i}
          d={arc(angleOf(r.from) - pad, angleOf(r.to) + pad)}
          fill="none"
          stroke="var(--ph)"
          data-phase={r.phase}
          strokeWidth={full ? 5 : 3}
          strokeLinecap="round"
        />
      ))}

      {/* the gong: where class starts and ends */}
      <circle cx={gx} cy={gy} r={full ? 12 : 5} fill="none" stroke="var(--sun)" strokeWidth={full ? 1.5 : 1.2} />
      <circle cx={gx} cy={gy} r={full ? 6.5 : 2.4} fill="var(--sun)" />

      {dots.map((d, i) => {
        const [x, y] = pt(angleOf(i));
        if (!full) return <circle key={i} cx={x} cy={y} r={dotR} fill="var(--ph)" data-phase={d.phase} />;
        return (
          <a key={i} href={`#${slug}-${d.n}`} data-phase={d.phase} className="circle-dot">
            <title>{`${d.n} · ${PHASE_LABEL[d.phase]}`}</title>
            <circle cx={x} cy={y} r={dotR} fill="var(--bg)" stroke="var(--ph)" strokeWidth={2.5} />
            <text x={x} y={y} dy="0.35em" textAnchor="middle" className="circle-num">
              {d.n}
            </text>
          </a>
        );
      })}

      {full && (
        <>
          <text x={c} y={gy + 30} textAnchor="middle" className="circle-gong">
            gong
          </text>
          {centre && (
            <>
              <text x={c} y={c - 2} textAnchor="middle" className="circle-big">
                {centre[0]}
              </text>
              {centre[1] && (
                <text x={c} y={c + 20} textAnchor="middle" className="circle-small">
                  {centre[1]}
                </text>
              )}
            </>
          )}
        </>
      )}
    </svg>
  );
}
