export const workSlugs = ["highsnobiety", "officeworks", "lysn", "onchain", "udrew", "nokia"] as const;
export type WorkSlug = (typeof workSlugs)[number];
/** Shown on the home page. */
export const featuredWork: readonly WorkSlug[] = ["highsnobiety", "officeworks", "lysn"];
