import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "@repo/web/locale";

const timeZones = { en: "Australia/Melbourne", pl: "Europe/Warsaw" } as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested) ? requested : defaultLocale;
  return { locale, messages: {}, timeZone: timeZones[locale] };
});
