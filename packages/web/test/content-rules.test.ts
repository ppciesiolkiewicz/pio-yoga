import { describe, expect, it } from "vitest";
import { collectStrings, findBareApps, findBarePolishApps, findCopyViolations } from "../src/content-rules";

describe("findBareApps (english)", () => {
  it("allows 'custom app(s)' in any case", () =>
    expect(findBareApps("We build custom apps. Custom App support. CUSTOM APPS.")).toEqual([]));
  it("flags bare app/apps", () => {
    expect(findBareApps("Our apps are great").map((f) => f.match)).toEqual(["apps"]);
    expect(findBareApps("Apps for you, and a web app too").map((f) => f.match)).toEqual(["Apps", "app"]);
  });
  it("ignores words that merely contain app", () => expect(findBareApps("Apple happy webapps application")).toEqual([]));
});

describe("findBarePolishApps", () => {
  it("allows 'dedykowane aplikacje' and 'aplikacje na zamówienie' in any inflection", () => {
    expect(findBarePolishApps("Tworzymy dedykowane aplikacje.")).toEqual([]);
    expect(findBarePolishApps("Robimy aplikacje na zamówienie.")).toEqual([]);
    expect(findBarePolishApps("Zbudujemy dedykowaną aplikację mobilną.")).toEqual([]);
    expect(findBarePolishApps("Aplikację na zamówienie wdrożymy szybko.")).toEqual([]);
  });
  it("flags bare aplikacja forms", () => {
    expect(findBarePolishApps("Nasze aplikacje są szybkie").map((f) => f.match)).toEqual(["aplikacje"]);
    expect(findBarePolishApps("Aplikację mobilną też").map((f) => f.match)).toEqual(["Aplikację"]);
  });
});

describe("collectStrings", () => {
  it("walks nested objects and arrays with dotted paths", () =>
    expect(collectStrings({ a: "x", b: { c: ["y", "z"], n: 3 } })).toEqual([
      { path: "a", value: "x" },
      { path: "b.c.0", value: "y" },
      { path: "b.c.1", value: "z" },
    ]));
});

describe("findCopyViolations", () => {
  it("reports the dictionary path of each violation", () => {
    expect(findCopyViolations({ hero: { title: "Custom apps" }, nav: ["Apps"] }, "en")).toEqual([
      { path: "nav.0", match: "Apps", index: 0 },
    ]);
    expect(findCopyViolations({ s: { t: "aplikacje" } }, "pl")).toEqual([{ path: "s.t", match: "aplikacje", index: 0 }]);
  });
});

describe("fewer false positives", () => {
  it("allows one word between custom and app(s)", () => {
    expect(findBareApps("Custom web apps for shops")).toEqual([]);
    expect(findBareApps("Custom-built apps")).toEqual([]);
  });
  it("allows up to three words before 'na zamówienie'", () =>
    expect(findBarePolishApps("Tworzymy aplikacji webowych i mobilnych na zamówienie.")).toEqual([]));
  it("skips slug-like strings", () => {
    expect(findCopyViolations({ slug: "custom-apps-websites", path: "/services/apps", pl: "dedykowane-aplikacje" }, "en")).toEqual([]);
    expect(findCopyViolations({ pl: "dedykowane-aplikacje" }, "pl")).toEqual([]);
  });
  it("still flags bare apps in sentences", () =>
    expect(findCopyViolations({ s: "Our apps rock" }, "en")).toHaveLength(1));
});
