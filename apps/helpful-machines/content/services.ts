/** "Find what works" (business analysis) leads: it's the entry point to everything else. */
export const serviceSlugs = [
  "find-what-works",
  "ai-assistants-automation",
  "custom-apps-websites",
  "spreadsheets-data",
  "migrations-integrations",
] as const;
export type ServiceSlug = (typeof serviceSlugs)[number];

export function isServiceSlug(value: string): value is ServiceSlug {
  return (serviceSlugs as readonly string[]).includes(value);
}
