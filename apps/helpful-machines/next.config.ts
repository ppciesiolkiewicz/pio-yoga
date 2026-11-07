import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { posthogRewrites, securityHeaders } from "@repo/web/headers";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@repo/ui", "@repo/web"],
  images: { formats: ["image/avif", "image/webp"] },
  // PostHog's API paths end with a slash; don't redirect them.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return posthogRewrites();
  },
  // Pages folded into the landing page (or the services pages): keep old links working.
  async redirects() {
    return [
      { source: "/how-it-works", destination: "/#how-it-works", permanent: true },
      { source: "/work", destination: "/", permanent: true },
      { source: "/faq", destination: "/services", permanent: true },
    ];
  },
  async headers() {
    const headers = securityHeaders({ dev: process.env.NODE_ENV === "development", https: process.env.VERCEL === "1" });
    return [{ source: "/(.*)", headers }];
  },
};

export default withNextIntl(config);
