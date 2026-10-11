import { getFormatter } from "next-intl/server";

export async function priceFormatter(currency: "AUD" | "PLN") {
  const format = await getFormatter();
  return (amount: number) => format.number(amount, { style: "currency", currency, maximumFractionDigits: 0 });
}
