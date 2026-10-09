import type { Dictionary } from "@/content/en";

export default function BreathCircle({ t }: { t: Dictionary["breath"] }) {
  return (
    <div className="breath">
      <svg viewBox="0 0 340 340" role="img" aria-label={t.label}>
        <circle cx="170" cy="170" r="160" fill="none" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="2 7" />
        <g className="orb">
          <circle cx="170" cy="170" r="160" fill="var(--sun-soft)" />
          <circle cx="170" cy="170" r="160" fill="none" stroke="var(--sun)" strokeWidth="2" />
        </g>
        <text className="lbl in" x="170" y="178" textAnchor="middle">{t.in}</text>
        <text className="lbl out" x="170" y="178" textAnchor="middle">{t.out}</text>
      </svg>
      <p>{t.note}</p>
    </div>
  );
}
