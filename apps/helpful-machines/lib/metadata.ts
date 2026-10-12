import type { Metadata } from "next";
import type { Locale } from "@repo/web/locale";
import { pageMetadata } from "@repo/web/seo";
import { site } from "@/site.config";
import { ogKey } from "./routes";

export function meta(locale: Locale, path: string, title: string, description: string): Metadata {
  const full = title.includes(site.name) ? title : `${title} · ${site.name}`;
  return pageMetadata({ siteUrl: site.url, siteName: site.name, locale, path, title: full, description, ogImage: `/og/${locale}/${ogKey(path)}` });
}
