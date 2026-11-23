import { defineExperiments } from "@repo/web/experiments";

/** Keys must equal the PostHog experiment's feature-flag key and variant keys. */
export const experiments = defineExperiments({
  hero: {
    variants: {
      control: "We set up AI agents for your company.",
      "do-it-better": "We'll find what we can do for you, and do it better.",
      "easy-mode": "Put your business on easy mode.",
    },
    // AI agents is the main message for everyone. The earlier headlines open by number:
    // /?hero=2 (do-it-better), /?hero=3 (easy-mode), and /?hero=1 goes back to the main one.
    weights: [100, 0, 0],
    onRequest: ["do-it-better", "easy-mode"],
    markets: ["en"],
  },
});
