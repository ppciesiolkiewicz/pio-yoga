/**
 * Security headers shared by the Next apps. Next's App Router inlines bootstrap scripts, so a static
 * site can't use nonces: script-src allows 'unsafe-inline'. Upgrades and HSTS only on https deploys,
 * so `next start` and E2E tests over http://localhost keep working.
 */
export function securityHeaders(o: { dev: boolean; https: boolean }): { key: string; value: string }[] {
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${o.dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(o.https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ...(o.https ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
  ];
}

/** PostHog EU, proxied through the site's own /ingest so ad-blockers and CSP stay simple. */
export function posthogRewrites() {
  return [
    { source: "/ingest/static/:path*", destination: "https://eu-assets.i.posthog.com/static/:path*" },
    { source: "/ingest/:path*", destination: "https://eu.i.posthog.com/:path*" },
  ];
}
