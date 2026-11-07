import { describe, expect, it } from "vitest";
import { collectStrings, findCopyViolations } from "@repo/web/content-rules";
import { en } from "../content/en";
import { markets, planKeys } from "../content/market";
import { serviceSlugs } from "../content/services";
import { workSlugs } from "../content/work";
import { experiments } from "../experiments";

describe("Helpful Machines content", () => {
  it("follows the Custom apps rule", () => {
    expect(findCopyViolations(en, "en")).toEqual([]);
  });

  it("has no empty strings", () => {
    for (const { path, value } of collectStrings(en)) expect(value.trim(), path).not.toBe("");
  });

  it("covers every service and work item", () => {
    expect(Object.keys(en.services.items).sort()).toEqual([...serviceSlugs].sort());
    expect(Object.keys(en.work.items).sort()).toEqual([...workSlugs].sort());
    for (const slug of serviceSlugs) {
      const item = en.services.items[slug];
      expect(item.problems.length, slug).toBeGreaterThan(0);
      expect(item.whatWeDo.length, slug).toBeGreaterThan(0);
      expect(item.deliverables.length, slug).toBeGreaterThan(0);
      expect(item.faq.length, slug).toBeGreaterThan(0);
    }
  });

  it("has a 3-part headline for every hero variant", () => {
    const variants = Object.keys(experiments.hero.variants).sort();
    expect(Object.keys(en.hero.title).sort()).toEqual(variants);
    for (const parts of Object.values(en.hero.title)) expect(parts).toHaveLength(3);
  });

  it("has whole positive weekly plans in the market currency", () => {
    expect(markets.en.currency).toBe("AUD");
    for (const key of planKeys) {
      const plan = markets.en.plans[key];
      expect(Number.isInteger(plan.monthlyPrice)).toBe(true);
      expect(plan.monthlyPrice).toBeGreaterThan(0);
      expect(plan.hoursPerMonth).toBeGreaterThan(0);
    }
    expect(markets.en.plans).toEqual({
      light: { monthlyPrice: 199, regularPrice: 600, hoursPerMonth: 4 },
      focus: { monthlyPrice: 299, regularPrice: 1200, hoursPerMonth: 8 },
    });
  });

  it("founding price is up to 75% off the usual price", () => {
    for (const key of planKeys) {
      const { monthlyPrice, regularPrice } = markets.en.plans[key];
      expect(regularPrice).toBeGreaterThan(monthlyPrice);
      expect(1 - monthlyPrice / regularPrice).toBeLessThanOrEqual(0.76);
    }
  });

  it("keeps the plan placeholders in the offer copy", () => {
    for (const text of [en.pricing.teaser.title, en.pricing.teaser.body, en.pricing.banner.detail]) expect(text).toContain("{price}");
    for (const text of [en.pricing.teaser.body, en.pricing.banner.detail]) expect(text).toContain("{hours}");
    for (const key of planKeys) expect(en.pricing.plans[key].name).toContain("{hours}");
    for (const text of [en.pricing.teaser.body, en.pricing.banner.detail]) expect(text).toContain("{fullPrice}");
  });
});
