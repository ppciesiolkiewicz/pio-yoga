import type { ReactNode } from "react";

/**
 * Pass-through root layout. The real <html> lives in app/[bucket]/[locale]/layout.tsx; without this
 * file that dynamic layout becomes the root layout, and Next renders every 404 as an empty error shell.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
