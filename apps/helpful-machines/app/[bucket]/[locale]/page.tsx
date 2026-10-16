import { ButtonLink } from "@repo/ui/SmartLink";
import { Card } from "@repo/ui/Card";
import { CtaBand } from "@repo/ui/CtaBand";
import { FaqList } from "@repo/ui/FaqList";
import { Hero } from "@repo/ui/Hero";
import { Highlight } from "@repo/ui/Highlight";
import { Section } from "@repo/ui/Section";
import { ServiceCard } from "@repo/ui/ServiceCard";
import { StepList } from "@repo/ui/StepList";
import { localizedPath } from "@repo/web/locale";
import { Career } from "@/components/Career";
import { WorkCard } from "@/components/WorkCard";
import { serviceSlugs } from "@/content/services";
import { featuredWork } from "@/content/work";
import { fillPlan, priceFormatter } from "@/lib/format";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/", t.meta.home.title, t.meta.home.description);
}

export default async function HomePage({ params }: Props) {
  const { locale, assignment, t, market } = await resolveParams(params);
  const variant = assignment.hero === "easy-mode" ? "easy-mode" : "control";
  const [before, highlighted, after] = t.hero.title[variant];
  const price = await priceFormatter(market.currency);
  const { light } = market.plans;
  const href = (path: string) => localizedPath(locale, path);

  return (
    <>
      <Hero
        eyebrow={t.hero.eyebrow}
        title={
          <>
            {before}
            <Highlight>{highlighted}</Highlight>
            {after}
          </>
        }
        lead={t.hero.lead}
        primary={bookingLink(locale, t, "hero")}
        secondary={{ href: href("/services"), label: t.hero.secondary }}
        note={t.hero.note}
        chips={t.hero.chips}
        chipsLabel={t.hero.chipsLabel}
        newTabLabel={t.nav.newTab}
      />

      <Section id="fixes" eyebrow={t.fixes.eyebrow} title={t.fixes.title}>
        <ul className="grid gap-5 sm:grid-cols-2">
          {t.fixes.items.map((item) => (
            <li key={item.pain}>
              <Card className="h-full">
                <p className="font-display text-xl font-bold">{item.pain}</p>
                <p className="mt-3 text-muted">
                  <span aria-hidden="true">→ </span>
                  {item.fix}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="services" eyebrow={t.services.eyebrow} title={t.services.title} intro={t.services.intro}>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceSlugs.map((slug) => (
            <li key={slug}>
              <ServiceCard
                title={t.services.items[slug].title}
                summary={t.services.items[slug].summary}
                href={href(`/services/${slug}`)}
                linkLabel={t.services.linkLabel}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="how-it-works" eyebrow={t.howItWorks.eyebrow} title={t.howItWorks.title} intro={t.howItWorks.intro}>
        <StepList steps={t.howItWorks.steps} />
      </Section>

      <Section
        id="pricing"
        eyebrow={t.pricing.eyebrow}
        title={fillPlan(t.pricing.teaser.title, price(light.monthlyPrice), light.hoursPerMonth)}
        intro={fillPlan(t.pricing.teaser.body, price(light.monthlyPrice), light.hoursPerMonth)}
      >
        <ButtonLink link={{ href: href("/pricing"), label: t.pricing.teaser.link }} variant="primary" />
      </Section>

      <Career t={t} />

      <Section id="work" eyebrow={t.work.eyebrow} title={t.work.title} intro={t.work.intro}>
        <ul className="grid gap-5 md:grid-cols-3">
          {featuredWork.map((slug) => (
            <li key={slug}>
              <WorkCard {...t.work.items[slug]} />
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <ButtonLink link={{ href: href("/work"), label: t.work.link }} variant="ghost" />
        </div>
      </Section>

      <Section id="faq" eyebrow={t.faq.eyebrow} title={t.faq.title}>
        <FaqList items={t.faq.items.slice(0, 4)} />
        <div className="mt-8">
          <ButtonLink link={{ href: href("/faq"), label: t.faq.link }} variant="ghost" />
        </div>
      </Section>

      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
    </>
  );
}
