import { Section } from "@repo/ui/Section";
import { Prose } from "@/components/Prose";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/privacy", t.meta.privacy.title, t.meta.privacy.description);
}

export default async function PrivacyPage({ params }: Props) {
  const { t } = await resolveParams(params);
  return (
    <Section id="privacy" headingLevel="h1" title={t.privacy.title}>
      <Prose updated={t.privacy.updated} sections={t.privacy.sections} />
    </Section>
  );
}
