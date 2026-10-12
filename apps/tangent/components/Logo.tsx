import type { DesignKey } from "@/experiments";

/** Precision: the tangent mark + "Tangent". Editorial: lowercase wordmark with an accent dot. */
export function Logo({ design }: { design: DesignKey }) {
  if (design === "tangent-editorial") {
    return (
      <span>
        tangent<span aria-hidden="true" className="text-accent-text">.</span>
      </span>
    );
  }
  return (
    <>
      <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
        <circle cx="9" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <line x1="0" y1="5" x2="18" y2="5" stroke="var(--accent)" strokeWidth="1.6" />
      </svg>
      Tangent
    </>
  );
}
