import { describe, expect, it } from "vitest";
import { en } from "../content/en";
import { pl } from "../content/pl";
import { allPaths, ogKey, pageTitle, pathFromOgKey, servicePaths, staticPaths } from "../lib/routes";

describe("routes", () => {
  it("lists 9 static pages and 5 service pages", () => {
    expect(staticPaths).toHaveLength(9);
    expect(servicePaths).toEqual([
      "/services/find-what-works",
      "/services/ai-assistants-automation",
      "/services/custom-apps-websites",
      "/services/spreadsheets-data",
      "/services/migrations-integrations",
    ]);
    expect(allPaths).toHaveLength(14);
  });
  it("round-trips OG keys", () => {
    expect(ogKey("/")).toBe("home");
    expect(ogKey("/services/spreadsheets-data")).toBe("services--spreadsheets-data");
    for (const path of allPaths) expect(pathFromOgKey(ogKey(path))).toBe(path);
  });
  it("has a title for every page in both languages", () => {
    for (const t of [en, pl]) for (const path of allPaths) expect(pageTitle(t, path), path).toBeTruthy();
    expect(pageTitle(en, "/services/nope")).toBeNull();
    expect(pageTitle(en, "/nope")).toBeNull();
    expect(pageTitle(en, "/services/toString")).toBeNull();
  });
});
