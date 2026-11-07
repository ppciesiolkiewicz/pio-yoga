import type { CSSProperties, ReactNode } from "react";

type Tone = "lilac" | "sun" | "mint" | "coral";

const icons: Record<string, { tone: Tone; paths: ReactNode }> = {
  // AI tools: sparkle
  "ai-assistants-automation": {
    tone: "lilac",
    paths: (
      <>
        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
        <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
      </>
    ),
  },
  // Custom apps: app window
  "custom-apps-websites": {
    tone: "sun",
    paths: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M3 9h18" />
        <path d="M7 13h5M7 16h8" />
      </>
    ),
  },
  // Integrations: two linked nodes
  "migrations-integrations": {
    tone: "mint",
    paths: (
      <>
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="18" r="3" />
        <path d="M9 6h4a3 3 0 0 1 3 3v6" />
        <path d="M15 18h-4a3 3 0 0 1-3-3V9" />
      </>
    ),
  },
  // Your best path: compass
  "find-what-works": {
    tone: "coral",
    paths: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M15.5 8.5l-2 5-5 2 2-5z" />
      </>
    ),
  },
};

/** Coloured icon tile for a landing-page service card, keyed by service slug. */
export function ServiceIcon({ slug }: { slug: string }) {
  const icon = icons[slug];
  if (!icon) return null;
  return (
    <span className="hm-icon-tile" style={{ "--tile": `var(--hm-${icon.tone})` } as CSSProperties}>
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {icon.paths}
      </svg>
    </span>
  );
}
