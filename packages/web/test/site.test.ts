import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "../src/site";

describe("resolveSiteUrl", () => {
  it("falls back to attunr.com", () => expect(resolveSiteUrl({})).toBe("https://attunr.com"));
  it("strips trailing slashes and whitespace", () =>
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "  https://helpfulmachines.ai//  " })).toBe(
      "https://helpfulmachines.ai",
    ));
  it("adds https when the protocol is missing", () =>
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "tangent.attunr.com" })).toBe("https://tangent.attunr.com"));
  it("keeps a path prefix", () =>
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://attunr.com/tangent/" })).toBe(
      "https://attunr.com/tangent",
    ));
  it("treats an empty value as missing", () => expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "" })).toBe("https://attunr.com"));
  it("throws on a value that is not a URL", () =>
    expect(() => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "not a url" })).toThrow(/NEXT_PUBLIC_SITE_URL/));
  it("reads the env var as a literal so Next can inline it into client bundles", () => {
    const source = readFileSync(new URL("../src/site.ts", import.meta.url), "utf8");
    expect(source).toContain("process.env.NEXT_PUBLIC_SITE_URL");
  });
});
