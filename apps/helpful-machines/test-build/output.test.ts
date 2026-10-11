import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { allBuckets } from "@repo/web/experiments";
import { localizedPath, locales } from "@repo/web/locale";
import { absoluteUrl } from "@repo/web/seo";
import { resolveSiteUrl } from "@repo/web/site";
import { experiments } from "../experiments";
import { allPaths } from "../lib/routes";

const root = fileURLToPath(new URL("../.next/server/app/", import.meta.url));
const buckets = allBuckets(experiments);
const fileFor = (bucket: string, locale: string, path: string) =>
  join(root, bucket, path === "/" ? `${locale}.html` : `${locale}${path}.html`);
const html = (bucket: string, locale: string, path: string) => readFileSync(fileFor(bucket, locale, path), "utf8");
const canonical = (page: string) => page.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
/** Next prints the root as "https://x.com" and we build "https://x.com/"; they're the same URL. */
const same = (url: string | undefined) => (url ? new URL(url).href : url);
const siteUrl = resolveSiteUrl();

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? htmlFiles(full) : name.endsWith(".html") ? [full] : [];
  });
}

describe("Helpful Machines build output", () => {
  it("exists (run `pnpm --filter helpful-machines build` first)", () => expect(existsSync(root)).toBe(true));

  it("pre-renders every bucket × locale × page", () => {
    for (const bucket of buckets) for (const locale of locales) for (const path of allPaths) {
      expect(existsSync(fileFor(bucket, locale, path)), `${bucket}/${locale}${path}`).toBe(true);
    }
  });

  it("sets <html lang> and the design", () => {
    expect(html("control", "en", "/")).toMatch(/<html[^>]*lang="en-AU"/);
    expect(html("control", "pl", "/")).toMatch(/<html[^>]*lang="pl-PL"/);
    expect(html("easy-mode", "en", "/pricing")).toMatch(/<html[^>]*data-design="helpful-machines"/);
  });

  it("renders each hero variant in each market", () => {
    expect(html("control", "en", "/")).toContain("does the boring bits");
    expect(html("easy-mode", "en", "/")).toContain("easy mode");
    expect(html("control", "pl", "/")).toContain("robi nudną robotę");
    expect(html("easy-mode", "pl", "/")).toContain("tryb łatwy");
  });

  it("gives every bucket the same public canonical", () => {
    for (const locale of locales) for (const path of ["/", "/services", "/services/custom-apps-websites", "/contact"]) {
      const expected = absoluteUrl(siteUrl, localizedPath(locale, path));
      for (const bucket of buckets) expect(same(canonical(html(bucket, locale, path))), `${bucket}/${locale}${path}`).toBe(same(expected));
    }
  });

  it("has hreflang alternates for both markets and x-default", () => {
    const page = html("control", "en", "/pricing");
    expect(page).toMatch(new RegExp(`hreflang="pl-PL" href="${absoluteUrl(siteUrl, "/pl/pricing")}"`, "i"));
    expect(page).toMatch(new RegExp(`hreflang="x-default" href="${absoluteUrl(siteUrl, "/pricing")}"`, "i"));
  });

  it("never links to an internal bucket path", () => {
    const internal = new RegExp(`href="/(?:${buckets.join("|")})(?:/|")`);
    for (const file of htmlFiles(root)) expect(readFileSync(file, "utf8"), file).not.toMatch(internal);
  });

  it("has one h1 per page", () => {
    for (const path of allPaths) {
      const count = html("control", "en", path).match(/<h1[\s>]/g)?.length ?? 0;
      expect(count, path).toBe(1);
    }
  });

  it("ships FAQ and service structured data", () => {
    expect(html("control", "en", "/faq")).toContain('"@type":"FAQPage"');
    expect(html("control", "pl", "/services/spreadsheets-data")).toContain('"@type":"Service"');
  });

  it("renders a branded, bilingual 404 page (not an empty error shell)", () => {
    const page = readFileSync(join(root, "_not-found.html"), "utf8");
    expect(page).not.toContain("__next_error__");
    expect(page).toMatch(/<html[^>]*data-design="helpful-machines"/);
    expect(page).toMatch(/<h1[^>]*>[^<]*Page not found/);
    expect(page).toContain("Nie znaleziono strony");
    expect(page).toContain('href="/pl"');
  });

  it("follows the copy rule in rendered Polish pages", () => {
    expect(html("control", "pl", "/")).toContain("Dedykowane aplikacje");
  });
});
