import { describe, expect, it } from "vitest";
import { collectStrings, findCopyViolations } from "@repo/web/content-rules";
import { en } from "../content/en";
import { pl } from "../content/pl";
import { markets } from "../content/market";
import { serviceSlugs } from "../content/services";
import { workSlugs } from "../content/work";
import { experiments } from "../experiments";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return "array";
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(obj).sort().map((k) => [k, shape(obj[k])]));
  }
  return typeof value;
}

describe("Helpful Machines content", () => {
  it("Polish has exactly the same shape as English", () => expect(shape(pl)).toEqual(shape(en)));

  it("follows the Custom apps rule in both languages", () => {
    expect(findCopyViolations(en, "en")).toEqual([]);
    expect(findCopyViolations(pl, "pl")).toEqual([]);
  });

  it("has no empty strings", () => {
    for (const dict of [en, pl]) for (const { path, value } of collectStrings(dict)) expect(value.trim(), path).not.toBe("");
  });

  it("covers every service and work item", () => {
    for (const dict of [en, pl]) {
      expect(Object.keys(dict.services.items).sort()).toEqual([...serviceSlugs].sort());
      expect(Object.keys(dict.work.items).sort()).toEqual([...workSlugs].sort());
      for (const slug of serviceSlugs) {
        const item = dict.services.items[slug];
        expect(item.problems.length, slug).toBeGreaterThan(0);
        expect(item.whatWeDo.length, slug).toBeGreaterThan(0);
        expect(item.deliverables.length, slug).toBeGreaterThan(0);
        expect(item.faq.length, slug).toBeGreaterThan(0);
      }
    }
  });

  it("has a 3-part headline for every hero variant", () => {
    const variants = Object.keys(experiments.hero.variants).sort();
    for (const dict of [en, pl]) {
      expect(Object.keys(dict.hero.title).sort()).toEqual(variants);
      for (const parts of Object.values(dict.hero.title)) expect(parts).toHaveLength(3);
    }
  });

  it("has whole positive prices in the market currency", () => {
    expect(markets.en.currency).toBe("AUD");
    expect(markets.pl.currency).toBe("PLN");
    for (const market of Object.values(markets)) {
      for (const price of Object.values(market.prices)) {
        expect(Number.isInteger(price)).toBe(true);
        expect(price).toBeGreaterThan(0);
      }
    }
  });

  it("Polish privacy text matches what analytics really does before consent", () => {
    // Before consent PostHog still runs, cookieless (memory persistence); only storage waits for consent.
    const privacy = JSON.stringify(pl.privacy);
    expect(privacy).toContain("bez plików cookie");
    expect(privacy).not.toContain("Za Twoją zgodą korzystamy z analityki");
  });

  it("keeps the pricing teaser placeholder", () => {
    expect(en.pricing.teaser.body).toContain("{price}");
    expect(pl.pricing.teaser.body).toContain("{price}");
  });
});
