import type { Locale } from "./locale";

export const CONSENT_COOKIE = "consent";
export type Consent = "granted" | "denied";

/**
 * Consent banner shows only in the Polish market (GDPR); Australia has none.
 * An unknown market (root 404 pages) is treated as consent-required, the safe default.
 */
export function consentRequired(locale: Locale | null): boolean {
  return locale !== "en";
}

/** PostHog persistence mode for a visitor. */
export function analyticsPersistence(locale: Locale | null, consent: Consent | null): "memory" | "localStorage+cookie" {
  if (!consentRequired(locale)) return "localStorage+cookie";
  return consent === "granted" ? "localStorage+cookie" : "memory";
}

export function parseConsent(value: string | undefined): Consent | null {
  return value === "granted" || value === "denied" ? value : null;
}
