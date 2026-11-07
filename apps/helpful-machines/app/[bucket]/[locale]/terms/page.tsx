import { Section } from "@repo/ui/Section";
import { PageBreadcrumbs } from "@/components/Breadcrumbs";
import { Prose } from "@/components/Prose";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/terms", t.meta.terms.title, t.meta.terms.description);
}

export default async function TermsPage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return (
    <>
      <PageBreadcrumbs locale={locale} t={t} trail={[{ name: t.terms.title }]} />
      <Section id="terms" className="pt-6 sm:pt-8" headingLevel="h1" title={t.terms.title}>
        <Prose
          updated={t.terms.updated}
          sections={[...t.terms.sections, { id: "founding-offer", heading: t.terms.offerHeading, paragraphs: t.pricing.offerTerms.items }]}
        />
      </Section>
    </>
  );
}
