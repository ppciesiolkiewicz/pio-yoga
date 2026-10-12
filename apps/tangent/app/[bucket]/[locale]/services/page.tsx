import { CtaBand } from "@repo/ui/CtaBand";
import { Section } from "@repo/ui/Section";
import { ServiceCard } from "@repo/ui/ServiceCard";
import { localizedPath } from "@repo/web/locale";
import { serviceSlugs } from "@/content/services";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/services", t.meta.services.title, t.meta.services.description);
}

export default async function ServicesPage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return (
    <>
      <Section id="services" headingLevel="h1" eyebrow={t.services.eyebrow} title={t.services.title} intro={t.services.intro}>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceSlugs.map((slug) => (
            <li key={slug}>
              <ServiceCard
                headingLevel="h2"
                title={t.services.items[slug].title}
                summary={t.services.items[slug].summary}
                href={localizedPath(locale, `/services/${slug}`)}
                linkLabel={t.services.linkLabel}
              />
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
    </>
  );
}
