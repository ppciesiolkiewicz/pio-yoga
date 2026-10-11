import type { Locale } from "./locale";

export type Finding = { path: string; match: string; index: number };
type Match = { match: string; index: number };

const EN_APP = /(?<![\p{L}\p{N}])apps?(?![\p{L}\p{N}])/giu;
const EN_ALLOWED_BEFORE = /(?<![\p{L}\p{N}])custom\s+$/iu;
const PL_APP = /(?<![\p{L}\p{N}])aplikacj\p{L}*/giu;
const PL_ALLOWED_BEFORE = /(?<![\p{L}\p{N}])dedykowan\p{L}*\s+$/iu;
const PL_ALLOWED_AFTER = /^(\s+\p{L}+)?\s+na\s+zamówienie(?![\p{L}])/iu;

function scan(text: string, re: RegExp, allowed: (before: string, after: string) => boolean): Match[] {
  const out: Match[] = [];
  for (const m of text.matchAll(re)) {
    const index = m.index ?? 0;
    if (!allowed(text.slice(0, index), text.slice(index + m[0].length))) out.push({ match: m[0], index });
  }
  return out;
}

/** English: every "app"/"apps" must be "custom app(s)". */
export function findBareApps(text: string): Match[] {
  return scan(text, EN_APP, (before) => EN_ALLOWED_BEFORE.test(before));
}

/** Polish: "aplikacj…" needs "dedykowan…" before it or "na zamówienie" after it (one adjective may sit between). */
export function findBarePolishApps(text: string): Match[] {
  return scan(text, PL_APP, (before, after) => PL_ALLOWED_BEFORE.test(before) || PL_ALLOWED_AFTER.test(after));
}

export function collectStrings(value: unknown, path = ""): { path: string; value: string }[] {
  if (typeof value === "string") return [{ path, value }];
  if (Array.isArray(value)) return value.flatMap((v, i) => collectStrings(v, path ? `${path}.${i}` : String(i)));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => collectStrings(v, path ? `${path}.${k}` : k));
  }
  return [];
}

export function findCopyViolations(dict: unknown, locale: Locale): Finding[] {
  const find = locale === "pl" ? findBarePolishApps : findBareApps;
  return collectStrings(dict).flatMap(({ path, value }) => find(value).map((m) => ({ path, ...m })));
}
