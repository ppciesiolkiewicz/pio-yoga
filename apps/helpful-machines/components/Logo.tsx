export function Logo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="hm-logo-metal" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--highlight)" />
          <stop offset="45%" stopColor="var(--accent)" />
          <stop offset="100%" stopColor="var(--accent-text)" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="7" fill="url(#hm-logo-metal)" />
      <path
        d="M6.8 12.3c1 1.7 3 2.7 5.2 2.7s4.2-1 5.2-2.7"
        stroke="var(--bg)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        transform="rotate(-5 12 13.6)"
      />
    </svg>
  );
}
