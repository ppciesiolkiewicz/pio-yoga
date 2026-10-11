import type { MetadataRoute } from "next";
import { buildRobots } from "@repo/web/seo";
import { site } from "@/site.config";

export default function robots(): MetadataRoute.Robots {
  return buildRobots(site.url);
}
