"use client";

import { usePathname } from "next/navigation";
import { htmlLang, localizedPath, stripInternalPrefix, type Locale } from "@repo/web/locale";

/** English → /pl/… (visiting /pl stores the choice). Polish → …?locale=en (middleware stores it and cleans the URL). */
export function LanguageLink({ locale, buckets, labels }: { locale: Locale; buckets: readonly string[]; labels: Record<Locale, string> }) {
  const { rest } = stripInternalPrefix(usePathname() ?? "/", buckets);
  const target: Locale = locale === "en" ? "pl" : "en";
  const href = target === "pl" ? localizedPath("pl", rest) : `${localizedPath("en", rest)}?locale=en`;
  return (
    <a href={href} hrefLang={htmlLang[target]} lang={htmlLang[target]} className="inline-flex min-h-11 items-center font-bold underline underline-offset-4">
      {labels[target]}
    </a>
  );
}
