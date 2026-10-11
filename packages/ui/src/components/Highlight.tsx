import type { ReactNode } from "react";

/** Highlighter-pen emphasis inside headlines; styled per design (.hm-highlight). */
export function Highlight({ children }: { children: ReactNode }) {
  return <mark className="hm-highlight">{children}</mark>;
}
