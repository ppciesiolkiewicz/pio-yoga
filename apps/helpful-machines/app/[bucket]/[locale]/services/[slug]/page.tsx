import { notFound } from "next/navigation";
import { Card } from "@repo/ui/Card";
import { CtaBand } from "@repo/ui/CtaBand";
import { FaqList } from "@repo/ui/FaqList";
import { JsonLd } from "@repo/ui/JsonLd";
import { Section } from "@repo/ui/Section";
import { breadcrumbList, faqPage, service } from "@repo/web/json-ld";
import { localizedPath } from "@repo/web/locale";
import { absoluteUrl } from "@repo/web/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { isServiceSlug, serviceSlugs } from "@/content/services";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";
import { site } from "@/site.config";

type Props = { params: Promise<RouteParams & { slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

async function load(params: Props["params"]) {
  const { slug, ...route } = await params;
  if (!isServiceSlug(slug)) notFound();
  const resolved = await resolveParams(Promise.resolve(route));
  return { ...resolved, slug, item: resolved.t.services.items[slug] };
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug, item } = await load(params);
  return meta(locale, `/services/${slug}`, `${item.title} · ${site.name}`, item.summary);
}

export default async function ServicePage({ params }: Props) {
  const { locale, t, slug, item } = await load(params);
  const url = (path: string) => absoluteUrl(site.url, localizedPath(locale, path));
  const lists: [string, string[]][] = [
    [t.services.problemsTitle, item.problems],
    [t.services.whatWeDoTitle, item.whatWeDo],
    [t.services.deliverablesTitle, item.deliverables],
  ];
  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
        <Breadcrumbs
          label={t.nav.breadcrumbs}
          items={[
            { name: t.nav.home, href: localizedPath(locale, "/") },
            { name: t.nav.services, href: localizedPath(locale, "/services") },
            { name: item.title },
          ]}
        />
      </div>
      <Section id="service" headingLevel="h1" title={item.title} intro={item.intro} className="pt-6 sm:pt-8">
        <div className="grid gap-5 md:grid-cols-3">
          {lists.map(([heading, entries]) => (
            <Card key={heading} className="h-full">
              <h2 className="font-display text-xl font-extrabold">{heading}</h2>
              <ul className="mt-4 grid list-disc gap-2 pl-5">
                {entries.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>
      <Section id="service-faq" title={t.services.faqTitle}>
        <FaqList items={item.faq} />
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
      <JsonLd
        data={[
          service({ name: item.title, description: item.summary, url: url(`/services/${slug}`), providerName: site.name, providerUrl: site.url, areaServed: ["AU", "PL"] }),
          breadcrumbList([
            { name: t.nav.home, url: url("/") },
            { name: t.nav.services, url: url("/services") },
            { name: item.title, url: url(`/services/${slug}`) },
          ]),
          faqPage(item.faq),
        ]}
      />
    </>
  );
}
