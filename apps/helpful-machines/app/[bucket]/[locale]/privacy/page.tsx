import { Section } from "@repo/ui/Section";
import { PageBreadcrumbs } from "@/components/Breadcrumbs";
import { Prose } from "@/components/Prose";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/privacy", t.meta.privacy.title, t.meta.privacy.description);
}

export default async function PrivacyPage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return (
    <>
      <PageBreadcrumbs locale={locale} t={t} trail={[{ name: t.privacy.title }]} />
      <Section id="privacy" className="pt-6 sm:pt-8" headingLevel="h1" title={t.privacy.title}>
        <Prose updated={t.privacy.updated} sections={t.privacy.sections} />
      </Section>
    </>
  );
}
