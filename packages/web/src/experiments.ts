import { locales, type Locale } from "./locale";

/** One A/B experiment. Variant keys and the experiment key must equal the PostHog flag/variant keys. */
export type ExperimentDef = {
  /** Variant key → human description. The first key must be "control". */
  variants: Record<string, string>;
  /** Whole-number weights in the same order as `variants`, summing to 100. */
  weights: readonly number[];
  /** Markets where the experiment runs; elsewhere visitors see control. */
  markets: readonly Locale[];
  /**
   * Variants nobody is assigned at random (weight 0) but that stay built and can be opened
   * with `?<experiment>=<number>`: variants are numbered from 1 in the order they're defined,
   * so `/?hero=1` is control and `/?hero=2` the next one. The variant key works too.
   */
  onRequest?: readonly string[];
};
export type Experiments = Record<string, ExperimentDef>;
/** Experiment key → assigned variant key. */
export type Assignment = Record<string, string>;

export const CONTROL = "control";
export const DEFAULT_BUCKET = "default";
const KEY = /^[a-z0-9-]+$/;

export function defineExperiments<T extends Experiments>(defs: T): T {
  for (const [name, def] of Object.entries(defs)) {
    const fail = (msg: string) => {
      throw new Error(`Experiment "${name}": ${msg}`);
    };
    if (!KEY.test(name)) fail(`key must match ${KEY}`);
    const keys = Object.keys(def.variants);
    if (keys.length < 2) fail("needs at least two variants");
    if (keys[0] !== CONTROL) fail(`first variant must be "${CONTROL}"`);
    for (const k of keys) if (!KEY.test(k)) fail(`variant key "${k}" must match ${KEY}`);
    if (def.weights.length !== keys.length) fail("needs one weight per variant");
    if (def.weights.some((w) => !Number.isInteger(w) || w < 0)) fail("weights must be whole numbers ≥ 0");
    if (def.weights.reduce((a, b) => a + b, 0) !== 100) fail("weights must sum to 100");
    for (const k of def.onRequest ?? []) {
      if (!keys.includes(k)) fail(`on-request variant "${k}" is not a variant`);
      if (k === CONTROL) fail(`"${CONTROL}" is always available and can't be on request`);
      if (weightOf(def, k) !== 0) fail(`on-request variant "${k}" must have weight 0`);
    }
    for (const m of def.markets) if (!(locales as readonly string[]).includes(m)) fail(`unknown market "${m}"`);
  }
  return defs;
}

/**
 * The variant a `?<experiment>=<value>` query asks for, or null. The value is the variant's number
 * (1 = control, then in definition order) or its key; variants that are switched off give null.
 */
export function requestedVariant(def: ExperimentDef, value: string): string | null {
  const key = /^[1-9]\d{0,2}$/.test(value) && !Object.hasOwn(def.variants, value) ? variantKeys(def)[Number(value) - 1] : value;
  return key !== undefined && canRequest(def, key) ? key : null;
}

const sortedNames = (exps: Experiments) => Object.keys(exps).sort();
const variantKeys = (def: ExperimentDef) => Object.keys(def.variants);
const weightOf = (def: ExperimentDef, key: string) => def.weights[variantKeys(def).indexOf(key)] ?? 0;
const onRequest = (def: ExperimentDef, key: string) => (def.onRequest ?? []).includes(key);

/** Variants a visitor can ask for by name: control, anything with traffic, and on-request variants. */
export function canRequest(def: ExperimentDef, key: string): boolean {
  return Object.hasOwn(def.variants, key) && (key === CONTROL || weightOf(def, key) > 0 || onRequest(def, key));
}

export function pickVariant(def: ExperimentDef, random: () => number): string {
  const keys = variantKeys(def);
  let r = random() * 100;
  for (let i = 0; i < keys.length; i++) {
    const w = def.weights[i] ?? 0;
    if (r < w) return keys[i]!;
    r -= w;
  }
  for (let i = keys.length - 1; i >= 0; i--) if ((def.weights[i] ?? 0) > 0) return keys[i]!;
  return CONTROL;
}

export function parseAssignment(cookie: string | undefined): Assignment {
  const out: Assignment = {};
  for (const pair of (cookie ?? "").split("|")) {
    const [name, variant, ...extra] = pair.split(":");
    if (extra.length === 0 && name && variant && KEY.test(name) && KEY.test(variant)) out[name] = variant;
  }
  return out;
}

export function serializeAssignment(assignment: Assignment): string {
  return Object.keys(assignment)
    .sort()
    .map((name) => `${name}:${assignment[name]}`)
    .join("|");
}

/** Keep valid live assignments, (re)assign the rest, drop experiments that no longer exist. */
export function assign(
  exps: Experiments,
  cookie: string | undefined,
  random: () => number,
): { assignment: Assignment; changed: boolean } {
  const previous = parseAssignment(cookie);
  const assignment: Assignment = {};
  for (const name of sortedNames(exps)) {
    const def = exps[name]!;
    const current = previous[name];
    const keep = current !== undefined && (weightOf(def, current) > 0 || onRequest(def, current));
    assignment[name] = keep ? current : pickVariant(def, random);
  }
  return { assignment, changed: serializeAssignment(assignment) !== (cookie ?? "") };
}

export function bucketFor(exps: Experiments, assignment: Assignment, locale: Locale): string {
  const names = sortedNames(exps);
  if (names.length === 0) return DEFAULT_BUCKET;
  return names
    .map((name) => {
      const def = exps[name]!;
      const variant = assignment[name];
      return def.markets.includes(locale) && variant !== undefined && Object.hasOwn(def.variants, variant) ? variant : CONTROL;
    })
    .join(".");
}

export function controlBucket(exps: Experiments): string {
  const names = sortedNames(exps);
  return names.length === 0 ? DEFAULT_BUCKET : names.map(() => CONTROL).join(".");
}

/** Every bucket to pre-render: live and on-request variants plus control (always built, bots get it). */
export function allBuckets(exps: Experiments): string[] {
  const names = sortedNames(exps);
  if (names.length === 0) return [DEFAULT_BUCKET];
  let combos: string[][] = [[]];
  for (const name of names) {
    const def = exps[name]!;
    const live = variantKeys(def).filter((k) => canRequest(def, k));
    combos = combos.flatMap((combo) => live.map((v) => [...combo, v]));
  }
  return combos.map((c) => c.join("."));
}

export function parseBucket(exps: Experiments, bucket: string): Assignment | null {
  const names = sortedNames(exps);
  if (names.length === 0) return bucket === DEFAULT_BUCKET ? {} : null;
  const parts = bucket.split(".");
  if (parts.length !== names.length) return null;
  const out: Assignment = {};
  for (let i = 0; i < names.length; i++) {
    const def = exps[names[i]!]!;
    const variant = parts[i]!;
    if (!Object.hasOwn(def.variants, variant)) return null;
    out[names[i]!] = variant;
  }
  return out;
}

/** The assignment limited to experiments running in this market, for analytics. */
export function activeAssignment(exps: Experiments, assignment: Assignment, locale: Locale): Assignment {
  const out: Assignment = {};
  for (const name of sortedNames(exps)) {
    const def = exps[name]!;
    const variant = assignment[name];
    if (def.markets.includes(locale) && variant !== undefined && Object.hasOwn(def.variants, variant)) out[name] = variant;
  }
  return out;
}
