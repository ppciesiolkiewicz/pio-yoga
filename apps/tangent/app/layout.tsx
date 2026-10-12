import type { ReactNode } from "react";

/** Pass-through root layout: the <html> lives in components/Document.tsx (see Plan 2's 404 ruling). */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
