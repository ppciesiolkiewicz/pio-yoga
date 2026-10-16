import { describe, expect, it } from "vitest";
import { collectStrings, findCopyViolations } from "@repo/web/content-rules";
import { en } from "../content/en";
import { pl } from "../content/pl";
import { markets, planKeys } from "../content/market";
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

  it("has whole positive weekly plans in the market currency", () => {
    expect(markets.en.currency).toBe("AUD");
    expect(markets.pl.currency).toBe("PLN");
    for (const market of Object.values(markets)) {
      for (const key of planKeys) {
        const plan = market.plans[key];
        expect(Number.isInteger(plan.monthlyPrice)).toBe(true);
        expect(plan.monthlyPrice).toBeGreaterThan(0);
        expect(plan.hoursPerMonth).toBeGreaterThan(0);
      }
    }
    expect(markets.en.plans).toEqual({ light: { monthlyPrice: 89, hoursPerMonth: 4 }, focus: { monthlyPrice: 219, hoursPerMonth: 10 } });
  });

  it("Polish privacy text matches what analytics really does before consent", () => {
    // Before consent PostHog still runs, cookieless (memory persistence); only storage waits for consent.
    const privacy = JSON.stringify(pl.privacy);
    expect(privacy).toContain("bez plików cookie");
    expect(privacy).not.toContain("Za Twoją zgodą korzystamy z analityki");
  });

  it("keeps the plan placeholders in the offer copy", () => {
    for (const dict of [en, pl]) {
      for (const text of [dict.pricing.teaser.title, dict.pricing.teaser.body, dict.pricing.banner.text]) expect(text).toContain("{price}");
      for (const text of [dict.pricing.teaser.body, dict.pricing.banner.text]) expect(text).toContain("{hours}");
      for (const key of planKeys) expect(dict.pricing.plans[key].name).toContain("{hours}");
    }
  });

  it("Polish copy uses neutral forms and the reviewed wording", () => {
    const text = collectStrings(pl).map((s) => s.value).join(" ");
    expect(text).not.toMatch(/\p{L}+łeś\b/u);
    for (const phrase of ["aktualizują się nawzajem", "Plan wycofania zmian", "zarejestrowany na Ciebie", "Nawigacja główna"]) {
      expect(text).toContain(phrase);
    }
  });
});
