export const serviceSlugs = [
  "fresh-look",
  "process-workflow",
  "custom-apps-platforms",
  "product-sprints",
  "fractional-tech-lead",
  "payments-ai-web3",
] as const;
export type ServiceSlug = (typeof serviceSlugs)[number];

export function isServiceSlug(value: string): value is ServiceSlug {
  return (serviceSlugs as readonly string[]).includes(value);
}
