import { describe, expect, it } from "vitest";
import { collectStrings } from "@repo/web/content-rules";
import { en } from "../content/en";
import { people, visiblePeople } from "../content/people";
import { pl } from "../content/pl";
import { serviceSlugs } from "../content/services";
import { featuredWork, workSlugs } from "../content/work";
import { experiments } from "../experiments";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return "array";
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(obj).sort().map((k) => [k, shape(obj[k])]));
  }
  return typeof value;
}

describe("Tangent content", () => {
  it("Polish has exactly the same shape as English", () => expect(shape(pl)).toEqual(shape(en)));

  it("has no empty strings", () => {
    for (const dict of [en, pl]) for (const { path, value } of collectStrings(dict)) expect(value.trim(), path).not.toBe("");
  });

  it("covers every service, case study and person in both languages", () => {
    for (const dict of [en, pl]) {
      expect(Object.keys(dict.services.items).sort()).toEqual([...serviceSlugs].sort());
      expect(Object.keys(dict.work.items).sort()).toEqual([...workSlugs].sort());
      expect(Object.keys(dict.people.items).sort()).toEqual(people.map((p) => p.id).sort());
      for (const slug of workSlugs) {
        const item = dict.work.items[slug];
        expect(item.whatChanged.length, slug).toBeGreaterThan(0);
        expect(item.stack.length, slug).toBeGreaterThan(0);
      }
    }
    for (const slug of featuredWork) expect(workSlugs).toContain(slug);
  });

  it("keeps the agreed positioning", () => {
    expect(en.hero.title.join("")).toBe("Connect the dots. Fix the flow.");
    expect(serviceSlugs[0]).toBe("fresh-look");
    for (const dict of [en, pl]) {
      const text = collectStrings(dict).map((s) => s.value.toLowerCase()).join(" ");
      expect(text).not.toMatch(/diagnos/);
      expect(text).not.toMatch(/yoga|joga|dance teacher|nauczyciel tańca/);
    }
  });

  it("never invents metrics in case studies", () => {
    for (const dict of [en, pl]) {
      for (const slug of workSlugs) {
        const { result, summary } = dict.work.items[slug];
        expect(`${result} ${summary}`, slug).not.toMatch(/\d+\s?%|\d+x\b/);
      }
    }
  });

  it("credits case studies as Piotr's work at the client", () => {
    for (const dict of [en, pl]) expect(dict.work.credit).toContain("{client}");
  });

  it("only shows people who consented", () => {
    expect(visiblePeople().every((p) => p.consent)).toBe(true);
    expect(visiblePeople().map((p) => p.id)).toContain("piotr");
  });

  it("design variants map to the two design keys", () =>
    expect(experiments.design.variants).toEqual({ control: "tangent-precision", editorial: "tangent-editorial" }));
});

describe("honest framing of past work", () => {
  it("never presents Piotr's client work as Tangent's own", () => {
    for (const dict of [en, pl]) {
      const text = collectStrings(dict).map((x) => x.value).join(" ");
      expect(text).not.toMatch(/Problems we've solved|Problemy, które rozwiązaliśmy|We've built|Budowaliśmy/);
    }
  });
  it("credits Piotr on every case-study card", () => {
    for (const dict of [en, pl]) expect(dict.work.cardCredit).toContain("{client}");
  });
  it("Polish Lysn bullet states a purpose, not a claimed result (matches English)", () =>
    expect(pl.work.items.lysn.whatChanged.join(" ")).toContain("żeby zwiększyć przychody"));
  it("Polish services title says leadership, not IT helpdesk", () => {
    expect(pl.meta.services.title).not.toContain("wsparcie techniczne");
    expect(pl.meta.services.title).toContain("przywództwo techniczne");
  });
});

describe("Polish copy review", () => {
  it("addresses the reader consistently as Ty, with the reviewed fixes", () => {
    const text = collectStrings(pl).map((s) => s.value).join(" ");
    expect(text).not.toMatch(/\b(Wasz|możecie|chcecie|Polegacie|zatrudniacie)\b/);
    expect(text).toContain("jest korzystny");
    expect(text).toContain("dziesiątki tysięcy różnych kryptowalut");
    expect(pl.hero.dots.users).toBe("użytkownicy");
  });
});
