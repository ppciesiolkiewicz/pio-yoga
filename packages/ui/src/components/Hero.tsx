import type { ReactNode } from "react";
import { ChipList } from "./ChipList";
import { Container } from "./Container";
import { ButtonLink, type CtaLink } from "./SmartLink";

export function Hero({
  eyebrow,
  title,
  lead,
  primary,
  secondary,
  note,
  chips,
  chipsLabel,
  newTabLabel,
  visual,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead: string;
  primary: CtaLink;
  secondary?: CtaLink;
  note?: string;
  chips?: string[];
  chipsLabel?: string;
  newTabLabel?: string;
  /** Decorative illustration beside the text on large screens (must be aria-hidden). */
  visual?: ReactNode;
}) {
  return (
    <section aria-labelledby="hero-title" className="pt-12 pb-14 sm:pt-20 sm:pb-20">
      <Container className={visual ? "grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]" : undefined}>
        <div>
          {eyebrow && (
            <p data-eyebrow className="mb-4 text-sm font-bold uppercase tracking-widest text-accent-text">
              {eyebrow}
            </p>
          )}
          <h1 id="hero-title" className="max-w-4xl font-display text-5xl leading-[1.02] font-extrabold tracking-tight text-balance sm:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">{lead}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <ButtonLink link={{ ...primary, trackLocation: "hero" }} newTabLabel={newTabLabel} />
            {secondary && <ButtonLink link={secondary} variant="ghost" />}
            {note && <span className="text-sm text-muted">{note}</span>}
          </div>
          {chips && chips.length > 0 && (
            <div className="mt-10">
              <ChipList items={chips} label={chipsLabel} />
            </div>
          )}
        </div>
        {visual && <div className="hidden lg:block">{visual}</div>}
      </Container>
    </section>
  );
}
