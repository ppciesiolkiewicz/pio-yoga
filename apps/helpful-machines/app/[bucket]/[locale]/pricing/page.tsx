import { Card } from "@repo/ui/Card";
import { CtaBand } from "@repo/ui/CtaBand";
import { PricingCard } from "@repo/ui/PricingCard";
import { Section } from "@repo/ui/Section";
import { ButtonLink } from "@repo/ui/SmartLink";
import { Career } from "@/components/Career";
import { localizedPath } from "@repo/web/locale";
import { planKeys } from "@/content/market";
import { fillPlan, priceFormatter } from "@/lib/format";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/pricing", t.meta.pricing.title, t.meta.pricing.description);
}

export default async function PricingPage({ params }: Props) {
  const { locale, t, market } = await resolveParams(params);
  const price = await priceFormatter(market.currency);
  const booking = bookingLink(locale, t, "pricing");
  return (
    <>
      <Section id="pricing" headingLevel="h1" eyebrow={t.pricing.eyebrow} title={t.pricing.title} intro={t.pricing.intro}>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {planKeys.map((key) => {
            const plan = market.plans[key];
            const copy = t.pricing.plans[key];
            const fill = (text: string) => fillPlan(text, price(plan.monthlyPrice), plan.hoursPerMonth, price(plan.regularPrice));
            return (
              <PricingCard
                key={key}
                headingLevel="h2"
                featured={key === "focus"}
                badge={t.pricing.badge}
                name={fill(copy.name)}
                price={`${price(plan.monthlyPrice)}${t.pricing.perMonth}`}
                regularPrice={`${price(plan.regularPrice)}${t.pricing.perMonth}`}
                regularPriceLabel={t.pricing.regularPriceLabel}
                summary={fill(copy.summary)}
                features={copy.features}
                cta={booking}
                newTabLabel={t.nav.newTab}
              />
            );
          })}
        </div>
        <Card className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-extrabold">{t.pricing.custom.name}</h2>
            <p className="mt-2 text-muted">{t.pricing.custom.body}</p>
          </div>
          <ButtonLink link={{ ...booking, label: t.pricing.custom.cta }} variant="secondary" newTabLabel={t.nav.newTab} />
        </Card>
        <p className="mx-auto mt-6 max-w-4xl text-sm text-muted">{t.pricing.note}</p>
        <section id="offer-terms" aria-labelledby="offer-terms-title" className="mx-auto mt-6 max-w-4xl text-sm text-muted">
          <h2 id="offer-terms-title" className="font-bold text-ink">
            {t.pricing.offerTerms.title}
          </h2>
          <ul className="mt-2 grid list-disc gap-1 pl-5">
            {t.pricing.offerTerms.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-2">
            <a href={localizedPath(locale, "/terms#founding-offer")} className="underline">
              {t.pricing.offerTerms.link}
            </a>
          </p>
        </section>
      </Section>
      <Career t={t} />
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
    </>
  );
}
