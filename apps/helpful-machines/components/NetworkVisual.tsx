/** Decorative "connecting the dots" node graphic for the hero's right column. Purely visual. */
export function NetworkVisual() {
  const nodes = [
    { id: "hub", x: 200, y: 200, r: 20 },
    { id: "a", x: 70, y: 110, r: 11 },
    { id: "b", x: 230, y: 50, r: 14 },
    { id: "c", x: 350, y: 130, r: 9 },
    { id: "d", x: 110, y: 270, r: 10 },
    { id: "e", x: 270, y: 310, r: 13 },
    { id: "f", x: 360, y: 250, r: 8 },
    { id: "g", x: 40, y: 320, r: 7 },
  ] as const;
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges: [string, string][] = [
    ["hub", "a"],
    ["hub", "b"],
    ["hub", "c"],
    ["hub", "d"],
    ["hub", "e"],
    ["hub", "f"],
    ["a", "d"],
    ["b", "c"],
    ["e", "f"],
    ["d", "g"],
  ];

  return (
    <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-md [perspective:1200px]">
      <div className="absolute inset-8 rounded-full bg-accent/20 blur-3xl" />
      <div className="hm-glass absolute inset-12 rounded-full" />
      <svg
        viewBox="0 0 400 400"
        className="relative h-full w-full [transform:rotateX(8deg)_rotateY(-14deg)] drop-shadow-[0_30px_40px_rgba(0,0,0,0.25)]"
      >
        <defs>
          <linearGradient id="nv-node" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--highlight)" />
            <stop offset="55%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-text)" />
          </linearGradient>
          <radialGradient id="nv-hub" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="var(--highlight)" />
            <stop offset="50%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-text)" />
          </radialGradient>
        </defs>

        {edges.map(([from, to]) => {
          const a = byId[from as keyof typeof byId];
          const b = byId[to as keyof typeof byId];
          return <line key={`${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--line)" strokeOpacity="0.25" strokeWidth="1.5" />;
        })}

        {nodes.map((n) => (
          <circle
            key={n.id}
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={n.id === "hub" ? "url(#nv-hub)" : "url(#nv-node)"}
            stroke="var(--bg)"
            strokeWidth="2"
          />
        ))}
      </svg>
    </div>
  );
}
