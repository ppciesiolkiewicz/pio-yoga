export function Logo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="7" fill="var(--accent)" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="var(--bg)" strokeWidth="2" />
      <path
        d="M12 6.5v2M12 15.5v2M6.5 12h2M15.5 12h2M8.1 8.1l1.4 1.4M14.5 14.5l1.4 1.4M8.1 15.9l1.4-1.4M14.5 9.5l1.4-1.4"
        stroke="var(--bg)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
