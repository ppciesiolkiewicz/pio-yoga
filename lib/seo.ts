import type { Metadata } from "next";
import { locales, ogLocale, type Locale } from "./i18n";
import { site } from "./site";

/** Metadata with canonical + hreflang alternates for a localised path ("" for home). */
export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
): Metadata {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${site.url}/${l}${path}`;
  languages["x-default"] = `${site.url}/en${path}`;
  const url = `${site.url}/${locale}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "Pio",
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
