import { Section } from "@repo/ui/Section";
import { ButtonLink } from "@repo/ui/SmartLink";
import { liveLocales } from "@repo/web/locale";
import { Document } from "@/components/Document";
import { getContent } from "@/content";

/** Server-side 404s render here (full document). English, plus a Polish line while Polish is live. */
export default function RootNotFound() {
  const en = getContent("en");
  const pl = getContent("pl");
  const polish = liveLocales.includes("pl");
  return (
    <Document locale="en" design="tangent-precision" assignment={{}} analyticsMarket={null}
      languageLink={
        polish ? (
          <a href="/pl" hrefLang="pl-PL" lang="pl-PL" className="inline-flex min-h-11 items-center font-bold underline underline-offset-4">
            Polski
          </a>
        ) : undefined
      }
    >
      <title>{polish ? `${en.notFound.title} · ${pl.notFound.title}` : en.notFound.title}</title>
      <Section id="not-found" headingLevel="h1" title={en.notFound.title} intro={en.notFound.body}>
        {polish && (
          <p lang="pl-PL" className="-mt-4 mb-8 text-lg text-muted">
            {pl.notFound.title}. {pl.notFound.body}
          </p>
        )}
        <div className="flex flex-wrap gap-4">
          <ButtonLink link={{ href: "/", label: en.notFound.home }} />
          {polish && (
            <span lang="pl-PL">
              <ButtonLink link={{ href: "/pl", label: pl.notFound.home }} variant="secondary" />
            </span>
          )}
        </div>
      </Section>
    </Document>
  );
}
