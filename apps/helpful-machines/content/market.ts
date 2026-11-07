import type { Locale } from "@repo/web/locale";

export type PlanKey = "light" | "focus";
export const planKeys: readonly PlanKey[] = ["light", "focus"];

export type Market = {
  currency: "AUD" | "PLN";
  /**
   * Founding-client monthly plans: dedicated hours per month at a price locked for the client's first 12 months.
   * `regularPrice` is the usual monthly price the founding price is discounted from (up to 75% off).
   */
  plans: Record<PlanKey, { monthlyPrice: number; regularPrice: number; hoursPerMonth: number }>;
};

export const markets: Record<Locale, Market> = {
  en: {
    currency: "AUD",
    plans: {
      light: { monthlyPrice: 199, regularPrice: 600, hoursPerMonth: 4 },
      focus: { monthlyPrice: 299, regularPrice: 1200, hoursPerMonth: 8 },
    },
  },
  pl: {
    currency: "PLN",
    /** PLACEHOLDER: roughly the AUD prices converted; confirm. */
    plans: {
      light: { monthlyPrice: 129, regularPrice: 516, hoursPerMonth: 4 },
      focus: { monthlyPrice: 259, regularPrice: 1036, hoursPerMonth: 10 },
    },
  },
};
