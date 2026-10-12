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
  async headers() {
    const headers = securityHeaders({ dev: process.env.NODE_ENV === "development", https: process.env.VERCEL === "1" });
    return [{ source: "/(.*)", headers }];
  },
};

export default withNextIntl(config);
