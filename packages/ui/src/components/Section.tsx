import type { ReactNode } from "react";
import { cn } from "../cn";
import { Container } from "./Container";

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className,
  headingLevel: Heading = "h2",
  tint = false,
  decor,
}: {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
  headingLevel?: "h1" | "h2";
  /** Full-bleed surface-colour band behind the section, to separate it from its neighbours. */
  tint?: boolean;
  /** Decorative layer behind the content (positioned absolutely; the section clips it). */
  decor?: ReactNode;
}) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("hm-rule border-t border-line/10 py-14 sm:py-20", tint && "bg-surface", decor && "relative", className)}
    >
      {decor && (
        <div aria-hidden="true" data-decor="" className="pointer-events-none absolute inset-0 overflow-hidden">
          {decor}
        </div>
      )}
      <Container className={decor ? "relative" : undefined}>
        {eyebrow && <p data-eyebrow={Heading} className="mb-3 text-sm font-extrabold uppercase tracking-widest text-accent-text">{eyebrow}</p>}
        <Heading
          id={headingId}
          className={cn(
            "max-w-3xl font-display font-extrabold tracking-tight text-balance",
            Heading === "h1" ? "text-4xl sm:text-6xl" : "text-3xl sm:text-5xl",
          )}
        >
          {title}
        </Heading>
        {intro && <p className="mt-4 max-w-2xl text-lg text-muted">{intro}</p>}
        {children && <div className="mt-10">{children}</div>}
      </Container>
    </section>
  );
}
