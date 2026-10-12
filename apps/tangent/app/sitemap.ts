import type { MetadataRoute } from "next";
import { buildSitemap } from "@repo/web/seo";
import { allPaths } from "@/lib/routes";
import { site } from "@/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(
    site.url,
    allPaths.map((path) => ({ path, priority: path === "/" ? 1 : path === "/privacy" || path === "/terms" ? 0.2 : 0.7 })),
  );
}
