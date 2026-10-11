import { getLocale } from "next-intl/server";
import { Section } from "@repo/ui/Section";
import { ButtonLink } from "@repo/ui/SmartLink";
import { defaultLocale, isLocale, localizedPath, type Locale } from "@repo/web/locale";
import { getContent } from "@/content";

export default async function NotFound() {
  let locale: Locale = defaultLocale;
  try {
    const current = await getLocale();
    if (isLocale(current)) locale = current;
  } catch {
    // no request locale: fall back to English
  }
  const t = getContent(locale);
  return (
    <Section id="not-found" headingLevel="h1" title={t.notFound.title} intro={t.notFound.body}>
      <ButtonLink link={{ href: localizedPath(locale, "/"), label: t.notFound.home }} />
    </Section>
  );
}
