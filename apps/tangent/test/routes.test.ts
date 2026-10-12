import { describe, expect, it } from "vitest";
import { en } from "../content/en";
import { pl } from "../content/pl";
import { allPaths, ogKey, pageTitle, pathFromOgKey, servicePaths, staticPaths, workPaths } from "../lib/routes";

describe("routes", () => {
  it("lists 7 static pages, 6 services and 7 case studies", () => {
    expect(staticPaths).toEqual(["/", "/services", "/work", "/about", "/contact", "/privacy", "/terms"]);
    expect(servicePaths[0]).toBe("/services/fresh-look");
    expect(servicePaths).toHaveLength(6);
    expect(workPaths).toHaveLength(7);
    expect(allPaths).toHaveLength(20);
  });
  it("round-trips OG keys", () => {
    for (const path of allPaths) expect(pathFromOgKey(ogKey(path))).toBe(path);
    expect(ogKey("/work/onchain")).toBe("work--onchain");
  });
  it("has a title for every page in both languages", () => {
    for (const t of [en, pl]) for (const path of allPaths) expect(pageTitle(t, path), path).toBeTruthy();
    expect(pageTitle(en, "/work/nope")).toBeNull();
    expect(pageTitle(en, "/services/toString")).toBeNull();
    expect(pageTitle(en, "/pricing")).toBeNull();
  });
});
