// The Yoga Timer's mark: the dial ring with progress arc, the round gong (top) and the halfway gong.
export default function TimerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="19" fill="none" stroke="var(--line)" strokeWidth="3" />
      <path d="M24 5 A19 19 0 1 1 5.2 26.7" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="5" r="4" fill="var(--sun)" stroke="var(--bg)" strokeWidth="1.5" />
      <circle cx="24" cy="43" r="3" fill="var(--ink)" stroke="var(--bg)" strokeWidth="1.5" />
    </svg>
  );
}
