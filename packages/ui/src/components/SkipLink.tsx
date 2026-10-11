export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-card focus:bg-ink focus:px-4 focus:py-3 focus:text-bg"
    >
      {label}
    </a>
  );
}
