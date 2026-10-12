type Labels = { idea: string; market: string; users: string; data: string; tech: string; product: string };

/** Decorative: scattered dots joined into one path that ends at the product. */
export function ConnectDots({ labels }: { labels: Labels }) {
  return (
    <svg className="tg-dots h-auto w-full max-w-md" viewBox="0 0 240 200" aria-hidden="true" focusable="false">
      <g stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" fill="none">
        <path d="M30 40 L95 70 M40 150 L95 70 M95 70 L150 120 M120 25 L150 120 M60 105 L150 120" />
      </g>
      <path className="tg-path" pathLength={1} d="M30 40 L95 70 L150 120 L215 150" stroke="var(--accent)" strokeWidth="2" fill="none" />
      <g fill="var(--bg)" stroke="var(--ink)" strokeWidth="1.4">
        <circle cx="30" cy="40" r="6" />
        <circle cx="40" cy="150" r="5" />
        <circle cx="120" cy="25" r="5" />
        <circle cx="60" cy="105" r="4" />
        <circle cx="95" cy="70" r="6" />
        <circle cx="150" cy="120" r="6" />
      </g>
      <circle cx="215" cy="150" r="11" fill="var(--accent)" />
      <g fontSize="9" fill="var(--muted)" fontFamily="var(--font-mono-family), ui-monospace, monospace">
        <text x="18" y="28">{labels.idea}</text>
        <text x="104" y="16">{labels.market}</text>
        <text x="20" y="168">{labels.users}</text>
        <text x="66" y="100">{labels.data}</text>
        <text x="160" y="112">{labels.tech}</text>
        <text x="186" y="178">{labels.product}</text>
      </g>
    </svg>
  );
}
