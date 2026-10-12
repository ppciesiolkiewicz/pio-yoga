import { Card } from "@repo/ui/Card";
import { ConnectDots } from "@repo/ui/ConnectDots";
import { CtaBand } from "@repo/ui/CtaBand";
import { Hero } from "@repo/ui/Hero";
import { Section } from "@repo/ui/Section";
import { ServiceCard } from "@repo/ui/ServiceCard";
import { ButtonLink } from "@repo/ui/SmartLink";
import { StepList } from "@repo/ui/StepList";
import { localizedPath } from "@repo/web/locale";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { serviceSlugs } from "@/content/services";
import { featuredWork } from "@/content/work";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/", t.meta.home.title, t.meta.home.description);
}

export default async function HomePage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  const href = (path: string) => localizedPath(locale, path);
  const [first, accent] = t.hero.title;
  return (
    <>
      <Hero
        eyebrow={t.hero.eyebrow}
        title={
          <>
            {first}
            <em className="tg-accent">{accent}</em>
          </>
        }
        lead={t.hero.lead}
        primary={bookingLink(locale, t, "hero")}
        secondary={{ href: href("/work"), label: t.hero.secondary }}
        chips={t.hero.proof}
        chipsLabel={t.hero.proofLabel}
        newTabLabel={t.nav.newTab}
        visual={<ConnectDots labels={t.hero.dots} />}
      />

      <Section id="flows" eyebrow={t.flows.eyebrow} title={t.flows.title} intro={t.flows.intro}>
        <ul className="grid gap-5 sm:grid-cols-2">
          {t.flows.items.map((item) => (
            <li key={item.title}>
              <Card className="h-full">
                <h3 className="font-display text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-muted">{item.body}</p>
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

      <Section id="process" eyebrow={t.process.eyebrow} title={t.process.title} intro={t.process.intro}>
        <StepList steps={t.process.steps} />
      </Section>

      <Section id="work" eyebrow={t.work.eyebrow} title={t.work.title} intro={t.work.intro}>
        <ul className="grid gap-5 md:grid-cols-3">
          {featuredWork.map((slug) => (
            <li key={slug}>
              <CaseStudyCard slug={slug} locale={locale} item={t.work.items[slug]} readMore={t.work.readMore} credit={t.work.cardCredit} />
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <ButtonLink link={{ href: href("/work"), label: t.work.link }} variant="ghost" />
        </div>
      </Section>

      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
    </>
  );
}
