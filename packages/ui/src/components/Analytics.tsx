"use client";

import { useEffect } from "react";
import { exposureEvents, posthogConfig, superProperties } from "@repo/web/analytics";
import { analyticsPersistence, type Consent } from "@repo/web/consent";
import type { Assignment } from "@repo/web/experiments";
import type { Locale } from "@repo/web/locale";
import { ANALYTICS_EVENT } from "../events";
import { CONSENT_EVENT, readConsent } from "./ConsentBanner";

const DEPTHS = [25, 50, 75, 100];

/** Loads PostHog on idle (never blocks rendering). Experiment variants come from the server-rendered bucket. */
/** locale null = unknown market (root 404): cookieless until the visitor has consented. */
export function Analytics({ apiKey, locale, assignment }: { apiKey: string; locale: Locale | null; assignment: Assignment }) {
  const market = locale ?? "unknown";
  const assignmentKey = JSON.stringify(assignment);

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    let cleanup = () => {};

    const start = async () => {
      const { default: posthog } = await import("posthog-js");
      if (cancelled) return;
      const variants = JSON.parse(assignmentKey) as Assignment;
      posthog.init(apiKey, posthogConfig(locale, readConsent()));
      posthog.register(
        superProperties({ market: locale, colorMode: document.documentElement.dataset.theme ?? "light", assignment: variants }),
      );
      for (const exposure of exposureEvents(variants)) posthog.capture(exposure.event, exposure.properties);

      const onConsent = (event: Event) => {
        posthog.set_config({ persistence: analyticsPersistence(locale, (event as CustomEvent<Consent>).detail) });
      };
      const onTrack = (event: Event) => {
        const { event: name, properties } = (event as CustomEvent<{ event: string; properties: Record<string, unknown> }>).detail;
        posthog.capture(name, { ...properties, market });
      };
      const onClick = (event: MouseEvent) => {
        const el = (event.target as Element | null)?.closest?.("[data-track]");
        if (!el) return;
        posthog.capture(el.getAttribute("data-track")!, {
          location: el.getAttribute("data-track-location") ?? undefined,
          label: el.textContent?.trim() ?? "",
          market,
        });
      };
      const reached = new Set<number>();
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const percent = max <= 0 ? 100 : (window.scrollY / max) * 100;
        for (const depth of DEPTHS) {
          if (percent >= depth && !reached.has(depth)) {
            reached.add(depth);
            posthog.capture("scroll_depth", { depth, market });
          }
        }
      };

      window.addEventListener(CONSENT_EVENT, onConsent);
      window.addEventListener(ANALYTICS_EVENT, onTrack);
      document.addEventListener("click", onClick);
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanup = () => {
        window.removeEventListener(CONSENT_EVENT, onConsent);
        window.removeEventListener(ANALYTICS_EVENT, onTrack);
        document.removeEventListener("click", onClick);
        window.removeEventListener("scroll", onScroll);
      };
    };

    const idle =
      (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback ??
      ((cb: () => void) => window.setTimeout(cb, 1500));
    idle(() => void start());
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [apiKey, locale, assignmentKey]);

  return null;
}
