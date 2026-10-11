const DEFAULT_SITE_URL = "https://attunr.com";

/**
 * Public base URL of an app, without a trailing slash.
 * Missing → fallback. Present but not a URL → throws, so a bad value fails the build
 * instead of shipping broken canonicals.
 */
export function resolveSiteUrl(
  env: Record<string, string | undefined> = { NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL },
  fallback: string = DEFAULT_SITE_URL,
): string {
  const raw = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return fallback;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL is not a valid URL: "${raw}"`);
  }
  if (!url.hostname.includes(".") && url.hostname !== "localhost") {
    throw new Error(`NEXT_PUBLIC_SITE_URL is not a valid URL: "${raw}"`);
  }
  return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
}
