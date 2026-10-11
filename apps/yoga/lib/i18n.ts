import { en } from "@/content/en";
import { pl } from "@/content/pl";

export const locales = ["en", "pl"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

const dictionaries = { en, pl };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export const ogLocale: Record<Locale, string> = { en: "en_US", pl: "pl_PL" };
