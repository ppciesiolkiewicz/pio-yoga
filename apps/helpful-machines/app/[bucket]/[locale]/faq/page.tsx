import { CtaBand } from "@repo/ui/CtaBand";
import { FaqList } from "@repo/ui/FaqList";
import { JsonLd } from "@repo/ui/JsonLd";
import { Section } from "@repo/ui/Section";
import { faqPage } from "@repo/web/json-ld";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/faq", t.meta.faq.title, t.meta.faq.description);
}

export default async function FaqPage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return (
    <>
      <Section id="faq" headingLevel="h1" eyebrow={t.faq.eyebrow} title={t.faq.title}>
        <FaqList items={t.faq.items} />
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
      <JsonLd data={faqPage(t.faq.items)} />
    </>
  );
}
