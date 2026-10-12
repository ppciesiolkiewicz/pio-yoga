import { Section } from "@repo/ui/Section";
import { Prose } from "@/components/Prose";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/terms", t.meta.terms.title, t.meta.terms.description);
}

export default async function TermsPage({ params }: Props) {
  const { t } = await resolveParams(params);
  return (
    <Section id="terms" headingLevel="h1" title={t.terms.title}>
      <Prose updated={t.terms.updated} sections={t.terms.sections} />
    </Section>
  );
}
