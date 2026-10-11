/** Window event the Analytics component listens to; lets any component report without importing PostHog. */
export const ANALYTICS_EVENT = "hm:analytics";

export function track(event: string, properties: Record<string, unknown> = {}) {
  window.dispatchEvent(new CustomEvent(ANALYTICS_EVENT, { detail: { event, properties } }));
}
