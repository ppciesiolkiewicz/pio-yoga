import type { Metadata } from "next";
import { body, display } from "@/lib/fonts";
import "../globals.css";
import "./flows.css";

// Private teaching notebook: not linked from the site, not indexed.
export const metadata: Metadata = {
  title: "Flow notebook · Pio",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function FlowsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
