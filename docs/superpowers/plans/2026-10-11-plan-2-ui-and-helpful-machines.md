# Plan 2: Shared UI kit and the Helpful Machines site

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `packages/ui` (Tailwind v4 + Radix design system with Helpful Machines tokens in light and dark) and ship the complete, statically generated Helpful Machines site in `apps/helpful-machines`, for the Australian (`/`) and Polish (`/pl`) markets, with the `hero` A/B experiment, contact form, PostHog analytics, consent on `/pl`, SEO, and OG images.

**Architecture:**
- **`packages/ui`:** TypeScript source consumed via `transpilePackages`. Styling comes only from CSS-variable tokens mapped into Tailwind's `@theme`, so a brand is one CSS file. Client components (colour mode, mobile menu, nav state, consent, analytics, contact form) are marked `"use client"`; everything else is a server component.
- **Routing:** the app's pages live under `app/[bucket]/[locale]/…`, pre-rendered for every bucket × locale. Plan 1's middleware rewrites public URLs into that tree.
- **Locale:** `next-intl` provides the request locale and the number/currency formatting. The copy itself lives in typed TS dictionaries.

**Tech Stack:**
- Next 15.5, React 19, Tailwind CSS ^4.3.3 (`@tailwindcss/postcss`)
- `@radix-ui/react-dialog` ^1.2.0, `@radix-ui/react-toggle-group` ^1.1.20
- next-intl ^4.14.9, posthog-js ^1.438.7, clsx ^2.1.1
- Vitest ^3.2.4 with jsdom ^26.1.0, @testing-library/react ^16.3.3, @testing-library/dom ^10.4.0, @testing-library/user-event ^14.6.7

**Spec:** `docs/superpowers/specs/2026-10-11-multi-brand-monorepo-design.md`
**Builds on:** Plan 1 (`docs/superpowers/plans/2026-10-11-plan-1-monorepo-foundation.md`), merged to `main`.

## Global Constraints

- Every page is SSG. Runtime pieces are only: middleware, `/api/contact`, and the 404 catch-all.
- Locales: `en` (Australia, no prefix) and `pl` (`/pl/...`), with the same slugs. `<html lang>` is `en-AU` / `pl-PL`.
- Public URLs never contain a bucket. Canonicals, hreflang, sitemap, nav links and OG image URLs are all built with `localizedPath` from `@repo/web/locale`.
- Experiment `hero`: variant `control` = "AI that actually does the boring bits.", variant `easy-mode` = "Put your business on easy mode.". Weights 50/50, both markets. Keys must match PostHog exactly.
- Design key: `helpful-machines` (`<html data-design="helpful-machines">`). Colour mode lives on `data-theme` (`light` / `dark`), and the no-JS fallback follows `prefers-color-scheme`.
- Copy rule: **"Custom apps"**, never "Apps" alone. Polish: "dedykowane …" or "… na zamówienie". `findCopyViolations` must return `[]` for both dictionaries.
- Consent banner on `pl` only; both buttons equally prominent. Australia has no banner.
- PostHog: EU region, proxied through `/ingest`, loaded on idle. No session recording, no autocapture.
- Contact form field names: `name`, `email`, `company`, `message`, `locale`, honeypot `website`, timestamp `t`.
- Touch targets ≥ 44 px. Focus visible. One `h1` per page. `prefers-reduced-motion` respected.
- Do not mention where Piotr lives. Work items are "experience behind Helpful Machines", never claimed as Helpful Machines clients.
- Local commands on this machine need `NODE_OPTIONS=--no-network-family-autoselection` (Plan 1 ruling). Never commit it.

## Review Focus

1. **A first visit with no JavaScript** (old phone, blocked scripts). Every page renders with the right theme from `prefers-color-scheme`, links work, and the contact form posts and comes back to `/contact?sent=1` (or `/pl/contact?...`). The honeypot stays invisible. Covered in Task 8 (form markup) and Task 13 (smoke POST).
2. **Switching colour mode, then reloading or opening another page.** No flash of the wrong theme, the switch shows the stored choice, and "System" follows OS changes live. Covered in Task 4.
3. **A Polish visitor's whole journey:** geo redirect → `/pl` → footer "English" link → back. The footer link goes straight to `/pl/...` (no `?locale=`) from English pages, and to `...?locale=en` from Polish pages, keeping the same page. Covered in Task 5 (LanguageLink) and Task 13 (smoke).
4. **Both hero variants on every market.** `control` and `easy-mode` HTML both exist for `en` and `pl`, with identical canonicals, and no `href` exposes `/control/` or `/easy-mode/`. Covered in Task 13 (build-output test).
5. **Consent on `/pl` declined, then changed later from the footer.** PostHog stays in memory mode until granted, then switches to `localStorage+cookie` without a reload. Australia never sees a banner. Covered in Task 7.

## Deviations from the spec (decided in this plan)

- **CSP:** `script-src` allows `'unsafe-inline'`. Next's App Router inlines its own bootstrap scripts, and nonces would force every page to render dynamically, breaking the SSG requirement. Hashing only the colour-mode script isn't enough. Everything else stays locked to `'self'`. `cspHash` stays in `@repo/web` for later use.
- **Radix use is narrower than listed:**
  - NavigationMenu → a plain `<nav>` list (no dropdowns needed).
  - Accordion → native `<details>` (zero JS, answers in the HTML).
  - Toast → an inline `role="status"` / `role="alert"` message (accessible, no portal).
  - Tooltip and Tabs → not needed on Helpful Machines; Tabs return in Plan 3 for the Work filter.
  - Radix is still used for Dialog (mobile menu) and ToggleGroup (colour mode).
- **No `asChild`/Slot buttons:** links styled as buttons use `ButtonLink` instead. This avoids passing server elements through a client Slot.
- **Public contact email:** a new `NEXT_PUBLIC_CONTACT_EMAIL` (shown on the site), separate from the private `CONTACT_TO_EMAIL` recipient.
- **Performance budget (decided during the build):** the spec's "≤ 70 KB first-load JS" is impossible on the Next 15 App Router, whose shared framework runtime alone is about 102 kB gzipped. New budget: **app-specific JS ≤ 30 KB gzipped per page**, plus Lighthouse mobile ≥ 95 (measured in Plan 4). Today the app adds about 27 kB (Radix 18.5, next/link 4.3, layout 4.3), and PostHog loads lazily.
- **Root 404 (decided in the review fix pass):** Next renders server-side 404s with the root layout and the root `not-found`. So `app/layout.tsx` is a pass-through, `app/not-found.tsx` is a full branded document (shared `components/Document.tsx`), and the middleware sends unknown paths there (`isKnownPath`). It can't know the market, so it's English with a Polish line and both home links.
- **Exposure event:** PostHog's own `$feature_flag_called` (plus `$feature/<key>` super properties) replaces the spec's `experiment_exposure`, so PostHog experiments read it natively. PostHog's flag evaluation is disabled (`advanced_disable_feature_flags`) so it can't overwrite the middleware's assignment.
- **Not built yet:** header `LocaleSwitch` behind `showLocaleSwitch` (the footer language link covers it), per-market "enabled pages", and social links in `site.config`. None are needed on Helpful Machines today.

---

## File structure

```
packages/config/tsconfig/nextjs.json          Next app tsconfig base
packages/web/src/
  experiments.ts      + activeAssignment, Object.hasOwn checks
  locale.ts           + stripInternalPrefix
  seo.ts              absolute ogImage passthrough
  content-rules.ts    fewer false positives (slugs, "custom web apps", up to 3 words before "na zamówienie")
  analytics.ts        posthogConfig, superProperties, exposureEvents (pure)
packages/ui/
  package.json  tsconfig.json  vitest.config.ts  test/setup.ts
  src/cn.ts  src/events.ts
  src/styles/base.css               Tailwind @theme mapping + base layer
  src/styles/helpful-machines.css   HM light + dark tokens
  src/components/
    Button.tsx  SmartLink.tsx  Container.tsx  Section.tsx  Card.tsx  Highlight.tsx
    ChipList.tsx  SkipLink.tsx  JsonLd.tsx
    ColorModeSwitch.tsx (client)
    NavLinks.tsx (client)  LanguageLink.tsx (client)  MobileMenu.tsx (client)
    SiteHeader.tsx  SiteFooter.tsx
    Hero.tsx  ServiceCard.tsx  StepList.tsx  PricingCard.tsx  FaqList.tsx  CtaBand.tsx
    ConsentBanner.tsx (client)  Analytics.tsx (client)  ContactForm.tsx (client)
  test/*.test.tsx
apps/helpful-machines/
  package.json  next.config.ts  postcss.config.mjs  tsconfig.json  vitest.config.ts  vitest.build.config.ts
  vercel.json  .env.example  README.md  middleware.ts  experiments.ts  site.config.ts
  i18n/request.ts
  public/icon.svg
  content/en.ts  pl.ts  index.ts  market.ts  services.ts  work.ts
  lib/params.ts  links.ts  routes.ts  metadata.ts
  components/Logo.tsx  Prose.tsx  Breadcrumbs.tsx  WorkCard.tsx
  app/globals.css
  app/[bucket]/[locale]/layout.tsx  page.tsx  not-found.tsx  [...missing]/page.tsx
  app/[bucket]/[locale]/services/page.tsx  services/[slug]/page.tsx
  app/[bucket]/[locale]/how-it-works/page.tsx  pricing/page.tsx  work/page.tsx  faq/page.tsx
  app/[bucket]/[locale]/contact/page.tsx  privacy/page.tsx  terms/page.tsx
  app/api/contact/route.ts  app/og/[locale]/[page]/route.tsx  app/sitemap.ts  app/robots.ts
  test/content.test.ts  test/routes.test.ts  test-build/output.test.ts
```

---

### Task 1: Approve the Helpful Machines dark mode (design gate)

**Files:**
- Create: `.superpowers/brainstorm/<session>/content/hm-dark-mode.html` (git-ignored companion screen)

**Interfaces:**
- Consumes: nothing.
- Produces: approved light and dark token values. If the user changes any, update the values in Task 3 Step 3 (`helpful-machines.css`) before running it, and ledger the change.

- [ ] **Step 1: Make sure the visual companion is running**

```bash
cd /Users/pio/projects/pio-yoga
ls .superpowers/brainstorm/*/state/server-info 2>/dev/null; ls .superpowers/brainstorm/*/state/server-stopped 2>/dev/null
```
If there's no `server-info`, or there is a `server-stopped`, start it:
```bash
bash /Users/pio/.claude/plugins/cache/claude-plugins-official/superpowers/6.4.1/skills/brainstorming/scripts/start-server.sh --project-dir /Users/pio/projects/pio-yoga --open
```
Expected: JSON with `url` (including `?key=`) and `screen_dir`. Keep the full URL.

- [ ] **Step 2: Write the comparison screen**

Write `<screen_dir>/hm-dark-mode.html` with the Write tool:

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&display=swap" rel="stylesheet">
<style>
  .hm { border-radius:14px; overflow:hidden; font-family:'Bricolage Grotesque',sans-serif; font-size:14px; line-height:1.5; background:var(--bg); color:var(--ink) }
  .light { --bg:#FFF6EA; --surface:#FFFFFF; --ink:#1E1A15; --muted:#5A5146; --line:#1E1A15; --accent:#FF5A36; --accent-text:#B8350D; --highlight:#FFC94A; --cta:4px 4px 0 #FF5A36; --card:4px 4px 0 #1E1A15 }
  .dark  { --bg:#17140F; --surface:#221D16; --ink:#FFF3E2; --muted:#CDBFAA; --line:#FFF3E2; --accent:#FF6B4A; --accent-text:#FF9A80; --highlight:#8C3B27; --cta:4px 4px 0 #FF6B4A; --card:4px 4px 0 #FF6B4A }
  .hm nav { display:flex; justify-content:space-between; align-items:center; padding:14px 22px; border-bottom:2px solid var(--line) }
  .logo { display:flex; gap:8px; align-items:center; font-weight:800; font-size:17px }
  .hero { padding:28px 22px }
  .eyebrow { color:var(--accent-text); font-weight:700; font-size:12px; letter-spacing:.12em; text-transform:uppercase }
  h1 { font-size:40px; font-weight:800; line-height:1.02; letter-spacing:-.02em; margin:8px 0 12px }
  mark { color:inherit; background:linear-gradient(transparent 60%, var(--highlight) 60%) }
  .lead { color:var(--muted); font-size:15.5px; max-width:30em; margin:0 0 18px }
  .btn { display:inline-block; padding:11px 18px; font-weight:700; border-radius:12px; background:var(--ink); color:var(--bg); box-shadow:var(--cta) }
  .card { margin-top:22px; background:var(--surface); border:2px solid var(--line); border-radius:12px; box-shadow:var(--card); padding:14px 16px }
  .card b { display:block; font-size:16px } .card span { color:var(--muted) }
  .chip { display:inline-block; margin:14px 6px 0 0; padding:5px 12px; border-radius:999px; border:2px solid var(--line); background:var(--surface); font-size:12.5px; font-weight:700 }
</style>
<h2>Helpful Machines: light and dark</h2>
<p class="subtitle">Same design, both colour modes. Dark keeps the cream "sticker" look by switching to cream lines and coral shadows. In dark the yellow highlighter becomes a deep coral band so cream text stays readable.</p>
<div class="split">
  <div class="mockup"><div class="mockup-header">Light (approved earlier)</div><div class="mockup-body"><div class="hm light">
    <nav><span class="logo"><svg width="22" height="22" viewBox="0 0 24 24"><rect width="24" height="24" rx="7" fill="#FF5A36"/><path d="M7 12.5c1.2 2 3 3 5 3s3.8-1 5-3" stroke="#FFF6EA" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>Helpful Machines</span><span>Services · Pricing · Work</span></nav>
    <div class="hero"><div class="eyebrow">AI and IT help for small businesses</div><h1>Put your business on <mark>easy mode</mark>.</h1><p class="lead">We set up AI assistants, custom apps and tidy data for small businesses, in plain English and at small-business prices.</p><span class="btn">Book a free chat →</span>
      <div><span class="chip">AI assistants</span><span class="chip">Custom apps</span></div>
      <div class="card"><b>You answer the same customer emails every day.</b><span>→ An AI assistant drafts the replies; you check and send.</span></div></div>
  </div></div></div>
  <div class="mockup"><div class="mockup-header">Dark (proposed)</div><div class="mockup-body"><div class="hm dark">
    <nav><span class="logo"><svg width="22" height="22" viewBox="0 0 24 24"><rect width="24" height="24" rx="7" fill="#FF6B4A"/><path d="M7 12.5c1.2 2 3 3 5 3s3.8-1 5-3" stroke="#17140F" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>Helpful Machines</span><span>Services · Pricing · Work</span></nav>
    <div class="hero"><div class="eyebrow">AI and IT help for small businesses</div><h1>Put your business on <mark>easy mode</mark>.</h1><p class="lead">We set up AI assistants, custom apps and tidy data for small businesses, in plain English and at small-business prices.</p><span class="btn">Book a free chat →</span>
      <div><span class="chip">AI assistants</span><span class="chip">Custom apps</span></div>
      <div class="card"><b>You answer the same customer emails every day.</b><span>→ An AI assistant drafts the replies; you check and send.</span></div></div>
  </div></div></div>
</div>
```

- [ ] **Step 3: STOP: ask the user to approve**

Tell the user the full companion URL and summarise: "Light is unchanged. Dark is warm charcoal with cream lines, coral button shadows and a deep coral highlighter band." Ask for approval or changes. **Do not start Task 3 until they answer.** Task 2 doesn't depend on this and may run while waiting.

- [ ] **Step 4: Record the outcome**

On approval: ledger `Task 1: approved dark tokens as proposed`. On changes: apply the new hex values to the Task 3 Step 3 CSS (both the `[data-theme="dark"]` block and the `prefers-color-scheme` fallback block) and ledger `Task 1: Ruling: dark tokens changed to …`. Push a `waiting-3.html` screen ("Continuing in terminal…"). No commit (the screen is git-ignored).

---

### Task 2: Web additions: active assignment, internal-prefix stripping, analytics helpers, review fixes

**Files:**
- Create: `packages/config/tsconfig/nextjs.json`, `packages/web/src/analytics.ts`, `packages/web/test/analytics.test.ts`
- Modify: `packages/web/src/experiments.ts`, `packages/web/src/locale.ts`, `packages/web/src/seo.ts`, `packages/web/src/content-rules.ts`, `packages/web/package.json` (export `./analytics`)
- Test: `packages/web/test/experiments.test.ts`, `packages/web/test/locale.test.ts`, `packages/web/test/seo.test.ts`, `packages/web/test/content-rules.test.ts`

**Interfaces:**
- Consumes: Plan 1's `@repo/web` modules.
- Produces:
  - `activeAssignment(exps: Experiments, assignment: Assignment, locale: Locale): Assignment` (only experiments running in that market, with valid variants)
  - `stripInternalPrefix(pathname: string, buckets: readonly string[]): { locale: Locale; rest: string }` (works on both internal `/control/pl/x` and public `/pl/x`)
  - `posthogConfig(locale: Locale, consent: Consent | null)` → `{ api_host: "/ingest", ui_host: "https://eu.posthog.com", persistence, capture_pageview: "history_change", capture_pageleave: true, autocapture: false, disable_session_recording: true }`
  - `superProperties(o: { market: Locale; colorMode: string; assignment: Assignment }): Record<string,string>` (`market`, `color_mode`, `$feature/<exp>`)
  - `exposureEvents(assignment: Assignment): { event: "$feature_flag_called"; properties: { $feature_flag: string; $feature_flag_response: string } }[]`
  - `pageMetadata` now passes absolute `ogImage` URLs through unchanged
  - `parseBucket`/`bucketFor` reject inherited keys (`toString`, `constructor`)
  - `findCopyViolations` skips slug-like strings and allows "Custom web apps", "Custom-built apps", and up to 3 words between "aplikacj…" and "na zamówienie"
  - `@repo/config/tsconfig/nextjs.json` for the Next app

- [ ] **Step 1: Add the Next tsconfig base**

`packages/config/tsconfig/nextjs.json`:
```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "allowJs": false,
    "incremental": true,
    "plugins": [{ "name": "next" }]
  }
}
```

- [ ] **Step 2: Write the failing tests**

Append to `packages/web/test/experiments.test.ts` (inside the file, after the existing `describe("buckets", …)` block; reuse the file's `one`, `two` and `hero` fixtures):
```ts
describe("inherited keys", () => {
  it("parseBucket rejects prototype keys", () => {
    expect(parseBucket(one, "toString")).toBeNull();
    expect(parseBucket(one, "constructor")).toBeNull();
  });
  it("bucketFor falls back to control for prototype keys", () =>
    expect(bucketFor(one, { hero: "toString" }, "en")).toBe("control"));
});

describe("activeAssignment", () => {
  it("keeps only experiments running in the market", () => {
    expect(activeAssignment(two, { design: "editorial", hero: "easy-mode" }, "en")).toEqual({ design: "editorial", hero: "easy-mode" });
    expect(activeAssignment(two, { design: "editorial", hero: "easy-mode" }, "pl")).toEqual({ hero: "easy-mode" });
  });
  it("drops unknown variants and experiments", () =>
    expect(activeAssignment(one, { hero: "gone", old: "control" }, "en")).toEqual({}));
});
```
and add `activeAssignment` to that file's import list from `../src/experiments`.

Append to `packages/web/test/locale.test.ts` (add `stripInternalPrefix` to the import):
```ts
describe("stripInternalPrefix", () => {
  const buckets = ["control", "easy-mode"];
  it("strips bucket and locale from internal paths", () => {
    expect(stripInternalPrefix("/control/pl/services", buckets)).toEqual({ locale: "pl", rest: "/services" });
    expect(stripInternalPrefix("/easy-mode/en", buckets)).toEqual({ locale: "en", rest: "/" });
  });
  it("handles public paths", () => {
    expect(stripInternalPrefix("/pl/services/", buckets)).toEqual({ locale: "pl", rest: "/services" });
    expect(stripInternalPrefix("/services", buckets)).toEqual({ locale: "en", rest: "/services" });
  });
  it("does not strip a bucket-named page without a locale after it", () =>
    expect(stripInternalPrefix("/control", buckets)).toEqual({ locale: "en", rest: "/control" }));
});
```

Append to `packages/web/test/seo.test.ts`:
```ts
describe("pageMetadata with an absolute ogImage", () => {
  it("passes it through unchanged", () => {
    const meta = pageMetadata({
      siteUrl: site, siteName: "X", locale: "en", path: "/", title: "T", description: "D",
      ogImage: "https://cdn.example.com/og.png",
    });
    expect(meta.openGraph).toMatchObject({ images: [{ url: "https://cdn.example.com/og.png" }] });
  });
});
```

Append to `packages/web/test/content-rules.test.ts`:
```ts
describe("fewer false positives", () => {
  it("allows one word between custom and app(s)", () => {
    expect(findBareApps("Custom web apps for shops")).toEqual([]);
    expect(findBareApps("Custom-built apps")).toEqual([]);
  });
  it("allows up to three words before 'na zamówienie'", () =>
    expect(findBarePolishApps("Tworzymy aplikacji webowych i mobilnych na zamówienie.")).toEqual([]));
  it("skips slug-like strings", () => {
    expect(findCopyViolations({ slug: "custom-apps-websites", path: "/services/apps", pl: "dedykowane-aplikacje" }, "en")).toEqual([]);
    expect(findCopyViolations({ pl: "dedykowane-aplikacje" }, "pl")).toEqual([]);
  });
  it("still flags bare apps in sentences", () =>
    expect(findCopyViolations({ s: "Our apps rock" }, "en")).toHaveLength(1));
});
```

`packages/web/test/analytics.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { exposureEvents, posthogConfig, superProperties } from "../src/analytics";

describe("posthogConfig", () => {
  it("uses the EU proxy and no recording or autocapture", () =>
    expect(posthogConfig("en", null)).toEqual({
      api_host: "/ingest",
      ui_host: "https://eu.posthog.com",
      persistence: "localStorage+cookie",
      capture_pageview: "history_change",
      capture_pageleave: true,
      autocapture: false,
      disable_session_recording: true,
    }));
  it("stays in memory on /pl until consent", () => {
    expect(posthogConfig("pl", null).persistence).toBe("memory");
    expect(posthogConfig("pl", "denied").persistence).toBe("memory");
    expect(posthogConfig("pl", "granted").persistence).toBe("localStorage+cookie");
  });
});

describe("superProperties", () => {
  it("adds market, colour mode and $feature/<experiment>", () =>
    expect(superProperties({ market: "pl", colorMode: "dark", assignment: { hero: "easy-mode" } })).toEqual({
      market: "pl",
      color_mode: "dark",
      "$feature/hero": "easy-mode",
    }));
});

describe("exposureEvents", () => {
  it("emits one $feature_flag_called per experiment", () =>
    expect(exposureEvents({ hero: "control" })).toEqual([
      { event: "$feature_flag_called", properties: { $feature_flag: "hero", $feature_flag_response: "control" } },
    ]));
  it("emits nothing without experiments", () => expect(exposureEvents({})).toEqual([]));
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd /Users/pio/projects/pio-yoga && pnpm --filter @repo/web test`
Expected: FAIL. Import errors for `activeAssignment`, `stripInternalPrefix` and `../src/analytics`; assertion failures for `toString` buckets, the absolute ogImage, and the copy-rule cases.

- [ ] **Step 4: Implement**

In `packages/web/src/experiments.ts`:
- replace `variant && variant in def.variants` (in `bucketFor`) with `variant !== undefined && Object.hasOwn(def.variants, variant)`
- replace `if (!(variant in def.variants)) return null;` (in `parseBucket`) with `if (!Object.hasOwn(def.variants, variant)) return null;`
- append:
```ts
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
```

Append to `packages/web/src/locale.ts`:
```ts
/** Locale and locale-less rest of a pathname that may be internal (/<bucket>/<locale>/…) or public. */
export function stripInternalPrefix(pathname: string, buckets: readonly string[]): { locale: Locale; rest: string } {
  const path = normalizePath(pathname);
  const [, first = "", second = "", ...more] = path.split("/");
  if (buckets.includes(first) && isLocale(second)) return { locale: second, rest: normalizePath(more.join("/")) };
  const { locale, rest } = splitLocale(path);
  return { locale, rest };
}
```

In `packages/web/src/seo.ts`, replace the `images` line in `pageMetadata` with:
```ts
  const imageUrl = o.ogImage && (/^https?:\/\//i.test(o.ogImage) ? o.ogImage : absoluteUrl(o.siteUrl, o.ogImage));
  const images = imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined;
```

In `packages/web/src/content-rules.ts`:
- replace `EN_ALLOWED_BEFORE` with `const EN_ALLOWED_BEFORE = /(?<![\p{L}\p{N}])custom(?:[\s-]+[\p{L}-]+)?[\s-]+$/iu;`
- replace `PL_ALLOWED_AFTER` with `const PL_ALLOWED_AFTER = /^(?:\s+\p{L}+){0,3}\s+na\s+zamówienie(?![\p{L}])/iu;`
- add `const SLUG = /^(?:\/\S*|[a-z0-9]+(?:-[a-z0-9]+)+)$/;`
- change `findCopyViolations` to skip slugs:
```ts
export function findCopyViolations(dict: unknown, locale: Locale): Finding[] {
  const find = locale === "pl" ? findBarePolishApps : findBareApps;
  return collectStrings(dict)
    .filter(({ value }) => !SLUG.test(value))
    .flatMap(({ path, value }) => find(value).map((m) => ({ path, ...m })));
}
```

`packages/web/src/analytics.ts`:
```ts
import { analyticsPersistence, type Consent } from "./consent";
import type { Assignment } from "./experiments";
import type { Locale } from "./locale";

export function posthogConfig(locale: Locale, consent: Consent | null) {
  return {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    persistence: analyticsPersistence(locale, consent),
    capture_pageview: "history_change" as const,
    capture_pageleave: true,
    autocapture: false,
    disable_session_recording: true,
  };
}

export function superProperties(o: { market: Locale; colorMode: string; assignment: Assignment }): Record<string, string> {
  const props: Record<string, string> = { market: o.market, color_mode: o.colorMode };
  for (const [name, variant] of Object.entries(o.assignment)) props[`$feature/${name}`] = variant;
  return props;
}

export function exposureEvents(assignment: Assignment) {
  return Object.entries(assignment).map(([flag, variant]) => ({
    event: "$feature_flag_called" as const,
    properties: { $feature_flag: flag, $feature_flag_response: variant },
  }));
}
```

In `packages/web/package.json` `exports`, add `"./analytics": "./src/analytics.ts",`.

- [ ] **Step 5: Run the tests and typecheck**

Run: `pnpm --filter @repo/web test && pnpm --filter @repo/web typecheck`
Expected: PASS (all previous tests plus the new ones). Typecheck clean.

- [ ] **Step 6: Commit**

```bash
git add packages
git commit -m "feat(web): analytics helpers, active assignment, internal-prefix stripping; review fixes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: `packages/ui` scaffold, tokens and static primitives

**Files:**
- Create: `packages/ui/package.json`, `packages/ui/tsconfig.json`, `packages/ui/vitest.config.ts`, `packages/ui/test/setup.ts`
- Create: `packages/ui/src/cn.ts`, `packages/ui/src/events.ts`, `packages/ui/src/styles/base.css`, `packages/ui/src/styles/helpful-machines.css`
- Create: `packages/ui/src/components/{Button,SmartLink,Container,Section,Card,Highlight,ChipList,SkipLink,JsonLd}.tsx`
- Test: `packages/ui/test/primitives.test.tsx`

**Interfaces:**
- Consumes: `serializeJsonLd` (`@repo/web/json-ld`).
- Produces (import paths are `@repo/ui/<Name>`):
  - `cn(...classes)` from `@repo/ui/cn`
  - `ANALYTICS_EVENT = "hm:analytics"`, `track(event: string, properties?: Record<string, unknown>)` from `@repo/ui/events`
  - `type Variant = "primary" | "secondary" | "ghost"`, `buttonClasses(variant?: Variant): string`, `Button(props: ButtonHTMLAttributes & { variant?: Variant })` (default `type="button"`)
  - `type CtaLink = { href: string; label: string; external?: boolean; track?: string; trackLocation?: string }`, and `SmartLink({ href, external?, track?, trackLocation?, newTabLabel?, className?, children, ...anchorProps })`: internal links use `next/link`; external ones open a new tab and announce it
  - `ButtonLink({ link: CtaLink, variant?, newTabLabel?, className? })`
  - `Container({ className?, children })`, `Section({ id, eyebrow?, title, intro?, children, className?, headingLevel?: "h1" | "h2" })`, `Card({ className?, children, as? })`, `Highlight({ children })`, `ChipList({ items: string[], label?: string })`, `SkipLink({ label })`, `JsonLd({ data })`
  - Tailwind utilities from tokens: `bg-bg bg-surface text-ink text-muted border-line bg-accent text-accent-text text-accent-ink bg-highlight rounded-card shadow-cta shadow-card font-display font-body`

- [ ] **Step 1: Create the package**

`packages/ui/package.json`:
```json
{
  "name": "@repo/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./styles/*": "./src/styles/*",
    "./cn": "./src/cn.ts",
    "./events": "./src/events.ts",
    "./*": "./src/components/*.tsx"
  },
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.2.0",
    "@radix-ui/react-toggle-group": "^1.1.20",
    "@repo/web": "workspace:*",
    "clsx": "^2.1.1",
    "posthog-js": "^1.438.7"
  },
  "peerDependencies": {
    "next": "^15.5.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@repo/config": "workspace:*",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/react": "^16.3.3",
    "@testing-library/user-event": "^14.6.7",
    "@types/node": "^22.15.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "jsdom": "^26.1.0",
    "next": "^15.5.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "typescript": "^5.9.3",
    "vitest": "^3.2.4"
  }
}
```

`packages/ui/tsconfig.json`:
```json
{
  "extends": "@repo/config/tsconfig/base.json",
  "compilerOptions": { "jsx": "react-jsx" },
  "include": ["src", "test", "vitest.config.ts"]
}
```

`packages/ui/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  test: { environment: "jsdom", include: ["test/**/*.test.tsx"], setupFiles: ["./test/setup.ts"] },
});
```

`packages/ui/test/setup.ts`:
```ts
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

let systemDark = false;
/** Tests flip the OS colour scheme with setSystemDark(true). */
export function setSystemDark(value: boolean) {
  systemDark = value;
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn((query: string) => ({
    get matches() {
      return query.includes("dark") ? systemDark : false;
    },
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

afterEach(() => {
  cleanup();
  vi.mocked(window.matchMedia).mockClear();
  localStorage.clear();
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0]?.trim();
    if (name) document.cookie = `${name}=; Max-Age=0; Path=/`;
  });
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.colorScheme = "";
  systemDark = false;
});
```

Run: `cd /Users/pio/projects/pio-yoga && pnpm install`
Expected: installs without errors. The `@repo/ui` workspace is linked.

- [ ] **Step 2: Write the failing primitives test**

`packages/ui/test/primitives.test.tsx`:
```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button, buttonClasses } from "../src/components/Button";
import { ButtonLink, SmartLink } from "../src/components/SmartLink";
import { Section } from "../src/components/Section";
import { ChipList } from "../src/components/ChipList";
import { SkipLink } from "../src/components/SkipLink";
import { JsonLd } from "../src/components/JsonLd";
import { ANALYTICS_EVENT, track } from "../src/events";

describe("Button", () => {
  it("defaults to type=button so it never submits forms by accident", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).getAttribute("type")).toBe("button");
  });
  it("has variant classes", () => {
    expect(buttonClasses("primary")).toContain("shadow-cta");
    expect(buttonClasses("secondary")).toContain("border-line");
  });
});

describe("SmartLink", () => {
  it("renders internal links without target", () => {
    render(<SmartLink href="/pl/services">Usługi</SmartLink>);
    const a = screen.getByRole("link", { name: "Usługi" });
    expect(a.getAttribute("href")).toBe("/pl/services");
    expect(a.getAttribute("target")).toBeNull();
  });
  it("opens external links in a new tab and says so to screen readers", () => {
    render(<SmartLink href="https://cal.com/x" external track="booking_opened" newTabLabel="(opens in a new tab)">Book</SmartLink>);
    const a = screen.getByRole("link", { name: "Book (opens in a new tab)" });
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    expect(a.getAttribute("data-track")).toBe("booking_opened");
  });
  it("ButtonLink styles a link as a button", () => {
    render(<ButtonLink link={{ href: "/contact", label: "Book a free chat", track: "cta_click", trackLocation: "hero" }} />);
    const a = screen.getByRole("link", { name: "Book a free chat" });
    expect(a.className).toContain("shadow-cta");
    expect(a.getAttribute("data-track-location")).toBe("hero");
  });
});

describe("Section", () => {
  it("labels the section by its heading", () => {
    render(<Section id="fixes" eyebrow="What we fix" title="Sound familiar?" intro="Intro">x</Section>);
    const region = screen.getByRole("region", { name: "Sound familiar?" });
    expect(region.id).toBe("fixes");
    expect(screen.getByRole("heading", { level: 2, name: "Sound familiar?" })).toBeTruthy();
  });
  it("can render an h1 for page headers", () => {
    render(<Section id="top" title="Pricing" headingLevel="h1">x</Section>);
    expect(screen.getByRole("heading", { level: 1, name: "Pricing" })).toBeTruthy();
  });
});

describe("ChipList / SkipLink / JsonLd", () => {
  it("renders chips as a labelled list", () => {
    render(<ChipList items={["AI assistants", "Custom apps"]} label="Services" />);
    expect(screen.getByRole("list", { name: "Services" }).children).toHaveLength(2);
  });
  it("skip link targets #main", () => {
    render(<SkipLink label="Skip to content" />);
    expect(screen.getByRole("link", { name: "Skip to content" }).getAttribute("href")).toBe("#main");
  });
  it("JsonLd escapes the payload", () => {
    const { container } = render(<JsonLd data={{ name: "</script>" }} />);
    const script = container.querySelector('script[type="application/ld+json"]')!;
    expect(script.innerHTML).not.toContain("</script>");
    expect(JSON.parse(script.innerHTML)).toEqual({ name: "</script>" });
  });
});

describe("track", () => {
  it("dispatches an analytics event on window", () => {
    const seen = vi.fn();
    window.addEventListener(ANALYTICS_EVENT, (e) => seen((e as CustomEvent).detail));
    track("form_submitted", { success: true });
    expect(seen).toHaveBeenCalledWith({ event: "form_submitted", properties: { success: true } });
  });
});
```

- [ ] **Step 3: Write the styles**

`packages/ui/src/styles/base.css`:
```css
/* Maps design tokens (CSS variables set per design and colour mode) into Tailwind utilities. */
@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --color-line: var(--line);
  --color-accent: var(--accent);
  --color-accent-text: var(--accent-text);
  --color-accent-ink: var(--accent-ink);
  --color-highlight: var(--highlight);
  --radius-card: var(--radius);
  --shadow-cta: var(--cta-shadow);
  --shadow-card: var(--card-shadow);
  --font-display: var(--font-display-family);
  --font-body: var(--font-body-family);
}

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

@layer base {
  html {
    background: var(--bg);
    color: var(--ink);
    -webkit-text-size-adjust: 100%;
    scroll-behavior: smooth;
  }
  body {
    font-family: var(--font-body-family), system-ui, sans-serif;
  }
  a {
    color: inherit;
  }
  :focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 3px;
  }
  [id] {
    scroll-margin-top: 5rem;
  }
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

`packages/ui/src/styles/helpful-machines.css` (values approved in Task 1):
```css
:root[data-design="helpful-machines"] {
  --bg: #fff6ea;
  --surface: #ffffff;
  --ink: #1e1a15;
  --muted: #5a5146;
  --line: #1e1a15;
  --accent: #ff5a36;
  --accent-text: #b8350d;
  --accent-ink: #1e1a15;
  --highlight: #ffc94a;
  --focus: #1e1a15;
  --radius: 12px;
  --cta-shadow: 4px 4px 0 #ff5a36;
  --card-shadow: 4px 4px 0 #1e1a15;
  --font-display-family: var(--font-bricolage);
  --font-body-family: var(--font-bricolage);
  color-scheme: light;
}

:root[data-design="helpful-machines"][data-theme="dark"] {
  --bg: #17140f;
  --surface: #221d16;
  --ink: #fff3e2;
  --muted: #cdbfaa;
  --line: #fff3e2;
  --accent: #ff6b4a;
  --accent-text: #ff9a80;
  --accent-ink: #17140f;
  --highlight: #8c3b27;
  --focus: #ffc94a;
  --cta-shadow: 4px 4px 0 #ff6b4a;
  --card-shadow: 4px 4px 0 #ff6b4a;
  color-scheme: dark;
}

/* No-JS fallback: the colour-mode script never ran, so follow the OS. */
@media (prefers-color-scheme: dark) {
  :root[data-design="helpful-machines"]:not([data-theme]) {
    --bg: #17140f;
    --surface: #221d16;
    --ink: #fff3e2;
    --muted: #cdbfaa;
    --line: #fff3e2;
    --accent: #ff6b4a;
    --accent-text: #ff9a80;
  --accent-ink: #17140f;
    --highlight: #8c3b27;
    --focus: #ffc94a;
    --cta-shadow: 4px 4px 0 #ff6b4a;
    --card-shadow: 4px 4px 0 #ff6b4a;
    color-scheme: dark;
  }
}

/* Highlighter sweep on headline words. */
[data-design="helpful-machines"] .hm-highlight {
  color: inherit;
  background: linear-gradient(transparent 60%, var(--highlight) 60%) no-repeat 0 0 / 100% 100%;
  animation: hm-sweep 0.7s 0.2s ease-out both;
}
@keyframes hm-sweep {
  from { background-size: 0% 100%; }
  to { background-size: 100% 100%; }
}
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm --filter @repo/ui test`
Expected: FAIL, "Failed to resolve import ../src/components/Button" (and the other components).

- [ ] **Step 5: Implement the primitives**

`packages/ui/src/cn.ts`:
```ts
export { clsx as cn } from "clsx";
```

`packages/ui/src/events.ts`:
```ts
/** Window event the Analytics component listens to; lets any component report without importing PostHog. */
export const ANALYTICS_EVENT = "hm:analytics";

export function track(event: string, properties: Record<string, unknown> = {}) {
  window.dispatchEvent(new CustomEvent(ANALYTICS_EVENT, { detail: { event, properties } }));
}
```

`packages/ui/src/components/Button.tsx`:
```tsx
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../cn";

export type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 font-display font-bold no-underline transition-transform duration-150 disabled:opacity-60";
const variants: Record<Variant, string> = {
  primary: "rounded-card bg-ink px-5 py-3 text-bg shadow-cta hover:-translate-y-0.5 active:translate-y-0",
  secondary: "rounded-card border-2 border-line bg-surface px-5 py-3 text-ink shadow-card hover:-translate-y-0.5 active:translate-y-0",
  ghost: "px-1 py-2 text-ink underline decoration-2 underline-offset-4 hover:decoration-accent",
};

export function buttonClasses(variant: Variant = "primary"): string {
  return cn(base, variants[variant]);
}

export function Button({
  variant = "primary",
  type = "button",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={cn(buttonClasses(variant), className)} {...props} />;
}
```

`packages/ui/src/components/SmartLink.tsx`:
```tsx
import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";
import { buttonClasses, type Variant } from "./Button";

export type CtaLink = { href: string; label: string; external?: boolean; track?: string; trackLocation?: string };

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  external?: boolean;
  track?: string;
  trackLocation?: string;
  newTabLabel?: string;
  children: ReactNode;
};

export function SmartLink({ href, external, track, trackLocation, newTabLabel = "(opens in a new tab)", children, className, ...rest }: Props) {
  const data = { "data-track": track, "data-track-location": trackLocation };
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...data} {...rest}>
        {children}
        <span className="sr-only"> {newTabLabel}</span>
      </a>
    );
  }
  return (
    <Link href={href} className={className} {...data} {...rest}>
      {children}
    </Link>
  );
}

export function ButtonLink({ link, variant = "primary", newTabLabel, className }: { link: CtaLink; variant?: Variant; newTabLabel?: string; className?: string }) {
  return (
    <SmartLink
      href={link.href}
      external={link.external}
      track={link.track}
      trackLocation={link.trackLocation}
      newTabLabel={newTabLabel}
      className={cn(buttonClasses(variant), className)}
    >
      {link.label}
    </SmartLink>
  );
}
```

`packages/ui/src/components/Container.tsx`:
```tsx
import type { ReactNode } from "react";
import { cn } from "../cn";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}
```

`packages/ui/src/components/Section.tsx`:
```tsx
import type { ReactNode } from "react";
import { cn } from "../cn";
import { Container } from "./Container";

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className,
  headingLevel: Heading = "h2",
}: {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
  headingLevel?: "h1" | "h2";
}) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className={cn("py-14 sm:py-20", className)}>
      <Container>
        {eyebrow && <p className="mb-3 text-sm font-bold uppercase tracking-widest text-accent-text">{eyebrow}</p>}
        <Heading
          id={headingId}
          className={cn(
            "max-w-3xl font-display font-extrabold tracking-tight text-balance",
            Heading === "h1" ? "text-4xl sm:text-6xl" : "text-3xl sm:text-5xl",
          )}
        >
          {title}
        </Heading>
        {intro && <p className="mt-4 max-w-2xl text-lg text-muted">{intro}</p>}
        {children && <div className="mt-10">{children}</div>}
      </Container>
    </section>
  );
}
```

`packages/ui/src/components/Card.tsx`:
```tsx
import type { ElementType, ReactNode } from "react";
import { cn } from "../cn";

export function Card({ className, children, as: Tag = "div" }: { className?: string; children: ReactNode; as?: ElementType }) {
  return <Tag className={cn("rounded-card border-2 border-line bg-surface p-6 shadow-card", className)}>{children}</Tag>;
}
```

`packages/ui/src/components/Highlight.tsx`:
```tsx
import type { ReactNode } from "react";

/** Highlighter-pen emphasis inside headlines; styled per design (.hm-highlight). */
export function Highlight({ children }: { children: ReactNode }) {
  return <mark className="hm-highlight">{children}</mark>;
}
```

`packages/ui/src/components/ChipList.tsx`:
```tsx
export function ChipList({ items, label }: { items: string[]; label?: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-full border-2 border-line bg-surface px-3 py-1 text-sm font-bold">
          {item}
        </li>
      ))}
    </ul>
  );
}
```

`packages/ui/src/components/SkipLink.tsx`:
```tsx
export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-card focus:bg-ink focus:px-4 focus:py-3 focus:text-bg"
    >
      {label}
    </a>
  );
}
```

`packages/ui/src/components/JsonLd.tsx`:
```tsx
import { serializeJsonLd } from "@repo/web/json-ld";

export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
```

- [ ] **Step 6: Run the tests and typecheck**

Run: `pnpm --filter @repo/ui test && pnpm --filter @repo/ui typecheck`
Expected: PASS (11 tests). Typecheck clean.

- [ ] **Step 7: Commit**

```bash
git add packages/ui pnpm-lock.yaml
git commit -m "feat(ui): design tokens (Helpful Machines light/dark) and static primitives

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: ColorModeSwitch (Light / Dark / System)

**Files:**
- Create: `packages/ui/src/components/ColorModeSwitch.tsx`
- Test: `packages/ui/test/color-mode-switch.test.tsx`

**Interfaces:**
- Consumes: `COLOR_MODE_KEY`, `resolveColorMode`, `ColorModePreference` (`@repo/web/color-mode`). `setSystemDark` (test setup).
- Produces: `type ColorModeLabels = { group: string; light: string; dark: string; system: string }` and `ColorModeSwitch({ labels }: { labels: ColorModeLabels })`. It reads and writes `localStorage.colorMode` (`"system"` removes the key), sets `data-theme` and `style.colorScheme` on `<html>`, and follows OS changes while on System.

- [ ] **Step 1: Write the failing test**

`packages/ui/test/color-mode-switch.test.tsx`:
```tsx
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, type Mock } from "vitest";
import { ColorModeSwitch } from "../src/components/ColorModeSwitch";
import { setSystemDark } from "./setup";

const labels = { group: "Colour mode", light: "Light", dark: "Dark", system: "System" };
const root = () => document.documentElement;
const state = (name: string) => screen.getByLabelText(name).getAttribute("data-state");

describe("ColorModeSwitch", () => {
  it("is a labelled group with 44px targets", () => {
    render(<ColorModeSwitch labels={labels} />);
    expect(screen.getByRole("radiogroup", { name: "Colour mode" })).toBeTruthy();
    expect(screen.getByLabelText("Light").className).toContain("size-11");
  });

  it("shows and applies a stored choice", () => {
    localStorage.setItem("colorMode", "dark");
    render(<ColorModeSwitch labels={labels} />);
    expect(state("Dark")).toBe("on");
    expect(root().dataset.theme).toBe("dark");
    expect(root().style.colorScheme).toBe("dark");
  });

  it("defaults to System and follows the OS", () => {
    setSystemDark(true);
    render(<ColorModeSwitch labels={labels} />);
    expect(state("System")).toBe("on");
    expect(root().dataset.theme).toBe("dark");
  });

  it("stores an explicit choice", async () => {
    render(<ColorModeSwitch labels={labels} />);
    await userEvent.click(screen.getByLabelText("Light"));
    expect(localStorage.getItem("colorMode")).toBe("light");
    expect(root().dataset.theme).toBe("light");
    expect(state("Light")).toBe("on");
  });

  it("System clears the stored choice", async () => {
    localStorage.setItem("colorMode", "light");
    setSystemDark(true);
    render(<ColorModeSwitch labels={labels} />);
    await userEvent.click(screen.getByLabelText("System"));
    expect(localStorage.getItem("colorMode")).toBeNull();
    expect(root().dataset.theme).toBe("dark");
  });

  it("follows live OS changes while on System", () => {
    render(<ColorModeSwitch labels={labels} />);
    expect(root().dataset.theme).toBe("light");
    const lists = (window.matchMedia as unknown as Mock).mock.results.map((r) => r.value);
    const call = lists.flatMap((l) => (l.addEventListener as Mock).mock.calls).find((c) => c[0] === "change");
    expect(call).toBeTruthy();
    setSystemDark(true);
    act(() => (call![1] as () => void)());
    expect(root().dataset.theme).toBe("dark");
  });

  it("survives blocked storage", () => {
    const original = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error("blocked");
    };
    try {
      render(<ColorModeSwitch labels={labels} />);
      expect(state("System")).toBe("on");
    } finally {
      Storage.prototype.getItem = original;
    }
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @repo/ui test color-mode-switch`
Expected: FAIL, "Failed to resolve import ../src/components/ColorModeSwitch".

- [ ] **Step 3: Implement**

`packages/ui/src/components/ColorModeSwitch.tsx`:
```tsx
"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { useEffect, useState, type ReactNode } from "react";
import { COLOR_MODE_KEY, resolveColorMode, type ColorModePreference } from "@repo/web/color-mode";

export type ColorModeLabels = { group: string; light: string; dark: string; system: string };

const MODES = ["light", "dark", "system"] as const;
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const icons: Record<ColorModePreference, ReactNode> = {
  light: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...stroke}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
  dark: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...stroke}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  ),
  system: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" {...stroke}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  ),
};

function readStored(): ColorModePreference {
  try {
    const value = localStorage.getItem(COLOR_MODE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function ColorModeSwitch({ labels }: { labels: ColorModeLabels }) {
  // null until mounted, so server and first client render match (no hydration mismatch).
  const [pref, setPref] = useState<ColorModePreference | null>(null);

  useEffect(() => setPref(readStored()), []);

  useEffect(() => {
    if (pref === null) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const mode = resolveColorMode(pref, media.matches);
      document.documentElement.dataset.theme = mode;
      document.documentElement.style.colorScheme = mode;
    };
    apply();
    if (pref !== "system") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [pref]);

  const choose = (value: string) => {
    if (value !== "light" && value !== "dark" && value !== "system") return; // "" = deselect; ignore
    setPref(value);
    try {
      if (value === "system") localStorage.removeItem(COLOR_MODE_KEY);
      else localStorage.setItem(COLOR_MODE_KEY, value);
    } catch {
      // storage blocked: the choice still applies for this page view
    }
  };

  return (
    <ToggleGroup.Root
      type="single"
      value={pref ?? "system"}
      onValueChange={choose}
      aria-label={labels.group}
      className="inline-flex rounded-full border-2 border-line bg-surface p-0.5"
    >
      {MODES.map((mode) => (
        <ToggleGroup.Item
          key={mode}
          value={mode}
          aria-label={labels[mode]}
          className="grid size-11 place-items-center rounded-full text-ink data-[state=on]:bg-ink data-[state=on]:text-bg"
        >
          {icons[mode]}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
```

- [ ] **Step 4: Run the tests and typecheck**

Run: `pnpm --filter @repo/ui test && pnpm --filter @repo/ui typecheck`
Expected: PASS (all ui tests). Typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): Light/Dark/System colour-mode switch with live OS tracking

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Navigation: NavLinks, LanguageLink, MobileMenu, SiteHeader, SiteFooter

**Files:**
- Create: `packages/ui/src/components/{NavLinks,LanguageLink,MobileMenu,SiteHeader,SiteFooter}.tsx`
- Test: `packages/ui/test/navigation.test.tsx`

**Interfaces:**
- Consumes:
  - `stripInternalPrefix`, `splitLocale`, `localizedPath`, `htmlLang`, `Locale` (`@repo/web/locale`)
  - `ColorModeSwitch`, `ColorModeLabels` (Task 4)
  - `ButtonLink`, `CtaLink`, `buttonClasses`, `Container`, `cn` (Task 3)
- Produces:
  - `type NavItem = { href: string; label: string }`
  - `NavLinks({ items, buckets, orientation?, onNavigate? })`: sets `aria-current="page"` on the current section
  - `LanguageLink({ locale, buckets, labels: Record<Locale,string> })`: on en → `/pl<rest>`; on pl → `<rest>?locale=en`
  - `MobileMenu({ items, buckets, cta, labels: { menu, close, colorMode }, newTabLabel? })`
  - `SiteHeader({ brand, homeHref, nav, buckets, cta, labels: { primary, menu, close, colorMode }, newTabLabel? })`
  - `SiteFooter({ brand, tagline, nav, navLabel, email: { label, address }, legal, legalLinks, languageLink?, extra? })`

- [ ] **Step 1: Write the failing test**

`packages/ui/test/navigation.test.tsx`:
```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const { NavLinks } = await import("../src/components/NavLinks");
const { LanguageLink } = await import("../src/components/LanguageLink");
const { MobileMenu } = await import("../src/components/MobileMenu");
const { SiteHeader } = await import("../src/components/SiteHeader");
const { SiteFooter } = await import("../src/components/SiteFooter");

const buckets = ["control", "easy-mode"];
const items = [
  { href: "/pl/services", label: "Usługi" },
  { href: "/pl/pricing", label: "Cennik" },
];
const colorMode = { group: "Tryb kolorów", light: "Jasny", dark: "Ciemny", system: "Systemowy" };
const cta = { href: "/pl/contact", label: "Umów bezpłatną rozmowę" };

beforeEach(() => {
  pathname = "/";
});

describe("NavLinks", () => {
  it("marks the current section, including its subpages", () => {
    pathname = "/control/pl/services/custom-apps-websites";
    render(<NavLinks items={items} buckets={buckets} />);
    expect(screen.getByRole("link", { name: "Usługi" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Cennik" }).getAttribute("aria-current")).toBeNull();
  });
  it("works with public paths too", () => {
    pathname = "/pl/pricing";
    render(<NavLinks items={items} buckets={buckets} />);
    expect(screen.getByRole("link", { name: "Cennik" }).getAttribute("aria-current")).toBe("page");
  });
});

describe("LanguageLink", () => {
  const labels = { en: "English", pl: "Polski" };
  it("links English pages straight to the same Polish page", () => {
    pathname = "/easy-mode/en/pricing";
    render(<LanguageLink locale="en" buckets={buckets} labels={labels} />);
    const a = screen.getByRole("link", { name: "Polski" });
    expect(a.getAttribute("href")).toBe("/pl/pricing");
    expect(a.getAttribute("hreflang")).toBe("pl-PL");
    expect(a.getAttribute("lang")).toBe("pl-PL");
  });
  it("links Polish pages to English with ?locale=en so the choice sticks", () => {
    pathname = "/control/pl/pricing";
    render(<LanguageLink locale="pl" buckets={buckets} labels={labels} />);
    expect(screen.getByRole("link", { name: "English" }).getAttribute("href")).toBe("/pricing?locale=en");
  });
  it("handles the Polish home page", () => {
    pathname = "/control/pl";
    render(<LanguageLink locale="pl" buckets={buckets} labels={labels} />);
    expect(screen.getByRole("link", { name: "English" }).getAttribute("href")).toBe("/?locale=en");
  });
});

describe("MobileMenu", () => {
  it("opens a titled dialog with nav, colour mode and CTA, and closes", async () => {
    render(<MobileMenu items={items} buckets={buckets} cta={cta} labels={{ menu: "Menu", close: "Zamknij menu", colorMode }} />);
    await userEvent.click(screen.getByRole("button", { name: "Menu" }));
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    expect(within(dialog).getByRole("link", { name: "Usługi" })).toBeTruthy();
    expect(within(dialog).getByRole("radiogroup", { name: "Tryb kolorów" })).toBeTruthy();
    expect(within(dialog).getByRole("link", { name: "Umów bezpłatną rozmowę" })).toBeTruthy();
    await userEvent.click(within(dialog).getByRole("button", { name: "Zamknij menu" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
  it("closes when a link is chosen", async () => {
    render(<MobileMenu items={items} buckets={buckets} cta={cta} labels={{ menu: "Menu", close: "Zamknij menu", colorMode }} />);
    await userEvent.click(screen.getByRole("button", { name: "Menu" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("link", { name: "Cennik" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("SiteHeader / SiteFooter", () => {
  it("header has a labelled primary nav and a home link", () => {
    render(
      <SiteHeader brand="Helpful Machines" homeHref="/pl" nav={items} buckets={buckets} cta={cta}
        labels={{ primary: "Główna", menu: "Menu", close: "Zamknij menu", colorMode }} />,
    );
    expect(screen.getByRole("navigation", { name: "Główna" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Helpful Machines" }).getAttribute("href")).toBe("/pl");
  });
  it("footer shows the email, legal links and language link", () => {
    render(
      <SiteFooter brand="Helpful Machines" tagline="Tagline" nav={items} navLabel="Stopka"
        email={{ label: "E-mail", address: "hello@attunr.com" }} legal="NIP: do uzupełnienia"
        legalLinks={[{ href: "/pl/privacy", label: "Prywatność" }]} languageLink={<a href="/pricing?locale=en">English</a>} />,
    );
    expect(screen.getByRole("navigation", { name: "Stopka" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "hello@attunr.com" }).getAttribute("href")).toBe("mailto:hello@attunr.com");
    expect(screen.getByRole("link", { name: "Prywatność" })).toBeTruthy();
    expect(screen.getByText("NIP: do uzupełnienia")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @repo/ui test navigation`
Expected: FAIL, "Failed to resolve import ../src/components/NavLinks".

- [ ] **Step 3: Implement**

`packages/ui/src/components/NavLinks.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { splitLocale, stripInternalPrefix } from "@repo/web/locale";
import { cn } from "../cn";

export type NavItem = { href: string; label: string };

export function NavLinks({
  items,
  buckets,
  orientation = "horizontal",
  onNavigate,
}: {
  items: NavItem[];
  buckets: readonly string[];
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
}) {
  const current = stripInternalPrefix(usePathname() ?? "/", buckets).rest;
  return (
    <ul className={cn("flex gap-1", orientation === "vertical" ? "flex-col items-start" : "items-center")}>
      {items.map((item) => {
        const target = splitLocale(item.href).rest;
        const active = current === target || (target !== "/" && current.startsWith(`${target}/`));
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "inline-flex min-h-11 items-center rounded-card px-3 font-bold no-underline hover:underline hover:underline-offset-8",
                active && "underline decoration-accent decoration-4 underline-offset-8",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
```

`packages/ui/src/components/LanguageLink.tsx`:
```tsx
"use client";

import { usePathname } from "next/navigation";
import { htmlLang, localizedPath, stripInternalPrefix, type Locale } from "@repo/web/locale";

/** English → /pl/… (visiting /pl stores the choice). Polish → …?locale=en (middleware stores it and cleans the URL). */
export function LanguageLink({ locale, buckets, labels }: { locale: Locale; buckets: readonly string[]; labels: Record<Locale, string> }) {
  const { rest } = stripInternalPrefix(usePathname() ?? "/", buckets);
  const target: Locale = locale === "en" ? "pl" : "en";
  const href = target === "pl" ? localizedPath("pl", rest) : `${localizedPath("en", rest)}?locale=en`;
  return (
    <a href={href} hrefLang={htmlLang[target]} lang={htmlLang[target]} className="inline-flex min-h-11 items-center font-bold underline underline-offset-4">
      {labels[target]}
    </a>
  );
}
```

`packages/ui/src/components/MobileMenu.tsx`:
```tsx
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { cn } from "../cn";
import { buttonClasses } from "./Button";
import { ColorModeSwitch, type ColorModeLabels } from "./ColorModeSwitch";
import { NavLinks, type NavItem } from "./NavLinks";
import { ButtonLink, type CtaLink } from "./SmartLink";

export function MobileMenu({
  items,
  buckets,
  cta,
  labels,
  newTabLabel,
}: {
  items: NavItem[];
  buckets: readonly string[];
  cta: CtaLink;
  labels: { menu: string; close: string; colorMode: ColorModeLabels };
  newTabLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button type="button" className={cn(buttonClasses("secondary"), "lg:hidden")}>
          {labels.menu}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-[min(22rem,100vw)] flex-col gap-6 overflow-y-auto border-l-2 border-line bg-bg p-6 text-ink"
        >
          <div className="flex items-center justify-between gap-4">
            <Dialog.Title className="font-display text-xl font-extrabold">{labels.menu}</Dialog.Title>
            <Dialog.Close asChild>
              <button type="button" className={buttonClasses("secondary")}>
                {labels.close}
              </button>
            </Dialog.Close>
          </div>
          <nav aria-label={labels.menu}>
            <NavLinks items={items} buckets={buckets} orientation="vertical" onNavigate={() => setOpen(false)} />
          </nav>
          <ColorModeSwitch labels={labels.colorMode} />
          <ButtonLink link={{ ...cta, trackLocation: "mobile_menu" }} newTabLabel={newTabLabel} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

`packages/ui/src/components/SiteHeader.tsx`:
```tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { ColorModeSwitch, type ColorModeLabels } from "./ColorModeSwitch";
import { Container } from "./Container";
import { MobileMenu } from "./MobileMenu";
import { NavLinks, type NavItem } from "./NavLinks";
import { ButtonLink, type CtaLink } from "./SmartLink";

export function SiteHeader({
  brand,
  homeHref,
  nav,
  buckets,
  cta,
  labels,
  newTabLabel,
}: {
  brand: ReactNode;
  homeHref: string;
  nav: NavItem[];
  buckets: readonly string[];
  cta: CtaLink;
  labels: { primary: string; menu: string; close: string; colorMode: ColorModeLabels };
  newTabLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-line bg-bg">
      <Container className="flex min-h-16 items-center justify-between gap-4 py-2">
        <Link href={homeHref} className="flex min-h-11 items-center gap-2 font-display text-lg font-extrabold no-underline">
          {brand}
        </Link>
        <nav aria-label={labels.primary} className="hidden lg:block">
          <NavLinks items={nav} buckets={buckets} />
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <ColorModeSwitch labels={labels.colorMode} />
          </div>
          <ButtonLink link={{ ...cta, trackLocation: "header" }} newTabLabel={newTabLabel} className="hidden sm:inline-flex" />
          <MobileMenu items={nav} buckets={buckets} cta={cta} labels={labels} newTabLabel={newTabLabel} />
        </div>
      </Container>
    </header>
  );
}
```

`packages/ui/src/components/SiteFooter.tsx`:
```tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "./Container";
import type { NavItem } from "./NavLinks";

export function SiteFooter({
  brand,
  tagline,
  nav,
  navLabel,
  email,
  legal,
  legalLinks,
  languageLink,
  extra,
}: {
  brand: ReactNode;
  tagline: string;
  nav: NavItem[];
  navLabel: string;
  email: { label: string; address: string };
  legal: string;
  legalLinks: NavItem[];
  languageLink?: ReactNode;
  extra?: ReactNode;
}) {
  const link = "inline-flex min-h-11 items-center underline-offset-4 hover:underline";
  return (
    <footer className="mt-10 border-t-2 border-line">
      <Container className="grid gap-10 py-12 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 font-display text-lg font-extrabold">{brand}</p>
          <p className="mt-3 max-w-xs text-muted">{tagline}</p>
        </div>
        <nav aria-label={navLabel}>
          <ul className="grid">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="grid content-start gap-2">
          <p>
            {email.label}:{" "}
            <a href={`mailto:${email.address}`} className="font-bold underline underline-offset-4">
              {email.address}
            </a>
          </p>
          {languageLink && <p>{languageLink}</p>}
        </div>
      </Container>
      <Container className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t-2 border-line py-4 text-sm text-muted">
        <span>{legal}</span>
        {legalLinks.map((item) => (
          <Link key={item.href} href={item.href} className={link}>
            {item.label}
          </Link>
        ))}
        {extra}
      </Container>
    </footer>
  );
}
```

- [ ] **Step 4: Run the tests and typecheck**

Run: `pnpm --filter @repo/ui test && pnpm --filter @repo/ui typecheck`
Expected: PASS. Typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): header, footer, mobile menu, current-page nav and language link

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Content components: Hero, ServiceCard, StepList, PricingCard, FaqList, CtaBand

**Files:**
- Create: `packages/ui/src/components/{Hero,ServiceCard,StepList,PricingCard,FaqList,CtaBand}.tsx`
- Test: `packages/ui/test/content.test.tsx`

**Interfaces:**
- Consumes: `ButtonLink`, `CtaLink`, `Card`, `ChipList`, `Container`, `cn` (Task 3).
- Produces:
  - `Hero({ eyebrow?, title: ReactNode, lead, primary: CtaLink, secondary?: CtaLink, note?, chips?, chipsLabel?, newTabLabel? })`: the page's `h1`, with `id="hero-title"`
  - `ServiceCard({ title, summary, href, linkLabel, headingLevel?: "h2" | "h3" })`: the title is the link, and the whole card is clickable
  - `StepList({ steps: { title, body }[], headingLevel?: "h2" | "h3" })`
  - `PricingCard({ name, price, summary, features, cta?, featured?, headingLevel?, newTabLabel? })`
  - `FaqList({ items: { question, answer }[] })`: native `<details>`, no JS, answers always in the HTML
  - `CtaBand({ id?, title, body, cta, newTabLabel? })`

- [ ] **Step 1: Write the failing test**

`packages/ui/test/content.test.tsx`:
```tsx
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "../src/components/Hero";
import { Highlight } from "../src/components/Highlight";
import { ServiceCard } from "../src/components/ServiceCard";
import { StepList } from "../src/components/StepList";
import { PricingCard } from "../src/components/PricingCard";
import { FaqList } from "../src/components/FaqList";
import { CtaBand } from "../src/components/CtaBand";

describe("Hero", () => {
  it("renders the h1 with highlighted words and a tracked CTA", () => {
    render(
      <Hero
        eyebrow="AI and IT help"
        title={<>Put your business on <Highlight>easy mode</Highlight>.</>}
        lead="Lead"
        primary={{ href: "/contact", label: "Book a free chat", track: "cta_click" }}
        secondary={{ href: "/services", label: "See what we do" }}
        chips={["AI assistants", "Custom apps"]}
        chipsLabel="What we help with"
      />,
    );
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.textContent).toBe("Put your business on easy mode.");
    expect(h1.querySelector("mark")?.textContent).toBe("easy mode");
    expect(screen.getByRole("link", { name: "Book a free chat" }).getAttribute("data-track-location")).toBe("hero");
    expect(screen.getByRole("list", { name: "What we help with" })).toBeTruthy();
  });
});

describe("ServiceCard", () => {
  it("uses the title as the link (no 'learn more' link text)", () => {
    render(<ServiceCard title="Custom apps & websites" summary="S" href="/services/custom-apps-websites" linkLabel="Learn more" />);
    const link = screen.getByRole("link", { name: "Custom apps & websites" });
    expect(link.getAttribute("href")).toBe("/services/custom-apps-websites");
    expect(screen.queryByRole("link", { name: /learn more/i })).toBeNull();
    expect(screen.getByRole("heading", { level: 3 })).toBeTruthy();
  });
  it("can be an h2 when directly under the page h1", () => {
    render(<ServiceCard title="T" summary="S" href="/x" linkLabel="More" headingLevel="h2" />);
    expect(screen.getByRole("heading", { level: 2, name: "T" })).toBeTruthy();
  });
});

describe("StepList", () => {
  it("is an ordered list of steps", () => {
    render(<StepList steps={[{ title: "Free chat", body: "B" }, { title: "Plan", body: "B" }]} />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByRole("heading", { level: 3, name: "Free chat" })).toBeTruthy();
  });
});

describe("PricingCard", () => {
  it("shows name, price, features and CTA", () => {
    render(
      <PricingCard name="Quick win" price="From A$900" summary="S" features={["One focused improvement"]}
        cta={{ href: "/contact", label: "Book a free chat" }} headingLevel="h2" />,
    );
    const card = screen.getByRole("article");
    expect(within(card).getByRole("heading", { level: 2, name: "Quick win" })).toBeTruthy();
    expect(within(card).getByText("From A$900")).toBeTruthy();
    expect(within(card).getByText("One focused improvement")).toBeTruthy();
    expect(within(card).getByRole("link", { name: "Book a free chat" })).toBeTruthy();
  });
});

describe("FaqList", () => {
  it("uses native details so answers are in the HTML without JS", () => {
    const { container } = render(<FaqList items={[{ question: "How much?", answer: "From A$900." }]} />);
    const details = container.querySelector("details")!;
    expect(details.querySelector("summary")?.textContent).toContain("How much?");
    expect(details.textContent).toContain("From A$900.");
  });
});

describe("CtaBand", () => {
  it("is a labelled region with a tracked CTA", () => {
    render(<CtaBand title="Let's make something easier" body="B" cta={{ href: "/contact", label: "Book a free chat" }} />);
    expect(screen.getByRole("region", { name: "Let's make something easier" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Book a free chat" }).getAttribute("data-track-location")).toBe("cta_band");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @repo/ui test content`
Expected: FAIL, "Failed to resolve import ../src/components/Hero".

- [ ] **Step 3: Implement**

`packages/ui/src/components/Hero.tsx`:
```tsx
import type { ReactNode } from "react";
import { ChipList } from "./ChipList";
import { Container } from "./Container";
import { ButtonLink, type CtaLink } from "./SmartLink";

export function Hero({
  eyebrow,
  title,
  lead,
  primary,
  secondary,
  note,
  chips,
  chipsLabel,
  newTabLabel,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead: string;
  primary: CtaLink;
  secondary?: CtaLink;
  note?: string;
  chips?: string[];
  chipsLabel?: string;
  newTabLabel?: string;
}) {
  return (
    <section aria-labelledby="hero-title" className="pt-12 pb-14 sm:pt-20 sm:pb-20">
      <Container>
        {eyebrow && <p className="mb-4 text-sm font-bold uppercase tracking-widest text-accent-text">{eyebrow}</p>}
        <h1 id="hero-title" className="max-w-4xl font-display text-5xl leading-[1.02] font-extrabold tracking-tight text-balance sm:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">{lead}</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <ButtonLink link={{ ...primary, trackLocation: "hero" }} newTabLabel={newTabLabel} />
          {secondary && <ButtonLink link={secondary} variant="ghost" />}
          {note && <span className="text-sm text-muted">{note}</span>}
        </div>
        {chips && chips.length > 0 && (
          <div className="mt-10">
            <ChipList items={chips} label={chipsLabel} />
          </div>
        )}
      </Container>
    </section>
  );
}
```

`packages/ui/src/components/ServiceCard.tsx`:
```tsx
import Link from "next/link";
import { Card } from "./Card";

export function ServiceCard({
  title,
  summary,
  href,
  linkLabel,
  headingLevel: Heading = "h3",
}: {
  title: string;
  summary: string;
  href: string;
  linkLabel: string;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Card className="relative flex h-full flex-col transition-transform focus-within:-translate-y-1 hover:-translate-y-1">
      <Heading className="font-display text-xl font-extrabold">
        <Link href={href} className="no-underline after:absolute after:inset-0 after:content-['']">
          {title}
        </Link>
      </Heading>
      <p className="mt-3 text-muted">{summary}</p>
      <p aria-hidden="true" className="mt-auto pt-6 font-bold">
        {linkLabel} →
      </p>
    </Card>
  );
}
```

`packages/ui/src/components/StepList.tsx`:
```tsx
import { Card } from "./Card";

export function StepList({ steps, headingLevel: Heading = "h3" }: { steps: { title: string; body: string }[]; headingLevel?: "h2" | "h3" }) {
  return (
    <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <li key={step.title}>
          <Card className="h-full">
            <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-accent font-display font-extrabold text-accent-ink">
              {index + 1}
            </span>
            <Heading className="mt-4 font-display text-xl font-extrabold">{step.title}</Heading>
            <p className="mt-2 text-muted">{step.body}</p>
          </Card>
        </li>
      ))}
    </ol>
  );
}
```

`packages/ui/src/components/PricingCard.tsx`:
```tsx
import { cn } from "../cn";
import { Card } from "./Card";
import { ButtonLink, type CtaLink } from "./SmartLink";

export function PricingCard({
  name,
  price,
  summary,
  features,
  cta,
  featured = false,
  headingLevel: Heading = "h3",
  newTabLabel,
}: {
  name: string;
  price: string;
  summary: string;
  features: string[];
  cta?: CtaLink;
  featured?: boolean;
  headingLevel?: "h2" | "h3";
  newTabLabel?: string;
}) {
  return (
    <Card as="article" className={cn("flex h-full flex-col", featured && "border-4")}>
      <Heading className="font-display text-2xl font-extrabold">{name}</Heading>
      <p className="mt-2 font-display text-3xl font-extrabold">{price}</p>
      <p className="mt-3 text-muted">{summary}</p>
      <ul className="mt-6 grid gap-2">
        {features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span aria-hidden="true" className="font-bold text-accent-text">
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>
      {cta && (
        <div className="mt-auto pt-8">
          <ButtonLink link={{ ...cta, trackLocation: "pricing" }} variant={featured ? "primary" : "secondary"} newTabLabel={newTabLabel} />
        </div>
      )}
    </Card>
  );
}
```

`packages/ui/src/components/FaqList.tsx`:
```tsx
/** Native <details>: zero JS, keyboard accessible, answers present in the HTML for SEO. */
export function FaqList({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="border-y-2 border-line">
      {items.map((item) => (
        <details key={item.question} className="group border-b-2 border-line last:border-b-0">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg font-bold [&::-webkit-details-marker]:hidden">
            {item.question}
            <span aria-hidden="true" className="text-2xl transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="pb-5 text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
```

`packages/ui/src/components/CtaBand.tsx`:
```tsx
import { Card } from "./Card";
import { Container } from "./Container";
import { ButtonLink, type CtaLink } from "./SmartLink";

export function CtaBand({ id = "cta", title, body, cta, newTabLabel }: { id?: string; title: string; body: string; cta: CtaLink; newTabLabel?: string }) {
  return (
    <section aria-labelledby={`${id}-title`} className="py-14 sm:py-20">
      <Container>
        <Card className="grid gap-6 p-8 sm:p-12 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 id={`${id}-title`} className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 max-w-xl text-lg text-muted">{body}</p>
          </div>
          <ButtonLink link={{ ...cta, trackLocation: "cta_band" }} newTabLabel={newTabLabel} />
        </Card>
      </Container>
    </section>
  );
}
```

- [ ] **Step 4: Run the tests and typecheck**

Run: `pnpm --filter @repo/ui test && pnpm --filter @repo/ui typecheck`
Expected: PASS. Typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): hero, service, step, pricing, FAQ and CTA components

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Consent banner (Poland) and PostHog analytics

**Files:**
- Create: `packages/ui/src/components/ConsentBanner.tsx`, `packages/ui/src/components/Analytics.tsx`
- Test: `packages/ui/test/consent-analytics.test.tsx`

**Interfaces:**
- Consumes:
  - `CONSENT_COOKIE`, `parseConsent`, `analyticsPersistence`, `Consent` (`@repo/web/consent`)
  - `posthogConfig`, `superProperties`, `exposureEvents` (`@repo/web/analytics`, Task 2)
  - `ANALYTICS_EVENT` (Task 3)
- Produces:
  - `CONSENT_EVENT = "hm:consent"` (with `detail: Consent`), `CONSENT_OPEN_EVENT = "hm:consent-open"`
  - `readConsent(): Consent | null` and `writeConsent(value: Consent)`: the cookie `consent=<value>; Max-Age=31536000; Path=/; SameSite=Lax`, plus `Secure` on https
  - `ConsentBanner({ labels: { label, text, accept, decline, policy }, policyHref })`: shows only while there's no decision; both buttons use the same style
  - `ConsentSettingsButton({ label })`: reopens the banner
  - `Analytics({ apiKey, locale, assignment })`: no-op without a key. On idle it imports posthog-js and calls `init(apiKey, posthogConfig(...))`, `register(superProperties)` and captures exposures. It tracks `[data-track]` clicks (`cta_click`, `booking_opened`), `ANALYTICS_EVENT` events and `scroll_depth`, and switches persistence when `CONSENT_EVENT` fires.

- [ ] **Step 1: Write the failing test**

`packages/ui/test/consent-analytics.test.tsx`:
```tsx
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock is hoisted above imports, so the mock object must be created with vi.hoisted.
const posthog = vi.hoisted(() => ({ init: vi.fn(), register: vi.fn(), capture: vi.fn(), set_config: vi.fn() }));
vi.mock("posthog-js", () => ({ default: posthog }));

const { ConsentBanner, ConsentSettingsButton, CONSENT_EVENT, readConsent } = await import("../src/components/ConsentBanner");
const { Analytics } = await import("../src/components/Analytics");
const { track } = await import("../src/events");

const labels = { label: "Zgoda na pliki cookie", text: "Używamy analityki.", accept: "Akceptuję", decline: "Odrzucam", policy: "Polityka prywatności" };

beforeEach(() => {
  vi.clearAllMocks();
  (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback = (cb) => {
    cb();
    return 1;
  };
});

describe("ConsentBanner", () => {
  it("asks once, with equally prominent buttons, and stores the answer", async () => {
    const seen = vi.fn();
    window.addEventListener(CONSENT_EVENT, (e) => seen((e as CustomEvent).detail));
    render(<ConsentBanner labels={labels} policyHref="/pl/privacy" />);
    const region = await screen.findByRole("region", { name: "Zgoda na pliki cookie" });
    const accept = screen.getByRole("button", { name: "Akceptuję" });
    const decline = screen.getByRole("button", { name: "Odrzucam" });
    expect(accept.className).toBe(decline.className);
    expect(screen.getByRole("link", { name: "Polityka prywatności" }).getAttribute("href")).toBe("/pl/privacy");
    await userEvent.click(decline);
    expect(readConsent()).toBe("denied");
    expect(seen).toHaveBeenCalledWith("denied");
    expect(region.isConnected).toBe(false);
  });

  it("stays hidden once a decision exists", () => {
    document.cookie = "consent=granted; Path=/";
    render(<ConsentBanner labels={labels} policyHref="/pl/privacy" />);
    expect(screen.queryByRole("region")).toBeNull();
  });

  it("can be reopened from the footer settings button", async () => {
    document.cookie = "consent=denied; Path=/";
    render(
      <>
        <ConsentBanner labels={labels} policyHref="/pl/privacy" />
        <ConsentSettingsButton label="Ustawienia prywatności" />
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Ustawienia prywatności" }));
    expect(screen.getByRole("region", { name: "Zgoda na pliki cookie" })).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Akceptuję" }));
    expect(readConsent()).toBe("granted");
  });
});

describe("Analytics", () => {
  it("does nothing without a key", async () => {
    render(<Analytics apiKey="" locale="en" assignment={{ hero: "control" }} />);
    await new Promise((r) => setTimeout(r, 0));
    expect(posthog.init).not.toHaveBeenCalled();
  });

  it("starts in memory mode on /pl without consent and reports exposure", async () => {
    render(<Analytics apiKey="phc_test" locale="pl" assignment={{ hero: "easy-mode" }} />);
    await waitFor(() => expect(posthog.init).toHaveBeenCalled());
    expect(posthog.init).toHaveBeenCalledWith("phc_test", expect.objectContaining({ api_host: "/ingest", persistence: "memory" }));
    expect(posthog.register).toHaveBeenCalledWith(expect.objectContaining({ market: "pl", "$feature/hero": "easy-mode" }));
    expect(posthog.capture).toHaveBeenCalledWith("$feature_flag_called", { $feature_flag: "hero", $feature_flag_response: "easy-mode" });
  });

  it("switches persistence when consent is granted", async () => {
    render(<Analytics apiKey="phc_test" locale="pl" assignment={{}} />);
    await waitFor(() => expect(posthog.init).toHaveBeenCalled());
    act(() => {
      window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: "granted" }));
    });
    expect(posthog.set_config).toHaveBeenCalledWith({ persistence: "localStorage+cookie" });
  });

  it("uses cookies from the start in Australia", async () => {
    render(<Analytics apiKey="phc_test" locale="en" assignment={{}} />);
    await waitFor(() => expect(posthog.init).toHaveBeenCalled());
    expect(posthog.init).toHaveBeenCalledWith("phc_test", expect.objectContaining({ persistence: "localStorage+cookie" }));
  });

  it("captures tracked clicks and component events with the market", async () => {
    render(
      <>
        <Analytics apiKey="phc_test" locale="en" assignment={{}} />
        <a href="#x" data-track="booking_opened" data-track-location="hero">Book a free chat</a>
      </>,
    );
    await waitFor(() => expect(posthog.init).toHaveBeenCalled());
    await userEvent.click(screen.getByRole("link", { name: "Book a free chat" }));
    expect(posthog.capture).toHaveBeenCalledWith("booking_opened", { location: "hero", label: "Book a free chat", market: "en" });
    act(() => track("form_submitted", { success: true }));
    expect(posthog.capture).toHaveBeenCalledWith("form_submitted", { success: true, market: "en" });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @repo/ui test consent-analytics`
Expected: FAIL, "Failed to resolve import ../src/components/ConsentBanner".

- [ ] **Step 3: Implement**

`packages/ui/src/components/ConsentBanner.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { CONSENT_COOKIE, parseConsent, type Consent } from "@repo/web/consent";
import { buttonClasses } from "./Button";

export const CONSENT_EVENT = "hm:consent";
export const CONSENT_OPEN_EVENT = "hm:consent-open";

export function readConsent(): Consent | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE}=([^;]*)`));
  return parseConsent(match ? decodeURIComponent(match[1]!) : undefined);
}

export function writeConsent(value: Consent) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=31536000; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

export function ConsentBanner({
  labels,
  policyHref,
}: {
  labels: { label: string; text: string; accept: string; decline: string; policy: string };
  policyHref: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(readConsent() === null);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;
  const choose = (value: Consent) => {
    writeConsent(value);
    setOpen(false);
  };
  // Same class on both buttons: accepting must not be more prominent than declining.
  const choiceClass = buttonClasses("secondary");
  return (
    <div
      role="region"
      aria-label={labels.label}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-card border-2 border-line bg-surface p-5 text-ink shadow-card sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <p>
        {labels.text}{" "}
        <a href={policyHref} className="font-bold underline underline-offset-4">
          {labels.policy}
        </a>
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className={choiceClass} onClick={() => choose("granted")}>
          {labels.accept}
        </button>
        <button type="button" className={choiceClass} onClick={() => choose("denied")}>
          {labels.decline}
        </button>
      </div>
    </div>
  );
}

export function ConsentSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center underline underline-offset-4"
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
    >
      {label}
    </button>
  );
}
```

`packages/ui/src/components/Analytics.tsx`:
```tsx
"use client";

import { useEffect } from "react";
import { exposureEvents, posthogConfig, superProperties } from "@repo/web/analytics";
import { analyticsPersistence, type Consent } from "@repo/web/consent";
import type { Assignment } from "@repo/web/experiments";
import type { Locale } from "@repo/web/locale";
import { ANALYTICS_EVENT } from "../events";
import { CONSENT_EVENT, readConsent } from "./ConsentBanner";

const DEPTHS = [25, 50, 75, 100];

/** Loads PostHog on idle (never blocks rendering). Experiment variants come from the server-rendered bucket. */
export function Analytics({ apiKey, locale, assignment }: { apiKey: string; locale: Locale; assignment: Assignment }) {
  const assignmentKey = JSON.stringify(assignment);

  useEffect(() => {
    if (!apiKey) return;
    let cancelled = false;
    let cleanup = () => {};

    const start = async () => {
      const { default: posthog } = await import("posthog-js");
      if (cancelled) return;
      const variants = JSON.parse(assignmentKey) as Assignment;
      posthog.init(apiKey, posthogConfig(locale, readConsent()));
      posthog.register(
        superProperties({ market: locale, colorMode: document.documentElement.dataset.theme ?? "light", assignment: variants }),
      );
      for (const exposure of exposureEvents(variants)) posthog.capture(exposure.event, exposure.properties);

      const onConsent = (event: Event) => {
        posthog.set_config({ persistence: analyticsPersistence(locale, (event as CustomEvent<Consent>).detail) });
      };
      const onTrack = (event: Event) => {
        const { event: name, properties } = (event as CustomEvent<{ event: string; properties: Record<string, unknown> }>).detail;
        posthog.capture(name, { ...properties, market: locale });
      };
      const onClick = (event: MouseEvent) => {
        const el = (event.target as Element | null)?.closest?.("[data-track]");
        if (!el) return;
        posthog.capture(el.getAttribute("data-track")!, {
          location: el.getAttribute("data-track-location") ?? undefined,
          label: el.textContent?.trim() ?? "",
          market: locale,
        });
      };
      const reached = new Set<number>();
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const percent = max <= 0 ? 100 : (window.scrollY / max) * 100;
        for (const depth of DEPTHS) {
          if (percent >= depth && !reached.has(depth)) {
            reached.add(depth);
            posthog.capture("scroll_depth", { depth, market: locale });
          }
        }
      };

      window.addEventListener(CONSENT_EVENT, onConsent);
      window.addEventListener(ANALYTICS_EVENT, onTrack);
      document.addEventListener("click", onClick);
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanup = () => {
        window.removeEventListener(CONSENT_EVENT, onConsent);
        window.removeEventListener(ANALYTICS_EVENT, onTrack);
        document.removeEventListener("click", onClick);
        window.removeEventListener("scroll", onScroll);
      };
    };

    const idle =
      (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback ??
      ((cb: () => void) => window.setTimeout(cb, 1500));
    idle(() => void start());
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [apiKey, locale, assignmentKey]);

  return null;
}
```

- [ ] **Step 4: Run the tests and typecheck**

Run: `pnpm --filter @repo/ui test && pnpm --filter @repo/ui typecheck`
Expected: PASS. Typecheck clean. (If `posthog.init`'s config type rejects `capture_pageview: "history_change"` or another key, the installed posthog-js types are the authority: keep the key if it's in the type, drop it if not, and ledger the ruling.)

- [ ] **Step 5: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): PL consent banner and idle-loaded PostHog analytics

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Contact form (works with and without JavaScript)

**Files:**
- Create: `packages/ui/src/components/ContactForm.tsx`
- Test: `packages/ui/test/contact-form.test.tsx`

**Interfaces:**
- Consumes: Plan 1's contact API contract (field names, JSON responses `{ok, error, fields}`, the 303 redirect to `?sent=1` / `?error=<key>`). Also `track` (Task 3) and `buttonClasses` (Task 3).
- Produces:
  - `type ContactErrorKey = "validation" | "rate_limited" | "send_failed" | "unavailable" | "bad_request"`
  - `type ContactFormLabels = { name; email; company; message; submit; sending; sent; errorSummary; emailFallback; fieldErrors: Record<"name" | "email" | "company" | "message", string>; errors: Record<ContactErrorKey, string> }`
  - `ContactForm({ locale, labels, email, action? = "/api/contact" })`

- [ ] **Step 1: Write the failing test**

`packages/ui/test/contact-form.test.tsx`:
```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm, type ContactFormLabels } from "../src/components/ContactForm";
import { ANALYTICS_EVENT } from "../src/events";

const labels: ContactFormLabels = {
  name: "Your name",
  email: "Email",
  company: "Business name (optional)",
  message: "What would you like help with?",
  submit: "Send message",
  sending: "Sending…",
  sent: "Thanks! Your message is on its way.",
  errorSummary: "Please fix the highlighted fields.",
  emailFallback: "You can also email us at",
  fieldErrors: { name: "Please enter your name.", email: "Please enter a valid email address.", company: "Too long.", message: "Please write a little more." },
  errors: {
    validation: "Please check the form and try again.",
    rate_limited: "Too many messages.",
    send_failed: "Sorry, something went wrong sending your message.",
    unavailable: "The contact form isn't available right now.",
    bad_request: "Sorry, something went wrong sending your message.",
  },
};
const respond = (status: number, body: unknown) => vi.fn(async () => new Response(JSON.stringify(body), { status }));
async function fill() {
  await userEvent.type(screen.getByLabelText("Your name"), "Ania");
  await userEvent.type(screen.getByLabelText("Email"), "ania@example.pl");
  await userEvent.type(screen.getByLabelText("What would you like help with?"), "Arkusze i automatyzacja.");
}

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

describe("ContactForm markup (no-JS path)", () => {
  it("posts to the API with the contract's field names", async () => {
    const { container } = render(<ContactForm locale="pl" labels={labels} email="hello@attunr.com" />);
    const form = container.querySelector("form")!;
    expect(form.getAttribute("method")).toBe("post");
    expect(form.getAttribute("action")).toBe("/api/contact");
    for (const name of ["name", "email", "company", "message", "locale", "website", "t"]) {
      expect(form.querySelector(`[name="${name}"]`), name).not.toBeNull();
    }
    expect((form.querySelector('[name="locale"]') as HTMLInputElement).value).toBe("pl");
    await waitFor(() => expect((form.querySelector('[name="t"]') as HTMLInputElement).value).toMatch(/^\d+$/));
  });
  it("hides the honeypot from people and assistive tech", () => {
    const { container } = render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    const trap = container.querySelector('[name="website"]') as HTMLInputElement;
    expect(trap.tabIndex).toBe(-1);
    expect(trap.closest('[aria-hidden="true"]')).not.toBeNull();
  });
  it("uses native validation hints", () => {
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    expect(screen.getByLabelText("Your name").hasAttribute("required")).toBe(true);
    expect(screen.getByLabelText("Email").getAttribute("type")).toBe("email");
    expect(screen.getByLabelText("What would you like help with?").getAttribute("minlength")).toBe("10");
  });
});

describe("ContactForm with JavaScript", () => {
  it("sends JSON and confirms success", async () => {
    const fetchMock = respond(200, { ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const events = vi.fn();
    window.addEventListener(ANALYTICS_EVENT, (e) => events((e as CustomEvent).detail));
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByRole("status")).toHaveProperty("textContent", labels.sent);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(init.body as string)).toMatchObject({ name: "Ania", email: "ania@example.pl", locale: "en", website: "" });
    expect(events).toHaveBeenCalledWith({ event: "form_submitted", properties: { success: true } });
    expect((screen.getByLabelText("Your name") as HTMLInputElement).value).toBe("");
  });

  it("shows field errors linked to inputs and focuses the summary", async () => {
    vi.stubGlobal("fetch", respond(400, { ok: false, error: "validation", fields: { email: "Invalid email" } }));
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain(labels.errorSummary);
    expect(screen.getByRole("link", { name: labels.fieldErrors.email }).getAttribute("href")).toBe("#contact-email");
    const email = screen.getByLabelText("Email");
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(email.getAttribute("aria-describedby")!)?.textContent).toBe(labels.fieldErrors.email);
    expect(document.activeElement).toBe(alert);
  });

  it("offers the email address when the form is unavailable", async () => {
    vi.stubGlobal("fetch", respond(503, { ok: false, error: "unavailable" }));
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain(labels.errors.unavailable);
    expect(screen.getByRole("link", { name: "hello@attunr.com" }).getAttribute("href")).toBe("mailto:hello@attunr.com");
  });

  it("handles network failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("offline"))));
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    await fill();
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect((await screen.findByRole("alert")).textContent).toContain(labels.errors.send_failed);
  });

  it("shows the result of a no-JS submission from the URL", async () => {
    window.history.replaceState({}, "", "/contact?sent=1");
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    expect((await screen.findByRole("status")).textContent).toBe(labels.sent);
  });

  it("shows a no-JS error from the URL", async () => {
    window.history.replaceState({}, "", "/contact?error=rate_limited");
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    expect((await screen.findByRole("alert")).textContent).toContain(labels.errors.rate_limited);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @repo/ui test contact-form`
Expected: FAIL, "Failed to resolve import ../src/components/ContactForm".

- [ ] **Step 3: Implement**

`packages/ui/src/components/ContactForm.tsx`:
```tsx
"use client";

import { useEffect, useRef, useState, type FormEvent, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import type { Locale } from "@repo/web/locale";
import { track } from "../events";
import { Button } from "./Button";

const FIELD_KEYS = ["name", "email", "company", "message"] as const;
type FieldKey = (typeof FIELD_KEYS)[number];
const ERROR_KEYS = ["validation", "rate_limited", "send_failed", "unavailable", "bad_request"] as const;
export type ContactErrorKey = (typeof ERROR_KEYS)[number];
const isErrorKey = (v: unknown): v is ContactErrorKey => typeof v === "string" && (ERROR_KEYS as readonly string[]).includes(v);

export type ContactFormLabels = {
  name: string;
  email: string;
  company: string;
  message: string;
  submit: string;
  sending: string;
  sent: string;
  errorSummary: string;
  emailFallback: string;
  fieldErrors: Record<FieldKey, string>;
  errors: Record<ContactErrorKey, string>;
};

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; error: ContactErrorKey; fields: Partial<Record<FieldKey, string>> };

const inputClass = "min-h-11 w-full rounded-card border-2 border-line bg-surface px-3 py-2 text-ink";

function Field({
  id,
  label,
  error,
  multiline,
  ...props
}: { id: string; label: string; error?: string; multiline?: boolean } & InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const errorId = `${id}-error`;
  const shared = { id, "aria-invalid": error ? true : undefined, "aria-describedby": error ? errorId : undefined, className: inputClass };
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      {multiline ? (
        <textarea rows={6} {...shared} {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input {...shared} {...(props as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {error && (
        <p id={errorId} className="text-sm font-bold text-accent-text">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm({ locale, labels, email, action = "/api/contact" }: { locale: Locale; labels: ContactFormLabels; email: string; action?: string }) {
  const [renderedAt, setRenderedAt] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRenderedAt(String(Date.now()));
    const query = new URLSearchParams(window.location.search);
    const error = query.get("error");
    if (query.get("sent") === "1") setStatus({ kind: "sent" });
    else if (isErrorKey(error)) setStatus({ kind: "error", error, fields: {} });
  }, []);

  useEffect(() => {
    if (status.kind === "error") alertRef.current?.focus();
  }, [status]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch(action, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: unknown; fields?: Record<string, string> };
      if (res.ok && body.ok) {
        form.reset();
        setStatus({ kind: "sent" });
        track("form_submitted", { success: true });
        return;
      }
      const fields: Partial<Record<FieldKey, string>> = {};
      for (const key of FIELD_KEYS) if (body.fields?.[key]) fields[key] = labels.fieldErrors[key];
      setStatus({ kind: "error", error: isErrorKey(body.error) ? body.error : "send_failed", fields });
    } catch {
      setStatus({ kind: "error", error: "send_failed", fields: {} });
    }
    track("form_submitted", { success: false });
  }

  const fields = status.kind === "error" ? status.fields : {};
  const fieldEntries = Object.entries(fields) as [FieldKey, string][];
  const showEmail = status.kind === "error" && (status.error === "unavailable" || status.error === "send_failed");

  return (
    <form method="post" action={action} onSubmit={onSubmit} className="grid gap-5">
      {status.kind === "sent" && (
        <p role="status" className="rounded-card border-2 border-line bg-highlight/40 p-4 font-bold">
          {labels.sent}
        </p>
      )}
      {status.kind === "error" && (
        <div ref={alertRef} role="alert" tabIndex={-1} className="rounded-card border-2 border-line bg-surface p-4">
          <p className="font-bold">{fieldEntries.length > 0 ? labels.errorSummary : labels.errors[status.error]}</p>
          {fieldEntries.length > 0 && (
            <ul className="mt-2 list-disc pl-5">
              {fieldEntries.map(([key, message]) => (
                <li key={key}>
                  <a href={`#contact-${key}`} className="underline underline-offset-4">
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          )}
          {showEmail && (
            <p className="mt-2">
              {labels.emailFallback}{" "}
              <a href={`mailto:${email}`} className="font-bold underline underline-offset-4">
                {email}
              </a>
            </p>
          )}
        </div>
      )}
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="t" value={renderedAt} />
      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <Field id="contact-name" name="name" label={labels.name} autoComplete="name" required maxLength={100} error={fields.name} />
      <Field id="contact-email" name="email" type="email" label={labels.email} autoComplete="email" required maxLength={200} error={fields.email} />
      <Field id="contact-company" name="company" label={labels.company} autoComplete="organization" maxLength={150} error={fields.company} />
      <Field id="contact-message" name="message" label={labels.message} multiline required minLength={10} maxLength={5000} error={fields.message} />
      <div>
        <Button type="submit" disabled={status.kind === "sending"}>
          {status.kind === "sending" ? labels.sending : labels.submit}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Run the tests and typecheck**

Run: `pnpm --filter @repo/ui test && pnpm --filter @repo/ui typecheck`
Expected: PASS (all ui test files). Typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): accessible contact form with no-JS fallback and inline errors

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Helpful Machines package and content (English and Polish draft)

**Files:**
- Create: `apps/helpful-machines/package.json`, `apps/helpful-machines/tsconfig.json`, `apps/helpful-machines/vitest.config.ts`
- Create: `apps/helpful-machines/experiments.ts`
- Create: `apps/helpful-machines/content/{services,work,market,en,pl,index}.ts`
- Test: `apps/helpful-machines/test/content.test.ts`

**Interfaces:**
- Consumes: `defineExperiments` (`@repo/web/experiments`), `findCopyViolations` and `collectStrings` (`@repo/web/content-rules`), and the `ContactFormLabels` shape (Task 8).
- Produces:
  - `experiments` (the `hero` experiment)
  - `serviceSlugs` (readonly tuple), `type ServiceSlug`, `isServiceSlug(v: string): v is ServiceSlug`
  - `workSlugs` and `type WorkSlug`
  - `type Market = { currency: "AUD" | "PLN"; prices: { quickWin: number; customApp: number; support: number } }`, `markets: Record<Locale, Market>`
  - `en`, `type Content = typeof en`, `pl: Content`, `getContent(locale: Locale): Content`
  - Content keys used by later tasks: `meta.*.{title,description}`, `meta.siteDescription`, `nav`, `hero`, `fixes`, `services`, `howItWorks`, `pricing`, `work`, `faq`, `cta`, `contact` (with `contact.form` matching `ContactFormLabels`), `footer`, `consent`, `privacy`, `terms`, `notFound`

- [ ] **Step 1: Create the app package (deps for the whole app, installed once)**

`apps/helpful-machines/package.json`:
```json
{
  "name": "helpful-machines",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "typecheck": "next typegen && tsc --noEmit",
    "test": "vitest run",
    "test:build": "vitest run --config vitest.build.config.ts"
  },
  "engines": {
    "node": ">=20"
  },
  "dependencies": {
    "@repo/ui": "workspace:*",
    "@repo/web": "workspace:*",
    "next": "^15.5.0",
    "next-intl": "^4.14.9",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@repo/config": "workspace:*",
    "@tailwindcss/postcss": "^4.3.3",
    "@types/node": "^22.15.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "tailwindcss": "^4.3.3",
    "typescript": "^5.9.3",
    "vitest": "^3.2.4"
  }
}
```

`apps/helpful-machines/tsconfig.json`:
```json
{
  "extends": "@repo/config/tsconfig/nextjs.json",
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".next"]
}
```

`apps/helpful-machines/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["test/**/*.test.ts"] },
});
```

Run: `cd /Users/pio/projects/pio-yoga && pnpm install`
Expected: installs next-intl, tailwindcss and @tailwindcss/postcss, and links the workspaces.

- [ ] **Step 2: Write the failing content test**

`apps/helpful-machines/test/content.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { collectStrings, findCopyViolations } from "@repo/web/content-rules";
import { en } from "../content/en";
import { pl } from "../content/pl";
import { markets } from "../content/market";
import { serviceSlugs } from "../content/services";
import { workSlugs } from "../content/work";
import { experiments } from "../experiments";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return "array";
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(obj).sort().map((k) => [k, shape(obj[k])]));
  }
  return typeof value;
}

describe("Helpful Machines content", () => {
  it("Polish has exactly the same shape as English", () => expect(shape(pl)).toEqual(shape(en)));

  it("follows the Custom apps rule in both languages", () => {
    expect(findCopyViolations(en, "en")).toEqual([]);
    expect(findCopyViolations(pl, "pl")).toEqual([]);
  });

  it("has no empty strings", () => {
    for (const dict of [en, pl]) for (const { path, value } of collectStrings(dict)) expect(value.trim(), path).not.toBe("");
  });

  it("covers every service and work item", () => {
    for (const dict of [en, pl]) {
      expect(Object.keys(dict.services.items).sort()).toEqual([...serviceSlugs].sort());
      expect(Object.keys(dict.work.items).sort()).toEqual([...workSlugs].sort());
      for (const slug of serviceSlugs) {
        const item = dict.services.items[slug];
        expect(item.problems.length, slug).toBeGreaterThan(0);
        expect(item.whatWeDo.length, slug).toBeGreaterThan(0);
        expect(item.deliverables.length, slug).toBeGreaterThan(0);
        expect(item.faq.length, slug).toBeGreaterThan(0);
      }
    }
  });

  it("has a 3-part headline for every hero variant", () => {
    const variants = Object.keys(experiments.hero.variants).sort();
    for (const dict of [en, pl]) {
      expect(Object.keys(dict.hero.title).sort()).toEqual(variants);
      for (const parts of Object.values(dict.hero.title)) expect(parts).toHaveLength(3);
    }
  });

  it("has whole positive prices in the market currency", () => {
    expect(markets.en.currency).toBe("AUD");
    expect(markets.pl.currency).toBe("PLN");
    for (const market of Object.values(markets)) {
      for (const price of Object.values(market.prices)) {
        expect(Number.isInteger(price)).toBe(true);
        expect(price).toBeGreaterThan(0);
      }
    }
  });

  it("keeps the pricing teaser placeholder", () => {
    expect(en.pricing.teaser.body).toContain("{price}");
    expect(pl.pricing.teaser.body).toContain("{price}");
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm --filter helpful-machines test`
Expected: FAIL, "Failed to resolve import ../content/en".

- [ ] **Step 4: Write the experiment, slugs and markets**

`apps/helpful-machines/experiments.ts`:
```ts
import { defineExperiments } from "@repo/web/experiments";

/** Keys must equal the PostHog experiment's feature-flag key and variant keys. */
export const experiments = defineExperiments({
  hero: {
    variants: { control: "AI that actually does the boring bits.", "easy-mode": "Put your business on easy mode." },
    weights: [50, 50],
    markets: ["en", "pl"],
  },
});
```

`apps/helpful-machines/content/services.ts`:
```ts
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
```

`apps/helpful-machines/content/work.ts`:
```ts
export const workSlugs = ["highsnobiety", "officeworks", "lysn", "onchain", "udrew", "nokia"] as const;
export type WorkSlug = (typeof workSlugs)[number];
/** Shown on the home page. */
export const featuredWork: readonly WorkSlug[] = ["highsnobiety", "officeworks", "lysn"];
```

`apps/helpful-machines/content/market.ts`:
```ts
import type { Locale } from "@repo/web/locale";

export type Market = {
  currency: "AUD" | "PLN";
  /** PLACEHOLDER starting prices: confirm before launch. */
  prices: { quickWin: number; customApp: number; support: number };
};

export const markets: Record<Locale, Market> = {
  en: { currency: "AUD", prices: { quickWin: 900, customApp: 4900, support: 390 } },
  pl: { currency: "PLN", prices: { quickWin: 2400, customApp: 12900, support: 990 } },
};
```

- [ ] **Step 5: Write the English content**

`apps/helpful-machines/content/en.ts`:
```ts
/** English (Australia). The type source for every other locale. Rule: "custom apps", never "apps" alone. */
export const en = {
  meta: {
    siteDescription:
      "Helpful Machines finds what's slowing your small business down and fixes it, with AI, custom apps, tidy data or a better process. Plain English, small-business prices. Free first chat.",
    home: {
      title: "Helpful Machines · AI and custom apps for small businesses",
      description:
        "Helpful Machines finds what's slowing your small business down and fixes it, with AI, custom apps, tidy data or a better process. Plain English, small-business prices. Free first chat.",
    },
    services: {
      title: "Services · AI, custom apps, spreadsheets and integrations",
      description:
        "What Helpful Machines can do for your business: AI assistants and automation, custom apps and websites, spreadsheet and data clean-ups, migrations and integrations.",
    },
    howItWorks: {
      title: "How it works · from free chat to finished",
      description: "Four simple steps: a free chat, a fixed plan and quote, the build, and support afterwards.",
    },
    pricing: {
      title: "Pricing · clear starting prices",
      description: "Starting prices for AI automations, custom apps and ongoing support. Every project starts with a free chat and a fixed quote.",
    },
    work: {
      title: "Work · what we've built before",
      description: "The experience behind Helpful Machines: checkout and payments, booking systems, recurring orders and internal tools.",
    },
    faq: {
      title: "FAQ · common questions",
      description: "Answers about cost, timelines, AI, data privacy and what happens after your project is finished.",
    },
    contact: {
      title: "Contact · book a free chat",
      description: "Book a free 30-minute chat or send a message. No jargon, no obligation.",
    },
    privacy: { title: "Privacy policy", description: "How Helpful Machines handles personal information and analytics." },
    terms: { title: "Terms", description: "The terms for working with Helpful Machines." },
  },
  nav: {
    services: "Services",
    howItWorks: "How it works",
    pricing: "Pricing",
    work: "Work",
    faq: "FAQ",
    contact: "Contact",
    cta: "Book a free chat",
    menu: "Menu",
    close: "Close menu",
    primary: "Main",
    skip: "Skip to content",
    newTab: "(opens in a new tab)",
    breadcrumbs: "Breadcrumb",
    home: "Home",
    colorMode: { group: "Colour mode", light: "Light", dark: "Dark", system: "System" },
  },
  hero: {
    eyebrow: "Practical tech help for small businesses",
    title: {
      control: ["AI that actually ", "does the boring bits", "."],
      "easy-mode": ["Put your business on ", "easy mode", "."],
    },
    lead: "We look at how your business actually runs, find what's costing you time and money, and fix it, with AI, custom apps, tidy data or simply a better process. Plain English, small-business prices.",
    secondary: "See what we do",
    note: "30 minutes · no jargon · no obligation",
    chipsLabel: "What we help with",
    chips: ["AI assistants", "Spreadsheets", "Custom apps", "Integrations"],
  },
  fixes: {
    eyebrow: "How we help",
    title: "We find what's slowing you down, then fix it.",
    items: [
      {
        pain: "Too much of your week goes on admin.",
        fix: "We map where the time goes and remove the busywork, with automation, AI or a simpler way of working.",
      },
      { pain: "Your tools don't talk to each other.", fix: "We connect them, or replace them with something that fits how you work." },
      { pain: "Your numbers live in spreadsheets nobody trusts.", fix: "We tidy your data so decisions get easier." },
      { pain: "You're not sure which tech is worth paying for.", fix: "We tell you honestly, including when the answer is \"nothing\"." },
    ],
  },
  services: {
    eyebrow: "Services",
    title: "What we can do for you",
    intro: "Practical help, sized for small businesses. We start with the problem, not the technology.",
    linkLabel: "Learn more",
    problemsTitle: "Signs you need this",
    whatWeDoTitle: "What we do",
    deliverablesTitle: "What you get",
    faqTitle: "Questions",
    items: {
      "ai-assistants-automation": {
        title: "AI assistants & automation",
        summary: "Let AI handle the repetitive bits: emails, enquiries, quotes, notes and reports.",
        intro:
          "AI is good at first drafts and boring sorting. We set it up so it fits how you already work, with a person checking anything that matters.",
        problems: [
          "Your inbox is full of the same five questions.",
          "Quotes, notes or reports take hours to write up.",
          "You've tried ChatGPT but it doesn't know your business.",
        ],
        whatWeDo: [
          "Find the tasks where AI saves real time",
          "Set up assistants that know your products, prices and tone",
          "Connect them to your email, forms or tools",
          "Keep a person in the loop for anything customer-facing",
        ],
        deliverables: ["A working assistant or automation", "A short guide for your team", "A month of tweaks after launch"],
        faq: [
          { question: "Will AI send things to customers without me seeing them?", answer: "Only if you want it to. By default, it drafts and you approve." },
          { question: "Is my data used to train AI models?", answer: "We use business plans of AI services that don't train on your data, and we tell you exactly where it goes." },
        ],
      },
      "custom-apps-websites": {
        title: "Custom apps & websites",
        summary: "Custom apps and websites built around how your business actually works.",
        intro:
          "Off-the-shelf software makes you work its way. A custom app works your way, and for many small businesses it costs less than you'd expect.",
        problems: [
          "You pay for several tools that don't talk to each other.",
          "Your booking, ordering or job tracking is done by hand.",
          "Your website doesn't bring in enquiries.",
        ],
        whatWeDo: [
          "Booking, ordering and job-tracking custom apps",
          "Customer portals and internal tools",
          "Fast, simple websites that bring in enquiries",
          "Online payments with Stripe",
        ],
        deliverables: ["A custom app or website you own", "Hosting set up in your name", "Training and three months of fixes included"],
        faq: [
          { question: "Do I own the custom app?", answer: "Yes. The code and accounts are in your name." },
          { question: "Will it work on phones?", answer: "Yes. Everything we build works on phones, tablets and computers." },
        ],
      },
      "spreadsheets-data": {
        title: "Spreadsheets & data",
        summary: "Turn messy spreadsheets into clear, reliable numbers.",
        intro: "Most small businesses run on spreadsheets. We make them reliable, or move the important bits somewhere safer.",
        problems: ["Formulas break and nobody knows why.", "The numbers in different files don't match.", "Reports take a day to put together."],
        whatWeDo: ["Clean up and restructure spreadsheets", "Automate reports and dashboards", "Set up shared, backed-up data people can trust"],
        deliverables: ["Tidy spreadsheets or a simple database", "Automatic reports", "A short handover so anyone can maintain it"],
        faq: [{ question: "Do I have to stop using Excel or Google Sheets?", answer: "No. Often the best fix is a better spreadsheet." }],
      },
      "migrations-integrations": {
        title: "Migrations & integrations",
        summary: "Move to better tools and connect the ones you have.",
        intro: "Switching systems or connecting them shouldn't mean weekends of copy and paste. We plan it, move it and check it.",
        problems: [
          "You're stuck on an old system you've outgrown.",
          "You copy data between tools by hand.",
          "You're worried a migration will lose something.",
        ],
        whatWeDo: [
          "Plan and run moves to new tools",
          "Connect tools like Xero, Shopify, Google Workspace and your CRM",
          "Check every record arrives safely",
        ],
        deliverables: ["Your data moved and verified", "Tools that update each other automatically", "A rollback plan, just in case"],
        faq: [{ question: "Will my business stop while you migrate?", answer: "No. We move things in stages and switch over when everything checks out." }],
      },
      "find-what-works": {
        title: "Find what works",
        summary: "Not sure what you need? We'll look at how you work and find the best fix.",
        intro:
          "Sometimes the answer is AI, sometimes a custom app, sometimes a better spreadsheet, and sometimes nothing at all. We find out before you spend money.",
        problems: [
          "Everyone has an opinion about which tool to buy.",
          "You've spent money on software nobody uses.",
          "You want to grow without hiring for admin.",
        ],
        whatWeDo: [
          "Look at how work actually flows through your business",
          "Find the bottlenecks worth fixing",
          "Compare options honestly, including doing nothing",
        ],
        deliverables: ["A short written plan in plain English", "Costs and time saved for each option", "A clear first step"],
        faq: [{ question: "Do I have to hire you for the work afterwards?", answer: "No. The plan is yours to use however you like." }],
      },
    },
  },
  howItWorks: {
    eyebrow: "How it works",
    title: "From free chat to finished",
    intro: "No surprises. You know the price before any work starts.",
    steps: [
      { title: "Free chat", body: "Thirty minutes to talk about what's slowing you down. No jargon, no sales pitch." },
      { title: "Plan and fixed quote", body: "A short written plan with a fixed price and timeline." },
      { title: "Build", body: "We build it, show you progress every week and adjust as we go." },
      { title: "Support", body: "Training for your team and help after launch, so it keeps working." },
    ],
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Clear starting prices",
    intro: "Every business is different, so every project gets a fixed quote after a free chat. These are typical starting points.",
    from: "From",
    perMonth: "/month",
    packages: {
      quickWin: {
        name: "Quick win",
        summary: "One automation, AI assistant or spreadsheet fix.",
        features: ["One focused improvement", "Set up in about a week", "A month of tweaks"],
      },
      customApp: {
        name: "Custom app",
        summary: "A custom app or website built around your business.",
        features: ["Designed with you", "Yours to own", "Three months of fixes"],
      },
      support: {
        name: "Ongoing help",
        summary: "A small monthly plan for changes and questions.",
        features: ["Changes when you need them", "Priority replies", "Cancel any time"],
      },
    },
    custom: {
      name: "Something bigger?",
      body: "Migrations, integrations and larger custom apps are quoted after a free chat.",
      cta: "Book a free chat",
    },
    note: "Prices exclude GST.",
    teaser: {
      title: "Small-business prices",
      body: "Quick wins from {price}. Every project gets a fixed quote before work starts.",
      link: "See pricing",
    },
  },
  work: {
    eyebrow: "Work",
    title: "Built before",
    intro:
      "Helpful Machines is run by Piotr, a developer with more than ten years of experience building software for companies like these. The same skills now go into small-business projects.",
    link: "See all work",
    items: {
      highsnobiety: {
        client: "Highsnobiety",
        sector: "Fashion e-commerce",
        title: "Checkout for a global fashion store",
        body: "Product pages and checkout, plus systems that stayed up when limited-edition drops brought huge traffic spikes.",
      },
      officeworks: {
        client: "Officeworks",
        sector: "Retail",
        title: "Recurring orders for Australia's biggest office supplier",
        body: "Scoped and built a feature that lets businesses reorder products automatically.",
      },
      lysn: {
        client: "Lysn",
        sector: "Health",
        title: "Bookings and payments for a mental health platform",
        body: "Better online booking and pricing, plus Medicare gap payments that cut down on no-shows.",
      },
      onchain: {
        client: "ONCHAIN",
        sector: "Fintech",
        title: "Card payments and subscriptions for a payments startup",
        body: "Systems that let people pay by card, and let merchants set prices in dollars while being paid in crypto.",
      },
      udrew: {
        client: "uDrew",
        sector: "Building and design",
        title: "Online forms and documents for building approvals",
        body: "Configurable forms and an audited document store that sped up approvals for home building projects.",
      },
      nokia: {
        client: "Nokia",
        sector: "Telecoms",
        title: "Tools that made huge log files searchable",
        body: "Web tools that let teams find answers in gigabytes of logs in minutes.",
      },
    },
  },
  faq: {
    eyebrow: "FAQ",
    title: "Common questions",
    link: "See all questions",
    items: [
      {
        question: "How much does it cost?",
        answer: "Most projects start from the prices on our pricing page. After a free chat you get a fixed quote, so the price won't change unless what you need changes.",
      },
      { question: "How long does a project take?", answer: "Quick wins usually take a week or two. Custom apps usually take four to eight weeks." },
      { question: "I'm not technical. Is that a problem?", answer: "Not at all. We explain everything in plain English and handle the technical side." },
      { question: "Is my data safe?", answer: "We keep access to a minimum, use services with strong security, and never sell or share your data." },
      {
        question: "What happens after the project is finished?",
        answer: "You get training and a period of free fixes. After that, you can book help when you need it or choose a monthly plan.",
      },
      { question: "Do you work with businesses outside Australia?", answer: "Yes. We work remotely with businesses in Australia and Poland." },
    ],
  },
  cta: {
    title: "Let's make something easier",
    body: "Book a free 30-minute chat. Bring the task that annoys you most.",
  },
  contact: {
    eyebrow: "Contact",
    title: "Book a free chat",
    intro: "Thirty minutes, no jargon, no obligation. Pick a time that suits you, or send a message and we'll reply within one business day.",
    bookTitle: "Pick a time",
    bookBody: "See open times and book in a couple of clicks.",
    formTitle: "Or send a message",
    form: {
      name: "Your name",
      email: "Email",
      company: "Business name (optional)",
      message: "What would you like help with?",
      submit: "Send message",
      sending: "Sending…",
      sent: "Thanks! Your message is on its way. We'll reply within one business day.",
      errorSummary: "Please fix the highlighted fields.",
      emailFallback: "You can also email us at",
      fieldErrors: {
        name: "Please enter your name.",
        email: "Please enter a valid email address.",
        company: "Please keep this under 150 characters.",
        message: "Please write a little more (at least 10 characters).",
      },
      errors: {
        validation: "Please check the form and try again.",
        rate_limited: "Too many messages from your connection. Please try again in a few minutes.",
        send_failed: "Sorry, something went wrong sending your message.",
        unavailable: "The contact form isn't available right now.",
        bad_request: "Sorry, something went wrong sending your message.",
      },
    },
  },
  footer: {
    tagline: "Practical AI and custom apps for small businesses.",
    navLabel: "Footer",
    contactLabel: "Email",
    legal: "ABN 48 737 987 261",
    privacy: "Privacy",
    terms: "Terms",
    languages: { en: "English", pl: "Polski" },
  },
  consent: {
    label: "Cookie consent",
    text: "We use privacy-friendly analytics to improve this site. Is that okay?",
    accept: "Accept",
    decline: "Decline",
    policy: "Privacy policy",
    settings: "Privacy settings",
  },
  privacy: {
    title: "Privacy policy",
    updated: "Last updated: October 2026",
    sections: [
      {
        heading: "Who we are",
        paragraphs: ["Helpful Machines is a sole-trader business run by Piotr Ciesiolkiewicz. You can reach us at the email address on our contact page."],
      },
      {
        heading: "What we collect",
        paragraphs: [
          "When you send a message, we receive your name, email, business name and message. We use them only to reply to you.",
          "We use PostHog analytics to understand how the site is used: pages viewed, buttons clicked and general location (country). PostHog stores this data in the EU.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "We set cookies that remember your language and which version of a page you see, and analytics cookies. On our Polish site, analytics cookies are only set after you accept them.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: ["You can ask to see, correct or delete your personal information at any time by emailing us."],
      },
    ],
  },
  terms: {
    title: "Terms",
    updated: "Last updated: October 2026",
    sections: [
      { heading: "Quotes", paragraphs: ["Every project starts with a written quote. Work begins once you accept it."] },
      { heading: "Payment", paragraphs: ["Invoices are due within 14 days unless we agree otherwise."] },
      { heading: "Ownership", paragraphs: ["Once paid, you own the work we create for you."] },
      {
        heading: "Liability",
        paragraphs: [
          "We take care with every project, but we're not liable for indirect losses. Nothing in these terms limits your rights under the Australian Consumer Law.",
        ],
      },
    ],
  },
  notFound: {
    title: "Page not found",
    body: "This page doesn't exist, or it has moved.",
    home: "Go to the home page",
  },
};

export type Content = typeof en;
```

- [ ] **Step 6: Write the Polish draft**

`apps/helpful-machines/content/pl.ts`:
```ts
import type { Content } from "./en";

/** Polski (Polska). DRAFT for Piotr's review. Rule: "dedykowane aplikacje" / "aplikacje na zamówienie". */
export const pl: Content = {
  meta: {
    siteDescription:
      "Helpful Machines znajduje to, co spowalnia Twoją małą firmę, i to naprawia: za pomocą AI, dedykowanych aplikacji, porządku w danych albo lepszego procesu. Prostym językiem, w cenach dla małych firm. Pierwsza rozmowa za darmo.",
    home: {
      title: "Helpful Machines · AI i dedykowane aplikacje dla małych firm",
      description:
        "Helpful Machines znajduje to, co spowalnia Twoją małą firmę, i to naprawia: za pomocą AI, dedykowanych aplikacji, porządku w danych albo lepszego procesu. Prostym językiem, w cenach dla małych firm. Pierwsza rozmowa za darmo.",
    },
    services: {
      title: "Usługi · AI, dedykowane aplikacje, arkusze i integracje",
      description:
        "Co Helpful Machines może zrobić dla Twojej firmy: asystenci AI i automatyzacja, dedykowane aplikacje i strony, porządek w arkuszach i danych, migracje i integracje.",
    },
    howItWorks: {
      title: "Jak to działa · od rozmowy do gotowego rozwiązania",
      description: "Cztery proste kroki: bezpłatna rozmowa, plan ze stałą wyceną, realizacja i wsparcie po wdrożeniu.",
    },
    pricing: {
      title: "Cennik · jasne ceny startowe",
      description:
        "Ceny startowe automatyzacji AI, dedykowanych aplikacji i stałej pomocy. Każdy projekt zaczyna się od bezpłatnej rozmowy i stałej wyceny.",
    },
    work: {
      title: "Realizacje · co zbudowaliśmy wcześniej",
      description: "Doświadczenie stojące za Helpful Machines: płatności, systemy rezerwacji, zamówienia cykliczne i narzędzia wewnętrzne.",
    },
    faq: {
      title: "FAQ · najczęstsze pytania",
      description: "Odpowiedzi o koszty, terminy, AI, prywatność danych i to, co dzieje się po zakończeniu projektu.",
    },
    contact: {
      title: "Kontakt · umów bezpłatną rozmowę",
      description: "Umów bezpłatną 30-minutową rozmowę albo napisz wiadomość. Bez żargonu, bez zobowiązań.",
    },
    privacy: { title: "Polityka prywatności", description: "Jak Helpful Machines przetwarza dane osobowe i dane analityczne." },
    terms: { title: "Warunki współpracy", description: "Zasady współpracy z Helpful Machines." },
  },
  nav: {
    services: "Usługi",
    howItWorks: "Jak to działa",
    pricing: "Cennik",
    work: "Realizacje",
    faq: "FAQ",
    contact: "Kontakt",
    cta: "Umów bezpłatną rozmowę",
    menu: "Menu",
    close: "Zamknij menu",
    primary: "Główna",
    skip: "Przejdź do treści",
    newTab: "(otwiera się w nowej karcie)",
    breadcrumbs: "Ścieżka nawigacji",
    home: "Strona główna",
    colorMode: { group: "Tryb kolorów", light: "Jasny", dark: "Ciemny", system: "Systemowy" },
  },
  hero: {
    eyebrow: "Praktyczna pomoc technologiczna dla małych firm",
    title: {
      control: ["AI, które naprawdę ", "robi nudną robotę", "."],
      "easy-mode": ["Przełącz swoją firmę na ", "tryb łatwy", "."],
    },
    lead: "Sprawdzamy, jak naprawdę działa Twoja firma, znajdujemy to, co kosztuje Cię czas i pieniądze, i naprawiamy to: za pomocą AI, dedykowanych aplikacji, porządku w danych albo po prostu lepszego sposobu pracy. Prostym językiem, w cenach dla małych firm.",
    secondary: "Zobacz, co robimy",
    note: "30 minut · bez żargonu · bez zobowiązań",
    chipsLabel: "W czym pomagamy",
    chips: ["Asystenci AI", "Arkusze", "Dedykowane aplikacje", "Integracje"],
  },
  fixes: {
    eyebrow: "Jak pomagamy",
    title: "Znajdujemy to, co Cię spowalnia, i to naprawiamy.",
    items: [
      {
        pain: "Za dużo czasu w tygodniu zjada administracja.",
        fix: "Sprawdzamy, gdzie ucieka czas, i usuwamy zbędną pracę: automatyzacją, AI albo prostszym sposobem działania.",
      },
      { pain: "Twoje narzędzia ze sobą nie współpracują.", fix: "Łączymy je albo zastępujemy czymś, co pasuje do Twojego sposobu pracy." },
      { pain: "Liczby są w arkuszach, którym nikt nie ufa.", fix: "Porządkujemy dane, żeby decyzje były łatwiejsze." },
      { pain: "Nie wiesz, za jaką technologię warto płacić.", fix: "Mówimy uczciwie, także wtedy, gdy odpowiedź brzmi: za żadną." },
    ],
  },
  services: {
    eyebrow: "Usługi",
    title: "W czym możemy pomóc",
    intro: "Praktyczna pomoc dopasowana do małych firm. Zaczynamy od problemu, nie od technologii.",
    linkLabel: "Dowiedz się więcej",
    problemsTitle: "Kiedy tego potrzebujesz",
    whatWeDoTitle: "Co robimy",
    deliverablesTitle: "Co dostajesz",
    faqTitle: "Pytania",
    items: {
      "ai-assistants-automation": {
        title: "Asystenci AI i automatyzacja",
        summary: "Niech AI zajmie się powtarzalną pracą: mailami, zapytaniami, wycenami, notatkami i raportami.",
        intro:
          "AI świetnie radzi sobie z pierwszymi wersjami tekstów i nudnym sortowaniem. Wdrażamy je tak, żeby pasowało do Twojego sposobu pracy, a wszystko, co ważne, sprawdza człowiek.",
        problems: [
          "Skrzynka jest pełna tych samych pięciu pytań.",
          "Wyceny, notatki i raporty zajmują godziny.",
          "Próbowałeś ChatGPT, ale nie zna on Twojej firmy.",
        ],
        whatWeDo: [
          "Znajdujemy zadania, w których AI naprawdę oszczędza czas",
          "Konfigurujemy asystentów, którzy znają Twoje produkty, ceny i styl",
          "Łączymy ich z pocztą, formularzami i narzędziami",
          "Zostawiamy człowieka przy wszystkim, co trafia do klientów",
        ],
        deliverables: ["Działający asystent lub automatyzacja", "Krótka instrukcja dla zespołu", "Miesiąc poprawek po wdrożeniu"],
        faq: [
          { question: "Czy AI wyśle coś klientom bez mojej wiedzy?", answer: "Tylko jeśli tego chcesz. Domyślnie AI przygotowuje szkic, a Ty go zatwierdzasz." },
          {
            question: "Czy moje dane posłużą do trenowania modeli AI?",
            answer: "Korzystamy z biznesowych planów usług AI, które nie trenują na Twoich danych, i mówimy dokładnie, gdzie te dane trafiają.",
          },
        ],
      },
      "custom-apps-websites": {
        title: "Dedykowane aplikacje i strony",
        summary: "Dedykowane aplikacje i strony internetowe zbudowane wokół tego, jak naprawdę działa Twoja firma.",
        intro:
          "Gotowe oprogramowanie zmusza Cię do pracy na jego zasadach. Dedykowana aplikacja działa na Twoich, a dla wielu małych firm kosztuje mniej, niż się wydaje.",
        problems: [
          "Płacisz za kilka narzędzi, które ze sobą nie współpracują.",
          "Rezerwacje, zamówienia albo zlecenia prowadzisz ręcznie.",
          "Strona internetowa nie przynosi zapytań.",
        ],
        whatWeDo: [
          "Dedykowane aplikacje do rezerwacji, zamówień i obsługi zleceń",
          "Portale dla klientów i narzędzia wewnętrzne",
          "Szybkie, proste strony, które przynoszą zapytania",
          "Płatności online przez Stripe",
        ],
        deliverables: ["Dedykowana aplikacja lub strona, która należy do Ciebie", "Hosting założony na Twoje dane", "Szkolenie i trzy miesiące poprawek w cenie"],
        faq: [
          { question: "Czy aplikacja na zamówienie będzie moja?", answer: "Tak. Kod i konta są zapisane na Ciebie." },
          { question: "Czy będzie działać na telefonach?", answer: "Tak. Wszystko, co budujemy, działa na telefonach, tabletach i komputerach." },
        ],
      },
      "spreadsheets-data": {
        title: "Arkusze i dane",
        summary: "Zamieniamy chaotyczne arkusze w jasne, wiarygodne liczby.",
        intro: "Większość małych firm działa na arkuszach. Sprawiamy, że są niezawodne, albo przenosimy najważniejsze rzeczy w bezpieczniejsze miejsce.",
        problems: ["Formuły się psują i nikt nie wie dlaczego.", "Liczby w różnych plikach się nie zgadzają.", "Przygotowanie raportu zajmuje cały dzień."],
        whatWeDo: ["Porządkujemy i przebudowujemy arkusze", "Automatyzujemy raporty i dashboardy", "Tworzymy wspólne dane z kopią zapasową, którym można ufać"],
        deliverables: ["Uporządkowane arkusze lub prosta baza danych", "Automatyczne raporty", "Krótkie przekazanie, żeby każdy mógł je utrzymać"],
        faq: [{ question: "Czy muszę przestać używać Excela lub Arkuszy Google?", answer: "Nie. Często najlepszym rozwiązaniem jest po prostu lepszy arkusz." }],
      },
      "migrations-integrations": {
        title: "Migracje i integracje",
        summary: "Przejdź na lepsze narzędzia i połącz te, które już masz.",
        intro: "Zmiana systemu albo połączenie kilku nie powinny oznaczać weekendów kopiowania i wklejania. Planujemy, przenosimy i sprawdzamy.",
        problems: [
          "Utknąłeś w starym systemie, z którego firma już wyrosła.",
          "Ręcznie przepisujesz dane między narzędziami.",
          "Boisz się, że przy migracji coś zginie.",
        ],
        whatWeDo: [
          "Planujemy i przeprowadzamy przejście na nowe narzędzia",
          "Łączymy narzędzia takie jak Fakturownia, Shopify, Google Workspace czy Twój CRM",
          "Sprawdzamy, czy każdy rekord dotarł bezpiecznie",
        ],
        deliverables: ["Dane przeniesione i zweryfikowane", "Narzędzia, które same się aktualizują", "Plan powrotu, na wszelki wypadek"],
        faq: [{ question: "Czy firma stanie na czas migracji?", answer: "Nie. Przenosimy dane etapami i przełączamy się, gdy wszystko się zgadza." }],
      },
      "find-what-works": {
        title: "Znajdźmy, co działa",
        summary: "Nie wiesz, czego potrzebujesz? Przyjrzymy się Twojej pracy i znajdziemy najlepsze rozwiązanie.",
        intro:
          "Czasem odpowiedzią jest AI, czasem dedykowana aplikacja, czasem lepszy arkusz, a czasem nic. Sprawdzamy to, zanim wydasz pieniądze.",
        problems: [
          "Każdy ma swoje zdanie, jakie narzędzie kupić.",
          "Wydałeś pieniądze na oprogramowanie, z którego nikt nie korzysta.",
          "Chcesz rosnąć bez zatrudniania ludzi do administracji.",
        ],
        whatWeDo: [
          "Sprawdzamy, jak naprawdę płynie praca w Twojej firmie",
          "Znajdujemy wąskie gardła, które warto naprawić",
          "Uczciwie porównujemy opcje, łącznie z pozostawieniem wszystkiego bez zmian",
        ],
        deliverables: ["Krótki plan na piśmie, prostym językiem", "Koszty i zaoszczędzony czas dla każdej opcji", "Jasny pierwszy krok"],
        faq: [{ question: "Czy potem muszę zlecić Wam realizację?", answer: "Nie. Plan jest Twój i możesz go wykorzystać, jak chcesz." }],
      },
    },
  },
  howItWorks: {
    eyebrow: "Jak to działa",
    title: "Od rozmowy do gotowego rozwiązania",
    intro: "Bez niespodzianek. Znasz cenę, zanim zaczniemy pracę.",
    steps: [
      { title: "Bezpłatna rozmowa", body: "Trzydzieści minut o tym, co Cię spowalnia. Bez żargonu i bez sprzedawania na siłę." },
      { title: "Plan i stała wycena", body: "Krótki plan na piśmie ze stałą ceną i terminem." },
      { title: "Realizacja", body: "Budujemy, co tydzień pokazujemy postępy i wprowadzamy poprawki na bieżąco." },
      { title: "Wsparcie", body: "Szkolenie dla zespołu i pomoc po wdrożeniu, żeby wszystko dalej działało." },
    ],
  },
  pricing: {
    eyebrow: "Cennik",
    title: "Jasne ceny startowe",
    intro: "Każda firma jest inna, dlatego każdy projekt dostaje stałą wycenę po bezpłatnej rozmowie. To typowe punkty startowe.",
    from: "Od",
    perMonth: "/mies.",
    packages: {
      quickWin: {
        name: "Szybka poprawa",
        summary: "Jedna automatyzacja, asystent AI lub poprawka arkusza.",
        features: ["Jedno konkretne usprawnienie", "Wdrożenie w około tydzień", "Miesiąc poprawek"],
      },
      customApp: {
        name: "Dedykowana aplikacja",
        summary: "Dedykowana aplikacja lub strona zbudowana wokół Twojej firmy.",
        features: ["Projektowana razem z Tobą", "Należy do Ciebie", "Trzy miesiące poprawek"],
      },
      support: {
        name: "Stała pomoc",
        summary: "Niewielki miesięczny abonament na zmiany i pytania.",
        features: ["Zmiany, kiedy ich potrzebujesz", "Szybsze odpowiedzi", "Rezygnacja w dowolnym momencie"],
      },
    },
    custom: {
      name: "Coś większego?",
      body: "Migracje, integracje i większe aplikacje na zamówienie wyceniamy po bezpłatnej rozmowie.",
      cta: "Umów bezpłatną rozmowę",
    },
    note: "Ceny netto (bez VAT).",
    teaser: {
      title: "Ceny dla małych firm",
      body: "Szybkie poprawki od {price}. Każdy projekt dostaje stałą wycenę przed rozpoczęciem pracy.",
      link: "Zobacz cennik",
    },
  },
  work: {
    eyebrow: "Realizacje",
    title: "Zbudowane wcześniej",
    intro:
      "Helpful Machines prowadzi Piotr, programista z ponad dziesięcioletnim doświadczeniem w tworzeniu oprogramowania dla firm takich jak te poniżej. Te same umiejętności trafiają teraz do projektów dla małych firm.",
    link: "Zobacz wszystkie realizacje",
    items: {
      highsnobiety: {
        client: "Highsnobiety",
        sector: "E-commerce modowy",
        title: "Proces zakupowy dla globalnego sklepu z modą",
        body: "Strony produktów i koszyk oraz systemy, które wytrzymywały ogromny ruch podczas premier limitowanych kolekcji.",
      },
      officeworks: {
        client: "Officeworks",
        sector: "Handel",
        title: "Zamówienia cykliczne dla największego dostawcy artykułów biurowych w Australii",
        body: "Zaprojektowanie i wdrożenie funkcji, dzięki której firmy automatycznie ponawiają zamówienia.",
      },
      lysn: {
        client: "Lysn",
        sector: "Zdrowie",
        title: "Rezerwacje i płatności dla platformy zdrowia psychicznego",
        body: "Lepsze rezerwacje online i ceny oraz dopłaty Medicare, które zmniejszyły liczbę nieodbytych wizyt.",
      },
      onchain: {
        client: "ONCHAIN",
        sector: "Fintech",
        title: "Płatności kartą i subskrypcje dla startupu płatniczego",
        body: "Systemy, które pozwalają płacić kartą, a sprzedawcom ustalać ceny w dolarach i otrzymywać zapłatę w kryptowalutach.",
      },
      udrew: {
        client: "uDrew",
        sector: "Budownictwo i projektowanie",
        title: "Formularze i dokumenty online do pozwoleń budowlanych",
        body: "Konfigurowalne formularze i archiwum dokumentów z pełną historią, które przyspieszyły zatwierdzanie projektów domów.",
      },
      nokia: {
        client: "Nokia",
        sector: "Telekomunikacja",
        title: "Narzędzia do przeszukiwania ogromnych logów",
        body: "Narzędzia webowe, dzięki którym zespoły znajdowały odpowiedzi w gigabajtach logów w kilka minut.",
      },
    },
  },
  faq: {
    eyebrow: "FAQ",
    title: "Najczęstsze pytania",
    link: "Zobacz wszystkie pytania",
    items: [
      {
        question: "Ile to kosztuje?",
        answer: "Większość projektów zaczyna się od cen z naszego cennika. Po bezpłatnej rozmowie dostajesz stałą wycenę, więc cena się nie zmieni, chyba że zmieni się zakres.",
      },
      { question: "Ile trwa projekt?", answer: "Szybkie poprawki zwykle tydzień lub dwa. Dedykowane aplikacje zwykle od czterech do ośmiu tygodni." },
      { question: "Nie znam się na technologii. Czy to problem?", answer: "Ani trochę. Wszystko tłumaczymy prostym językiem i zajmujemy się stroną techniczną." },
      {
        question: "Czy moje dane są bezpieczne?",
        answer: "Ograniczamy dostęp do minimum, korzystamy z usług o wysokim poziomie bezpieczeństwa i nigdy nie sprzedajemy ani nie udostępniamy Twoich danych.",
      },
      {
        question: "Co dzieje się po zakończeniu projektu?",
        answer: "Dostajesz szkolenie i okres bezpłatnych poprawek. Potem możesz zamawiać pomoc, kiedy jej potrzebujesz, albo wybrać miesięczny abonament.",
      },
      { question: "Czy pracujecie z firmami spoza Polski?", answer: "Tak. Pracujemy zdalnie z firmami w Polsce i w Australii." },
    ],
  },
  cta: {
    title: "Ułatwmy Ci pracę",
    body: "Umów bezpłatną 30-minutową rozmowę. Przyjdź z zadaniem, które irytuje Cię najbardziej.",
  },
  contact: {
    eyebrow: "Kontakt",
    title: "Umów bezpłatną rozmowę",
    intro: "Trzydzieści minut, bez żargonu i bez zobowiązań. Wybierz dogodny termin albo napisz wiadomość, a odpowiemy w ciągu jednego dnia roboczego.",
    bookTitle: "Wybierz termin",
    bookBody: "Zobacz wolne terminy i zarezerwuj w kilka kliknięć.",
    formTitle: "Albo napisz wiadomość",
    form: {
      name: "Imię i nazwisko",
      email: "E-mail",
      company: "Nazwa firmy (opcjonalnie)",
      message: "W czym możemy pomóc?",
      submit: "Wyślij wiadomość",
      sending: "Wysyłanie…",
      sent: "Dziękujemy! Wiadomość została wysłana. Odpowiemy w ciągu jednego dnia roboczego.",
      errorSummary: "Popraw zaznaczone pola.",
      emailFallback: "Możesz też napisać na adres",
      fieldErrors: {
        name: "Podaj imię i nazwisko.",
        email: "Podaj poprawny adres e-mail.",
        company: "Nazwa firmy może mieć maksymalnie 150 znaków.",
        message: "Napisz trochę więcej (co najmniej 10 znaków).",
      },
      errors: {
        validation: "Sprawdź formularz i spróbuj ponownie.",
        rate_limited: "Zbyt wiele wiadomości z Twojego połączenia. Spróbuj ponownie za kilka minut.",
        send_failed: "Przepraszamy, nie udało się wysłać wiadomości.",
        unavailable: "Formularz kontaktowy jest chwilowo niedostępny.",
        bad_request: "Przepraszamy, nie udało się wysłać wiadomości.",
      },
    },
  },
  footer: {
    tagline: "Praktyczne AI i dedykowane aplikacje dla małych firm.",
    navLabel: "Stopka",
    contactLabel: "E-mail",
    legal: "NIP: do uzupełnienia",
    privacy: "Prywatność",
    terms: "Warunki",
    languages: { en: "English", pl: "Polski" },
  },
  consent: {
    label: "Zgoda na pliki cookie",
    text: "Używamy analityki przyjaznej prywatności, żeby ulepszać tę stronę. Czy się zgadzasz?",
    accept: "Akceptuję",
    decline: "Odrzucam",
    policy: "Polityka prywatności",
    settings: "Ustawienia prywatności",
  },
  privacy: {
    title: "Polityka prywatności",
    updated: "Ostatnia aktualizacja: październik 2026",
    sections: [
      {
        heading: "Kim jesteśmy",
        paragraphs: [
          "Administratorem danych jest Helpful Machines, jednoosobowa działalność prowadzona przez Piotra Ciesiolkiewicza. Dane kontaktowe znajdziesz na stronie kontaktu.",
        ],
      },
      {
        heading: "Jakie dane zbieramy",
        paragraphs: [
          "Gdy wysyłasz wiadomość, otrzymujemy Twoje imię, e-mail, nazwę firmy i treść wiadomości. Używamy ich wyłącznie do odpowiedzi.",
          "Za Twoją zgodą korzystamy z analityki PostHog, żeby zrozumieć, jak używana jest strona: wyświetlone strony, kliknięcia i przybliżona lokalizacja (kraj). PostHog przechowuje dane w UE.",
        ],
      },
      {
        heading: "Pliki cookie",
        paragraphs: [
          "Ustawiamy pliki cookie zapamiętujące język i wersję strony, którą widzisz. Analityczne pliki cookie ustawiamy dopiero po wyrażeniu zgody. Zgodę możesz zmienić w każdej chwili w ustawieniach prywatności w stopce.",
        ],
      },
      {
        heading: "Twoje prawa",
        paragraphs: [
          "Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia i ograniczenia przetwarzania, a także prawo wniesienia skargi do Prezesa UODO. Napisz do nas, aby skorzystać z tych praw.",
        ],
      },
    ],
  },
  terms: {
    title: "Warunki współpracy",
    updated: "Ostatnia aktualizacja: październik 2026",
    sections: [
      { heading: "Wycena", paragraphs: ["Każdy projekt zaczyna się od pisemnej wyceny. Pracę rozpoczynamy po jej akceptacji."] },
      { heading: "Płatność", paragraphs: ["Faktury są płatne w ciągu 14 dni, chyba że ustalimy inaczej."] },
      { heading: "Prawa do pracy", paragraphs: ["Po opłaceniu faktury prawa do stworzonej dla Ciebie pracy przechodzą na Ciebie."] },
      {
        heading: "Odpowiedzialność",
        paragraphs: ["Dbamy o każdy projekt, ale nie odpowiadamy za szkody pośrednie. Nic w tych warunkach nie ogranicza Twoich praw konsumenckich."],
      },
    ],
  },
  notFound: {
    title: "Nie znaleziono strony",
    body: "Ta strona nie istnieje albo została przeniesiona.",
    home: "Przejdź na stronę główną",
  },
};
```

`apps/helpful-machines/content/index.ts`:
```ts
import type { Locale } from "@repo/web/locale";
import { en, type Content } from "./en";
import { pl } from "./pl";

export type { Content } from "./en";

const dictionaries: Record<Locale, Content> = { en, pl };

export function getContent(locale: Locale): Content {
  return dictionaries[locale];
}
```

- [ ] **Step 7: Run the tests and typecheck the content**

Run: `pnpm --filter helpful-machines test && pnpm --filter helpful-machines exec tsc --noEmit -p tsconfig.json`
Expected: content tests PASS (7). tsc may report errors only for files not yet created; it must report **no errors in `content/` or `experiments.ts`**. If `findCopyViolations` flags a phrase, fix the copy (don't loosen the rule) and ledger the wording change.

- [ ] **Step 8: Commit**

```bash
git add apps/helpful-machines pnpm-lock.yaml
git commit -m "feat(helpful-machines): content in English and Polish draft, markets, hero experiment

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: App scaffold, root layout and home page

**Files:**
- Create: `apps/helpful-machines/{next.config.ts,postcss.config.mjs,middleware.ts,site.config.ts,.env.example,vercel.json}`
- Create: `apps/helpful-machines/i18n/request.ts`, `apps/helpful-machines/public/icon.svg`, `apps/helpful-machines/app/globals.css`
- Create: `apps/helpful-machines/lib/{params,links,routes,metadata,format}.ts`, `apps/helpful-machines/components/{Logo,WorkCard}.tsx`
- Create: `apps/helpful-machines/app/[bucket]/[locale]/{layout,page,not-found}.tsx`, `apps/helpful-machines/app/[bucket]/[locale]/[...missing]/page.tsx`
- Test: `apps/helpful-machines/test/routes.test.ts`

**Interfaces:**
- Consumes: all of `@repo/web`, all `@repo/ui` components, and the content from Task 9.
- Produces:
  - `site` (`name`, `design`, `url`, `contactEmail`, `posthogKey`, `googleVerification`, `calUrl: Record<Locale,string>`)
  - `type RouteParams = { bucket: string; locale: string }`, `resolveParams(params: Promise<RouteParams>) → { locale, assignment, t, market }`
  - `bookingLink(locale, t, location): CtaLink`, `navItems(locale, t): NavItem[]`, `footerLinks(locale, t): NavItem[]`
  - `staticPaths`, `servicePaths`, `allPaths`, `ogKey(path)`, `pathFromOgKey(key)`, `pageTitle(t, path): string | null`
  - `meta(locale, path, title, description): Metadata`, `priceFormatter(currency): Promise<(n: number) => string>`
  - `buckets` (all pre-rendered buckets), exported from `lib/params.ts`

- [ ] **Step 1: Write the failing routes test**

`apps/helpful-machines/test/routes.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { en } from "../content/en";
import { pl } from "../content/pl";
import { allPaths, ogKey, pageTitle, pathFromOgKey, servicePaths, staticPaths } from "../lib/routes";

describe("routes", () => {
  it("lists 9 static pages and 5 service pages", () => {
    expect(staticPaths).toHaveLength(9);
    expect(servicePaths).toEqual([
      "/services/find-what-works",
      "/services/ai-assistants-automation",
      "/services/custom-apps-websites",
      "/services/spreadsheets-data",
      "/services/migrations-integrations",
    ]);
    expect(allPaths).toHaveLength(14);
  });
  it("round-trips OG keys", () => {
    expect(ogKey("/")).toBe("home");
    expect(ogKey("/services/spreadsheets-data")).toBe("services--spreadsheets-data");
    for (const path of allPaths) expect(pathFromOgKey(ogKey(path))).toBe(path);
  });
  it("has a title for every page in both languages", () => {
    for (const t of [en, pl]) for (const path of allPaths) expect(pageTitle(t, path), path).toBeTruthy();
    expect(pageTitle(en, "/services/nope")).toBeNull();
    expect(pageTitle(en, "/nope")).toBeNull();
    expect(pageTitle(en, "/services/toString")).toBeNull();
  });
});
```

Run: `pnpm --filter helpful-machines test routes`
Expected: FAIL, "Failed to resolve import ../lib/routes".

- [ ] **Step 2: Implement `lib/routes.ts`**

`apps/helpful-machines/lib/routes.ts`:
```ts
import type { Content } from "../content/en";
import { isServiceSlug, serviceSlugs } from "../content/services";

export const staticPaths = ["/", "/services", "/how-it-works", "/pricing", "/work", "/faq", "/contact", "/privacy", "/terms"] as const;
export type StaticPath = (typeof staticPaths)[number];
export const servicePaths = serviceSlugs.map((slug) => `/services/${slug}`);
export const allPaths: string[] = [...staticPaths, ...servicePaths];

const metaKey: Record<StaticPath, keyof Omit<Content["meta"], "siteDescription">> = {
  "/": "home",
  "/services": "services",
  "/how-it-works": "howItWorks",
  "/pricing": "pricing",
  "/work": "work",
  "/faq": "faq",
  "/contact": "contact",
  "/privacy": "privacy",
  "/terms": "terms",
};

export function ogKey(path: string): string {
  return path === "/" ? "home" : path.slice(1).split("/").join("--");
}

export function pathFromOgKey(key: string): string {
  return key === "home" ? "/" : `/${key.split("--").join("/")}`;
}

/** Short page title for OG images; null for unknown paths. */
export function pageTitle(t: Content, path: string): string | null {
  if (Object.hasOwn(metaKey, path)) return t.meta[metaKey[path as StaticPath]].title;
  const slug = path.match(/^\/services\/([^/]+)$/)?.[1];
  if (slug && isServiceSlug(slug)) return t.services.items[slug].title;
  return null;
}
```

Run: `pnpm --filter helpful-machines test`
Expected: PASS (content + routes).

- [ ] **Step 3: Configuration files**

`apps/helpful-machines/postcss.config.mjs`:
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

`apps/helpful-machines/next.config.ts`:
```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
const dev = process.env.NODE_ENV === "development";

/**
 * Next's App Router inlines its own bootstrap scripts, so a static site can't use nonces.
 * script-src therefore allows 'unsafe-inline'; everything else is locked to self.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@repo/ui", "@repo/web"],
  images: { formats: ["image/avif", "image/webp"] },
  // PostHog's API paths end with a slash; don't redirect them.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: "https://eu-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/:path*", destination: "https://eu.i.posthog.com/:path*" },
    ];
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default withNextIntl(config);
```

`apps/helpful-machines/i18n/request.ts`:
```ts
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "@repo/web/locale";

const timeZones = { en: "Australia/Melbourne", pl: "Europe/Warsaw" } as const;

/** next-intl supplies the request locale and number/currency formatting; copy lives in content/*.ts. */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested) ? requested : defaultLocale;
  return { locale, messages: {}, timeZone: timeZones[locale] };
});
```

`apps/helpful-machines/middleware.ts`:
```ts
import { createRoutingMiddleware } from "@repo/web/middleware";
import { experiments } from "./experiments";

export default createRoutingMiddleware({ experiments });

export const config = {
  matcher: ["/((?!(?:api|_next|_vercel|ingest|og)(?:/|$)|.*\\..*).*)"],
};
```

`apps/helpful-machines/site.config.ts`:
```ts
import { resolveSiteUrl } from "@repo/web/site";

export const site = {
  name: "Helpful Machines",
  design: "helpful-machines",
  url: resolveSiteUrl(),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@attunr.com",
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY || "",
  googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  calUrl: {
    en: process.env.NEXT_PUBLIC_CAL_URL_EN || "",
    pl: process.env.NEXT_PUBLIC_CAL_URL_PL || "",
  },
} as const;
```

`apps/helpful-machines/.env.example`:
```bash
# Copy to .env.local for local development. On Vercel: Project → Settings → Environment Variables.

# Public base URL (canonical links, hreflang, sitemap, OG images). Only one app can own the root of attunr.com.
NEXT_PUBLIC_SITE_URL=https://attunr.com
# Address shown on the site (footer, contact fallback)
NEXT_PUBLIC_CONTACT_EMAIL=hello@attunr.com
# Cal.com booking links per market; empty = booking buttons go to /contact
NEXT_PUBLIC_CAL_URL_EN=
NEXT_PUBLIC_CAL_URL_PL=

# Contact form (Resend). Without both, the form shows the email address instead.
RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL="Helpful Machines <hello@attunr.com>"

# PostHog (EU project). Empty = no analytics script.
NEXT_PUBLIC_POSTHOG_KEY=

# Optional
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

`apps/helpful-machines/vercel.json`:
```json
{
  "ignoreCommand": "npx turbo-ignore --fallback=HEAD^1"
}
```

`apps/helpful-machines/public/icon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="7" fill="#ff5a36"/><path d="M7 12.5c1.2 2 3 3 5 3s3.8-1 5-3" stroke="#fff6ea" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>
```

`apps/helpful-machines/app/globals.css`:
```css
@import "tailwindcss";
@import "@repo/ui/styles/base.css";
@import "@repo/ui/styles/helpful-machines.css";
@source "../../../packages/ui/src";
```

- [ ] **Step 4: App helpers and logo**

`apps/helpful-machines/lib/params.ts`:
```ts
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { allBuckets, parseBucket } from "@repo/web/experiments";
import { isLocale } from "@repo/web/locale";
import { getContent } from "@/content";
import { markets } from "@/content/market";
import { experiments } from "@/experiments";

export type RouteParams = { bucket: string; locale: string };
export const buckets = allBuckets(experiments);

/** Validates bucket + locale, sets the next-intl request locale, and loads the market's content. */
export async function resolveParams(params: Promise<RouteParams>) {
  const { bucket, locale } = await params;
  const assignment = parseBucket(experiments, bucket);
  if (!isLocale(locale) || !assignment) notFound();
  setRequestLocale(locale);
  return { locale, assignment, t: getContent(locale), market: markets[locale] };
}
```

`apps/helpful-machines/lib/links.ts`:
```ts
import type { NavItem } from "@repo/ui/NavLinks";
import type { CtaLink } from "@repo/ui/SmartLink";
import { localizedPath, type Locale } from "@repo/web/locale";
import type { Content } from "@/content";
import { site } from "@/site.config";

/** Cal.com when configured for the market (new tab, tracked as booking_opened), otherwise the contact page. */
export function bookingLink(locale: Locale, t: Content, location: string): CtaLink {
  const url = site.calUrl[locale];
  return url
    ? { href: url, label: t.nav.cta, external: true, track: "booking_opened", trackLocation: location }
    : { href: localizedPath(locale, "/contact"), label: t.nav.cta, track: "cta_click", trackLocation: location };
}

export function navItems(locale: Locale, t: Content): NavItem[] {
  const items: [string, string][] = [
    ["/services", t.nav.services],
    ["/how-it-works", t.nav.howItWorks],
    ["/pricing", t.nav.pricing],
    ["/work", t.nav.work],
    ["/faq", t.nav.faq],
    ["/contact", t.nav.contact],
  ];
  return items.map(([path, label]) => ({ href: localizedPath(locale, path), label }));
}

export function footerLinks(locale: Locale, t: Content): NavItem[] {
  return [
    { href: localizedPath(locale, "/privacy"), label: t.footer.privacy },
    { href: localizedPath(locale, "/terms"), label: t.footer.terms },
  ];
}
```

`apps/helpful-machines/lib/metadata.ts`:
```ts
import type { Metadata } from "next";
import type { Locale } from "@repo/web/locale";
import { pageMetadata } from "@repo/web/seo";
import { site } from "@/site.config";
import { ogKey } from "./routes";

export function meta(locale: Locale, path: string, title: string, description: string): Metadata {
  return pageMetadata({ siteUrl: site.url, siteName: site.name, locale, path, title, description, ogImage: `/og/${locale}/${ogKey(path)}` });
}
```

`apps/helpful-machines/lib/format.ts`:
```ts
import { getFormatter } from "next-intl/server";

export async function priceFormatter(currency: "AUD" | "PLN") {
  const format = await getFormatter();
  return (amount: number) => format.number(amount, { style: "currency", currency, maximumFractionDigits: 0 });
}
```

`apps/helpful-machines/components/Logo.tsx`:
```tsx
export function Logo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="7" fill="var(--accent)" />
      <path d="M7 12.5c1.2 2 3 3 5 3s3.8-1 5-3" stroke="var(--bg)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
```

- [ ] **Step 5: Root layout, home page, 404**

`apps/helpful-machines/app/[bucket]/[locale]/layout.tsx`:
```tsx
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import type { ReactNode } from "react";
import { Analytics } from "@repo/ui/Analytics";
import { ConsentBanner, ConsentSettingsButton } from "@repo/ui/ConsentBanner";
import { JsonLd } from "@repo/ui/JsonLd";
import { LanguageLink } from "@repo/ui/LanguageLink";
import { SiteFooter } from "@repo/ui/SiteFooter";
import { SiteHeader } from "@repo/ui/SiteHeader";
import { SkipLink } from "@repo/ui/SkipLink";
import { colorModeScript } from "@repo/web/color-mode";
import { consentRequired } from "@repo/web/consent";
import { activeAssignment } from "@repo/web/experiments";
import { organization, professionalService, website } from "@repo/web/json-ld";
import { htmlLang, locales, localizedPath } from "@repo/web/locale";
import { Logo } from "@/components/Logo";
import { experiments } from "@/experiments";
import { bookingLink, footerLinks, navItems } from "@/lib/links";
import { buckets, resolveParams, type RouteParams } from "@/lib/params";
import { site } from "@/site.config";
import "../../globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--font-bricolage", display: "swap" });

export const dynamicParams = false;

export function generateStaticParams() {
  return buckets.flatMap((bucket) => locales.map((locale) => ({ bucket, locale })));
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }): Promise<Metadata> {
  const { t } = await resolveParams(params);
  return {
    metadataBase: new URL(site.url),
    description: t.meta.siteDescription,
    icons: { icon: "/icon.svg" },
    ...(site.googleVerification ? { verification: { google: site.googleVerification } } : {}),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff6ea" },
    { media: "(prefers-color-scheme: dark)", color: "#17140f" },
  ],
};

export default async function RootLayout({ children, params }: { children: ReactNode; params: Promise<RouteParams> }) {
  const { locale, assignment, t } = await resolveParams(params);
  const brand = (
    <>
      <Logo />
      {site.name}
    </>
  );
  const nav = navItems(locale, t);
  const askConsent = consentRequired(locale);
  return (
    <html lang={htmlLang[locale]} data-design={site.design} className={display.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: colorModeScript }} />
      </head>
      <body className="min-h-dvh bg-bg font-body text-ink antialiased">
        <SkipLink label={t.nav.skip} />
        <SiteHeader
          brand={brand}
          homeHref={localizedPath(locale, "/")}
          nav={nav}
          buckets={buckets}
          cta={bookingLink(locale, t, "header")}
          labels={{ primary: t.nav.primary, menu: t.nav.menu, close: t.nav.close, colorMode: t.nav.colorMode }}
          newTabLabel={t.nav.newTab}
        />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter
          brand={brand}
          tagline={t.footer.tagline}
          nav={nav}
          navLabel={t.footer.navLabel}
          email={{ label: t.footer.contactLabel, address: site.contactEmail }}
          legal={t.footer.legal}
          legalLinks={footerLinks(locale, t)}
          languageLink={<LanguageLink locale={locale} buckets={buckets} labels={t.footer.languages} />}
          extra={askConsent ? <ConsentSettingsButton label={t.consent.settings} /> : undefined}
        />
        {askConsent && <ConsentBanner labels={t.consent} policyHref={localizedPath(locale, "/privacy")} />}
        <Analytics apiKey={site.posthogKey} locale={locale} assignment={activeAssignment(experiments, assignment, locale)} />
        <JsonLd
          data={[
            organization({ name: site.name, url: site.url, email: site.contactEmail }),
            website({ name: site.name, url: site.url, inLanguage: ["en-AU", "pl-PL"] }),
            professionalService({ name: site.name, url: site.url, description: t.meta.siteDescription, areaServed: ["AU", "PL"], email: site.contactEmail }),
          ]}
        />
      </body>
    </html>
  );
}
```

`apps/helpful-machines/app/[bucket]/[locale]/page.tsx`:
```tsx
import { ButtonLink } from "@repo/ui/SmartLink";
import { Card } from "@repo/ui/Card";
import { CtaBand } from "@repo/ui/CtaBand";
import { FaqList } from "@repo/ui/FaqList";
import { Hero } from "@repo/ui/Hero";
import { Highlight } from "@repo/ui/Highlight";
import { Section } from "@repo/ui/Section";
import { ServiceCard } from "@repo/ui/ServiceCard";
import { StepList } from "@repo/ui/StepList";
import { localizedPath } from "@repo/web/locale";
import { WorkCard } from "@/components/WorkCard";
import { serviceSlugs } from "@/content/services";
import { featuredWork } from "@/content/work";
import { priceFormatter } from "@/lib/format";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/", t.meta.home.title, t.meta.home.description);
}

export default async function HomePage({ params }: Props) {
  const { locale, assignment, t, market } = await resolveParams(params);
  const variant = assignment.hero === "easy-mode" ? "easy-mode" : "control";
  const [before, highlighted, after] = t.hero.title[variant];
  const price = await priceFormatter(market.currency);
  const href = (path: string) => localizedPath(locale, path);

  return (
    <>
      <Hero
        eyebrow={t.hero.eyebrow}
        title={
          <>
            {before}
            <Highlight>{highlighted}</Highlight>
            {after}
          </>
        }
        lead={t.hero.lead}
        primary={bookingLink(locale, t, "hero")}
        secondary={{ href: href("/services"), label: t.hero.secondary }}
        note={t.hero.note}
        chips={t.hero.chips}
        chipsLabel={t.hero.chipsLabel}
        newTabLabel={t.nav.newTab}
      />

      <Section id="fixes" eyebrow={t.fixes.eyebrow} title={t.fixes.title}>
        <ul className="grid gap-5 sm:grid-cols-2">
          {t.fixes.items.map((item) => (
            <li key={item.pain}>
              <Card className="h-full">
                <p className="font-display text-xl font-bold">{item.pain}</p>
                <p className="mt-3 text-muted">
                  <span aria-hidden="true">→ </span>
                  {item.fix}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="services" eyebrow={t.services.eyebrow} title={t.services.title} intro={t.services.intro}>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceSlugs.map((slug) => (
            <li key={slug}>
              <ServiceCard
                title={t.services.items[slug].title}
                summary={t.services.items[slug].summary}
                href={href(`/services/${slug}`)}
                linkLabel={t.services.linkLabel}
              />
            </li>
          ))}
        </ul>
      </Section>

      <Section id="how-it-works" eyebrow={t.howItWorks.eyebrow} title={t.howItWorks.title} intro={t.howItWorks.intro}>
        <StepList steps={t.howItWorks.steps} />
      </Section>

      <Section
        id="pricing"
        eyebrow={t.pricing.eyebrow}
        title={t.pricing.teaser.title}
        intro={t.pricing.teaser.body.replace("{price}", price(market.prices.quickWin))}
      >
        <ButtonLink link={{ href: href("/pricing"), label: t.pricing.teaser.link }} variant="secondary" />
      </Section>

      <Section id="work" eyebrow={t.work.eyebrow} title={t.work.title} intro={t.work.intro}>
        <ul className="grid gap-5 md:grid-cols-3">
          {featuredWork.map((slug) => (
            <li key={slug}>
              <WorkCard {...t.work.items[slug]} />
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <ButtonLink link={{ href: href("/work"), label: t.work.link }} variant="ghost" />
        </div>
      </Section>

      <Section id="faq" eyebrow={t.faq.eyebrow} title={t.faq.title}>
        <FaqList items={t.faq.items.slice(0, 4)} />
        <div className="mt-8">
          <ButtonLink link={{ href: href("/faq"), label: t.faq.link }} variant="ghost" />
        </div>
      </Section>

      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
    </>
  );
}
```

`apps/helpful-machines/components/WorkCard.tsx`:
```tsx
import { Card } from "@repo/ui/Card";

export function WorkCard({
  client,
  sector,
  title,
  body,
  headingLevel: Heading = "h3",
}: {
  client: string;
  sector: string;
  title: string;
  body: string;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Card as="article" className="flex h-full flex-col">
      <p className="text-sm font-bold uppercase tracking-widest text-accent-text">{sector}</p>
      <Heading className="mt-2 font-display text-xl font-extrabold">{title}</Heading>
      <p className="mt-3 text-muted">{body}</p>
      <p className="mt-auto pt-4 text-sm font-bold">{client}</p>
    </Card>
  );
}
```

`apps/helpful-machines/app/[bucket]/[locale]/not-found.tsx`:
```tsx
import { getLocale } from "next-intl/server";
import { Section } from "@repo/ui/Section";
import { ButtonLink } from "@repo/ui/SmartLink";
import { defaultLocale, isLocale, localizedPath, type Locale } from "@repo/web/locale";
import { getContent } from "@/content";

export default async function NotFound() {
  let locale: Locale = defaultLocale;
  try {
    const current = await getLocale();
    if (isLocale(current)) locale = current;
  } catch {
    // no request locale: fall back to English
  }
  const t = getContent(locale);
  return (
    <Section id="not-found" headingLevel="h1" title={t.notFound.title} intro={t.notFound.body}>
      <ButtonLink link={{ href: localizedPath(locale, "/"), label: t.notFound.home }} />
    </Section>
  );
}
```

`apps/helpful-machines/app/[bucket]/[locale]/[...missing]/page.tsx`:
```tsx
import { notFound } from "next/navigation";

/** Any unknown path under a valid bucket/locale renders the localized 404 inside the layout. */
export default function MissingPage(): never {
  notFound();
}
```

- [ ] **Step 6: Build and check the home page output**

Run:
```bash
cd /Users/pio/projects/pio-yoga && export NODE_OPTIONS=--no-network-family-autoselection
pnpm --filter helpful-machines typecheck && pnpm --filter helpful-machines build 2>&1 | tail -30
ls apps/helpful-machines/.next/server/app/control/ apps/helpful-machines/.next/server/app/easy-mode/
grep -o 'does the boring bits' apps/helpful-machines/.next/server/app/control/en.html | head -1
grep -o 'easy mode' apps/helpful-machines/.next/server/app/easy-mode/en.html | head -1
grep -o 'lang="pl-PL"' apps/helpful-machines/.next/server/app/control/pl.html | head -1
```
Expected:
- Typecheck clean and build succeeds.
- The route table shows `● /[bucket]/[locale]` with 4 prerendered paths.
- `control/` and `easy-mode/` each contain `en.html` and `pl.html`, and each grep prints its match.

If the build fails because the root layout sits under two dynamic segments, use systematic debugging: read the Next error, rule on it, and ledger it.

- [ ] **Step 7: Commit**

```bash
git add apps/helpful-machines
git commit -m "feat(helpful-machines): app scaffold, root layout, home page with hero experiment

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Remaining pages

**Files:**
- Create: `apps/helpful-machines/components/{Breadcrumbs,Prose}.tsx`
- Create: `apps/helpful-machines/app/[bucket]/[locale]/services/page.tsx`, `services/[slug]/page.tsx`
- Create: `apps/helpful-machines/app/[bucket]/[locale]/{how-it-works,pricing,work,faq,contact,privacy,terms}/page.tsx`

**Interfaces:**
- Consumes: Task 10 helpers, Task 9 content, and `@repo/ui` components.
- Produces: every route in `allPaths`, each with `generateMetadata` via `meta()`, one `h1`, and heading levels that never skip.

- [ ] **Step 1: Shared page components**

`apps/helpful-machines/components/Breadcrumbs.tsx`:
```tsx
import Link from "next/link";

export function Breadcrumbs({ items, label }: { items: { name: string; href?: string }[]; label: string }) {
  return (
    <nav aria-label={label} className="text-sm">
      <ol className="flex flex-wrap items-center gap-2 text-muted">
        {items.map((item, index) => (
          <li key={item.name} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="inline-flex min-h-11 items-center underline underline-offset-4">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className="font-bold text-ink">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

`apps/helpful-machines/components/Prose.tsx`:
```tsx
export function Prose({ updated, sections }: { updated: string; sections: { heading: string; paragraphs: string[] }[] }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm text-muted">{updated}</p>
      {sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="font-display text-2xl font-extrabold">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-lg">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Services index and service pages**

`apps/helpful-machines/app/[bucket]/[locale]/services/page.tsx`:
```tsx
import { CtaBand } from "@repo/ui/CtaBand";
import { Section } from "@repo/ui/Section";
import { ServiceCard } from "@repo/ui/ServiceCard";
import { localizedPath } from "@repo/web/locale";
import { serviceSlugs } from "@/content/services";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/services", t.meta.services.title, t.meta.services.description);
}

export default async function ServicesPage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return (
    <>
      <Section id="services" headingLevel="h1" eyebrow={t.services.eyebrow} title={t.services.title} intro={t.services.intro}>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceSlugs.map((slug) => (
            <li key={slug}>
              <ServiceCard
                headingLevel="h2"
                title={t.services.items[slug].title}
                summary={t.services.items[slug].summary}
                href={localizedPath(locale, `/services/${slug}`)}
                linkLabel={t.services.linkLabel}
              />
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
    </>
  );
}
```

`apps/helpful-machines/app/[bucket]/[locale]/services/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { Card } from "@repo/ui/Card";
import { CtaBand } from "@repo/ui/CtaBand";
import { FaqList } from "@repo/ui/FaqList";
import { JsonLd } from "@repo/ui/JsonLd";
import { Section } from "@repo/ui/Section";
import { breadcrumbList, faqPage, service } from "@repo/web/json-ld";
import { localizedPath } from "@repo/web/locale";
import { absoluteUrl } from "@repo/web/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { isServiceSlug, serviceSlugs } from "@/content/services";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";
import { site } from "@/site.config";

type Props = { params: Promise<RouteParams & { slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

async function load(params: Props["params"]) {
  const { slug, ...route } = await params;
  if (!isServiceSlug(slug)) notFound();
  const resolved = await resolveParams(Promise.resolve(route));
  return { ...resolved, slug, item: resolved.t.services.items[slug] };
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug, item } = await load(params);
  return meta(locale, `/services/${slug}`, `${item.title} · ${site.name}`, item.summary);
}

export default async function ServicePage({ params }: Props) {
  const { locale, t, slug, item } = await load(params);
  const url = (path: string) => absoluteUrl(site.url, localizedPath(locale, path));
  const lists: [string, string[]][] = [
    [t.services.problemsTitle, item.problems],
    [t.services.whatWeDoTitle, item.whatWeDo],
    [t.services.deliverablesTitle, item.deliverables],
  ];
  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
        <Breadcrumbs
          label={t.nav.breadcrumbs}
          items={[
            { name: t.nav.home, href: localizedPath(locale, "/") },
            { name: t.nav.services, href: localizedPath(locale, "/services") },
            { name: item.title },
          ]}
        />
      </div>
      <Section id="service" headingLevel="h1" title={item.title} intro={item.intro} className="pt-6 sm:pt-8">
        <div className="grid gap-5 md:grid-cols-3">
          {lists.map(([heading, entries]) => (
            <Card key={heading} className="h-full">
              <h2 className="font-display text-xl font-extrabold">{heading}</h2>
              <ul className="mt-4 grid list-disc gap-2 pl-5">
                {entries.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>
      <Section id="service-faq" title={t.services.faqTitle}>
        <FaqList items={item.faq} />
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
      <JsonLd
        data={[
          service({ name: item.title, description: item.summary, url: url(`/services/${slug}`), providerName: site.name, providerUrl: site.url, areaServed: ["AU", "PL"] }),
          breadcrumbList([
            { name: t.nav.home, url: url("/") },
            { name: t.nav.services, url: url("/services") },
            { name: item.title, url: url(`/services/${slug}`) },
          ]),
          faqPage(item.faq),
        ]}
      />
    </>
  );
}
```

- [ ] **Step 3: How it works, pricing, work, FAQ**

`apps/helpful-machines/app/[bucket]/[locale]/how-it-works/page.tsx`:
```tsx
import { CtaBand } from "@repo/ui/CtaBand";
import { Section } from "@repo/ui/Section";
import { StepList } from "@repo/ui/StepList";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/how-it-works", t.meta.howItWorks.title, t.meta.howItWorks.description);
}

export default async function HowItWorksPage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return (
    <>
      <Section id="how-it-works" headingLevel="h1" eyebrow={t.howItWorks.eyebrow} title={t.howItWorks.title} intro={t.howItWorks.intro}>
        <StepList steps={t.howItWorks.steps} headingLevel="h2" />
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
    </>
  );
}
```

`apps/helpful-machines/app/[bucket]/[locale]/pricing/page.tsx`:
```tsx
import { Card } from "@repo/ui/Card";
import { CtaBand } from "@repo/ui/CtaBand";
import { PricingCard } from "@repo/ui/PricingCard";
import { Section } from "@repo/ui/Section";
import { ButtonLink } from "@repo/ui/SmartLink";
import { priceFormatter } from "@/lib/format";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/pricing", t.meta.pricing.title, t.meta.pricing.description);
}

export default async function PricingPage({ params }: Props) {
  const { locale, t, market } = await resolveParams(params);
  const price = await priceFormatter(market.currency);
  const booking = bookingLink(locale, t, "pricing");
  const { quickWin, customApp, support } = t.pricing.packages;
  return (
    <>
      <Section id="pricing" headingLevel="h1" eyebrow={t.pricing.eyebrow} title={t.pricing.title} intro={t.pricing.intro}>
        <div className="grid gap-6 lg:grid-cols-3">
          <PricingCard headingLevel="h2" {...quickWin} price={`${t.pricing.from} ${price(market.prices.quickWin)}`} cta={booking} newTabLabel={t.nav.newTab} />
          <PricingCard headingLevel="h2" featured {...customApp} price={`${t.pricing.from} ${price(market.prices.customApp)}`} cta={booking} newTabLabel={t.nav.newTab} />
          <PricingCard
            headingLevel="h2"
            {...support}
            price={`${t.pricing.from} ${price(market.prices.support)}${t.pricing.perMonth}`}
            cta={booking}
            newTabLabel={t.nav.newTab}
          />
        </div>
        <Card className="mt-6 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-extrabold">{t.pricing.custom.name}</h2>
            <p className="mt-2 text-muted">{t.pricing.custom.body}</p>
          </div>
          <ButtonLink link={{ ...booking, label: t.pricing.custom.cta }} variant="secondary" newTabLabel={t.nav.newTab} />
        </Card>
        <p className="mt-6 text-sm text-muted">{t.pricing.note}</p>
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
    </>
  );
}
```

`apps/helpful-machines/app/[bucket]/[locale]/work/page.tsx`:
```tsx
import { CtaBand } from "@repo/ui/CtaBand";
import { Section } from "@repo/ui/Section";
import { WorkCard } from "@/components/WorkCard";
import { workSlugs } from "@/content/work";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/work", t.meta.work.title, t.meta.work.description);
}

export default async function WorkPage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return (
    <>
      <Section id="work" headingLevel="h1" eyebrow={t.work.eyebrow} title={t.work.title} intro={t.work.intro}>
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {workSlugs.map((slug) => (
            <li key={slug}>
              <WorkCard {...t.work.items[slug]} headingLevel="h2" />
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
    </>
  );
}
```

`apps/helpful-machines/app/[bucket]/[locale]/faq/page.tsx`:
```tsx
import { CtaBand } from "@repo/ui/CtaBand";
import { FaqList } from "@repo/ui/FaqList";
import { JsonLd } from "@repo/ui/JsonLd";
import { Section } from "@repo/ui/Section";
import { faqPage } from "@repo/web/json-ld";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/faq", t.meta.faq.title, t.meta.faq.description);
}

export default async function FaqPage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return (
    <>
      <Section id="faq" headingLevel="h1" eyebrow={t.faq.eyebrow} title={t.faq.title}>
        <FaqList items={t.faq.items} />
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
      <JsonLd data={faqPage(t.faq.items)} />
    </>
  );
}
```

- [ ] **Step 4: Contact, privacy, terms**

`apps/helpful-machines/app/[bucket]/[locale]/contact/page.tsx`:
```tsx
import { Card } from "@repo/ui/Card";
import { ContactForm } from "@repo/ui/ContactForm";
import { Section } from "@repo/ui/Section";
import { ButtonLink } from "@repo/ui/SmartLink";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";
import { site } from "@/site.config";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/contact", t.meta.contact.title, t.meta.contact.description);
}

export default async function ContactPage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  const booking = bookingLink(locale, t, "contact");
  return (
    <Section id="contact" headingLevel="h1" eyebrow={t.contact.eyebrow} title={t.contact.title} intro={t.contact.intro}>
      <div className="grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-start">
        {booking.external && (
          <Card>
            <h2 className="font-display text-2xl font-extrabold">{t.contact.bookTitle}</h2>
            <p className="mt-2 text-muted">{t.contact.bookBody}</p>
            <div className="mt-6">
              <ButtonLink link={booking} newTabLabel={t.nav.newTab} />
            </div>
          </Card>
        )}
        <Card className={booking.external ? undefined : "md:col-span-2"}>
          <h2 className="font-display text-2xl font-extrabold">{t.contact.formTitle}</h2>
          <div className="mt-6">
            <ContactForm locale={locale} labels={t.contact.form} email={site.contactEmail} />
          </div>
        </Card>
      </div>
    </Section>
  );
}
```

`apps/helpful-machines/app/[bucket]/[locale]/privacy/page.tsx`:
```tsx
import { Section } from "@repo/ui/Section";
import { Prose } from "@/components/Prose";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/privacy", t.meta.privacy.title, t.meta.privacy.description);
}

export default async function PrivacyPage({ params }: Props) {
  const { t } = await resolveParams(params);
  return (
    <Section id="privacy" headingLevel="h1" title={t.privacy.title}>
      <Prose updated={t.privacy.updated} sections={t.privacy.sections} />
    </Section>
  );
}
```

`apps/helpful-machines/app/[bucket]/[locale]/terms/page.tsx`:
```tsx
import { Section } from "@repo/ui/Section";
import { Prose } from "@/components/Prose";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/terms", t.meta.terms.title, t.meta.terms.description);
}

export default async function TermsPage({ params }: Props) {
  const { t } = await resolveParams(params);
  return (
    <Section id="terms" headingLevel="h1" title={t.terms.title}>
      <Prose updated={t.terms.updated} sections={t.terms.sections} />
    </Section>
  );
}
```

- [ ] **Step 5: Build and check every page exists**

Run:
```bash
cd /Users/pio/projects/pio-yoga && export NODE_OPTIONS=--no-network-family-autoselection
pnpm --filter helpful-machines typecheck && pnpm --filter helpful-machines build 2>&1 | grep -E "●|○|ƒ|error" | head -40
find apps/helpful-machines/.next/server/app/control apps/helpful-machines/.next/server/app/easy-mode -name "*.html" | wc -l
```
Expected: typecheck clean, build succeeds, and the count is **56** (2 buckets × 2 locales × 14 pages).

- [ ] **Step 6: Commit**

```bash
git add apps/helpful-machines
git commit -m "feat(helpful-machines): services, service pages, pricing, work, FAQ, contact and legal pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Sitemap, robots, OG images and the contact API

**Files:**
- Create: `apps/helpful-machines/app/sitemap.ts`, `apps/helpful-machines/app/robots.ts`
- Create: `apps/helpful-machines/app/og/[locale]/[page]/route.tsx`, `apps/helpful-machines/app/api/contact/route.ts`

**Interfaces:**
- Consumes: `buildSitemap`, `buildRobots` (`@repo/web/seo`); `createContactHandler`, `resendSender` (`@repo/web/contact`); `allPaths`, `ogKey`, `pathFromOgKey`, `pageTitle` (Task 10).
- Produces:
  - `/sitemap.xml`: 28 URLs with alternates
  - `/robots.txt`
  - `/og/<locale>/<key>`: a static 1200×630 PNG per page
  - `POST /api/contact`

- [ ] **Step 1: Write the four route files**

`apps/helpful-machines/app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";
import { buildSitemap } from "@repo/web/seo";
import { allPaths } from "@/lib/routes";
import { site } from "@/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(
    site.url,
    allPaths.map((path) => ({ path, priority: path === "/" ? 1 : path === "/privacy" || path === "/terms" ? 0.2 : 0.7 })),
  );
}
```

`apps/helpful-machines/app/robots.ts`:
```ts
import type { MetadataRoute } from "next";
import { buildRobots } from "@repo/web/seo";
import { site } from "@/site.config";

export default function robots(): MetadataRoute.Robots {
  return buildRobots(site.url);
}
```

`apps/helpful-machines/app/og/[locale]/[page]/route.tsx`:
```tsx
import { ImageResponse } from "next/og";
import { isLocale, locales } from "@repo/web/locale";
import { getContent } from "@/content";
import { allPaths, ogKey, pageTitle, pathFromOgKey } from "@/lib/routes";

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.flatMap((locale) => allPaths.map((path) => ({ locale, page: ogKey(path) })));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string; page: string }> }) {
  const { locale, page } = await params;
  if (!isLocale(locale)) return new Response("Not found", { status: 404 });
  const t = getContent(locale);
  const title = pageTitle(t, pathFromOgKey(page));
  if (!title) return new Response("Not found", { status: 404 });
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fff6ea",
          color: "#1e1a15",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 36, fontWeight: 800 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#ff5a36" }} />
          Helpful Machines
        </div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1.5, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 30, color: "#5a5146", borderTop: "4px solid #1e1a15", paddingTop: 24 }}>{t.footer.tagline}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
```

`apps/helpful-machines/app/api/contact/route.ts`:
```ts
import { createContactHandler, resendSender } from "@repo/web/contact";

export const runtime = "nodejs";

const apiKey = process.env.RESEND_API_KEY;
const to = process.env.CONTACT_TO_EMAIL;

/** Without RESEND_API_KEY and CONTACT_TO_EMAIL the handler answers 503 and the form shows the email address. */
export const POST = createContactHandler({
  send: apiKey && to ? resendSender(apiKey) : null,
  to: to ?? "",
  from: process.env.CONTACT_FROM_EMAIL || "Helpful Machines <hello@attunr.com>",
  siteName: "Helpful Machines",
});
```

- [ ] **Step 2: Build and inspect**

Run:
```bash
cd /Users/pio/projects/pio-yoga && export NODE_OPTIONS=--no-network-family-autoselection
pnpm --filter helpful-machines typecheck && pnpm --filter helpful-machines build 2>&1 | grep -E "og|sitemap|robots|api/contact|error"
```
Expected:
- `/og/[locale]/[page]` is listed as SSG with 28 paths.
- `/sitemap.xml` and `/robots.txt` are listed as static.
- `/api/contact` is listed as `ƒ` (dynamic).

- [ ] **Step 3: Look at a Polish OG image**

Run:
```bash
cd /Users/pio/projects/pio-yoga/apps/helpful-machines && (pnpm start > /tmp/hm-start.log 2>&1 &) ; sleep 5
curl -s -o "$TMPDIR/og-pl.png" -w "%{http_code} %{content_type}\n" "http://localhost:3001/og/pl/services--custom-apps-websites"
pkill -f "next start -p 3001"
```
Expected: `200 image/png`. Open `$TMPDIR/og-pl.png` with the Read tool. "Dedykowane aplikacje i strony" must render with correct Polish letters. If ą/ę/ł show as boxes, the default OG font lacks them: bundle Bricolage Grotesque's Latin-Extended TTF via `next/font`'s cached file, or fetch it at build time (ask the user before downloading any font file). Ledger the outcome.

- [ ] **Step 4: Commit**

```bash
git add apps/helpful-machines
git commit -m "feat(helpful-machines): sitemap, robots, static OG images, contact API route

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Build-output test, smoke test, CI and docs

**Files:**
- Create: `apps/helpful-machines/vitest.build.config.ts`, `apps/helpful-machines/test-build/output.test.ts`, `apps/helpful-machines/README.md`
- Modify: `turbo.json` (add the `test:build` task), `.github/workflows/ci.yml` (run it), `README.md` (root: Helpful Machines is now live in the repo)

**Interfaces:**
- Consumes: the built `.next/server/app` output; `allBuckets`, `locales`, `localizedPath`, `absoluteUrl`, `resolveSiteUrl`.
- Produces: `pnpm --filter helpful-machines test:build` and `turbo run test:build`.

- [ ] **Step 1: Write the build-output test**

`apps/helpful-machines/vitest.build.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["test-build/**/*.test.ts"] },
});
```

`apps/helpful-machines/test-build/output.test.ts`:
```ts
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { allBuckets } from "@repo/web/experiments";
import { localizedPath, locales } from "@repo/web/locale";
import { absoluteUrl } from "@repo/web/seo";
import { resolveSiteUrl } from "@repo/web/site";
import { experiments } from "../experiments";
import { allPaths } from "../lib/routes";

const root = fileURLToPath(new URL("../.next/server/app/", import.meta.url));
const buckets = allBuckets(experiments);
const fileFor = (bucket: string, locale: string, path: string) =>
  join(root, bucket, path === "/" ? `${locale}.html` : `${locale}${path}.html`);
const html = (bucket: string, locale: string, path: string) => readFileSync(fileFor(bucket, locale, path), "utf8");
const canonical = (page: string) => page.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
/** Next prints the root as "https://x.com" and we build "https://x.com/"; they're the same URL. */
const same = (url: string | undefined) => (url ? new URL(url).href : url);
const siteUrl = resolveSiteUrl();

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? htmlFiles(full) : name.endsWith(".html") ? [full] : [];
  });
}

describe("Helpful Machines build output", () => {
  it("exists (run `pnpm --filter helpful-machines build` first)", () => expect(existsSync(root)).toBe(true));

  it("pre-renders every bucket × locale × page", () => {
    for (const bucket of buckets) for (const locale of locales) for (const path of allPaths) {
      expect(existsSync(fileFor(bucket, locale, path)), `${bucket}/${locale}${path}`).toBe(true);
    }
  });

  it("sets <html lang> and the design", () => {
    expect(html("control", "en", "/")).toMatch(/<html[^>]*lang="en-AU"/);
    expect(html("control", "pl", "/")).toMatch(/<html[^>]*lang="pl-PL"/);
    expect(html("easy-mode", "en", "/pricing")).toMatch(/<html[^>]*data-design="helpful-machines"/);
  });

  it("renders each hero variant in each market", () => {
    expect(html("control", "en", "/")).toContain("does the boring bits");
    expect(html("easy-mode", "en", "/")).toContain("easy mode");
    expect(html("control", "pl", "/")).toContain("robi nudną robotę");
    expect(html("easy-mode", "pl", "/")).toContain("tryb łatwy");
  });

  it("gives every bucket the same public canonical", () => {
    for (const locale of locales) for (const path of ["/", "/services", "/services/custom-apps-websites", "/contact"]) {
      const expected = absoluteUrl(siteUrl, localizedPath(locale, path));
      for (const bucket of buckets) expect(same(canonical(html(bucket, locale, path))), `${bucket}/${locale}${path}`).toBe(same(expected));
    }
  });

  it("has hreflang alternates for both markets and x-default", () => {
    const page = html("control", "en", "/pricing");
    expect(page).toMatch(new RegExp(`hreflang="pl-PL" href="${absoluteUrl(siteUrl, "/pl/pricing")}"`, "i"));
    expect(page).toMatch(new RegExp(`hreflang="x-default" href="${absoluteUrl(siteUrl, "/pricing")}"`, "i"));
  });

  it("never links to an internal bucket path", () => {
    const internal = new RegExp(`href="/(?:${buckets.join("|")})(?:/|")`);
    for (const file of htmlFiles(root)) expect(readFileSync(file, "utf8"), file).not.toMatch(internal);
  });

  it("has one h1 per page", () => {
    for (const path of allPaths) {
      const count = html("control", "en", path).match(/<h1[\s>]/g)?.length ?? 0;
      expect(count, path).toBe(1);
    }
  });

  it("ships FAQ and service structured data", () => {
    expect(html("control", "en", "/faq")).toContain('"@type":"FAQPage"');
    expect(html("control", "pl", "/services/spreadsheets-data")).toContain('"@type":"Service"');
  });

  it("follows the copy rule in rendered Polish pages", () => {
    expect(html("control", "pl", "/")).toContain("Dedykowane aplikacje");
  });
});
```

- [ ] **Step 2: Run it against the Task 12 build**

Run: `cd /Users/pio/projects/pio-yoga && pnpm --filter helpful-machines test:build`
Expected: PASS (10 tests). If a regex misses because of how React serialises an attribute (e.g. `hrefLang` vs `hreflang`), inspect the real HTML with `grep`, fix the regex to match the real output (not the other way round), and ledger it.

- [ ] **Step 3: Wire it into turbo and CI**

In `turbo.json` `tasks`, add:
```json
    "test:build": {
      "dependsOn": ["build"]
    },
```

In `.github/workflows/ci.yml`, after `- run: pnpm build`, add:
```yaml
      - run: pnpm turbo run test:build
```

- [ ] **Step 4: Smoke-test the running site**

```bash
cd /Users/pio/projects/pio-yoga/apps/helpful-machines && (pnpm start > /tmp/hm-start.log 2>&1 &) ; sleep 5
B=http://localhost:3001
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; echo; }
loc() { curl -s -o /dev/null -D - "$@" | grep -i '^location' | tr -d '\r'; }
echo "home:"; code $B/
echo "home headline:"; curl -s $B/ | grep -oE "does the boring bits|easy mode" | head -1
echo "PL geo:"; loc -H "x-vercel-ip-country: PL" $B/services
echo "pl page:"; code $B/pl/services
echo "bot+PL:"; code -A "Mozilla/5.0 (compatible; Googlebot/2.1)" -H "x-vercel-ip-country: PL" $B/
echo "?locale=en:"; loc "$B/pl/pricing?locale=en"
echo "404:"; code $B/nope
echo "no-JS form:"; loc -X POST -H "content-type: application/x-www-form-urlencoded" --data "name=Ania&email=ania@example.pl&message=Prosze+o+kontakt+w+sprawie&locale=pl" $B/api/contact
echo "og:"; curl -s -o /dev/null -w "%{http_code} %{content_type}\n" $B/og/en/home
echo "sitemap urls:"; curl -s $B/sitemap.xml | grep -c "<loc>"
echo "robots:"; curl -s $B/robots.txt | grep -i sitemap
echo "CSP:"; curl -s -o /dev/null -D - $B/ | grep -i '^content-security-policy' | cut -c1-80
pkill -f "next start -p 3001"
```
Expected:
- `home:` 200, and the home headline grep prints one of the two variants.
- `PL geo:` `location: http://localhost:3001/pl/services`. `pl page:` 200. `bot+PL:` 200.
- `?locale=en:` `location: http://localhost:3001/pricing`.
- `404:` 404.
- `no-JS form:` `location: http://localhost:3001/pl/contact?error=unavailable` (no Resend key locally).
- `og:` `200 image/png`. `sitemap urls:` 28. `robots:` a `Sitemap:` line. `CSP:` `content-security-policy: default-src 'self'; …`.

- [ ] **Step 5: Docs**

`apps/helpful-machines/README.md`:
````markdown
# Helpful Machines

Practical AI and custom apps for small businesses. English (Australia) at `/`, Polish at `/pl/...`. Every page is pre-rendered.

```bash
pnpm --filter helpful-machines dev        # http://localhost:3001
pnpm --filter helpful-machines test       # content and routes
pnpm --filter helpful-machines build && pnpm --filter helpful-machines test:build
```

## Before launch (placeholders)

- **Prices:** `content/market.ts` (AUD and PLN starting prices).
- **NIP:** `footer.legal` in `content/pl.ts` (the ABN is already set in `content/en.ts`).
- **Polish copy:** `content/pl.ts` is a draft. Review it all, especially the legal pages.
- **Legal pages:** `privacy` and `terms` in both content files are templates. Have them reviewed.
- **Copy rule:** say "custom apps" / "dedykowane aplikacje" / "aplikacje na zamówienie", never "apps" alone. `pnpm test` enforces it.

## Vercel

1. New project from this repo. **Root Directory:** `apps/helpful-machines`. Vercel detects pnpm and Next.
2. Environment variables from `.env.example`. `NEXT_PUBLIC_SITE_URL` must be this project's real URL (subdomain, path or `helpfulmachines.ai`).
3. Builds are skipped when nothing relevant changed (`vercel.json` → `turbo-ignore`).
4. The country header (`x-vercel-ip-country`) is set by Vercel automatically; visitors in Poland are redirected to `/pl`.

## PostHog (EU)

1. Create a project in the **EU** region and set `NEXT_PUBLIC_POSTHOG_KEY`. Events go through `/ingest` on this domain.
2. Create an experiment with feature-flag key **`hero`** and variants **`control`** and **`easy-mode`** (50/50). The site assigns variants itself (edge middleware) and reports them as `$feature_flag_called` events and `$feature/hero` properties, so don't let PostHog override the assignment.
3. Primary metric: `booking_opened` or `form_submitted` (`success: true`). Secondary: `cta_click`, `scroll_depth`.
4. To end the test, set the winner's weight in `experiments.ts`. To ship a non-control winner, make it the default copy and delete the experiment.

## Contact form (Resend)

Verify the sending domain in Resend, then set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`. Without them, the form shows the email address instead.

## Booking (Cal.com)

Set `NEXT_PUBLIC_CAL_URL_EN` and `NEXT_PUBLIC_CAL_URL_PL`. Without them, booking buttons go to `/contact`.
````

In the root `README.md` table, change the Helpful Machines row's last column to: `AI and IT for small businesses (see apps/helpful-machines/README.md)`.

- [ ] **Step 6: Full pipeline**

Run:
```bash
cd /Users/pio/projects/pio-yoga && export NODE_OPTIONS=--no-network-family-autoselection
pnpm typecheck && pnpm test && pnpm build && pnpm turbo run test:build
```
Expected: everything passes. Tests run for `@repo/web`, `@repo/ui` and `helpful-machines`. All three apps build. `test:build` passes.

- [ ] **Step 7: Commit**

```bash
git add turbo.json .github/workflows/ci.yml README.md apps/helpful-machines
git commit -m "test(helpful-machines): build-output checks, CI wiring, README and Vercel/PostHog setup docs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 8: Hand back**

Report the test counts, the smoke results and the commits. Remind the user of the placeholders (prices, NIP, Polish review, legal review), the Vercel setup and the PostHog experiment setup. Don't push.
