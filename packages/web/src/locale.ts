export const locales = ["en", "pl"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Value for <html lang>. */
export const htmlLang: Record<Locale, string> = { en: "en-AU", pl: "pl-PL" };
/** Keys for hreflang alternates. */
export const hreflang: Record<Locale, string> = { en: "en-AU", pl: "pl-PL" };
/** Open Graph locale codes. */
export const ogLocale: Record<Locale, string> = { en: "en_AU", pl: "pl_PL" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** Leading slash, no duplicate slashes, no trailing slash (except the root). */
export function normalizePath(path: string): string {
  const collapsed = `/${path}`.replace(/\/{2,}/g, "/");
  return collapsed.length > 1 ? collapsed.replace(/\/$/, "") : "/";
}

/** Public URL path for a locale: English unprefixed, other locales under /<locale>. */
export function localizedPath(locale: Locale, path: string): string {
  const rest = normalizePath(path);
  if (locale === defaultLocale) return rest;
  return rest === "/" ? `/${locale}` : `/${locale}${rest}`;
}

/** Split a public pathname into its locale and the locale-less rest. */
export function splitLocale(pathname: string): { locale: Locale; rest: string; explicitDefault: boolean } {
  const path = normalizePath(pathname);
  const [, first = "", ...more] = path.split("/");
  if (isLocale(first)) {
    return { locale: first, rest: normalizePath(more.join("/")), explicitDefault: first === defaultLocale };
  }
  return { locale: defaultLocale, rest: path, explicitDefault: false };
}

/** Locale and locale-less rest of a pathname that may be internal (/<bucket>/<locale>/…) or public. */
export function stripInternalPrefix(pathname: string, buckets: readonly string[]): { locale: Locale; rest: string } {
  const path = normalizePath(pathname);
  const [, first = "", second = "", ...more] = path.split("/");
  if (buckets.includes(first) && isLocale(second)) return { locale: second, rest: normalizePath(more.join("/")) };
  const { locale, rest } = splitLocale(path);
  return { locale, rest };
}
