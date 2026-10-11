import type { Locale } from "@repo/web/locale";

export type Market = {
  currency: "AUD" | "PLN";
  /** PLACEHOLDER starting prices: confirm before launch. */
  prices: { quickWin: number; customApp: number; support: number };
};

export const markets: Record<Locale, Market> = {
  en: { currency: "AUD", prices: { quickWin: 900, customApp: 4900, support: 390 } },
  pl: { currency: "PLN", prices: { quickWin: 2400, customApp: 12900, support: 990 } },
};
