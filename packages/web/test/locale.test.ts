import { describe, expect, it } from "vitest";
import { isLocale, localizedPath, normalizePath, splitLocale, stripInternalPrefix } from "../src/locale";

describe("normalizePath", () => {
  it.each([
    ["", "/"],
    ["/", "/"],
    ["services", "/services"],
    ["/services/", "/services"],
    ["//services//faq/", "/services/faq"],
  ])("%s → %s", (input, out) => expect(normalizePath(input)).toBe(out));
});

describe("localizedPath", () => {
  it("english has no prefix", () => {
    expect(localizedPath("en", "/")).toBe("/");
    expect(localizedPath("en", "services/")).toBe("/services");
  });
  it("polish is prefixed", () => {
    expect(localizedPath("pl", "/")).toBe("/pl");
    expect(localizedPath("pl", "/services")).toBe("/pl/services");
  });
});

describe("splitLocale", () => {
  it("root is english", () =>
    expect(splitLocale("/")).toEqual({ locale: "en", rest: "/", explicitDefault: false }));
  it("detects /pl and /pl/...", () => {
    expect(splitLocale("/pl")).toEqual({ locale: "pl", rest: "/", explicitDefault: false });
    expect(splitLocale("/pl/work/onchain")).toEqual({ locale: "pl", rest: "/work/onchain", explicitDefault: false });
  });
  it("paths that only start with 'pl' stay english", () => {
    expect(splitLocale("/plumbing")).toEqual({ locale: "en", rest: "/plumbing", explicitDefault: false });
    expect(splitLocale("/places/pl")).toEqual({ locale: "en", rest: "/places/pl", explicitDefault: false });
  });
  it("flags an explicit /en prefix", () => {
    expect(splitLocale("/en")).toEqual({ locale: "en", rest: "/", explicitDefault: true });
    expect(splitLocale("/en/services/")).toEqual({ locale: "en", rest: "/services", explicitDefault: true });
  });
});

describe("isLocale", () => {
  it("accepts only en and pl", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("pl")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe("stripInternalPrefix", () => {
  const buckets = ["control", "easy-mode"];
  it("strips bucket and locale from internal paths", () => {
    expect(stripInternalPrefix("/control/pl/services", buckets)).toEqual({ locale: "pl", rest: "/services" });
    expect(stripInternalPrefix("/easy-mode/en", buckets)).toEqual({ locale: "en", rest: "/" });
  });
  it("handles public paths", () => {
    expect(stripInternalPrefix("/pl/services/", buckets)).toEqual({ locale: "pl", rest: "/services" });
    expect(stripInternalPrefix("/services", buckets)).toEqual({ locale: "en", rest: "/services" });
  });
  it("does not strip a bucket-named page without a locale after it", () =>
    expect(stripInternalPrefix("/control", buckets)).toEqual({ locale: "en", rest: "/control" }));
});
