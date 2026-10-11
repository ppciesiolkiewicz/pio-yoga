import type { Locale } from "./locale";

export const CONSENT_COOKIE = "consent";
export type Consent = "granted" | "denied";

/** Consent banner shows only in the Polish market (GDPR); Australia has none. */
export function consentRequired(locale: Locale): boolean {
  return locale === "pl";
}

/** PostHog persistence mode for a visitor. */
export function analyticsPersistence(locale: Locale, consent: Consent | null): "memory" | "localStorage+cookie" {
  if (!consentRequired(locale)) return "localStorage+cookie";
  return consent === "granted" ? "localStorage+cookie" : "memory";
}

export function parseConsent(value: string | undefined): Consent | null {
  return value === "granted" || value === "denied" ? value : null;
}
