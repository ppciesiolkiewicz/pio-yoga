import { CtaBand } from "@repo/ui/CtaBand";
import { Section } from "@repo/ui/Section";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { workSlugs } from "@/content/work";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/work", t.meta.work.title, t.meta.work.description);
}

export default async function WorkPage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return (
    <>
      <Section id="work" headingLevel="h1" eyebrow={t.work.eyebrow} title={t.work.title} intro={t.work.intro}>
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {workSlugs.map((slug) => (
            <li key={slug}>
              <CaseStudyCard slug={slug} locale={locale} item={t.work.items[slug]} readMore={t.work.readMore} credit={t.work.cardCredit} headingLevel="h2" />
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
    </>
  );
}
