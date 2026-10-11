import { defineExperiments } from "@repo/web/experiments";

/** Keys must equal the PostHog experiment's feature-flag key and variant keys. */
export const experiments = defineExperiments({
  hero: {
    variants: { control: "AI that actually does the boring bits.", "easy-mode": "Put your business on easy mode." },
    weights: [50, 50],
    markets: ["en", "pl"],
  },
});
