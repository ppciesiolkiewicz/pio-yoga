export function Logo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="var(--ink)" />
      <circle cx="8.5" cy="9.5" r="1.6" fill="var(--accent)" />
      <circle cx="15.5" cy="9.5" r="1.6" fill="var(--accent)" />
      <path d="M7.5 14c1.1 2 2.7 3 4.5 3s3.4-1 4.5-3" stroke="var(--bg)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
