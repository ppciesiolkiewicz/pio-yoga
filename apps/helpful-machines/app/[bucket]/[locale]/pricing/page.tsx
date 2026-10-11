import { Card } from "@repo/ui/Card";
import { CtaBand } from "@repo/ui/CtaBand";
import { PricingCard } from "@repo/ui/PricingCard";
import { Section } from "@repo/ui/Section";
import { ButtonLink } from "@repo/ui/SmartLink";
import { priceFormatter } from "@/lib/format";
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
  const { quickWin, customApp, support } = t.pricing.packages;
  return (
    <>
      <Section id="pricing" headingLevel="h1" eyebrow={t.pricing.eyebrow} title={t.pricing.title} intro={t.pricing.intro}>
        <div className="grid gap-6 lg:grid-cols-3">
          <PricingCard headingLevel="h2" {...quickWin} price={`${t.pricing.from} ${price(market.prices.quickWin)}`} cta={booking} newTabLabel={t.nav.newTab} />
          <PricingCard headingLevel="h2" featured {...customApp} price={`${t.pricing.from} ${price(market.prices.customApp)}`} cta={booking} newTabLabel={t.nav.newTab} />
          <PricingCard
            headingLevel="h2"
            {...support}
            price={`${t.pricing.from} ${price(market.prices.support)}${t.pricing.perMonth}`}
            cta={booking}
            newTabLabel={t.nav.newTab}
          />
        </div>
        <Card className="mt-6 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-extrabold">{t.pricing.custom.name}</h2>
            <p className="mt-2 text-muted">{t.pricing.custom.body}</p>
          </div>
          <ButtonLink link={{ ...booking, label: t.pricing.custom.cta }} variant="secondary" newTabLabel={t.nav.newTab} />
        </Card>
        <p className="mt-6 text-sm text-muted">{t.pricing.note}</p>
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
    </>
  );
}
