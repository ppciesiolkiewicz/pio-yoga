import { notFound } from "next/navigation";
import { Card } from "@repo/ui/Card";
import { ChipList } from "@repo/ui/ChipList";
import { CtaBand } from "@repo/ui/CtaBand";
import { JsonLd } from "@repo/ui/JsonLd";
import { Section } from "@repo/ui/Section";
import { breadcrumbList } from "@repo/web/json-ld";
import { localizedPath } from "@repo/web/locale";
import { absoluteUrl } from "@repo/web/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { isWorkSlug, workSlugs } from "@/content/work";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";
import { site } from "@/site.config";

type Props = { params: Promise<RouteParams & { slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return workSlugs.map((slug) => ({ slug }));
}

async function load(params: Props["params"]) {
  const { slug, ...route } = await params;
  if (!isWorkSlug(slug)) notFound();
  const resolved = await resolveParams(Promise.resolve(route));
  return { ...resolved, slug, item: resolved.t.work.items[slug] };
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug, item } = await load(params);
  return meta(locale, `/work/${slug}`, `${item.title} · ${site.name}`, item.summary);
}

export default async function CaseStudyPage({ params }: Props) {
  const { locale, t, slug, item } = await load(params);
  const url = (path: string) => absoluteUrl(site.url, localizedPath(locale, path));
  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
        <Breadcrumbs
          label={t.nav.breadcrumbs}
          items={[{ name: t.nav.home, href: localizedPath(locale, "/") }, { name: t.nav.work, href: localizedPath(locale, "/work") }, { name: item.client }]}
        />
      </div>
      <Section id="case" headingLevel="h1" eyebrow={`${item.sector} · ${item.period}`} title={item.title} intro={item.summary} className="pt-6 sm:pt-8">
        <p className="-mt-4 mb-8 text-sm text-muted">{t.work.credit.replace("{client}", item.client)}</p>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <h2 className="font-display text-xl font-bold">{t.work.problemTitle}</h2>
            <p className="mt-3">{item.problem}</p>
          </Card>
          <Card>
            <h2 className="font-display text-xl font-bold">{t.work.resultTitle}</h2>
            <p className="mt-3">{item.result}</p>
          </Card>
          <Card className="lg:col-span-2">
            <h2 className="font-display text-xl font-bold">{t.work.changedTitle}</h2>
            <ul className="mt-4 grid list-disc gap-2 pl-5">
              {item.whatChanged.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </Card>
        </div>
        <h2 className="mt-10 font-display text-xl font-bold">{t.work.stackTitle}</h2>
        <div className="mt-4">
          <ChipList items={item.stack} label={t.work.stackTitle} />
        </div>
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
      <JsonLd
        data={breadcrumbList([
          { name: t.nav.home, url: url("/") },
          { name: t.nav.work, url: url("/work") },
          { name: item.client, url: url(`/work/${slug}`) },
        ])}
      />
    </>
  );
}
