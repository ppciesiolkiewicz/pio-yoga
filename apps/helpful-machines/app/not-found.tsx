import { Section } from "@repo/ui/Section";
import { ButtonLink } from "@repo/ui/SmartLink";
import { Document } from "@/components/Document";
import { getContent } from "@/content";

/** Next renders server-side 404s with the root layout + this file, so it must be a full document. */
export default function RootNotFound() {
  const en = getContent("en");
  return (
    <Document locale="en" assignment={{}} analyticsMarket={null}>
      <title>{en.notFound.title}</title>
      <Section id="not-found" headingLevel="h1" title={en.notFound.title} intro={en.notFound.body}>
        <div className="flex flex-wrap gap-4">
          <ButtonLink link={{ href: "/", label: en.notFound.home }} />
        </div>
      </Section>
    </Document>
  );
}
