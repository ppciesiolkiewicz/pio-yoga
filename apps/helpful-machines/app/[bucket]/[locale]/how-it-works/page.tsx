import { CtaBand } from "@repo/ui/CtaBand";
import { Section } from "@repo/ui/Section";
import { StepList } from "@repo/ui/StepList";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/how-it-works", t.meta.howItWorks.title, t.meta.howItWorks.description);
}

export default async function HowItWorksPage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return (
    <>
      <Section id="how-it-works" headingLevel="h1" eyebrow={t.howItWorks.eyebrow} title={t.howItWorks.title} intro={t.howItWorks.intro}>
        <StepList steps={t.howItWorks.steps} headingLevel="h2" />
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
    </>
  );
}
