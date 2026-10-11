import type { Content } from "../content/en";
import { isServiceSlug, serviceSlugs } from "../content/services";

export const staticPaths = ["/", "/services", "/how-it-works", "/pricing", "/work", "/faq", "/contact", "/privacy", "/terms"] as const;
export type StaticPath = (typeof staticPaths)[number];
export const servicePaths = serviceSlugs.map((slug) => `/services/${slug}`);
export const allPaths: string[] = [...staticPaths, ...servicePaths];

const metaKey: Record<StaticPath, keyof Omit<Content["meta"], "siteDescription">> = {
  "/": "home",
  "/services": "services",
  "/how-it-works": "howItWorks",
  "/pricing": "pricing",
  "/work": "work",
  "/faq": "faq",
  "/contact": "contact",
  "/privacy": "privacy",
  "/terms": "terms",
};

export function ogKey(path: string): string {
  return path === "/" ? "home" : path.slice(1).split("/").join("--");
}

export function pathFromOgKey(key: string): string {
  return key === "home" ? "/" : `/${key.split("--").join("/")}`;
}

/** Short page title for OG images; null for unknown paths. */
export function pageTitle(t: Content, path: string): string | null {
  if (Object.hasOwn(metaKey, path)) return t.meta[metaKey[path as StaticPath]].title;
  const slug = path.match(/^\/services\/([^/]+)$/)?.[1];
  if (slug && isServiceSlug(slug)) return t.services.items[slug].title;
  return null;
}
