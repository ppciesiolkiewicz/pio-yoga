import { analyticsPersistence, type Consent } from "./consent";
import type { Assignment } from "./experiments";
import type { Locale } from "./locale";

/** locale null = unknown market (root 404): cookieless until consent, like Poland. */
export function posthogConfig(locale: Locale | null, consent: Consent | null) {
  return {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    persistence: analyticsPersistence(locale, consent),
    capture_pageview: "history_change" as const,
    capture_pageleave: true,
    autocapture: false,
    disable_session_recording: true,
    // Variants come from the edge middleware. PostHog's own /flags result would overwrite
    // $feature/<key> on every event and corrupt the experiment.
    advanced_disable_feature_flags: true,
  };
}

export function superProperties(o: { market: Locale | null; colorMode: string; assignment: Assignment }): Record<string, string> {
  const props: Record<string, string> = { market: o.market ?? "unknown", color_mode: o.colorMode };
  for (const [name, variant] of Object.entries(o.assignment)) props[`$feature/${name}`] = variant;
  return props;
}

export function exposureEvents(assignment: Assignment) {
  return Object.entries(assignment).map(([flag, variant]) => ({
    event: "$feature_flag_called" as const,
    properties: { $feature_flag: flag, $feature_flag_response: variant },
  }));
}
