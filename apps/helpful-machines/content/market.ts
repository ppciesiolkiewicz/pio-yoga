import type { Locale } from "@repo/web/locale";

export type PlanKey = "light" | "focus";
export const planKeys: readonly PlanKey[] = ["light", "focus"];

export type Market = {
  currency: "AUD";
  /**
   * Founding-client monthly plans: dedicated hours per week, billed monthly, at a price locked for the client's first 12 months.
   * `regularPrice` is the usual monthly price the founding price is discounted from (up to 70% off).
   */
  plans: Record<PlanKey, { monthlyPrice: number; regularPrice: number; hoursPerWeek: number }>;
};

export const markets: Record<"en", Market> = {
  en: {
    currency: "AUD",
    plans: {
      light: { monthlyPrice: 199, regularPrice: 600, hoursPerWeek: 4 },
      focus: { monthlyPrice: 299, regularPrice: 1000, hoursPerWeek: 8 },
    },
  },
};

export function getMarket(_locale: Locale): Market {
  return markets.en;
}
