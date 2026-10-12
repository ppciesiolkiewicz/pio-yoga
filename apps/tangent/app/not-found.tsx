import { Section } from "@repo/ui/Section";
import { ButtonLink } from "@repo/ui/SmartLink";
import { Document } from "@/components/Document";
import { getContent } from "@/content";

/** Server-side 404s render here (full document). English with a Polish line: the market is unknown. */
export default function RootNotFound() {
  const en = getContent("en");
  const pl = getContent("pl");
  return (
    <Document locale="en" design="tangent-precision" assignment={{}}>
      <title>{`${en.notFound.title} · ${pl.notFound.title}`}</title>
      <Section id="not-found" headingLevel="h1" title={en.notFound.title} intro={en.notFound.body}>
        <p lang="pl-PL" className="-mt-4 mb-8 text-lg text-muted">
          {pl.notFound.title}. {pl.notFound.body}
        </p>
        <div className="flex flex-wrap gap-4">
          <ButtonLink link={{ href: "/", label: en.notFound.home }} />
          <span lang="pl-PL">
            <ButtonLink link={{ href: "/pl", label: pl.notFound.home }} variant="secondary" />
          </span>
        </div>
      </Section>
    </Document>
  );
}
