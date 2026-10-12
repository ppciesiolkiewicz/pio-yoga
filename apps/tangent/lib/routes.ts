import type { Content } from "../content/en";
import { isServiceSlug, serviceSlugs } from "../content/services";
import { isWorkSlug, workSlugs } from "../content/work";

export const staticPaths = ["/", "/services", "/work", "/about", "/contact", "/privacy", "/terms"] as const;
export type StaticPath = (typeof staticPaths)[number];
export const servicePaths = serviceSlugs.map((slug) => `/services/${slug}`);
export const workPaths = workSlugs.map((slug) => `/work/${slug}`);
export const allPaths: string[] = [...staticPaths, ...servicePaths, ...workPaths];

const metaKey: Record<StaticPath, keyof Omit<Content["meta"], "siteDescription">> = {
  "/": "home",
  "/services": "services",
  "/work": "work",
  "/about": "about",
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
  const service = path.match(/^\/services\/([^/]+)$/)?.[1];
  if (service && isServiceSlug(service)) return t.services.items[service].title;
  const work = path.match(/^\/work\/([^/]+)$/)?.[1];
  if (work && isWorkSlug(work)) return t.work.items[work].title;
  return null;
}
