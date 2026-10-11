import { assign, bucketFor, controlBucket, serializeAssignment, type Experiments } from "../experiments";
import { defaultLocale, isLocale, localizedPath, splitLocale, type Locale } from "../locale";

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const EXP_COOKIE = "exp";
const YEAR = 31_536_000;
const EXP_MAX_AGE = 90 * 86_400;

export type CookieSet = { name: string; value: string; maxAge: number };
export type RouteInput = {
  pathname: string;
  search: string;
  userAgent: string | null;
  /** Value of x-vercel-ip-country. */
  country: string | null;
  cookies: { locale?: string; exp?: string };
  experiments: Experiments;
  random?: () => number;
};
export type RouteDecision =
  | { kind: "pass" }
  | { kind: "redirect"; status: 307 | 308; location: string; setCookies: CookieSet[] }
  | { kind: "rewrite"; pathname: string; setCookies: CookieSet[] };

const SKIP_PREFIX = /^\/(api|_next|_vercel|ingest|og)(\/|$)/;
const FILE = /\/[^/]*\.[^/]+$/;
const METADATA_IMAGE = /(^|\/)(opengraph-image|twitter-image|icon|apple-icon)(-[^/]*)?$/;
/**
 * Named crawlers and link-preview fetchers, plus generic "xyzbot/1.0" and "(compatible; …bot" forms.
 * Deliberately not matched: Lighthouse (audits must see real buckets), in-app browsers
 * (Slack, Telegram, Pinterest apps) and phone brands containing "bot" (CUBOT).
 */
const BOT =
  /googlebot|bingbot|bingpreview|yandex|baiduspider|duckduckbot|applebot|petalbot|semrushbot|ahrefsbot|linkedinbot|twitterbot|slackbot|telegrambot|discordbot|pinterestbot|facebookexternalhit|whatsapp|embedly|slurp|crawler|spider|quora link preview|vkshare|w3c_validator|bot\/|compatible;[^)]*bot/i;

export function isSkipped(pathname: string): boolean {
  return SKIP_PREFIX.test(pathname) || FILE.test(pathname) || METADATA_IMAGE.test(pathname);
}

/** Crawlers and link-preview fetchers. HeadlessChrome (our E2E tests) and Lighthouse are deliberately not bots. */
export function isBot(userAgent: string | null): boolean {
  return !!userAgent && BOT.test(userAgent);
}

/** Internal path of the pre-rendered page: app/[bucket]/[locale]/... */
export function internalPath(bucket: string, locale: Locale, rest: string): string {
  return `/${bucket}/${locale}${rest === "/" ? "" : rest}`;
}

const withQuery = (path: string, params: URLSearchParams) => {
  const q = params.toString();
  return q ? `${path}?${q}` : path;
};

export function decideRoute(input: RouteInput): RouteDecision {
  const { pathname, experiments } = input;
  if (isSkipped(pathname)) return { kind: "pass" };

  const { locale, rest, explicitDefault } = splitLocale(pathname);
  const params = new URLSearchParams(input.search);

  // 1. Explicit language choice via ?locale=… (footer link; works without JS).
  const requested = params.get("locale");
  if (requested !== null) {
    params.delete("locale");
    const chosen = isLocale(requested) ? requested : null;
    return {
      kind: "redirect",
      status: 307,
      location: withQuery(localizedPath(chosen ?? locale, rest), params),
      setCookies: chosen ? [{ name: LOCALE_COOKIE, value: chosen, maxAge: YEAR }] : [],
    };
  }

  // 2. The default locale is never prefixed.
  if (explicitDefault) {
    return { kind: "redirect", status: 308, location: withQuery(localizedPath(defaultLocale, rest), params), setCookies: [] };
  }

  // 3. Bots: no redirects, no cookies, always control.
  if (isBot(input.userAgent)) {
    return { kind: "rewrite", pathname: internalPath(controlBucket(experiments), locale, rest), setCookies: [] };
  }

  // 4. Preferred market: a stored choice wins; otherwise visitors in Poland prefer /pl.
  const cookieLocale = isLocale(input.cookies.locale) ? input.cookies.locale : null;
  const preferred = cookieLocale ?? (input.country?.toUpperCase() === "PL" ? "pl" : null);
  if (locale === defaultLocale && preferred === "pl") {
    return { kind: "redirect", status: 307, location: withQuery(localizedPath("pl", rest), params), setCookies: [] };
  }

  const setCookies: CookieSet[] = [];
  if (locale !== defaultLocale && cookieLocale !== locale) {
    setCookies.push({ name: LOCALE_COOKIE, value: locale, maxAge: YEAR });
  }

  // 5. Bucketing + rewrite to the pre-rendered bucket.
  const { assignment, changed } = assign(experiments, input.cookies.exp, input.random ?? Math.random);
  if (changed) {
    const value = serializeAssignment(assignment);
    setCookies.push({ name: EXP_COOKIE, value, maxAge: value ? EXP_MAX_AGE : 0 });
  }
  return { kind: "rewrite", pathname: internalPath(bucketFor(experiments, assignment, locale), locale, rest), setCookies };
}
