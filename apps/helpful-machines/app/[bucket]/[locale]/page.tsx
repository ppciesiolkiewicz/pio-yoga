import { ButtonLink } from "@repo/ui/SmartLink";
import { CtaBand } from "@repo/ui/CtaBand";
import { Hero } from "@repo/ui/Hero";
import { Highlight } from "@repo/ui/Highlight";
import { PricingCard } from "@repo/ui/PricingCard";
import { Section } from "@repo/ui/Section";
import { ServiceCard } from "@repo/ui/ServiceCard";
import { StepList } from "@repo/ui/StepList";
import { localizedPath } from "@repo/web/locale";
import { Founder } from "@/components/Founder";
import { HeroDecor } from "@/components/HeroDecor";
import { GeometricVisual } from "@/components/GeometricVisual";
import { ServiceIcon } from "@/components/ServiceIcon";
import { planKeys } from "@/content/market";
import { fillPlan, priceFormatter } from "@/lib/format";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/", t.meta.home.title, t.meta.home.description);
}

/** One scrolling page: the navbar links jump to the sections below. */
export default async function HomePage({ params }: Props) {
  const { locale, assignment, t, market } = await resolveParams(params);
  const variant = assignment.hero === "easy-mode" ? "easy-mode" : "control";
  const [before, highlighted, after] = t.hero.title[variant];
  const price = await priceFormatter(market.currency);
  const { light } = market.plans;
  const href = (path: string) => localizedPath(locale, path);
  const booking = bookingLink(locale, t, "pricing");

  return (
    <>
      <div className="relative overflow-hidden">
        <HeroDecor />
        <div className="relative z-10">
          <Hero
            eyebrow={t.hero.eyebrow}
            title={
              <span className="select-none">
                {before}
                <Highlight>{highlighted}</Highlight>
                {after}
              </span>
            }
            lead={t.hero.lead}
            primary={bookingLink(locale, t, "hero")}
            secondary={{ href: "#services", label: t.hero.secondary }}
            note={t.hero.note}
            newTabLabel={t.nav.newTab}
            visual={<GeometricVisual />}
          />
        </div>
      </div>

      <Section id="services" className="hm-band hm-band-sky" eyebrow={t.landing.services.eyebrow} title={t.landing.services.title}>
        <ul className="grid gap-5 sm:grid-cols-2">
          {t.landing.services.items.map((item) => (
            <li key={item.slug}>
              <ServiceCard
                title={item.title}
                summary={item.summary}
                href={href(`/services/${item.slug}`)}
                linkLabel={t.services.linkLabel}
                icon={<ServiceIcon slug={item.slug} />}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="how-it-works" className="hm-band" eyebrow={t.howItWorks.eyebrow} title={t.howItWorks.title} intro={t.howItWorks.intro}>
        <div className="select-none">
          <StepList steps={t.howItWorks.steps} variant="timeline" />
        </div>
      </Section>

      <Founder t={t} careerHref={`${href("/pricing")}#career`} />

      <Section
        id="pricing"
        className="hm-band hm-band-lilac"
        eyebrow={t.pricing.eyebrow}
        title={fillPlan(t.pricing.teaser.title, price(light.monthlyPrice), light.hoursPerWeek, price(light.regularPrice))}
        intro={fillPlan(t.pricing.teaser.body, price(light.monthlyPrice), light.hoursPerWeek, price(light.regularPrice))}
      >
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {planKeys.map((key) => {
            const plan = market.plans[key];
            const copy = t.pricing.plans[key];
            const fill = (text: string) => fillPlan(text, price(plan.monthlyPrice), plan.hoursPerWeek, price(plan.regularPrice));
            return (
              <PricingCard
                key={key}
                featured={key === "focus"}
                className={key === "focus" ? "hm-featured" : undefined}
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
        <p className="mx-auto mt-6 max-w-4xl text-center">
          <ButtonLink link={{ href: href("/pricing"), label: t.pricing.teaser.link }} variant="secondary" />
        </p>
      </Section>

      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} className="hm-cta" />
    </>
  );
}
