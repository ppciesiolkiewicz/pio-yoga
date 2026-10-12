export const workSlugs = ["onchain", "lysn", "highsnobiety", "officeworks", "udrew", "displaysweet", "nokia"] as const;
export type WorkSlug = (typeof workSlugs)[number];
export const featuredWork: readonly WorkSlug[] = ["onchain", "lysn", "officeworks"];

export function isWorkSlug(value: string): value is WorkSlug {
  return (workSlugs as readonly string[]).includes(value);
}
