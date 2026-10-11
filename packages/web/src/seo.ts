import type { Metadata, MetadataRoute } from "next";
import { defaultLocale, hreflang, localizedPath, locales, normalizePath, ogLocale, type Locale } from "./locale";

/** Absolute URL. The root of a bare origin keeps its "/"; the root under a path prefix has none. */
export function absoluteUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/+$/, "");
  const rest = normalizePath(path);
  if (rest !== "/") return `${base}${rest}`;
  return new URL(base).pathname === "/" ? `${base}/` : base;
}

export function languageAlternates(
  siteUrl: string,
  path: string,
  available: readonly Locale[] = locales,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of locales) if (available.includes(l)) out[hreflang[l]] = absoluteUrl(siteUrl, localizedPath(l, path));
  if (available.includes(defaultLocale)) out["x-default"] = absoluteUrl(siteUrl, localizedPath(defaultLocale, path));
  return out;
}

export function pageMetadata(o: {
  siteUrl: string;
  siteName: string;
  locale: Locale;
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  available?: readonly Locale[];
}): Metadata {
  const available = o.available ?? locales;
  const url = absoluteUrl(o.siteUrl, localizedPath(o.locale, o.path));
  const imageUrl = o.ogImage && (/^https?:\/\//i.test(o.ogImage) ? o.ogImage : absoluteUrl(o.siteUrl, o.ogImage));
  const images = imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined;
  return {
    title: o.title,
    description: o.description,
    alternates: { canonical: url, languages: languageAlternates(o.siteUrl, o.path, available) },
    openGraph: {
      type: "website",
      url,
      siteName: o.siteName,
      title: o.title,
      description: o.description,
      locale: ogLocale[o.locale],
      alternateLocale: available.filter((l) => l !== o.locale).map((l) => ogLocale[l]),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: o.title,
      description: o.description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

export type SitemapPage = { path: string; locales?: readonly Locale[]; lastModified?: Date; priority?: number };

export function buildSitemap(siteUrl: string, pages: SitemapPage[]): MetadataRoute.Sitemap {
  return pages.flatMap((page) => {
    const available = page.locales ?? locales;
    const languages = languageAlternates(siteUrl, page.path, available);
    return locales
      .filter((l) => available.includes(l))
      .map((l) => ({
        url: absoluteUrl(siteUrl, localizedPath(l, page.path)),
        ...(page.lastModified ? { lastModified: page.lastModified } : {}),
        ...(page.priority !== undefined ? { priority: page.priority } : {}),
        alternates: { languages },
      }));
  });
}

export function buildRobots(siteUrl: string): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/ingest/"] },
    sitemap: absoluteUrl(siteUrl, "/sitemap.xml"),
  };
}
