import { describe, expect, it } from "vitest";
import { absoluteUrl, buildRobots, buildSitemap, languageAlternates, pageMetadata } from "../src/seo";

const site = "https://attunr.com";

describe("absoluteUrl", () => {
  it("joins without double slashes", () => {
    expect(absoluteUrl(site, "/")).toBe("https://attunr.com/");
    expect(absoluteUrl(site, "/services")).toBe("https://attunr.com/services");
    expect(absoluteUrl("https://attunr.com/tangent", "/pl")).toBe("https://attunr.com/tangent/pl");
  });
});

describe("languageAlternates", () => {
  it("lists every market plus x-default → english", () =>
    expect(languageAlternates(site, "/services")).toEqual({
      "en-AU": "https://attunr.com/services",
      "pl-PL": "https://attunr.com/pl/services",
      "x-default": "https://attunr.com/services",
    }));
  it("omits markets where the page is disabled", () =>
    expect(languageAlternates(site, "/pricing", ["en"])).toEqual({
      "en-AU": "https://attunr.com/pricing",
      "x-default": "https://attunr.com/pricing",
    }));
});

describe("pageMetadata", () => {
  const meta = pageMetadata({
    siteUrl: site,
    siteName: "Helpful Machines",
    locale: "pl",
    path: "/services",
    title: "Usługi",
    description: "Opis",
    ogImage: "/og/services-pl.png",
  });
  it("sets canonical to the locale URL", () => expect(meta.alternates?.canonical).toBe("https://attunr.com/pl/services"));
  it("sets hreflang alternates", () =>
    expect(meta.alternates?.languages).toEqual(languageAlternates(site, "/services")));
  it("sets open graph for the market", () =>
    expect(meta.openGraph).toMatchObject({
      type: "website",
      url: "https://attunr.com/pl/services",
      siteName: "Helpful Machines",
      locale: "pl_PL",
      alternateLocale: ["en_AU"],
      title: "Usługi",
      description: "Opis",
      images: [{ url: "https://attunr.com/og/services-pl.png", width: 1200, height: 630 }],
    }));
  it("sets twitter card", () => expect(meta.twitter).toMatchObject({ card: "summary_large_image", title: "Usługi" }));
});

describe("buildSitemap", () => {
  it("emits one entry per locale with alternates", () => {
    const entries = buildSitemap(site, [{ path: "/" }, { path: "/pricing", locales: ["en"] }]);
    expect(entries.map((e) => e.url)).toEqual(["https://attunr.com/", "https://attunr.com/pl", "https://attunr.com/pricing"]);
    expect(entries[1]!.alternates?.languages).toEqual(languageAlternates(site, "/"));
    expect(entries[2]!.alternates?.languages).toEqual({
      "en-AU": "https://attunr.com/pricing",
      "x-default": "https://attunr.com/pricing",
    });
  });
});

describe("buildRobots", () => {
  it("allows everything except the API and points at the sitemap", () =>
    expect(buildRobots(site)).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/ingest/"] },
      sitemap: "https://attunr.com/sitemap.xml",
    }));
});

describe("pageMetadata with an absolute ogImage", () => {
  it("passes it through unchanged", () => {
    const meta = pageMetadata({
      siteUrl: site, siteName: "X", locale: "en", path: "/", title: "T", description: "D",
      ogImage: "https://cdn.example.com/og.png",
    });
    expect(meta.openGraph).toMatchObject({ images: [{ url: "https://cdn.example.com/og.png" }] });
  });
});
