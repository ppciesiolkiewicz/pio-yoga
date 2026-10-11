import { Card } from "./Card";
import { Container } from "./Container";
import { ButtonLink, type CtaLink } from "./SmartLink";

export function CtaBand({ id = "cta", title, body, cta, newTabLabel }: { id?: string; title: string; body: string; cta: CtaLink; newTabLabel?: string }) {
  return (
    <section aria-labelledby={`${id}-title`} className="py-14 sm:py-20">
      <Container>
        <Card className="grid gap-6 p-8 sm:p-12 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 id={`${id}-title`} className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 max-w-xl text-lg text-muted">{body}</p>
          </div>
          <ButtonLink link={{ ...cta, trackLocation: "cta_band" }} newTabLabel={newTabLabel} />
        </Card>
      </Container>
    </section>
  );
}
