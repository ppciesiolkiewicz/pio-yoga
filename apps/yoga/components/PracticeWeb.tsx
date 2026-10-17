// Seven practices on a ring, each joined to breath at the centre and to its neighbours.
// Decorative: the same content follows as a list, so the drawing is hidden from screen readers.
export default function PracticeWeb({ centre, labels }: { centre: string; labels: string[] }) {
  const c = 260;
  const r = 178;
  const pts = labels.map((_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / labels.length;
    return { x: c + r * Math.cos(a), y: c + r * Math.sin(a), a };
  });
  const ring = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <svg className="web" viewBox="0 0 520 520" aria-hidden="true">
      <circle className="web-pulse" cx={c} cy={c} r="78" />
      <polygon points={ring} fill="none" stroke="var(--line)" strokeWidth="1.5" />
      {pts.map((p, i) => (
        <line key={`s${i}`} x1={c} y1={c} x2={p.x} y2={p.y} stroke="var(--sun)" strokeWidth="1.5" strokeDasharray="3 6" />
      ))}
      <circle cx={c} cy={c} r="62" fill="var(--accent)" />
      <text x={c} y={c + 7} textAnchor="middle" className="web-centre">{centre}</text>
      {pts.map((p, i) => {
        const below = Math.sin(p.a) > 0.2;
        const lx = p.x + Math.cos(p.a) * 6;
        const ly = below ? p.y + 40 : p.y - 26;
        return (
          <g key={labels[i]}>
            <circle cx={p.x} cy={p.y} r="13" fill="var(--bg)" stroke="var(--accent)" strokeWidth="2.5" />
            <circle cx={p.x} cy={p.y} r="5" fill="var(--sun)" />
            <text x={lx} y={ly} textAnchor="middle" className="web-label">{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}
