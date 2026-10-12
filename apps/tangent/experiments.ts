import { defineExperiments } from "@repo/web/experiments";

/** Variant descriptions are the design keys used for <html data-design>. Keys must equal PostHog's. */
export const experiments = defineExperiments({
  design: {
    variants: { control: "tangent-precision", editorial: "tangent-editorial" },
    weights: [50, 50],
    markets: ["en", "pl"],
  },
});

export type DesignKey = "tangent-precision" | "tangent-editorial";

export function designFor(variant: string | undefined): DesignKey {
  return variant === "editorial" ? "tangent-editorial" : "tangent-precision";
}
