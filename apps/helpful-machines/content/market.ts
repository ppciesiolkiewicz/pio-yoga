import type { Locale } from "@repo/web/locale";

export type PlanKey = "light" | "focus";
export const planKeys: readonly PlanKey[] = ["light", "focus"];

export type Market = {
  currency: "AUD" | "PLN";
  /** New-client monthly plans: dedicated hours per month at a price locked for the client's first 12 months. */
  plans: Record<PlanKey, { monthlyPrice: number; hoursPerMonth: number }>;
};

export const markets: Record<Locale, Market> = {
  en: {
    currency: "AUD",
    plans: { light: { monthlyPrice: 89, hoursPerMonth: 4 }, focus: { monthlyPrice: 219, hoursPerMonth: 10 } },
  },
  pl: {
    currency: "PLN",
    /** PLACEHOLDER: roughly the AUD prices converted; confirm. */
    plans: { light: { monthlyPrice: 129, hoursPerMonth: 4 }, focus: { monthlyPrice: 259, hoursPerMonth: 10 } },
  },
};
