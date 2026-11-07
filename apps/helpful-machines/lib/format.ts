import { getFormatter } from "next-intl/server";
import type { Locale } from "@repo/web/locale";

const options = (currency: "AUD" | "PLN") => ({ style: "currency", currency, maximumFractionDigits: 0 }) as const;

export async function priceFormatter(currency: "AUD" | "PLN") {
  const format = await getFormatter();
  return (amount: number) => format.number(amount, options(currency));
}

/** Same output as priceFormatter, for components outside a next-intl request (the site-wide Document). */
export function formatPrice(locale: Locale, currency: "AUD" | "PLN", amount: number) {
  return new Intl.NumberFormat(locale, options(currency)).format(amount);
}

/** Fills {price}, {fullPrice} and {hours} in a copy string from a plan. */
export function fillPlan(text: string, price: string, hours: number, fullPrice = "") {
  return text.replace("{price}", price).replace("{fullPrice}", fullPrice).replace("{hours}", String(hours));
}
