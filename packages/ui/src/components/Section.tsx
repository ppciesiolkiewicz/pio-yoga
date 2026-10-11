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
}: {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
  headingLevel?: "h1" | "h2";
}) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className={cn("py-14 sm:py-20", className)}>
      <Container>
        {eyebrow && <p className="mb-3 text-sm font-bold uppercase tracking-widest text-accent-text">{eyebrow}</p>}
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
