# Plan 1: Monorepo foundation and shared core logic

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the single-app yoga repo into a pnpm + Turborepo monorepo, with the yoga site moved unchanged to `apps/yoga`, and build the framework-light core logic that Tangent and Helpful Machines will share (`packages/web`), fully unit-tested.

**Architecture:** Workspaces under `apps/*` and `packages/*`. `packages/web` is TypeScript source (no build step), consumed later through `transpilePackages`. Every behaviour lives in a pure function (route decision, bucketing, SEO URLs, contact handling, colour-mode script), with thin adapters for Next (`NextRequest`/`NextResponse`) and the Web `Request`/`Response`, so everything is tested with Vitest in Node without running Next.

**Tech Stack:** Node ≥ 20 (local 24), pnpm 10.15.0 via corepack, Turborepo ^2.5.6, Next 15.5.x, React 19, TypeScript ^5.9.3, Vitest ^3.2.4, zod ^4.1.5.

**Spec:** `docs/superpowers/specs/2026-10-11-multi-brand-monorepo-design.md`

**Plan series:** This is Plan 1 of 4.
- Plan 2: `packages/ui` + Helpful Machines app.
- Plan 3: Tangent app.
- Plan 4: quality pass (Playwright E2E, axe, Lighthouse CI, design critique).

UI, next-intl wiring, PostHog client code and the consent banner component are in Plans 2 and 3. This plan only provides their pure logic.

## Global Constraints

- Package manager: **pnpm 10.15.0** (`"packageManager": "pnpm@10.15.0"`). Monorepo runner: **Turborepo ^2.5.6**.
- Workspace package names: `@repo/web`, `@repo/config` (later `@repo/ui`). App names: `yoga`, `tangent`, `helpful-machines`.
- The yoga site's routes, content, styles, Stripe routes and middleware are **unchanged**. Only its location (`apps/yoga`) and package manager change.
- Locales: `en` (Australia, default, **no URL prefix**) and `pl` (Poland, prefix `/pl`). `<html lang>` values: `en-AU`, `pl-PL`. hreflang keys: `en-AU`, `pl-PL`, `x-default` (→ English).
- Locale cookie: `NEXT_LOCALE`, 1 year. Experiment cookie: `exp`, 90 days, `SameSite=Lax`, path `/`.
- Geo redirect: only when there's no `NEXT_LOCALE` cookie, `x-vercel-ip-country` is `PL`, and the path is English. **307**, path and query kept. Bots are never redirected.
- Experiment naming follows standard A/B terms: **experiment**, **variant** (baseline key is always `control`), **bucketing**, **bucket**. Variant and experiment keys match `/^[a-z0-9-]+$/` and are identical to PostHog flag and variant keys.
- Bots always get every experiment at `control`. The `control` variant is always pre-built.
- `NEXT_PUBLIC_SITE_URL` fallback is `https://attunr.com`.
- Consent banner: **only on the `pl` market**. `en` uses normal analytics persistence.
- Copy rule (Helpful Machines): **"Custom apps"**, never "Apps" alone. Polish: "aplikacje" must have "dedykowane…" before it or "na zamówienie" after it.
- Every page in the future apps is SSG. The only runtime pieces are middleware and `/api/contact`.

## Review Focus

1. **Stale, tampered or ended `exp` cookie** (unknown variant, garbage text, a variant now at weight 0, an experiment removed from config). The visitor is silently reassigned and gets a page, never a 404 or a crash. Tests: Task 3 (`assign`) and Task 4 (`decideRoute`).
2. **Paths that merely start with "pl"** (`/plumbing`, `/places`), trailing slashes, and an explicit `/en` prefix. They stay English, get normalised, and `/en/...` permanently redirects to the unprefixed URL. Tests: Task 2 (`splitLocale`) and Task 4.
3. **Crawlers with a Polish IP, and our own headless browsers.** Googlebot is never geo-redirected and always sees `control`. Playwright's `HeadlessChrome` is *not* treated as a bot, so Plan 4's E2E tests see real bucketing. Test: Task 4.
4. **Contact input with Polish diacritics, CRLF header injection in the name, or malformed JSON.** Text arrives intact, the email subject has no line breaks, and malformed bodies get a 400, not a 500. A no-JS submission from `/pl` returns to `/pl/contact`. Test: Task 7.
5. **`NEXT_PUBLIC_SITE_URL` with a trailing slash, whitespace or no protocol.** Canonicals come out without double slashes. A value that isn't a URL fails the build loudly instead of shipping broken canonicals. Test: Task 2.

---

## File structure

```
package.json                     root: workspaces scripts, turbo, packageManager
pnpm-workspace.yaml
turbo.json
.gitignore                       + .turbo
README.md                        monorepo overview (new)
.github/workflows/ci.yml
apps/yoga/                       ← everything that is the yoga app today (git mv)
  package.json (name: yoga)  vercel.json  README.md  …unchanged files
packages/config/
  package.json  tsconfig/base.json
packages/web/
  package.json  tsconfig.json  vitest.config.ts
  src/locale.ts            locales, html lang, path normalising, locale split/join
  src/site.ts              resolveSiteUrl
  src/experiments.ts       defineExperiments, pickVariant, assign, buckets
  src/routing/decide.ts    decideRoute (pure), isBot, isSkipped, internalPath
  src/routing/middleware.ts createRoutingMiddleware (Next adapter)
  src/seo.ts               absoluteUrl, pageMetadata, buildSitemap, buildRobots
  src/json-ld.ts           schema.org builders + serializeJsonLd
  src/contact/schema.ts    zod schema, isSpam, buildEmail
  src/contact/handler.ts   createContactHandler, createRateLimiter
  src/contact/resend.ts    resendSender
  src/contact/index.ts     re-exports
  src/color-mode.ts        colorModeScript, resolveColorMode (client-safe: no Node imports)
  src/csp.ts               cspHash (server-only: node:crypto)
  src/consent.ts           consentRequired, analyticsPersistence
  src/content-rules.ts     findBareApps, findBarePolishApps, findCopyViolations
  test/*.test.ts
```

---

### Task 1: Convert to a pnpm + Turborepo monorepo and move yoga unchanged

**Files:**
- Create: `package.json` (root, new), `pnpm-workspace.yaml`, `turbo.json`, `apps/yoga/vercel.json`, `README.md` (root, new)
- Move (git mv): `app/`, `components/`, `content/`, `lib/`, `middleware.ts`, `next.config.mjs`, `tsconfig.json`, `README.md`, `.env.example`, `package.json` → `apps/yoga/`
- Modify: `apps/yoga/package.json` (name, typecheck script), `.gitignore`
- Delete: `package-lock.json` (untracked), `node_modules/`, `.next/`, `next-env.d.ts` (untracked, regenerated)

**Interfaces:**
- Consumes: nothing.
- Produces: `pnpm --filter yoga build|dev|typecheck`. Root `pnpm build|typecheck|test` run through turbo. Workspace globs `apps/*` and `packages/*`.

- [ ] **Step 1: Record the yoga baseline route table (before moving anything)**

```bash
cd /Users/pio/projects/pio-yoga
npm run build 2>&1 | tee "$TMPDIR/yoga-before.txt"
grep -E '^[┌├└│]' "$TMPDIR/yoga-before.txt" | grep -oE ' /[^ ]*' | sort -u > "$TMPDIR/yoga-routes-before.txt"
cat "$TMPDIR/yoga-routes-before.txt"
```
Expected: build succeeds. The list includes `/[locale]`, `/[locale]/program`, `/[locale]/video`, `/[locale]/checkout/success`, `/[locale]/checkout/cancel`, `/api/checkout`, `/api/stripe/webhook`, `/robots.txt`, `/sitemap.xml`, `/icon.svg`.

- [ ] **Step 2: Move the app into `apps/yoga`**

```bash
cd /Users/pio/projects/pio-yoga
mkdir -p apps/yoga
git mv app components content lib middleware.ts next.config.mjs tsconfig.json README.md .env.example package.json apps/yoga/
rm -rf node_modules .next next-env.d.ts package-lock.json
git status --short
```
Expected: renames only (`R  app/... -> apps/yoga/app/...`). No deletions of tracked content.

- [ ] **Step 3: Rename the yoga package and fix its typecheck script**

Edit `apps/yoga/package.json`. Change the `name` and the `typecheck` script; leave everything else as-is:

```json
{
  "name": "yoga",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "next typegen && tsc --noEmit"
  },
  "engines": {
    "node": ">=20"
  },
  "dependencies": {
    "@vercel/analytics": "^1.5.0",
    "@vercel/speed-insights": "^1.2.0",
    "next": "^15.3.3",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "stripe": "^18.2.1"
  },
  "devDependencies": {
    "@types/node": "^22.15.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "typescript": "^5.8.3"
  }
}
```
(`next typegen` generates `next-env.d.ts` and route types, so `tsc` works on a clean checkout in CI.)

- [ ] **Step 4: Create the root workspace files**

`package.json`:
```json
{
  "name": "attunr",
  "private": true,
  "packageManager": "pnpm@10.15.0",
  "engines": {
    "node": ">=20"
  },
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.5.6"
  },
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild", "sharp"]
  }
}
```

`pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

`turbo.json`:
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "env": ["NEXT_PUBLIC_*", "STRIPE_*", "RESEND_API_KEY", "CONTACT_*", "VERCEL_*"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["^typecheck"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

`apps/yoga/vercel.json` (skips Vercel builds when nothing yoga depends on changed):
```json
{
  "ignoreCommand": "npx turbo-ignore --fallback=HEAD^1"
}
```

Append to `.gitignore`:
```
.turbo
```

- [ ] **Step 5: Install with pnpm**

```bash
cd /Users/pio/projects/pio-yoga
corepack enable pnpm || npm install -g pnpm@10.15.0
pnpm -v
pnpm install
```
Expected: `pnpm -v` prints `10.15.0`. Install creates `pnpm-lock.yaml` and finishes without "ignored build scripts" warnings for `sharp`.

- [ ] **Step 6: Build yoga from the monorepo and compare routes**

```bash
cd /Users/pio/projects/pio-yoga
pnpm --filter yoga typecheck
pnpm --filter yoga build 2>&1 | tee "$TMPDIR/yoga-after.txt"
grep -E '^[┌├└│]' "$TMPDIR/yoga-after.txt" | grep -oE ' /[^ ]*' | sort -u > "$TMPDIR/yoga-routes-after.txt"
diff "$TMPDIR/yoga-routes-before.txt" "$TMPDIR/yoga-routes-after.txt" && echo "ROUTES IDENTICAL"
```
Expected: typecheck passes, build passes, `ROUTES IDENTICAL`.

- [ ] **Step 7: Smoke-test the built yoga site**

```bash
cd /Users/pio/projects/pio-yoga/apps/yoga
pnpm start -p 3100 & SERVER=$!; sleep 4
for p in / /en /pl /en/program /pl/video /sitemap.xml /robots.txt; do
  printf "%s " "$p"; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3100$p"
done
kill $SERVER
```
Expected: `/` → `307`. Every other path → `200`.

- [ ] **Step 8: Write the root README**

`README.md`:
````markdown
# attunr monorepo

Three independent websites deployed from one repo.

| App | Path | What it is |
| --- | --- | --- |
| Yoga | `apps/yoga` | Pio – yoga, Thai yoga massage, program, video (see `apps/yoga/README.md`) |
| Tangent | `apps/tangent` | Senior engineering and business analysis for startups (Plan 3) |
| Helpful Machines | `apps/helpful-machines` | AI and IT for small businesses (Plan 2) |

Shared code lives in `packages/` (`@repo/web` core logic, `@repo/config` tooling, `@repo/ui` design system in Plan 2).

## Setup

```bash
corepack enable pnpm
pnpm install
pnpm --filter yoga dev        # one app
pnpm test                     # all unit tests
pnpm typecheck && pnpm build  # everything
```

## Deploying on Vercel

One Vercel project per app, all pointing at this repo:

- **Root Directory:** `apps/<app>`. Vercel detects pnpm and the workspace automatically.
- **Ignored Build Step:** comes from `apps/<app>/vercel.json` (`npx turbo-ignore`), so an app only rebuilds when it or a package it uses changed.
- **Environment variables:** per project. Each app's `.env.example` lists them.

Design spec: `docs/superpowers/specs/2026-10-11-multi-brand-monorepo-design.md`.
````

- [ ] **Step 9: Commit**

```bash
cd /Users/pio/projects/pio-yoga
git add -A
git status --short | head -40
git commit -m "chore: convert to pnpm + Turborepo monorepo, move yoga to apps/yoga

Yoga routes, content and behaviour unchanged (route table diffed).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 10: STOP: Vercel setting the user must change before pushing**

The existing yoga Vercel project builds from the repo root. Before this commit reaches the branch Vercel deploys from, the user must set **Project → Settings → Build and Deployment → Root Directory = `apps/yoga`**. Ask the user to confirm it's done (or to approve making the change through the Vercel connector) before any `git push`. Don't push without that confirmation.

---

### Task 2: `packages/config`, `packages/web` scaffold, locale paths and site URL

**Files:**
- Create: `packages/config/package.json`, `packages/config/tsconfig/base.json`
- Create: `packages/web/package.json`, `packages/web/tsconfig.json`, `packages/web/vitest.config.ts`
- Create: `packages/web/src/locale.ts`, `packages/web/src/site.ts`
- Test: `packages/web/test/locale.test.ts`, `packages/web/test/site.test.ts`

**Interfaces:**
- Consumes: workspace from Task 1.
- Produces:
  - `locales: readonly ["en","pl"]`, `type Locale = "en" | "pl"`, `defaultLocale: "en"`
  - `htmlLang: Record<Locale,string>` (`en-AU`, `pl-PL`), `ogLocale: Record<Locale,string>` (`en_AU`, `pl_PL`), `hreflang: Record<Locale,string>` (`en-AU`, `pl-PL`)
  - `isLocale(v: unknown): v is Locale`
  - `normalizePath(path: string): string`: leading slash, no trailing slash except `/`, no `//`
  - `localizedPath(locale: Locale, path: string): string`: `("en","/")→"/"`, `("pl","/")→"/pl"`, `("pl","/x")→"/pl/x"`
  - `splitLocale(pathname: string): { locale: Locale; rest: string; explicitDefault: boolean }`
  - `resolveSiteUrl(env?: Record<string,string|undefined>, fallback?: string): string`: no trailing slash; throws on a non-URL

- [ ] **Step 1: Create the config package**

`packages/config/package.json`:
```json
{
  "name": "@repo/config",
  "version": "0.0.0",
  "private": true,
  "files": ["tsconfig"]
}
```

`packages/config/tsconfig/base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "noEmit": true
  }
}
```

- [ ] **Step 2: Create the web package skeleton**

`packages/web/package.json`:
```json
{
  "name": "@repo/web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./locale": "./src/locale.ts",
    "./site": "./src/site.ts",
    "./experiments": "./src/experiments.ts",
    "./routing": "./src/routing/decide.ts",
    "./middleware": "./src/routing/middleware.ts",
    "./seo": "./src/seo.ts",
    "./json-ld": "./src/json-ld.ts",
    "./contact": "./src/contact/index.ts",
    "./color-mode": "./src/color-mode.ts",
    "./csp": "./src/csp.ts",
    "./consent": "./src/consent.ts",
    "./content-rules": "./src/content-rules.ts"
  },
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^4.1.5"
  },
  "peerDependencies": {
    "next": "^15.5.0"
  },
  "devDependencies": {
    "@repo/config": "workspace:*",
    "@types/node": "^22.15.0",
    "next": "^15.5.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "typescript": "^5.9.3",
    "vitest": "^3.2.4"
  }
}
```

`packages/web/tsconfig.json`:
```json
{
  "extends": "@repo/config/tsconfig/base.json",
  "include": ["src", "test", "vitest.config.ts"]
}
```

`packages/web/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["test/**/*.test.ts"] },
});
```

Run: `cd /Users/pio/projects/pio-yoga && pnpm install`
Expected: links `@repo/config` into `packages/web/node_modules`.

- [ ] **Step 3: Write the failing locale tests**

`packages/web/test/locale.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { isLocale, localizedPath, normalizePath, splitLocale } from "../src/locale";

describe("normalizePath", () => {
  it.each([
    ["", "/"],
    ["/", "/"],
    ["services", "/services"],
    ["/services/", "/services"],
    ["//services//faq/", "/services/faq"],
  ])("%s → %s", (input, out) => expect(normalizePath(input)).toBe(out));
});

describe("localizedPath", () => {
  it("english has no prefix", () => {
    expect(localizedPath("en", "/")).toBe("/");
    expect(localizedPath("en", "services/")).toBe("/services");
  });
  it("polish is prefixed", () => {
    expect(localizedPath("pl", "/")).toBe("/pl");
    expect(localizedPath("pl", "/services")).toBe("/pl/services");
  });
});

describe("splitLocale", () => {
  it("root is english", () =>
    expect(splitLocale("/")).toEqual({ locale: "en", rest: "/", explicitDefault: false }));
  it("detects /pl and /pl/...", () => {
    expect(splitLocale("/pl")).toEqual({ locale: "pl", rest: "/", explicitDefault: false });
    expect(splitLocale("/pl/work/onchain")).toEqual({ locale: "pl", rest: "/work/onchain", explicitDefault: false });
  });
  it("paths that only start with 'pl' stay english", () => {
    expect(splitLocale("/plumbing")).toEqual({ locale: "en", rest: "/plumbing", explicitDefault: false });
    expect(splitLocale("/places/pl")).toEqual({ locale: "en", rest: "/places/pl", explicitDefault: false });
  });
  it("flags an explicit /en prefix", () => {
    expect(splitLocale("/en")).toEqual({ locale: "en", rest: "/", explicitDefault: true });
    expect(splitLocale("/en/services/")).toEqual({ locale: "en", rest: "/services", explicitDefault: true });
  });
});

describe("isLocale", () => {
  it("accepts only en and pl", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("pl")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
```

- [ ] **Step 4: Write the failing site URL tests**

`packages/web/test/site.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "../src/site";

describe("resolveSiteUrl", () => {
  it("falls back to attunr.com", () => expect(resolveSiteUrl({})).toBe("https://attunr.com"));
  it("strips trailing slashes and whitespace", () =>
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "  https://helpfulmachines.ai//  " })).toBe(
      "https://helpfulmachines.ai",
    ));
  it("adds https when the protocol is missing", () =>
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "tangent.attunr.com" })).toBe("https://tangent.attunr.com"));
  it("keeps a path prefix", () =>
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://attunr.com/tangent/" })).toBe(
      "https://attunr.com/tangent",
    ));
  it("treats an empty value as missing", () => expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "" })).toBe("https://attunr.com"));
  it("throws on a value that is not a URL", () =>
    expect(() => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "not a url" })).toThrow(/NEXT_PUBLIC_SITE_URL/));
});
```

- [ ] **Step 5: Run the tests to verify they fail**

Run: `cd /Users/pio/projects/pio-yoga && pnpm --filter @repo/web test`
Expected: FAIL, "Failed to resolve import ../src/locale" and "../src/site".

- [ ] **Step 6: Implement `locale.ts`**

`packages/web/src/locale.ts`:
```ts
export const locales = ["en", "pl"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Value for <html lang>. */
export const htmlLang: Record<Locale, string> = { en: "en-AU", pl: "pl-PL" };
/** Keys for hreflang alternates. */
export const hreflang: Record<Locale, string> = { en: "en-AU", pl: "pl-PL" };
/** Open Graph locale codes. */
export const ogLocale: Record<Locale, string> = { en: "en_AU", pl: "pl_PL" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** Leading slash, no duplicate slashes, no trailing slash (except the root). */
export function normalizePath(path: string): string {
  const collapsed = `/${path}`.replace(/\/{2,}/g, "/");
  return collapsed.length > 1 ? collapsed.replace(/\/$/, "") : "/";
}

/** Public URL path for a locale: English unprefixed, other locales under /<locale>. */
export function localizedPath(locale: Locale, path: string): string {
  const rest = normalizePath(path);
  if (locale === defaultLocale) return rest;
  return rest === "/" ? `/${locale}` : `/${locale}${rest}`;
}

/** Split a public pathname into its locale and the locale-less rest. */
export function splitLocale(pathname: string): { locale: Locale; rest: string; explicitDefault: boolean } {
  const path = normalizePath(pathname);
  const [, first = "", ...more] = path.split("/");
  if (isLocale(first)) {
    return { locale: first, rest: normalizePath(more.join("/")), explicitDefault: first === defaultLocale };
  }
  return { locale: defaultLocale, rest: path, explicitDefault: false };
}
```

- [ ] **Step 7: Implement `site.ts`**

`packages/web/src/site.ts`:
```ts
const DEFAULT_SITE_URL = "https://attunr.com";

/**
 * Public base URL of an app, without a trailing slash.
 * Missing → fallback. Present but not a URL → throws, so a bad value fails the build
 * instead of shipping broken canonicals.
 */
export function resolveSiteUrl(
  env: Record<string, string | undefined> = process.env,
  fallback: string = DEFAULT_SITE_URL,
): string {
  const raw = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return fallback;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL is not a valid URL: "${raw}"`);
  }
  if (!url.hostname.includes(".") && url.hostname !== "localhost") {
    throw new Error(`NEXT_PUBLIC_SITE_URL is not a valid URL: "${raw}"`);
  }
  return `${url.origin}${url.pathname}`.replace(/\/+$/, "");
}
```
(`new URL("https://not a url")` throws because of the space. The hostname check catches single-word values like `https://foo`.)

- [ ] **Step 8: Run the tests and typecheck**

Run: `cd /Users/pio/projects/pio-yoga && pnpm --filter @repo/web test && pnpm --filter @repo/web typecheck`
Expected: PASS (all locale and site tests). Typecheck clean.

- [ ] **Step 9: Commit**

```bash
git add packages pnpm-lock.yaml
git commit -m "feat(web): add config package, web package, locale paths and site URL

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Experiments: definitions, weighted bucketing, buckets

**Files:**
- Create: `packages/web/src/experiments.ts`
- Test: `packages/web/test/experiments.test.ts`

**Interfaces:**
- Consumes: `Locale`, `locales` from `src/locale.ts`.
- Produces:
  - `type ExperimentDef = { variants: Record<string,string>; weights: readonly number[]; markets: readonly Locale[] }`. `variants` maps a variant key to a description; `weights` follow `Object.keys(variants)` order and sum to 100.
  - `type Experiments = Record<string, ExperimentDef>`, `type Assignment = Record<string,string>`
  - `CONTROL = "control"`, `DEFAULT_BUCKET = "default"`
  - `defineExperiments<T extends Experiments>(defs: T): T` (validates; throws)
  - `pickVariant(def: ExperimentDef, random: () => number): string`
  - `parseAssignment(cookie: string | undefined): Assignment`, `serializeAssignment(a: Assignment): string` (format `name:variant|name:variant`, names sorted)
  - `assign(exps: Experiments, cookie: string | undefined, random: () => number): { assignment: Assignment; changed: boolean }`
  - `bucketFor(exps, assignment, locale): string` (effective variants in sorted experiment order, joined with `.`; `"default"` when there are no experiments)
  - `controlBucket(exps): string`, `allBuckets(exps): string[]`, `parseBucket(exps, bucket): Assignment | null`

- [ ] **Step 1: Write the failing tests**

`packages/web/test/experiments.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import {
  allBuckets,
  assign,
  bucketFor,
  controlBucket,
  defineExperiments,
  parseAssignment,
  parseBucket,
  pickVariant,
  serializeAssignment,
  type ExperimentDef,
} from "../src/experiments";

const hero: ExperimentDef = {
  variants: { control: "boring-bits", "easy-mode": "easy-mode" },
  weights: [50, 50],
  markets: ["en", "pl"],
};
const one = defineExperiments({ hero });
const two = defineExperiments({
  hero,
  design: { variants: { control: "dark-precision", editorial: "editorial" }, weights: [50, 50], markets: ["en"] },
});
const none = defineExperiments({});
const seq = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length]!;
};

describe("defineExperiments", () => {
  const bad = (def: Partial<ExperimentDef>, name = "x") => () =>
    defineExperiments({ [name]: { ...hero, ...def } as ExperimentDef });
  it("requires control as the first variant", () =>
    expect(bad({ variants: { a: "", control: "" } })).toThrow(/first variant must be "control"/));
  it("requires weights for every variant", () => expect(bad({ weights: [100] })).toThrow(/one weight per variant/));
  it("requires weights to sum to 100", () => expect(bad({ weights: [50, 40] })).toThrow(/sum to 100/));
  it("rejects negative or fractional weights", () => expect(bad({ weights: [110, -10] })).toThrow(/whole numbers/));
  it("rejects keys that are not lowercase-kebab", () => {
    expect(bad({}, "Hero")).toThrow(/key/);
    expect(bad({ variants: { control: "", "Easy Mode": "" } })).toThrow(/key/);
  });
  it("rejects unknown markets", () => expect(bad({ markets: ["de" as never] })).toThrow(/market/));
  it("returns the definitions unchanged", () => expect(one.hero).toBe(hero));
});

describe("pickVariant", () => {
  it("maps random 0..1 onto cumulative weights", () => {
    expect(pickVariant(hero, () => 0)).toBe("control");
    expect(pickVariant(hero, () => 0.4999)).toBe("control");
    expect(pickVariant(hero, () => 0.5)).toBe("easy-mode");
    expect(pickVariant(hero, () => 0.9999)).toBe("easy-mode");
  });
  it("never picks a weight-0 variant", () => {
    const ended = { ...hero, weights: [100, 0] };
    expect(pickVariant(ended, () => 0.9999)).toBe("control");
  });
  it("splits roughly 50/50 over many draws", () => {
    let s = 42;
    const lcg = () => ((s = (s * 1664525 + 1013904223) % 2 ** 32) / 2 ** 32);
    let control = 0;
    for (let i = 0; i < 10_000; i++) if (pickVariant(hero, lcg) === "control") control++;
    expect(control).toBeGreaterThan(4800);
    expect(control).toBeLessThan(5200);
  });
});

describe("parseAssignment / serializeAssignment", () => {
  it("round-trips with sorted names", () => {
    expect(serializeAssignment({ hero: "control", design: "editorial" })).toBe("design:editorial|hero:control");
    expect(parseAssignment("design:editorial|hero:control")).toEqual({ design: "editorial", hero: "control" });
  });
  it("ignores garbage", () => {
    expect(parseAssignment(undefined)).toEqual({});
    expect(parseAssignment("%%%|hero|:x|Hero:control|hero:easy-mode")).toEqual({ hero: "easy-mode" });
  });
});

describe("assign", () => {
  it("assigns new visitors and reports a change", () =>
    expect(assign(one, undefined, () => 0.9)).toEqual({ assignment: { hero: "easy-mode" }, changed: true }));
  it("keeps a valid assignment", () =>
    expect(assign(one, "hero:control", () => 0.9)).toEqual({ assignment: { hero: "control" }, changed: false }));
  it("reassigns an unknown variant", () =>
    expect(assign(one, "hero:gone", () => 0.1)).toEqual({ assignment: { hero: "control" }, changed: true }));
  it("reassigns a variant whose weight dropped to 0", () => {
    const ended = defineExperiments({ hero: { ...hero, weights: [100, 0] } });
    expect(assign(ended, "hero:easy-mode", () => 0.9)).toEqual({ assignment: { hero: "control" }, changed: true });
  });
  it("drops experiments removed from config", () =>
    expect(assign(one, "old:control|hero:control", () => 0.9)).toEqual({
      assignment: { hero: "control" },
      changed: true,
    }));
  it("is a no-op with no experiments and no cookie", () =>
    expect(assign(none, undefined, () => 0.5)).toEqual({ assignment: {}, changed: false }));
  it("uses one random draw per new experiment", () =>
    expect(assign(two, undefined, seq(0.9, 0.1)).assignment).toEqual({ design: "editorial", hero: "control" }));
});

describe("buckets", () => {
  it("joins effective variants in sorted experiment order", () =>
    expect(bucketFor(two, { design: "editorial", hero: "easy-mode" }, "en")).toBe("editorial.easy-mode"));
  it("uses control where an experiment is not active in the market", () =>
    expect(bucketFor(two, { design: "editorial", hero: "easy-mode" }, "pl")).toBe("control.easy-mode"));
  it("uses control for missing assignments", () => expect(bucketFor(one, {}, "en")).toBe("control"));
  it("controlBucket", () => {
    expect(controlBucket(one)).toBe("control");
    expect(controlBucket(two)).toBe("control.control");
    expect(controlBucket(none)).toBe("default");
  });
  it("allBuckets lists every combination of live variants plus control", () => {
    expect(allBuckets(one)).toEqual(["control", "easy-mode"]);
    expect(allBuckets(two)).toEqual(["control.control", "control.easy-mode", "editorial.control", "editorial.easy-mode"]);
    expect(allBuckets(none)).toEqual(["default"]);
    const ended = defineExperiments({ hero: { ...hero, weights: [0, 100] } });
    expect(allBuckets(ended)).toEqual(["control", "easy-mode"]);
    const done = defineExperiments({ hero: { ...hero, weights: [100, 0] } });
    expect(allBuckets(done)).toEqual(["control"]);
  });
  it("parseBucket reverses bucketFor and rejects unknown buckets", () => {
    expect(parseBucket(two, "editorial.easy-mode")).toEqual({ design: "editorial", hero: "easy-mode" });
    expect(parseBucket(one, "nope")).toBeNull();
    expect(parseBucket(two, "control")).toBeNull();
    expect(parseBucket(none, "default")).toEqual({});
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @repo/web test experiments`
Expected: FAIL, "Failed to resolve import ../src/experiments".

- [ ] **Step 3: Implement `experiments.ts`**

`packages/web/src/experiments.ts`:
```ts
import { locales, type Locale } from "./locale";

/** One A/B experiment. Variant keys and the experiment key must equal the PostHog flag/variant keys. */
export type ExperimentDef = {
  /** Variant key → human description. The first key must be "control". */
  variants: Record<string, string>;
  /** Whole-number weights in the same order as `variants`, summing to 100. */
  weights: readonly number[];
  /** Markets where the experiment runs; elsewhere visitors see control. */
  markets: readonly Locale[];
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
    for (const m of def.markets) if (!(locales as readonly string[]).includes(m)) fail(`unknown market "${m}"`);
  }
  return defs;
}

const sortedNames = (exps: Experiments) => Object.keys(exps).sort();
const variantKeys = (def: ExperimentDef) => Object.keys(def.variants);
const weightOf = (def: ExperimentDef, key: string) => def.weights[variantKeys(def).indexOf(key)] ?? 0;

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
    assignment[name] = current && weightOf(def, current) > 0 ? current : pickVariant(def, random);
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
      return def.markets.includes(locale) && variant && variant in def.variants ? variant : CONTROL;
    })
    .join(".");
}

export function controlBucket(exps: Experiments): string {
  const names = sortedNames(exps);
  return names.length === 0 ? DEFAULT_BUCKET : names.map(() => CONTROL).join(".");
}

/** Every bucket to pre-render: all live variants plus control (always built, bots get it). */
export function allBuckets(exps: Experiments): string[] {
  const names = sortedNames(exps);
  if (names.length === 0) return [DEFAULT_BUCKET];
  let combos: string[][] = [[]];
  for (const name of names) {
    const def = exps[name]!;
    const live = variantKeys(def).filter((k) => k === CONTROL || weightOf(def, k) > 0);
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
    if (!(variant in def.variants)) return null;
    out[names[i]!] = variant;
  }
  return out;
}
```

- [ ] **Step 4: Run the tests and typecheck**

Run: `pnpm --filter @repo/web test experiments && pnpm --filter @repo/web typecheck`
Expected: PASS. Typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add packages/web
git commit -m "feat(web): experiments with weighted bucketing and pre-render buckets

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Route decision (geo, locale choice, bots, bucketing) and Next middleware adapter

**Files:**
- Create: `packages/web/src/routing/decide.ts`, `packages/web/src/routing/middleware.ts`
- Test: `packages/web/test/routing.test.ts`, `packages/web/test/middleware.test.ts`

**Interfaces:**
- Consumes: `splitLocale`, `localizedPath`, `isLocale`, `defaultLocale`, `Locale` (Task 2). `Experiments`, `assign`, `bucketFor`, `controlBucket`, `serializeAssignment` (Task 3).
- Produces:
  - `LOCALE_COOKIE = "NEXT_LOCALE"`, `EXP_COOKIE = "exp"`
  - `type CookieSet = { name: string; value: string; maxAge: number }`
  - `type RouteInput = { pathname: string; search: string; userAgent: string | null; country: string | null; cookies: { locale?: string; exp?: string }; experiments: Experiments; random?: () => number }`
  - `type RouteDecision = { kind: "pass" } | { kind: "redirect"; status: 307 | 308; location: string; setCookies: CookieSet[] } | { kind: "rewrite"; pathname: string; setCookies: CookieSet[] }`
  - `decideRoute(input: RouteInput): RouteDecision`, `isBot(ua: string | null): boolean`, `isSkipped(pathname: string): boolean`, `internalPath(bucket: string, locale: Locale, rest: string): string` (→ `/<bucket>/<locale><rest>`)
  - `createRoutingMiddleware(opts: { experiments: Experiments; random?: () => number }): (req: NextRequest) => NextResponse`
  - Plans 2 and 3: each app's `middleware.ts` is `export default createRoutingMiddleware({ experiments })` plus a literal `config.matcher`. Pages live under `app/[bucket]/[locale]/…`.

- [ ] **Step 1: Write the failing decision tests**

`packages/web/test/routing.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { defineExperiments } from "../src/experiments";
import { decideRoute, isBot, isSkipped, type RouteInput } from "../src/routing/decide";

const experiments = defineExperiments({
  hero: { variants: { control: "boring-bits", "easy-mode": "easy-mode" }, weights: [50, 50], markets: ["en", "pl"] },
});
const SAFARI = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 Version/17.5 Safari/605.1.15";
const run = (o: Partial<RouteInput>) =>
  decideRoute({
    pathname: "/",
    search: "",
    userAgent: SAFARI,
    country: "AU",
    cookies: {},
    experiments,
    random: () => 0.1,
    ...o,
  });
const expCookie = (value: string) => ({ name: "exp", value, maxAge: 7_776_000 });
const localeCookie = (value: string) => ({ name: "NEXT_LOCALE", value, maxAge: 31_536_000 });

describe("isSkipped", () => {
  it.each(["/api/contact", "/_next/static/a.js", "/_vercel/insights", "/ingest/e", "/favicon.ico", "/robots.txt",
    "/sitemap.xml", "/control/en/opengraph-image", "/control/en/opengraph-image-1a2b", "/og/home"])("%s", (p) =>
    expect(isSkipped(p)).toBe(true));
  it.each(["/", "/pl", "/services", "/work/onchain", "/pl/faq"])("not %s", (p) => expect(isSkipped(p)).toBe(false));
});

describe("isBot", () => {
  it.each([
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0)",
    "facebookexternalhit/1.1",
    "Mozilla/5.0 (compatible; SemrushBot/7~bl)",
    "Mozilla/5.0 (compatible; AhrefsBot/7.0)",
    "LinkedInBot/1.0",
    "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) Chrome-Lighthouse",
  ])("bot: %s", (ua) => expect(isBot(ua)).toBe(true));
  it("headless browsers used by our E2E tests are not bots", () =>
    expect(isBot("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/131.0.0.0 Safari/537.36")).toBe(false));
  it("real browsers and a missing UA are not bots", () => {
    expect(isBot(SAFARI)).toBe(false);
    expect(isBot(null)).toBe(false);
  });
});

describe("decideRoute", () => {
  it("passes skipped paths through", () => expect(run({ pathname: "/api/contact" })).toEqual({ kind: "pass" }));

  it("rewrites english root into the bucket and sets the exp cookie", () =>
    expect(run({})).toEqual({ kind: "rewrite", pathname: "/control/en", setCookies: [expCookie("hero:control")] }));

  it("keeps an existing assignment without re-setting the cookie", () =>
    expect(run({ pathname: "/services", cookies: { exp: "hero:easy-mode" } })).toEqual({
      kind: "rewrite",
      pathname: "/easy-mode/en/services",
      setCookies: [],
    }));

  it("reassigns a stale exp cookie", () =>
    expect(run({ pathname: "/services", cookies: { exp: "hero:gone" } })).toEqual({
      kind: "rewrite",
      pathname: "/control/en/services",
      setCookies: [expCookie("hero:control")],
    }));

  it("keeps /plumbing english and normalises trailing slashes", () => {
    expect(run({ pathname: "/plumbing", cookies: { exp: "hero:control" } })).toMatchObject({ pathname: "/control/en/plumbing" });
    expect(run({ pathname: "/services/", cookies: { exp: "hero:control" } })).toMatchObject({ pathname: "/control/en/services" });
  });

  it("rewrites /pl paths and remembers the choice", () =>
    expect(run({ pathname: "/pl/services", cookies: { exp: "hero:control" } })).toEqual({
      kind: "rewrite",
      pathname: "/control/pl/services",
      setCookies: [localeCookie("pl")],
    }));

  it("does not re-set the locale cookie when it already says pl", () =>
    expect(run({ pathname: "/pl", cookies: { exp: "hero:control", locale: "pl" } })).toEqual({
      kind: "rewrite",
      pathname: "/control/pl",
      setCookies: [],
    }));

  it("redirects visitors in Poland to /pl keeping path and query", () => {
    expect(run({ pathname: "/services", search: "?utm_source=x", country: "PL" })).toEqual({
      kind: "redirect",
      status: 307,
      location: "/pl/services?utm_source=x",
      setCookies: [],
    });
    expect(run({ country: "pl" })).toMatchObject({ kind: "redirect", location: "/pl" });
  });

  it("does not geo-redirect once a locale was chosen", () => {
    expect(run({ country: "PL", cookies: { locale: "en", exp: "hero:control" } })).toMatchObject({ kind: "rewrite", pathname: "/control/en" });
    expect(run({ country: "PL", cookies: { locale: "pl", exp: "hero:control" } })).toMatchObject({ kind: "rewrite", pathname: "/control/en" });
  });

  it("does not loop on /pl for visitors in Poland", () =>
    expect(run({ pathname: "/pl/faq", country: "PL", cookies: { exp: "hero:control" } })).toMatchObject({
      kind: "rewrite",
      pathname: "/control/pl/faq",
    }));

  it("never redirects bots and always serves control without cookies", () =>
    expect(
      run({
        pathname: "/services",
        country: "PL",
        userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        cookies: { exp: "hero:easy-mode" },
      }),
    ).toEqual({ kind: "rewrite", pathname: "/control/en/services", setCookies: [] }));

  it("?locale=en sets the cookie and redirects to the clean english URL", () =>
    expect(run({ pathname: "/pl/services", search: "?locale=en&x=1" })).toEqual({
      kind: "redirect",
      status: 307,
      location: "/services?x=1",
      setCookies: [localeCookie("en")],
    }));

  it("?locale=pl from an english page", () =>
    expect(run({ pathname: "/about", search: "?locale=pl" })).toEqual({
      kind: "redirect",
      status: 307,
      location: "/pl/about",
      setCookies: [localeCookie("pl")],
    }));

  it("an unknown ?locale is stripped without setting a cookie", () =>
    expect(run({ pathname: "/about", search: "?locale=de" })).toEqual({
      kind: "redirect",
      status: 307,
      location: "/about",
      setCookies: [],
    }));

  it("an explicit /en prefix permanently redirects to the unprefixed URL", () => {
    expect(run({ pathname: "/en/services", search: "?x=1" })).toEqual({
      kind: "redirect",
      status: 308,
      location: "/services?x=1",
      setCookies: [],
    });
    expect(run({ pathname: "/en" })).toMatchObject({ status: 308, location: "/" });
  });

  it("serves control where an experiment is not active in the market", () => {
    const enOnly = defineExperiments({
      design: { variants: { control: "dark", editorial: "editorial" }, weights: [50, 50], markets: ["en"] },
    });
    expect(run({ experiments: enOnly, pathname: "/pl", cookies: { exp: "design:editorial", locale: "pl" } })).toEqual({
      kind: "rewrite",
      pathname: "/control/pl",
      setCookies: [],
    });
  });

  it("clears the exp cookie when every experiment is removed", () =>
    expect(run({ experiments: defineExperiments({}), cookies: { exp: "hero:control" } })).toEqual({
      kind: "rewrite",
      pathname: "/default/en",
      setCookies: [{ name: "exp", value: "", maxAge: 0 }],
    }));
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @repo/web test routing`
Expected: FAIL, "Failed to resolve import ../src/routing/decide".

- [ ] **Step 3: Implement `decide.ts`**

`packages/web/src/routing/decide.ts`:
```ts
import { assign, bucketFor, controlBucket, serializeAssignment, type Experiments } from "../experiments";
import { defaultLocale, isLocale, localizedPath, splitLocale, type Locale } from "../locale";

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const EXP_COOKIE = "exp";
const YEAR = 31_536_000;
const EXP_MAX_AGE = 90 * 86_400;

export type CookieSet = { name: string; value: string; maxAge: number };
export type RouteInput = {
  pathname: string;
  search: string;
  userAgent: string | null;
  /** Value of x-vercel-ip-country. */
  country: string | null;
  cookies: { locale?: string; exp?: string };
  experiments: Experiments;
  random?: () => number;
};
export type RouteDecision =
  | { kind: "pass" }
  | { kind: "redirect"; status: 307 | 308; location: string; setCookies: CookieSet[] }
  | { kind: "rewrite"; pathname: string; setCookies: CookieSet[] };

const SKIP_PREFIX = /^\/(api|_next|_vercel|ingest|og)(\/|$)/;
const FILE = /\/[^/]*\.[^/]+$/;
const METADATA_IMAGE = /(^|\/)(opengraph-image|twitter-image|icon|apple-icon)(-[^/]*)?$/;
const BOT =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|pinterest|whatsapp|telegram|discord|slack|lighthouse|semrush|ahrefs|yandex|baidu|duckduck|petal|applebot|quora link preview|vkshare|w3c_validator/i;

export function isSkipped(pathname: string): boolean {
  return SKIP_PREFIX.test(pathname) || FILE.test(pathname) || METADATA_IMAGE.test(pathname);
}

/** Crawlers and link-preview fetchers. HeadlessChrome (our E2E tests) is deliberately not a bot. */
export function isBot(userAgent: string | null): boolean {
  return !!userAgent && BOT.test(userAgent);
}

/** Internal path of the pre-rendered page: app/[bucket]/[locale]/... */
export function internalPath(bucket: string, locale: Locale, rest: string): string {
  return `/${bucket}/${locale}${rest === "/" ? "" : rest}`;
}

const withQuery = (path: string, params: URLSearchParams) => {
  const q = params.toString();
  return q ? `${path}?${q}` : path;
};

export function decideRoute(input: RouteInput): RouteDecision {
  const { pathname, experiments } = input;
  if (isSkipped(pathname)) return { kind: "pass" };

  const { locale, rest, explicitDefault } = splitLocale(pathname);
  const params = new URLSearchParams(input.search);

  // 1. Explicit language choice via ?locale=… (footer link; works without JS).
  const requested = params.get("locale");
  if (requested !== null) {
    params.delete("locale");
    const chosen = isLocale(requested) ? requested : null;
    return {
      kind: "redirect",
      status: 307,
      location: withQuery(localizedPath(chosen ?? locale, rest), params),
      setCookies: chosen ? [{ name: LOCALE_COOKIE, value: chosen, maxAge: YEAR }] : [],
    };
  }

  // 2. The default locale is never prefixed.
  if (explicitDefault) {
    return { kind: "redirect", status: 308, location: withQuery(localizedPath(defaultLocale, rest), params), setCookies: [] };
  }

  // 3. Bots: no redirects, no cookies, always control.
  if (isBot(input.userAgent)) {
    return { kind: "rewrite", pathname: internalPath(controlBucket(experiments), locale, rest), setCookies: [] };
  }

  // 4. Geo: visitors in Poland without a stored choice go to /pl.
  const cookieLocale = isLocale(input.cookies.locale) ? input.cookies.locale : null;
  if (locale === defaultLocale && !cookieLocale && input.country?.toUpperCase() === "PL") {
    return { kind: "redirect", status: 307, location: withQuery(localizedPath("pl", rest), params), setCookies: [] };
  }

  const setCookies: CookieSet[] = [];
  if (locale !== defaultLocale && cookieLocale !== locale) {
    setCookies.push({ name: LOCALE_COOKIE, value: locale, maxAge: YEAR });
  }

  // 5. Bucketing + rewrite to the pre-rendered bucket.
  const { assignment, changed } = assign(experiments, input.cookies.exp, input.random ?? Math.random);
  if (changed) {
    const value = serializeAssignment(assignment);
    setCookies.push({ name: EXP_COOKIE, value, maxAge: value ? EXP_MAX_AGE : 0 });
  }
  return { kind: "rewrite", pathname: internalPath(bucketFor(experiments, assignment, locale), locale, rest), setCookies };
}
```

- [ ] **Step 4: Run the decision tests**

Run: `pnpm --filter @repo/web test routing`
Expected: PASS.

- [ ] **Step 5: Write the failing middleware adapter tests**

`packages/web/test/middleware.test.ts`:
```ts
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { defineExperiments } from "../src/experiments";
import { createRoutingMiddleware } from "../src/routing/middleware";

const experiments = defineExperiments({
  hero: { variants: { control: "boring-bits", "easy-mode": "easy-mode" }, weights: [50, 50], markets: ["en", "pl"] },
});
const middleware = createRoutingMiddleware({ experiments, random: () => 0.9 });
const request = (url: string, headers: Record<string, string> = {}) => new NextRequest(url, { headers });

describe("createRoutingMiddleware", () => {
  it("rewrites to the bucket and sets cookies", () => {
    const res = middleware(request("https://attunr.com/services"));
    expect(res.headers.get("x-middleware-rewrite")).toBe("https://attunr.com/easy-mode/en/services");
    const cookie = res.cookies.get("exp");
    expect(cookie?.value).toBe("hero:easy-mode");
    expect(cookie?.sameSite).toBe("lax");
    expect(cookie?.path).toBe("/");
    expect(cookie?.secure).toBe(true);
  });

  it("redirects with an absolute location and the decided status", () => {
    const res = middleware(request("https://attunr.com/services?a=1", { "x-vercel-ip-country": "PL" }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("https://attunr.com/pl/services?a=1");
  });

  it("reads existing cookies", () => {
    const res = middleware(request("https://attunr.com/", { cookie: "exp=hero:control; NEXT_LOCALE=en", "x-vercel-ip-country": "PL" }));
    expect(res.headers.get("x-middleware-rewrite")).toBe("https://attunr.com/control/en");
    expect(res.cookies.getAll()).toEqual([]);
  });

  it("passes through skipped paths", () => {
    const res = middleware(request("https://attunr.com/api/contact"));
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("does not mark cookies secure on plain http (local dev)", () => {
    const res = middleware(request("http://localhost:3000/"));
    expect(res.cookies.get("exp")?.secure).toBe(false);
  });
});
```

- [ ] **Step 6: Run the tests to verify they fail**

Run: `pnpm --filter @repo/web test middleware`
Expected: FAIL, "Failed to resolve import ../src/routing/middleware".

- [ ] **Step 7: Implement `middleware.ts`**

`packages/web/src/routing/middleware.ts`:
```ts
import { NextResponse, type NextRequest } from "next/server";
import type { Experiments } from "../experiments";
import { decideRoute, EXP_COOKIE, LOCALE_COOKIE } from "./decide";

/**
 * Next middleware for Tangent and Helpful Machines. In each app:
 *   export default createRoutingMiddleware({ experiments });
 *   export const config = { matcher: ["/((?!api|_next|_vercel|ingest|og|.*\\..*).*)"] };
 */
export function createRoutingMiddleware(opts: { experiments: Experiments; random?: () => number }) {
  return function middleware(req: NextRequest): NextResponse {
    const decision = decideRoute({
      pathname: req.nextUrl.pathname,
      search: req.nextUrl.search,
      userAgent: req.headers.get("user-agent"),
      country: req.headers.get("x-vercel-ip-country"),
      cookies: { locale: req.cookies.get(LOCALE_COOKIE)?.value, exp: req.cookies.get(EXP_COOKIE)?.value },
      experiments: opts.experiments,
      random: opts.random,
    });
    if (decision.kind === "pass") return NextResponse.next();

    let res: NextResponse;
    if (decision.kind === "redirect") {
      res = NextResponse.redirect(new URL(decision.location, req.url), decision.status);
    } else {
      const url = req.nextUrl.clone();
      url.pathname = decision.pathname;
      res = NextResponse.rewrite(url);
    }
    const secure = req.nextUrl.protocol === "https:";
    for (const c of decision.setCookies) {
      res.cookies.set(c.name, c.value, { maxAge: c.maxAge, path: "/", sameSite: "lax", secure });
    }
    return res;
  };
}
```

- [ ] **Step 8: Run all web tests and typecheck**

Run: `pnpm --filter @repo/web test && pnpm --filter @repo/web typecheck`
Expected: PASS. Typecheck clean.

- [ ] **Step 9: Commit**

```bash
git add packages/web
git commit -m "feat(web): route decision with geo, locale choice, bots and bucketing; Next adapter

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: SEO: page metadata, sitemap, robots

**Files:**
- Create: `packages/web/src/seo.ts`
- Test: `packages/web/test/seo.test.ts`

**Interfaces:**
- Consumes: `locales`, `Locale`, `localizedPath`, `hreflang`, `ogLocale` (Task 2).
- Produces:
  - `absoluteUrl(siteUrl: string, path: string): string`
  - `languageAlternates(siteUrl: string, path: string, available?: readonly Locale[]): Record<string,string>` (keys `en-AU`, `pl-PL`, `x-default`)
  - `pageMetadata(o: { siteUrl: string; siteName: string; locale: Locale; path: string; title: string; description: string; ogImage?: string; available?: readonly Locale[] }): Metadata`
  - `type SitemapPage = { path: string; locales?: readonly Locale[]; lastModified?: Date; priority?: number }`
  - `buildSitemap(siteUrl: string, pages: SitemapPage[]): MetadataRoute.Sitemap`
  - `buildRobots(siteUrl: string): MetadataRoute.Robots`

- [ ] **Step 1: Write the failing tests**

`packages/web/test/seo.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { absoluteUrl, buildRobots, buildSitemap, languageAlternates, pageMetadata } from "../src/seo";

const site = "https://attunr.com";

describe("absoluteUrl", () => {
  it("joins without double slashes", () => {
    expect(absoluteUrl(site, "/")).toBe("https://attunr.com/");
    expect(absoluteUrl(site, "/services")).toBe("https://attunr.com/services");
    expect(absoluteUrl("https://attunr.com/tangent", "/pl")).toBe("https://attunr.com/tangent/pl");
  });
});

describe("languageAlternates", () => {
  it("lists every market plus x-default → english", () =>
    expect(languageAlternates(site, "/services")).toEqual({
      "en-AU": "https://attunr.com/services",
      "pl-PL": "https://attunr.com/pl/services",
      "x-default": "https://attunr.com/services",
    }));
  it("omits markets where the page is disabled", () =>
    expect(languageAlternates(site, "/pricing", ["en"])).toEqual({
      "en-AU": "https://attunr.com/pricing",
      "x-default": "https://attunr.com/pricing",
    }));
});

describe("pageMetadata", () => {
  const meta = pageMetadata({
    siteUrl: site,
    siteName: "Helpful Machines",
    locale: "pl",
    path: "/services",
    title: "Usługi",
    description: "Opis",
    ogImage: "/og/services-pl.png",
  });
  it("sets canonical to the locale URL", () => expect(meta.alternates?.canonical).toBe("https://attunr.com/pl/services"));
  it("sets hreflang alternates", () =>
    expect(meta.alternates?.languages).toEqual(languageAlternates(site, "/services")));
  it("sets open graph for the market", () =>
    expect(meta.openGraph).toMatchObject({
      type: "website",
      url: "https://attunr.com/pl/services",
      siteName: "Helpful Machines",
      locale: "pl_PL",
      alternateLocale: ["en_AU"],
      title: "Usługi",
      description: "Opis",
      images: [{ url: "https://attunr.com/og/services-pl.png", width: 1200, height: 630 }],
    }));
  it("sets twitter card", () => expect(meta.twitter).toMatchObject({ card: "summary_large_image", title: "Usługi" }));
});

describe("buildSitemap", () => {
  it("emits one entry per locale with alternates", () => {
    const entries = buildSitemap(site, [{ path: "/" }, { path: "/pricing", locales: ["en"] }]);
    expect(entries.map((e) => e.url)).toEqual(["https://attunr.com/", "https://attunr.com/pl", "https://attunr.com/pricing"]);
    expect(entries[1]!.alternates?.languages).toEqual(languageAlternates(site, "/"));
    expect(entries[2]!.alternates?.languages).toEqual({
      "en-AU": "https://attunr.com/pricing",
      "x-default": "https://attunr.com/pricing",
    });
  });
});

describe("buildRobots", () => {
  it("allows everything except the API and points at the sitemap", () =>
    expect(buildRobots(site)).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/ingest/"] },
      sitemap: "https://attunr.com/sitemap.xml",
    }));
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @repo/web test seo`
Expected: FAIL, "Failed to resolve import ../src/seo".

- [ ] **Step 3: Implement `seo.ts`**

`packages/web/src/seo.ts`:
```ts
import type { Metadata, MetadataRoute } from "next";
import { defaultLocale, hreflang, localizedPath, locales, normalizePath, ogLocale, type Locale } from "./locale";

/** Absolute URL. The root of a bare origin keeps its "/"; the root under a path prefix has none. */
export function absoluteUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/+$/, "");
  const rest = normalizePath(path);
  if (rest !== "/") return `${base}${rest}`;
  return new URL(base).pathname === "/" ? `${base}/` : base;
}

export function languageAlternates(
  siteUrl: string,
  path: string,
  available: readonly Locale[] = locales,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of locales) if (available.includes(l)) out[hreflang[l]] = absoluteUrl(siteUrl, localizedPath(l, path));
  if (available.includes(defaultLocale)) out["x-default"] = absoluteUrl(siteUrl, localizedPath(defaultLocale, path));
  return out;
}

export function pageMetadata(o: {
  siteUrl: string;
  siteName: string;
  locale: Locale;
  path: string;
  title: string;
  description: string;
  ogImage?: string;
  available?: readonly Locale[];
}): Metadata {
  const available = o.available ?? locales;
  const url = absoluteUrl(o.siteUrl, localizedPath(o.locale, o.path));
  const images = o.ogImage ? [{ url: absoluteUrl(o.siteUrl, o.ogImage), width: 1200, height: 630 }] : undefined;
  return {
    title: o.title,
    description: o.description,
    alternates: { canonical: url, languages: languageAlternates(o.siteUrl, o.path, available) },
    openGraph: {
      type: "website",
      url,
      siteName: o.siteName,
      title: o.title,
      description: o.description,
      locale: ogLocale[o.locale],
      alternateLocale: available.filter((l) => l !== o.locale).map((l) => ogLocale[l]),
      ...(images ? { images } : {}),
    },
    twitter: { card: "summary_large_image", title: o.title, description: o.description, ...(images ? { images: images.map((i) => i.url) } : {}) },
  };
}

export type SitemapPage = { path: string; locales?: readonly Locale[]; lastModified?: Date; priority?: number };

export function buildSitemap(siteUrl: string, pages: SitemapPage[]): MetadataRoute.Sitemap {
  return pages.flatMap((page) => {
    const available = page.locales ?? locales;
    const languages = languageAlternates(siteUrl, page.path, available);
    return locales
      .filter((l) => available.includes(l))
      .map((l) => ({
        url: absoluteUrl(siteUrl, localizedPath(l, page.path)),
        ...(page.lastModified ? { lastModified: page.lastModified } : {}),
        ...(page.priority !== undefined ? { priority: page.priority } : {}),
        alternates: { languages },
      }));
  });
}

export function buildRobots(siteUrl: string): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/ingest/"] },
    sitemap: absoluteUrl(siteUrl, "/sitemap.xml"),
  };
}
```

- [ ] **Step 4: Run the tests and typecheck**

Run: `pnpm --filter @repo/web test seo && pnpm --filter @repo/web typecheck`
Expected: PASS. Typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add packages/web
git commit -m "feat(web): SEO metadata with hreflang, sitemap and robots builders

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: JSON-LD builders

**Files:**
- Create: `packages/web/src/json-ld.ts`
- Test: `packages/web/test/json-ld.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces (each returns a plain object with `@context` and `@type`):
  - `organization({ name, url, logo?, email?, sameAs? })`
  - `website({ name, url, inLanguage: string[] })`
  - `professionalService({ name, url, description, areaServed: string[], email?, priceRange? })`
  - `service({ name, description, url, providerName, providerUrl, areaServed: string[] })`
  - `faqPage(items: { question: string; answer: string }[])`
  - `breadcrumbList(items: { name: string; url: string }[])`
  - `person({ name, jobTitle, url?, image?, sameAs?, alumniOf?: string[], award?: string[] })`
  - `serializeJsonLd(data: object | object[]): string` (safe to embed in `<script type="application/ld+json">`)

- [ ] **Step 1: Write the failing tests**

`packages/web/test/json-ld.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import {
  breadcrumbList,
  faqPage,
  organization,
  person,
  professionalService,
  serializeJsonLd,
  service,
  website,
} from "../src/json-ld";

describe("json-ld builders", () => {
  it("organization", () =>
    expect(organization({ name: "Helpful Machines", url: "https://attunr.com", email: "hi@x.com" })).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Helpful Machines",
      url: "https://attunr.com",
      email: "hi@x.com",
    }));
  it("website", () =>
    expect(website({ name: "Tangent", url: "https://attunr.com", inLanguage: ["en-AU", "pl-PL"] })).toMatchObject({
      "@type": "WebSite",
      inLanguage: ["en-AU", "pl-PL"],
    }));
  it("professionalService lists countries served", () =>
    expect(
      professionalService({ name: "Tangent", url: "https://attunr.com", description: "d", areaServed: ["AU", "PL"] }),
    ).toMatchObject({
      "@type": "ProfessionalService",
      areaServed: [
        { "@type": "Country", name: "AU" },
        { "@type": "Country", name: "PL" },
      ],
    }));
  it("service links to its provider", () =>
    expect(
      service({ name: "Custom apps", description: "d", url: "https://a.com/s", providerName: "HM", providerUrl: "https://a.com", areaServed: ["AU"] }),
    ).toMatchObject({ "@type": "Service", provider: { "@type": "Organization", name: "HM", url: "https://a.com" } }));
  it("faqPage", () =>
    expect(faqPage([{ question: "Q?", answer: "A." }])).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } }],
    }));
  it("breadcrumbList numbers items from 1", () =>
    expect(breadcrumbList([{ name: "Home", url: "https://a.com/" }, { name: "Services", url: "https://a.com/services" }]).itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: "https://a.com/" },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://a.com/services" },
    ]));
  it("person omits empty optional fields", () =>
    expect(person({ name: "Piotr Ciesiolkiewicz", jobTitle: "Founder" })).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Piotr Ciesiolkiewicz",
      jobTitle: "Founder",
    }));
});

describe("serializeJsonLd", () => {
  it("escapes characters that could close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>", x: "\u2028" });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script");
    expect(out).toContain("\\u2028");
    expect(JSON.parse(out)).toEqual({ name: "</script><script>alert(1)</script>", x: "\u2028" });
  });
  it("serializes arrays", () => expect(JSON.parse(serializeJsonLd([{ a: 1 }, { b: 2 }]))).toEqual([{ a: 1 }, { b: 2 }]));
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @repo/web test json-ld`
Expected: FAIL, "Failed to resolve import ../src/json-ld".

- [ ] **Step 3: Implement `json-ld.ts`**

`packages/web/src/json-ld.ts`:
```ts
type Json = Record<string, unknown>;
const CONTEXT = "https://schema.org";

/** Drop undefined values and empty arrays so output stays minimal. */
function clean(obj: Json): Json {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0)),
  );
}
const countries = (codes: string[]) => codes.map((name) => ({ "@type": "Country", name }));

export function organization(o: { name: string; url: string; logo?: string; email?: string; sameAs?: string[] }) {
  return clean({ "@context": CONTEXT, "@type": "Organization", ...o });
}

export function website(o: { name: string; url: string; inLanguage: string[] }) {
  return clean({ "@context": CONTEXT, "@type": "WebSite", ...o });
}

export function professionalService(o: {
  name: string;
  url: string;
  description: string;
  areaServed: string[];
  email?: string;
  priceRange?: string;
}) {
  return clean({ "@context": CONTEXT, "@type": "ProfessionalService", ...o, areaServed: countries(o.areaServed) });
}

export function service(o: {
  name: string;
  description: string;
  url: string;
  providerName: string;
  providerUrl: string;
  areaServed: string[];
}) {
  return clean({
    "@context": CONTEXT,
    "@type": "Service",
    name: o.name,
    description: o.description,
    url: o.url,
    provider: { "@type": "Organization", name: o.providerName, url: o.providerUrl },
    areaServed: countries(o.areaServed),
  });
}

export function faqPage(items: { question: string; answer: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.question, acceptedAnswer: { "@type": "Answer", text: i.answer } })),
  };
}

export function breadcrumbList(items: { name: string; url: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((i, index) => ({ "@type": "ListItem", position: index + 1, name: i.name, item: i.url })),
  };
}

export function person(o: {
  name: string;
  jobTitle: string;
  url?: string;
  image?: string;
  sameAs?: string[];
  alumniOf?: string[];
  award?: string[];
}) {
  return clean({
    "@context": CONTEXT,
    "@type": "Person",
    ...o,
    alumniOf: o.alumniOf?.map((name) => ({ "@type": "CollegeOrUniversity", name })),
  });
}

/** JSON for a <script type="application/ld+json">: escapes "<" and line separators. */
export function serializeJsonLd(data: object | object[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
```

- [ ] **Step 4: Run the tests and typecheck**

Run: `pnpm --filter @repo/web test json-ld && pnpm --filter @repo/web typecheck`
Expected: PASS. Typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add packages/web
git commit -m "feat(web): schema.org JSON-LD builders with safe serialisation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Contact: validation, spam checks, handler, Resend sender

**Files:**
- Create: `packages/web/src/contact/schema.ts`, `packages/web/src/contact/handler.ts`, `packages/web/src/contact/resend.ts`, `packages/web/src/contact/index.ts`
- Test: `packages/web/test/contact.test.ts`

**Interfaces:**
- Consumes: `Locale` (Task 2).
- Produces:
  - `contactSchema` (zod): `{ name, email, company, message, locale }`; `type ContactInput`
  - Form field names (Plan 2 form must use exactly these): `name`, `email`, `company`, `message`, `locale`, honeypot `website`, render timestamp `t` (ms, set by client JS on mount; absent without JS)
  - `isSpam(o: { honeypot: unknown; renderedAt: unknown; now: number }): boolean`
  - `type EmailMessage = { to: string; from: string; replyTo: string; subject: string; text: string }`, `type SendEmail = (m: EmailMessage) => Promise<void>`
  - `buildEmail(input: ContactInput, o: { to: string; from: string; siteName: string }): EmailMessage`
  - `createRateLimiter(o: { limit: number; windowMs: number; now?: () => number }): { hit(key: string): boolean }`
  - `createContactHandler(o: { send: SendEmail | null; to: string; from: string; siteName: string; now?: () => number; rateLimiter?: { hit(key: string): boolean } }): (req: Request) => Promise<Response>`
  - JSON responses: `200 {ok:true}`, `400 {ok:false,error:"validation",fields:Record<string,string>}`, `400 {ok:false,error:"bad_request"}`, `429 {ok:false,error:"rate_limited"}`, `502 {ok:false,error:"send_failed"}`, `503 {ok:false,error:"unavailable"}`
  - Form (non-JSON) responses: `303` to `/contact` or `/pl/contact` with `?sent=1` or `?error=validation|rate_limited|send_failed|unavailable|bad_request`
  - `resendSender(apiKey: string, fetchImpl?: typeof fetch): SendEmail`

- [ ] **Step 1: Write the failing tests**

`packages/web/test/contact.test.ts`:
```ts
import { describe, expect, it, vi } from "vitest";
import { buildEmail, createContactHandler, createRateLimiter, isSpam, resendSender, type EmailMessage } from "../src/contact";

const NOW = 1_800_000_000_000;
const valid = {
  name: "Zażółć Gęślą",
  email: "ania@example.pl",
  company: "Jaźń sp. z o.o.",
  message: "Potrzebujemy pomocy z arkuszami i automatyzacją.",
  locale: "pl",
  t: String(NOW - 60_000),
};
const setup = (opts: { send?: ((m: EmailMessage) => Promise<void>) | null } = {}) => {
  const sent: EmailMessage[] = [];
  const send = opts.send === undefined ? async (m: EmailMessage) => void sent.push(m) : opts.send;
  const handler = createContactHandler({ send, to: "piotr@example.com", from: "site@attunr.com", siteName: "Helpful Machines", now: () => NOW });
  return { handler, sent };
};
const json = (body: unknown, ip = "1.1.1.1") =>
  new Request("https://attunr.com/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
const form = (body: Record<string, string>) =>
  new Request("https://attunr.com/api/contact", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", "x-forwarded-for": "2.2.2.2" },
    body: new URLSearchParams(body).toString(),
  });

describe("isSpam", () => {
  it("flags a filled honeypot", () => expect(isSpam({ honeypot: "http://spam", renderedAt: undefined, now: NOW })).toBe(true));
  it("flags submissions faster than 3 seconds", () => expect(isSpam({ honeypot: "", renderedAt: String(NOW - 1000), now: NOW })).toBe(true));
  it("allows slower submissions and missing timestamps (no-JS)", () => {
    expect(isSpam({ honeypot: "", renderedAt: String(NOW - 5000), now: NOW })).toBe(false);
    expect(isSpam({ honeypot: undefined, renderedAt: undefined, now: NOW })).toBe(false);
  });
  it("ignores timestamps from the future (clock skew)", () =>
    expect(isSpam({ honeypot: "", renderedAt: String(NOW + 60_000), now: NOW })).toBe(false));
});

describe("buildEmail", () => {
  it("keeps diacritics and strips line breaks from the subject", () => {
    const m = buildEmail(
      { name: "Zażółć\r\nBcc: evil@x.com", email: "a@b.co", company: "", message: "Cześć", locale: "pl" },
      { to: "me@x.com", from: "site@x.com", siteName: "Tangent" },
    );
    expect(m.subject).toBe("[Tangent] Enquiry from Zażółć Bcc: evil@x.com");
    expect(m.subject).not.toMatch(/[\r\n]/);
    expect(m.replyTo).toBe("a@b.co");
    expect(m.text).toContain("Cześć");
    expect(m.text).toContain("Market: pl");
  });
});

describe("createContactHandler (JSON)", () => {
  it("sends a valid enquiry", async () => {
    const { handler, sent } = setup();
    const res = await handler(json(valid));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ to: "piotr@example.com", from: "site@attunr.com", replyTo: "ania@example.pl" });
    expect(sent[0]!.text).toContain("Zażółć Gęślą");
  });

  it("returns field errors without sending", async () => {
    const { handler, sent } = setup();
    const res = await handler(json({ ...valid, email: "nope", message: "hi" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("validation");
    expect(Object.keys(body.fields).sort()).toEqual(["email", "message"]);
    expect(sent).toHaveLength(0);
  });

  it("returns 400 for malformed JSON", async () => {
    const { handler } = setup();
    const res = await handler(json("{not json"));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: "bad_request" });
  });

  it("fakes success for spam", async () => {
    const { handler, sent } = setup();
    const res = await handler(json({ ...valid, website: "http://spam" }));
    expect(res.status).toBe(200);
    expect(sent).toHaveLength(0);
  });

  it("returns 503 when email is not configured", async () => {
    const { handler } = setup({ send: null });
    const res = await handler(json(valid));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false, error: "unavailable" });
  });

  it("returns 502 when sending fails", async () => {
    const { handler } = setup({ send: async () => Promise.reject(new Error("down")) });
    const res = await handler(json(valid));
    expect(res.status).toBe(502);
  });

  it("rate-limits per IP", async () => {
    const { handler } = setup();
    for (let i = 0; i < 5; i++) expect((await handler(json(valid, "9.9.9.9"))).status).toBe(200);
    expect((await handler(json(valid, "9.9.9.9"))).status).toBe(429);
    expect((await handler(json(valid, "8.8.8.8"))).status).toBe(200);
  });
});

describe("createContactHandler (no-JS form)", () => {
  it("redirects back to the polish contact page on success", async () => {
    const { handler, sent } = setup();
    const res = await handler(form(valid));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("https://attunr.com/pl/contact?sent=1");
    expect(sent).toHaveLength(1);
  });
  it("redirects to the english contact page with an error", async () => {
    const { handler } = setup();
    const res = await handler(form({ ...valid, locale: "en", email: "bad" }));
    expect(res.headers.get("location")).toBe("https://attunr.com/contact?error=validation");
  });
  it("accepts a submission without the JS timestamp", async () => {
    const { handler, sent } = setup();
    const { t: _t, ...noTimestamp } = valid;
    await handler(form(noTimestamp));
    expect(sent).toHaveLength(1);
  });
});

describe("createRateLimiter", () => {
  it("frees slots after the window", () => {
    let t = 0;
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t });
    expect(rl.hit("a")).toBe(true);
    expect(rl.hit("a")).toBe(false);
    t = 1001;
    expect(rl.hit("a")).toBe(true);
  });
});

describe("resendSender", () => {
  const msg = { to: "me@x.com", from: "site@x.com", replyTo: "a@b.co", subject: "S", text: "T" };
  it("posts to the Resend API", async () => {
    const fetchImpl = vi.fn(async () => new Response("{}", { status: 200 }));
    await resendSender("re_test", fetchImpl as unknown as typeof fetch)(msg);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test");
    expect(JSON.parse(init.body as string)).toEqual({ from: "site@x.com", to: ["me@x.com"], reply_to: "a@b.co", subject: "S", text: "T" });
  });
  it("throws on a non-2xx response", async () => {
    const fetchImpl = vi.fn(async () => new Response("no", { status: 422 }));
    await expect(resendSender("re_test", fetchImpl as unknown as typeof fetch)(msg)).rejects.toThrow(/422/);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @repo/web test contact`
Expected: FAIL, "Failed to resolve import ../src/contact".

- [ ] **Step 3: Implement `schema.ts`**

`packages/web/src/contact/schema.ts`:
```ts
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(200),
  company: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(10).max(5000),
  locale: z.enum(["en", "pl"]),
});
export type ContactInput = z.infer<typeof contactSchema>;

export type EmailMessage = { to: string; from: string; replyTo: string; subject: string; text: string };
export type SendEmail = (message: EmailMessage) => Promise<void>;

const MIN_FILL_MS = 3000;

/** Honeypot filled, or submitted under 3 s after the form mounted (timestamp set by client JS). */
export function isSpam(o: { honeypot: unknown; renderedAt: unknown; now: number }): boolean {
  if (typeof o.honeypot === "string" && o.honeypot.trim() !== "") return true;
  const t = Number(o.renderedAt);
  if (o.renderedAt === undefined || o.renderedAt === "" || !Number.isFinite(t)) return false;
  const elapsed = o.now - t;
  return elapsed >= 0 && elapsed < MIN_FILL_MS;
}

export function buildEmail(input: ContactInput, o: { to: string; from: string; siteName: string }): EmailMessage {
  const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();
  return {
    to: o.to,
    from: o.from,
    replyTo: input.email,
    subject: `[${o.siteName}] Enquiry from ${oneLine(input.name)}`,
    text: [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Company: ${input.company || "-"}`,
      `Market: ${input.locale}`,
      "",
      "Message:",
      input.message,
    ].join("\n"),
  };
}
```

- [ ] **Step 4: Implement `handler.ts`**

`packages/web/src/contact/handler.ts`:
```ts
import { buildEmail, contactSchema, isSpam, type SendEmail } from "./schema";

type Limiter = { hit(key: string): boolean };

export function createRateLimiter(o: { limit: number; windowMs: number; now?: () => number }): Limiter {
  const now = o.now ?? Date.now;
  const hits = new Map<string, number[]>();
  return {
    hit(key) {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((x) => t - x < o.windowMs);
      if (recent.length >= o.limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(t);
      hits.set(key, recent);
      return true;
    },
  };
}

type Outcome = { status: number; body: Record<string, unknown>; query: string };

export function createContactHandler(o: {
  send: SendEmail | null;
  to: string;
  from: string;
  siteName: string;
  now?: () => number;
  rateLimiter?: Limiter;
}) {
  const now = o.now ?? Date.now;
  const limiter = o.rateLimiter ?? createRateLimiter({ limit: 5, windowMs: 10 * 60_000, now });

  return async function POST(req: Request): Promise<Response> {
    const isJson = (req.headers.get("content-type") ?? "").includes("application/json");
    let raw: Record<string, unknown> | null = null;
    try {
      const parsed: unknown = isJson ? await req.json() : Object.fromEntries(await req.formData());
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) raw = parsed as Record<string, unknown>;
    } catch {
      raw = null;
    }
    const locale = raw?.locale === "pl" ? "pl" : "en";

    const respond = ({ status, body, query }: Outcome): Response => {
      if (isJson) return Response.json(body, { status });
      const location = new URL(`${locale === "pl" ? "/pl" : ""}/contact?${query}`, req.url);
      return new Response(null, { status: 303, headers: { Location: location.toString() } });
    };

    if (!raw) return respond({ status: 400, body: { ok: false, error: "bad_request" }, query: "error=bad_request" });

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || "unknown";
    if (!limiter.hit(ip)) return respond({ status: 429, body: { ok: false, error: "rate_limited" }, query: "error=rate_limited" });

    if (isSpam({ honeypot: raw.website, renderedAt: raw.t, now: now() })) {
      return respond({ status: 200, body: { ok: true }, query: "sent=1" });
    }

    const result = contactSchema.safeParse(raw);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "form");
        fields[key] ??= issue.message;
      }
      return respond({ status: 400, body: { ok: false, error: "validation", fields }, query: "error=validation" });
    }

    if (!o.send) return respond({ status: 503, body: { ok: false, error: "unavailable" }, query: "error=unavailable" });

    try {
      await o.send(buildEmail(result.data, o));
    } catch {
      return respond({ status: 502, body: { ok: false, error: "send_failed" }, query: "error=send_failed" });
    }
    return respond({ status: 200, body: { ok: true }, query: "sent=1" });
  };
}
```

- [ ] **Step 5: Implement `resend.ts` and `index.ts`**

`packages/web/src/contact/resend.ts`:
```ts
import type { SendEmail } from "./schema";

/** Sends through the Resend HTTP API (no SDK, keeps the route small). */
export function resendSender(apiKey: string, fetchImpl: typeof fetch = fetch): SendEmail {
  return async (m) => {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: m.from, to: [m.to], reply_to: m.replyTo, subject: m.subject, text: m.text }),
    });
    if (!res.ok) throw new Error(`Resend responded ${res.status}`);
  };
}
```

`packages/web/src/contact/index.ts`:
```ts
export { buildEmail, contactSchema, isSpam, type ContactInput, type EmailMessage, type SendEmail } from "./schema";
export { createContactHandler, createRateLimiter } from "./handler";
export { resendSender } from "./resend";
```

- [ ] **Step 6: Run the tests and typecheck**

Run: `pnpm --filter @repo/web test contact && pnpm --filter @repo/web typecheck`
Expected: PASS. Typecheck clean.

- [ ] **Step 7: Commit**

```bash
git add packages/web
git commit -m "feat(web): contact handler with validation, spam checks, rate limit, Resend

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Colour-mode script and consent rules

**Files:**
- Create: `packages/web/src/color-mode.ts`, `packages/web/src/csp.ts`, `packages/web/src/consent.ts`
- Test: `packages/web/test/color-mode.test.ts`, `packages/web/test/consent.test.ts`

**Interfaces:**
- Consumes: `Locale` (Task 2).
- Produces:
  - `COLOR_MODE_KEY = "colorMode"`, `type ColorModePreference = "light" | "dark" | "system"`, `type ColorMode = "light" | "dark"`
  - `resolveColorMode(pref: string | null, systemDark: boolean): ColorMode`
  - `colorModeScript: string` (inline `<head>` script; sets `document.documentElement.dataset.theme` and `style.colorScheme`)
  - `cspHash(script: string): string` in `src/csp.ts` (returns `'sha256-…'`, quoted as CSP expects). It lives in its own file because it imports `node:crypto`: `color-mode.ts` must stay importable from client components (Plan 2's switch imports `COLOR_MODE_KEY`).
  - `CONSENT_COOKIE = "consent"`, `type Consent = "granted" | "denied"`
  - `consentRequired(locale: Locale): boolean`
  - `analyticsPersistence(locale: Locale, consent: Consent | null): "memory" | "localStorage+cookie"`
  - `parseConsent(value: string | undefined): Consent | null`

- [ ] **Step 1: Write the failing tests**

`packages/web/test/color-mode.test.ts`:
```ts
import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { colorModeScript, resolveColorMode } from "../src/color-mode";
import { cspHash } from "../src/csp";

function runScript(o: { stored?: string | null; throws?: boolean; systemDark?: boolean }) {
  const root = { dataset: {} as Record<string, string>, style: {} as Record<string, string> };
  vm.runInNewContext(colorModeScript, {
    document: { documentElement: root },
    localStorage: {
      getItem: () => {
        if (o.throws) throw new Error("blocked");
        return o.stored ?? null;
      },
    },
    matchMedia: () => ({ matches: !!o.systemDark }),
  });
  return root;
}

describe("resolveColorMode", () => {
  it("honours an explicit choice", () => {
    expect(resolveColorMode("dark", false)).toBe("dark");
    expect(resolveColorMode("light", true)).toBe("light");
  });
  it("falls back to the system for system, null or garbage", () => {
    expect(resolveColorMode("system", true)).toBe("dark");
    expect(resolveColorMode(null, false)).toBe("light");
    expect(resolveColorMode("blue", true)).toBe("dark");
  });
});

describe("colorModeScript", () => {
  it("applies a stored choice", () => {
    const root = runScript({ stored: "dark" });
    expect(root.dataset.theme).toBe("dark");
    expect(root.style.colorScheme).toBe("dark");
  });
  it("prefers the stored choice over the system", () => expect(runScript({ stored: "light", systemDark: true }).dataset.theme).toBe("light"));
  it("follows the system with no choice", () => expect(runScript({ systemDark: true }).dataset.theme).toBe("dark"));
  it("survives blocked storage", () => expect(runScript({ throws: true, systemDark: true }).dataset.theme).toBe("dark"));
  it("is tiny", () => expect(colorModeScript.length).toBeLessThan(400));
});

describe("cspHash", () => {
  it("returns a quoted sha256 source", () => expect(cspHash("a")).toBe("'sha256-ypeBEsobvcr6wjGzmiPcTaeG7/gUfE5yuYB3ha/uSLs='"));
});
```

`packages/web/test/consent.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { analyticsPersistence, consentRequired, parseConsent } from "../src/consent";

describe("consent", () => {
  it("is required only in the polish market", () => {
    expect(consentRequired("pl")).toBe(true);
    expect(consentRequired("en")).toBe(false);
  });
  it("australia always persists normally", () => expect(analyticsPersistence("en", null)).toBe("localStorage+cookie"));
  it("poland stays in memory until consent is granted", () => {
    expect(analyticsPersistence("pl", null)).toBe("memory");
    expect(analyticsPersistence("pl", "denied")).toBe("memory");
    expect(analyticsPersistence("pl", "granted")).toBe("localStorage+cookie");
  });
  it("parses the cookie strictly", () => {
    expect(parseConsent("granted")).toBe("granted");
    expect(parseConsent("denied")).toBe("denied");
    expect(parseConsent("yes")).toBeNull();
    expect(parseConsent(undefined)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @repo/web test color-mode consent`
Expected: FAIL, "Failed to resolve import".

- [ ] **Step 3: Implement `color-mode.ts` and `csp.ts`**

`packages/web/src/color-mode.ts` (no Node imports, safe in client components):
```ts
export const COLOR_MODE_KEY = "colorMode";
export type ColorModePreference = "light" | "dark" | "system";
export type ColorMode = "light" | "dark";

export function resolveColorMode(pref: string | null, systemDark: boolean): ColorMode {
  if (pref === "light" || pref === "dark") return pref;
  return systemDark ? "dark" : "light";
}

/**
 * Inline <head> script: applies the stored or system colour mode before first paint.
 * Keep in sync with resolveColorMode. Allowed by CSP through cspHash(colorModeScript).
 */
export const colorModeScript = `(function(){var m="light";try{m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch(e){}try{var p=localStorage.getItem("${COLOR_MODE_KEY}");if(p==="light"||p==="dark")m=p}catch(e){}var d=document.documentElement;d.dataset.theme=m;d.style.colorScheme=m})()`;
```

`packages/web/src/csp.ts` (server-only):
```ts
import { createHash } from "node:crypto";

/** CSP source for an inline script, e.g. script-src 'self' 'sha256-…'. */
export function cspHash(script: string): string {
  return `'sha256-${createHash("sha256").update(script, "utf8").digest("base64")}'`;
}
```

- [ ] **Step 4: Implement `consent.ts`**

`packages/web/src/consent.ts`:
```ts
import type { Locale } from "./locale";

export const CONSENT_COOKIE = "consent";
export type Consent = "granted" | "denied";

/** Consent banner shows only in the Polish market (GDPR); Australia has none. */
export function consentRequired(locale: Locale): boolean {
  return locale === "pl";
}

/** PostHog persistence mode for a visitor. */
export function analyticsPersistence(locale: Locale, consent: Consent | null): "memory" | "localStorage+cookie" {
  if (!consentRequired(locale)) return "localStorage+cookie";
  return consent === "granted" ? "localStorage+cookie" : "memory";
}

export function parseConsent(value: string | undefined): Consent | null {
  return value === "granted" || value === "denied" ? value : null;
}
```

- [ ] **Step 5: Run the tests and typecheck**

Run: `pnpm --filter @repo/web test color-mode consent && pnpm --filter @repo/web typecheck`
Expected: PASS. Typecheck clean.

- [ ] **Step 6: Commit**

```bash
git add packages/web
git commit -m "feat(web): no-flash colour-mode script, CSP hash helper, consent rules (PL only)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Copy rule: "Custom apps", never "Apps" alone

**Files:**
- Create: `packages/web/src/content-rules.ts`
- Test: `packages/web/test/content-rules.test.ts`

**Interfaces:**
- Consumes: `Locale` (Task 2).
- Produces:
  - `type Finding = { path: string; match: string; index: number }`
  - `findBareApps(text: string): { match: string; index: number }[]` (English)
  - `findBarePolishApps(text: string): { match: string; index: number }[]`
  - `collectStrings(value: unknown, path?: string): { path: string; value: string }[]`
  - `findCopyViolations(dict: unknown, locale: Locale): Finding[]` (Plan 2's Helpful Machines content test asserts this is `[]` for `en.ts` and `pl.ts`)

- [ ] **Step 1: Write the failing tests**

`packages/web/test/content-rules.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { collectStrings, findBareApps, findBarePolishApps, findCopyViolations } from "../src/content-rules";

describe("findBareApps (english)", () => {
  it("allows 'custom app(s)' in any case", () =>
    expect(findBareApps("We build custom apps. Custom App support. CUSTOM APPS.")).toEqual([]));
  it("flags bare app/apps", () => {
    expect(findBareApps("Our apps are great").map((f) => f.match)).toEqual(["apps"]);
    expect(findBareApps("Apps for you, and a web app too").map((f) => f.match)).toEqual(["Apps", "app"]);
  });
  it("ignores words that merely contain app", () => expect(findBareApps("Apple happy webapps application")).toEqual([]));
});

describe("findBarePolishApps", () => {
  it("allows 'dedykowane aplikacje' and 'aplikacje na zamówienie' in any inflection", () => {
    expect(findBarePolishApps("Tworzymy dedykowane aplikacje.")).toEqual([]);
    expect(findBarePolishApps("Robimy aplikacje na zamówienie.")).toEqual([]);
    expect(findBarePolishApps("Zbudujemy dedykowaną aplikację mobilną.")).toEqual([]);
    expect(findBarePolishApps("Aplikację na zamówienie wdrożymy szybko.")).toEqual([]);
  });
  it("flags bare aplikacja forms", () => {
    expect(findBarePolishApps("Nasze aplikacje są szybkie").map((f) => f.match)).toEqual(["aplikacje"]);
    expect(findBarePolishApps("Aplikację mobilną też").map((f) => f.match)).toEqual(["Aplikację"]);
  });
});

describe("collectStrings", () => {
  it("walks nested objects and arrays with dotted paths", () =>
    expect(collectStrings({ a: "x", b: { c: ["y", "z"], n: 3 } })).toEqual([
      { path: "a", value: "x" },
      { path: "b.c.0", value: "y" },
      { path: "b.c.1", value: "z" },
    ]));
});

describe("findCopyViolations", () => {
  it("reports the dictionary path of each violation", () => {
    expect(findCopyViolations({ hero: { title: "Custom apps" }, nav: ["Apps"] }, "en")).toEqual([
      { path: "nav.0", match: "Apps", index: 0 },
    ]);
    expect(findCopyViolations({ s: { t: "aplikacje" } }, "pl")).toEqual([{ path: "s.t", match: "aplikacje", index: 0 }]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @repo/web test content-rules`
Expected: FAIL, "Failed to resolve import ../src/content-rules".

- [ ] **Step 3: Implement `content-rules.ts`**

`packages/web/src/content-rules.ts`:
```ts
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
```

- [ ] **Step 4: Run the tests and typecheck**

Run: `pnpm --filter @repo/web test content-rules && pnpm --filter @repo/web typecheck`
Expected: PASS. Typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add packages/web
git commit -m "feat(web): copy rule checker for 'Custom apps' (EN) and 'dedykowane aplikacje' (PL)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: CI workflow and whole-repo verification

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: root scripts `typecheck`, `test`, `build` (Task 1) and all packages.
- Produces: CI on every push and PR. Plan 4 adds Playwright, axe and Lighthouse jobs to this file.

- [ ] **Step 1: Write the workflow**

`.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```
(`pnpm/action-setup@v4` reads the version from `packageManager`.)

- [ ] **Step 2: Run the full pipeline locally from a clean state**

```bash
cd /Users/pio/projects/pio-yoga
rm -rf node_modules apps/*/node_modules packages/*/node_modules apps/yoga/.next .turbo
pnpm install --frozen-lockfile
pnpm typecheck && pnpm test && pnpm build
```
Expected: all three succeed. `pnpm test` reports all 11 `@repo/web` test files passing (locale, site, experiments, routing, middleware, seo, json-ld, contact, color-mode, consent, content-rules).

- [ ] **Step 3: Run it again to confirm turbo caching works**

Run: `pnpm typecheck && pnpm test && pnpm build`
Expected: same results, with turbo reporting `FULL TURBO` (all tasks cached).

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: typecheck, test and build all workspaces

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Hand back to the user**

Report: test count, build result, the commits. Remind them of the Vercel **Root Directory = `apps/yoga`** change from Task 1, Step 10 before anything is pushed. Don't push.
