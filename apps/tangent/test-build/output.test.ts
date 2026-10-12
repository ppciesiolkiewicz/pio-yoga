import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { allBuckets } from "@repo/web/experiments";
import { localizedPath, locales } from "@repo/web/locale";
import { absoluteUrl } from "@repo/web/seo";
import { experiments } from "../experiments";
import { site } from "../site.config";
import { allPaths } from "../lib/routes";

const root = fileURLToPath(new URL("../.next/server/app/", import.meta.url));
const buckets = allBuckets(experiments);
const fileFor = (bucket: string, locale: string, path: string) =>
  join(root, bucket, path === "/" ? `${locale}.html` : `${locale}${path}.html`);
const html = (bucket: string, locale: string, path: string) => readFileSync(fileFor(bucket, locale, path), "utf8");
const canonical = (page: string) => page.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const same = (url: string | undefined) => (url ? new URL(url).href : url);
const siteUrl = site.url;

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? htmlFiles(full) : name.endsWith(".html") ? [full] : [];
  });
}

describe("Tangent build output", () => {
  it("exists (run `pnpm --filter tangent build` first)", () => expect(existsSync(root)).toBe(true));

  it("defaults to https://tangentlabs.com.au when NEXT_PUBLIC_SITE_URL is unset", () => {
    if (process.env.NEXT_PUBLIC_SITE_URL) return;
    expect(canonical(html("control", "en", "/about"))).toBe("https://tangentlabs.com.au/about");
  });

  it("pre-renders every bucket × locale × page", () => {
    for (const bucket of buckets) for (const locale of locales) for (const path of allPaths) {
      expect(existsSync(fileFor(bucket, locale, path)), `${bucket}/${locale}${path}`).toBe(true);
    }
  });

  it("gives each bucket its own design on every page", () => {
    for (const locale of locales) for (const path of allPaths) {
      expect(html("control", locale, path)).toMatch(/<html[^>]*data-design="tangent-precision"/);
      expect(html("editorial", locale, path)).toMatch(/<html[^>]*data-design="tangent-editorial"/);
    }
  });

  it("shows the same copy in both designs", () => {
    for (const bucket of buckets) {
      expect(html(bucket, "en", "/")).toContain("Connect the dots.");
      expect(html(bucket, "pl", "/")).toContain("Połącz kropki.");
    }
  });

  it("sets <html lang>", () => {
    expect(html("control", "en", "/")).toMatch(/<html[^>]*lang="en-AU"/);
    expect(html("editorial", "pl", "/work")).toMatch(/<html[^>]*lang="pl-PL"/);
  });

  it("gives both designs the same public canonical", () => {
    for (const locale of locales) for (const path of ["/", "/services/fresh-look", "/work/onchain", "/about"]) {
      const expected = same(absoluteUrl(siteUrl, localizedPath(locale, path)));
      for (const bucket of buckets) expect(same(canonical(html(bucket, locale, path))), `${bucket}/${locale}${path}`).toBe(expected);
    }
  });

  it("never links to an internal bucket path", () => {
    const internal = new RegExp(`href="/(?:${buckets.join("|")})(?:/|")`);
    for (const file of htmlFiles(root)) expect(readFileSync(file, "utf8"), file).not.toMatch(internal);
  });

  it("has one h1 per page", () => {
    for (const bucket of buckets) for (const path of allPaths) {
      const count = html(bucket, "en", path).match(/<h1[\s>]/g)?.length ?? 0;
      expect(count, `${bucket}${path}`).toBe(1);
    }
  });

  it("hides the connect-the-dots illustration from assistive tech", () =>
    expect(html("control", "en", "/")).toMatch(/<svg class="tg-dots[^"]*"[^>]*aria-hidden="true"/));

  it("credits case studies and ships structured data", () => {
    expect(html("control", "en", "/work/officeworks")).toContain("Work by Piotr Ciesiolkiewicz while working with Officeworks.");
    expect(html("control", "en", "/about")).toContain('"@type":"Person"');
    expect(html("editorial", "pl", "/services/fresh-look")).toContain('"@type":"FAQPage"');
  });

  it("credits Piotr on every case-study card in the work index", () => {
    const page = html("control", "en", "/work");
    for (const client of ["ONCHAIN", "Officeworks", "Nokia Networks"]) expect(page).toContain(`Piotr's work at ${client}`);
  });

  it("renders a branded, bilingual 404 page", () => {
    const page = readFileSync(join(root, "_not-found.html"), "utf8");
    expect(page).not.toContain("__next_error__");
    expect(page).toMatch(/<html[^>]*data-design="tangent-precision"/);
    expect(page).toMatch(/<h1[^>]*>[^<]*Page not found/);
    expect(page).toContain("Nie znaleziono strony");
  });

  it("puts the brand in every page title", () => {
    for (const locale of locales) for (const path of allPaths) {
      expect(html("control", locale, path).match(/<title>([^<]*)<\/title>/)?.[1], `${locale}${path}`).toContain("Tangent");
    }
  });

  it("gives the root 404 a working language link (not /pl/_not-found)", () =>
    expect(readFileSync(join(root, "_not-found.html"), "utf8")).not.toContain("/pl/_not-found"));

  it("preloads at most one font file per page (performance budget)", () => {
    for (const path of ["/", "/about"]) {
      const preloads = html("control", "en", path).match(/<link rel="preload" href="[^"]+\.woff2"/g) ?? [];
      expect(preloads.length, path).toBeLessThanOrEqual(1);
    }
  });

  it("still declares the Latin Extended face so Polish letters use the brand font", () => {
    const cssDir = fileURLToPath(new URL("../.next/static/css/", import.meta.url));
    const css = readdirSync(cssDir).map((f) => readFileSync(join(cssDir, f), "utf8")).join("");
    expect(css).toMatch(/u\+0100-02ba/i);
  });
});
