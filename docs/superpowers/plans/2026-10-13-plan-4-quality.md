# Plan 4: Quality pass (fixes, browser tests, accessibility, Lighthouse, design review)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove both business sites work for real users in a real browser and keep them that way in CI. That means:
- fix the deferred minors that affect users
- add Playwright end-to-end tests (routing, colour modes, consent, the contact form with and without JS, both Tangent designs)
- scan every page with axe in every market × colour mode × design
- enforce Lighthouse budgets
- run a screenshot-based design and accessibility review whose findings go to the user

**Architecture:**
- A new workspace package `packages/e2e` (`@repo/e2e`) holds Playwright, axe and Lighthouse CI. It starts both built apps itself (Helpful Machines on 3001, Tangent on 3002) and imports each app's route list, so new pages are tested automatically.
- Fixes land in `@repo/web`, `@repo/ui` and the apps, each test-first.

**Tech Stack:** @playwright/test ^1.64.0, @axe-core/playwright ^4.13.0, @lhci/cli ^0.15.1, Vitest (existing).

**Spec:** `docs/superpowers/specs/2026-10-11-multi-brand-monorepo-design.md`. Plans 1–3 are merged.

## Global Constraints

- Budgets:
  - Lighthouse mobile ≥ 0.95 for performance, accessibility, best practices and SEO, on the listed pages.
  - Script transfer ≤ 180 KB per page. That's the framework's ~102 kB plus ≤ 30 KB of app code plus headroom for RSC chunks, per Plan 2's ruling.
- Accessibility: zero axe violations of impact **serious** or **critical** under WCAG 2.0/2.1/2.2 A + AA, on every route, in both markets, both colour modes and (Tangent) both designs.
- E2E tests must never send a real email. They assume no Resend config, and the no-JS contact test skips itself if an app's `.env.local` sets `RESEND_API_KEY`.
- Lighthouse results stay local or in CI artifacts. Never upload them to public storage.
- Local commands need `NODE_OPTIONS=--no-network-family-autoselection`. Never commit it.
- No changes to the yoga app.

## Review Focus

1. **Flaky timing in browser tests** (hydration, idle-loaded analytics, CSS animations): tests wait on visible states, never on sleeps, and run with reduced motion where appearance matters. Covered in Tasks 4–6.
2. **A failing budget or axe scan that's a real defect, not a test problem.** Fix the product and ledger it. Never loosen a threshold or disable an axe rule without a written ruling. Covered in Tasks 6–7.
3. **A user who opens a confirmation link twice** (`?sent=1` bookmarked or reloaded) shouldn't see "Thanks!" again. Covered in Task 2.
4. **Screen-reader users in Tangent:** decorative "// " and "01 —" aren't read aloud, and focus never gets lost after consent choices. Covered in Tasks 2, 4 and 6.
5. **Duplicate URLs** (`/services/` vs `/services`) consolidate to one with a 308. Covered in Tasks 1 and 4.

---

## File structure

```
packages/web/src/routing/decide.ts            trailing-slash 308
packages/ui/src/components/ConsentBanner.tsx  focus management
packages/ui/src/components/ContactForm.tsx    live region, invalid styling, clean URL after result
packages/ui/src/components/{Section,Hero,ConnectDots}.tsx  eyebrow levels, pathLength
packages/ui/src/styles/tangent.css            alt text for decorations, numbering only h2 sections, chip separators
apps/*/lib/metadata.ts                        brand in every <title>
apps/*/components/Document.tsx + app/not-found.tsx   404 language link
apps/*/content/pl.ts                          Polish copy fixes
turbo.json                                    test:build env, test:e2e, test:lighthouse
packages/e2e/
  package.json tsconfig.json playwright.config.ts
  lighthouserc.helpful-machines.cjs lighthouserc.tangent.cjs scripts/{lighthouse,screenshots}.mjs
  tests/helpers.ts
  tests/shared.colormode.spec.ts tests/shared.consent.spec.ts tests/shared.contact.spec.ts
  tests/hm.routing.spec.ts tests/tangent.routing.spec.ts tests/tangent.designs.spec.ts
  tests/hm.a11y.spec.ts tests/tangent.a11y.spec.ts
.github/workflows/ci.yml                      e2e + lighthouse jobs
docs/quality/2026-10-13-design-review.md      review report (Task 9)
```

---

### Task 1: Trailing slashes redirect to the canonical URL

**Files:**
- Modify: `packages/web/src/routing/decide.ts`, `packages/web/test/routing.test.ts`

**Interfaces:**
- Produces: `decideRoute` returns `{ kind: "redirect", status: 308, location: <path without trailing slash>?<query> }` for any non-root path ending in `/`. This runs before every other rule except skipped paths.

- [ ] **Step 1: Write the failing tests**

In `packages/web/test/routing.test.ts`, **replace** the existing test:
```ts
  it("keeps /plumbing english and normalises trailing slashes", () => {
    expect(run({ pathname: "/plumbing", cookies: { exp: "hero:control" } })).toMatchObject({ pathname: "/control/en/plumbing" });
    expect(run({ pathname: "/services/", cookies: { exp: "hero:control" } })).toMatchObject({ pathname: "/control/en/services" });
  });
```
with:
```ts
  it("keeps /plumbing english", () =>
    expect(run({ pathname: "/plumbing", cookies: { exp: "hero:control" } })).toMatchObject({ pathname: "/control/en/plumbing" }));

  it("redirects trailing slashes to the canonical URL (one URL per page)", () => {
    expect(run({ pathname: "/services/" })).toEqual({ kind: "redirect", status: 308, location: "/services", setCookies: [] });
    expect(run({ pathname: "/pl/", search: "?a=1" })).toEqual({ kind: "redirect", status: 308, location: "/pl?a=1", setCookies: [] });
    expect(run({ pathname: "//services//" })).toMatchObject({ status: 308, location: "/services" });
    expect(run({ pathname: "/", cookies: { exp: "hero:control" } })).toMatchObject({ kind: "rewrite" });
  });
```

- [ ] **Step 2: Run them to verify they fail**

Run: `cd /Users/pio/projects/pio-yoga && pnpm --filter @repo/web test routing`
Expected: FAIL in "redirects trailing slashes…" (a rewrite comes back instead of a 308).

- [ ] **Step 3: Implement**

In `packages/web/src/routing/decide.ts`:
- Change the locale import to `import { defaultLocale, isLocale, localizedPath, normalizePath, splitLocale, type Locale } from "../locale";`
- Directly after `if (isSkipped(pathname)) return { kind: "pass" };`, insert:
```ts
  // 0. One URL per page: /services/ → /services (Next's own redirect is off for PostHog's /ingest).
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return { kind: "redirect", status: 308, location: withQuery(normalizePath(pathname), new URLSearchParams(input.search)), setCookies: [] };
  }
```

- [ ] **Step 4: Run all web tests**

Run: `pnpm --filter @repo/web test && pnpm --filter @repo/web typecheck`
Expected: PASS. Typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add packages/web
git commit -m "fix(web): 308 trailing-slash URLs to the canonical path

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: UI fixes: consent focus, contact live region, invalid styling, clean URL, Tangent decorations

**Files:**
- Modify: `packages/ui/src/components/{ConsentBanner,ContactForm,Section,Hero,ConnectDots}.tsx`, `packages/ui/src/styles/tangent.css`
- Test: `packages/ui/test/{consent-analytics,contact-form,primitives,content,tangent}.test.tsx`

**Interfaces:**
- Produces:
  - After a consent choice, focus moves to the element that reopened the banner, otherwise to `#main`.
  - ContactForm always renders one polite live region (`role="status"`), empty until success. Invalid fields get a visible style (`aria-invalid:` utilities). After showing a `?sent=1` / `?error=` result, the URL is cleaned with `history.replaceState`.
  - Section eyebrows: `data-eyebrow="h1" | "h2"`. Hero eyebrow: `data-eyebrow="hero"`.
  - In `tangent.css`: decorations use CSS alt text (`content: "…" / ""`), editorial numbering applies only to `[data-eyebrow="h2"]`, precision chips get separators, editorial defines `--font-mono-family`.
  - ConnectDots path uses `pathLength="1"`.

- [ ] **Step 1: Write the failing tests**

Append to `packages/ui/test/consent-analytics.test.tsx`:
```tsx
describe("ConsentBanner focus", () => {
  it("moves focus to the main content after a first-visit choice", async () => {
    render(
      <>
        <main id="main" tabIndex={-1}>
          content
        </main>
        <ConsentBanner labels={labels} policyHref="/pl/privacy" />
      </>,
    );
    await userEvent.click(await screen.findByRole("button", { name: "Odrzucam" }));
    expect(document.activeElement?.id).toBe("main");
  });

  it("returns focus to the settings button after reopening", async () => {
    document.cookie = "consent=denied; Path=/";
    render(
      <>
        <main id="main" tabIndex={-1}>
          content
        </main>
        <ConsentBanner labels={labels} policyHref="/pl/privacy" />
        <ConsentSettingsButton label="Ustawienia prywatności" />
      </>,
    );
    const settings = screen.getByRole("button", { name: "Ustawienia prywatności" });
    await userEvent.click(settings);
    await userEvent.click(screen.getByRole("button", { name: "Akceptuję" }));
    expect(document.activeElement).toBe(settings);
  });
});
```

In `packages/ui/test/contact-form.test.tsx`:
- In "sends JSON and confirms success", replace `expect(await screen.findByRole("status")).toHaveProperty("textContent", labels.sent);` with `expect((await screen.findByText(labels.sent)).getAttribute("role")).toBe("status");`
- In "shows the result of a no-JS submission from the URL", replace `expect((await screen.findByRole("status")).textContent).toBe(labels.sent);` with `expect((await screen.findByText(labels.sent)).getAttribute("role")).toBe("status");`
- Append:
```tsx
describe("ContactForm accessibility and URL hygiene", () => {
  it("keeps one polite live region mounted, empty until success", () => {
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    const live = screen.getByRole("status");
    expect(live.getAttribute("aria-live")).toBe("polite");
    expect(live.textContent).toBe("");
  });
  it("styles invalid fields visibly, not only with text", () => {
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    expect(screen.getByLabelText("Email").className).toContain("aria-invalid:border-accent-text");
  });
  it("cleans ?sent=1 and the #anchor from the URL after showing the result", async () => {
    window.history.replaceState({}, "", "/contact?sent=1#contact-sent");
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    await screen.findByText(labels.sent);
    expect(window.location.search).toBe("");
    expect(window.location.hash).toBe("");
  });
});
```

Append to `packages/ui/test/primitives.test.tsx`:
```tsx
describe("eyebrow levels", () => {
  it("marks section eyebrows with their heading level", () => {
    render(
      <>
        <Section id="a" eyebrow="Top" title="T1" headingLevel="h1">x</Section>
        <Section id="b" eyebrow="Sub" title="T2">x</Section>
      </>,
    );
    expect(screen.getByText("Top").getAttribute("data-eyebrow")).toBe("h1");
    expect(screen.getByText("Sub").getAttribute("data-eyebrow")).toBe("h2");
  });
});
```

Append to `packages/ui/test/content.test.tsx`:
```tsx
describe("Hero eyebrow level", () => {
  it("marks the hero eyebrow so section numbering can skip it", () => {
    render(<Hero eyebrow="E" title="T" lead="L" primary={{ href: "/c", label: "Go" }} />);
    expect(screen.getByText("E").getAttribute("data-eyebrow")).toBe("hero");
  });
});
```

Append to `packages/ui/test/tangent.test.tsx`:
```tsx
describe("tangent decorations", () => {
  it("hides decorative text from screen readers with CSS alt text", () => {
    expect(css).toContain('content: "// " / "";');
    expect(css).toMatch(/content: counter\(tg-section, decimal-leading-zero\) " — " \/ "";/);
  });
  it("numbers only h2 section eyebrows in editorial (not the hero, not page titles)", () =>
    expect(css).toContain('[data-design="tangent-editorial"] main [data-eyebrow="h2"]::before'));
  it("separates precision chips", () => expect(css).toContain('[data-design="tangent-precision"] [data-chips] li + li::before'));
  it("defines a mono font in editorial too", () => {
    const editorial = css.slice(css.indexOf(':root[data-design="tangent-editorial"] {'));
    expect(editorial.slice(0, editorial.indexOf("}"))).toContain("--font-mono-family:");
  });
  it("draws the dots path with a normalised length", () => {
    const { container } = render(
      <ConnectDots labels={{ idea: "i", market: "m", users: "u", data: "d", tech: "t", product: "p" }} />,
    );
    expect(container.querySelector(".tg-path")?.getAttribute("pathLength")).toBe("1");
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `pnpm --filter @repo/ui test`
Expected: FAIL in each new describe block. The two edited success assertions may already pass; that's fine.

- [ ] **Step 3: Implement**

`packages/ui/src/components/ConsentBanner.tsx`:
- Change the React import to `import { useEffect, useRef, useState } from "react";`
- In `ConsentBanner`, after `const [open, setOpen] = useState(false);` add `const openerRef = useRef<HTMLElement | null>(null);`
- Replace `const reopen = () => setOpen(true);` with:
```tsx
    const reopen = () => {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
    };
```
- Replace the `choose` function with:
```tsx
  const choose = (value: Consent) => {
    writeConsent(value);
    setOpen(false);
    // Don't drop focus to <body> when the banner disappears.
    const target = openerRef.current ?? document.getElementById("main");
    openerRef.current = null;
    target?.focus();
  };
```

`packages/ui/src/components/ContactForm.tsx`:
- `inputClass` becomes:
```ts
const inputClass =
  "min-h-11 w-full rounded-card border-2 border-control bg-surface px-3 py-2 text-ink aria-invalid:border-4 aria-invalid:border-accent-text";
```
- In the first `useEffect`, after the `if (...) setStatus(...) else if (...)` lines, add:
```ts
    // Show the result once; a reload or bookmark shouldn't repeat "Thanks!".
    if (query.has("sent") || query.has("error")) window.history.replaceState(null, "", window.location.pathname);
```
- Replace the block
```tsx
      {status.kind === "sent" && (
        <p role="status" className="rounded-card border-2 border-line bg-highlight/40 p-4 font-bold">
          {labels.sent}
        </p>
      )}
```
with:
```tsx
      {/* Always mounted so screen readers announce the change when it's filled. */}
      <p role="status" aria-live="polite" className={status.kind === "sent" ? "rounded-card border-2 border-line bg-highlight/40 p-4 font-bold" : "sr-only"}>
        {status.kind === "sent" ? labels.sent : ""}
      </p>
```

`packages/ui/src/components/Section.tsx`: change `<p data-eyebrow className=` to `<p data-eyebrow={Heading} className=`.

`packages/ui/src/components/Hero.tsx`: change `<p data-eyebrow className=` to `<p data-eyebrow="hero" className=`.

`packages/ui/src/components/ConnectDots.tsx`: change `<path className="tg-path" d=` to `<path className="tg-path" pathLength={1} d=`.

`packages/ui/src/styles/tangent.css`:
- In the editorial light block, after `--font-serif-family: var(--font-instrument);`, add `  --font-mono-family: var(--font-jetbrains);`.
- Replace
```css
[data-design="tangent-precision"] [data-eyebrow]::before {
  content: "// ";
}
```
with
```css
[data-design="tangent-precision"] [data-eyebrow]::before {
  content: "// " / "";
}
```
- Replace
```css
[data-design="tangent-editorial"] main [data-eyebrow]::before {
  counter-increment: tg-section;
  content: counter(tg-section, decimal-leading-zero) " — ";
}
```
with
```css
[data-design="tangent-editorial"] main [data-eyebrow="h2"]::before {
  counter-increment: tg-section;
  content: counter(tg-section, decimal-leading-zero) " — " / "";
}
```
- After the precision `[data-chips] li` rule, add:
```css
[data-design="tangent-precision"] [data-chips] li + li::before {
  content: "/ " / "";
  margin-right: 0.75rem;
  color: var(--muted);
}
```
- In the `.tg-dots .tg-path` rule, change `stroke-dasharray: 320;` and `stroke-dashoffset: 320;` to `stroke-dasharray: 1;` and `stroke-dashoffset: 1;`.

- [ ] **Step 4: Run all UI tests and typecheck**

Run: `pnpm --filter @repo/ui test && pnpm --filter @repo/ui typecheck`
Expected: PASS. Typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add packages/ui
git commit -m "fix(ui): consent focus, contact live region and invalid styling, clean result URL, quiet decorations

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: App fixes: brand in every title, root-404 language link, Polish copy, turbo env

**Files:**
- Modify: `apps/{helpful-machines,tangent}/lib/metadata.ts`, `apps/{helpful-machines,tangent}/components/Document.tsx`, `apps/{helpful-machines,tangent}/app/not-found.tsx`
- Modify: `apps/{helpful-machines,tangent}/content/pl.ts`, `turbo.json`
- Test: `apps/{helpful-machines,tangent}/test/content.test.ts`, `apps/{helpful-machines,tangent}/test-build/output.test.ts`

**Interfaces:**
- Produces:
  - `meta()` appends ` · <brand>` unless the title already contains it.
  - `Document` accepts `languageLink?: ReactNode`, which overrides the footer language link.
  - `test:build` declares `NEXT_PUBLIC_SITE_URL` in turbo.

- [ ] **Step 1: Write the failing tests**

Append to `apps/helpful-machines/test-build/output.test.ts` (inside the main `describe`, before its closing `});`):
```ts
  it("puts the brand in every page title", () => {
    for (const locale of locales) for (const path of allPaths) {
      expect(html("control", locale, path).match(/<title>([^<]*)<\/title>/)?.[1], `${locale}${path}`).toContain("Helpful Machines");
    }
  });

  it("gives the root 404 a working language link (not /pl/_not-found)", () =>
    expect(readFileSync(join(root, "_not-found.html"), "utf8")).not.toContain("/pl/_not-found"));
```
Append the same two tests to `apps/tangent/test-build/output.test.ts`, with `"Tangent"` instead of `"Helpful Machines"`.

Append to `apps/helpful-machines/test/content.test.ts` (inside the main `describe`):
```ts
  it("Polish copy uses neutral forms and the reviewed wording", () => {
    const text = collectStrings(pl).map((s) => s.value).join(" ");
    expect(text).not.toMatch(/\p{L}+łeś\b/u);
    for (const phrase of ["w ciągu około tygodnia", "aktualizują się nawzajem", "Plan wycofania zmian", "zarejestrowany na Ciebie", "Nawigacja główna"]) {
      expect(text).toContain(phrase);
    }
  });
```

Append to `apps/tangent/test/content.test.ts`:
```ts
describe("Polish copy review", () => {
  it("addresses the reader consistently as Ty, with the reviewed fixes", () => {
    const text = collectStrings(pl).map((s) => s.value).join(" ");
    expect(text).not.toMatch(/\b(Wasz|możecie|chcecie|Polegacie|zatrudniacie)\b/);
    expect(text).toContain("jest korzystny");
    expect(text).toContain("dziesiątki tysięcy różnych kryptowalut");
    expect(pl.hero.dots.users).toBe("użytkownicy");
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run:
```bash
cd /Users/pio/projects/pio-yoga && export NODE_OPTIONS=--no-network-family-autoselection
pnpm --filter helpful-machines test; pnpm --filter tangent test
pnpm --filter helpful-machines test:build; pnpm --filter tangent test:build
```
Expected: the new content tests FAIL. The new build tests FAIL against the current builds (titles without the brand; `/pl/_not-found` present).

- [ ] **Step 3: Implement**

In **both** `apps/helpful-machines/lib/metadata.ts` and `apps/tangent/lib/metadata.ts`, replace the body of `meta` with:
```ts
  const full = title.includes(site.name) ? title : `${title} · ${site.name}`;
  return pageMetadata({ siteUrl: site.url, siteName: site.name, locale, path, title: full, description, ogImage: `/og/${locale}/${ogKey(path)}` });
```

In **both** `components/Document.tsx`:
- Add `languageLink,` to the destructured props.
- Add `  /** Overrides the footer language link (the root 404 has no page to switch). */\n  languageLink?: ReactNode;` to the props type.
- Replace `languageLink={<LanguageLink locale={locale} buckets={buckets} labels={t.footer.languages} />}` with `languageLink={languageLink ?? <LanguageLink locale={locale} buckets={buckets} labels={t.footer.languages} />}`.

In **both** `app/not-found.tsx`, add this prop to `<Document …>`:
```tsx
      languageLink={
        <a href="/pl" hrefLang="pl-PL" lang="pl-PL" className="inline-flex min-h-11 items-center font-bold underline underline-offset-4">
          Polski
        </a>
      }
```

In `apps/helpful-machines/content/pl.ts`, make these exact replacements:

| Find | Replace with |
|---|---|
| `"Wdrożenie w około tydzień"` | `"Wdrożenie w ciągu około tygodnia"` |
| `"Narzędzia, które same się aktualizują"` | `"Narzędzia, które aktualizują się nawzajem"` |
| `"Plan powrotu, na wszelki wypadek"` | `"Plan wycofania zmian, na wszelki wypadek"` |
| `"Hosting założony na Twoje dane"` | `"Hosting zarejestrowany na Ciebie"` |
| `"Krótkie przekazanie, żeby każdy mógł je utrzymać"` | `"Krótkie wdrożenie zespołu, żeby każdy mógł je utrzymać"` |
| `"Tworzymy wspólne dane z kopią zapasową, którym można ufać"` | `"Tworzymy wspólne, regularnie archiwizowane dane, którym można ufać"` |
| `"Próbowałeś ChatGPT, ale nie zna on Twojej firmy."` | `"ChatGPT nie zna Twojej firmy, więc jego odpowiedzi są ogólnikowe."` |
| `"Utknąłeś w starym systemie, z którego firma już wyrosła."` | `"Firma wyrosła ze starego systemu, ale trudno go porzucić."` |
| `"Wydałeś pieniądze na oprogramowanie, z którego nikt nie korzysta."` | `"Firma zapłaciła za oprogramowanie, z którego nikt nie korzysta."` |
| `primary: "Główna",` | `primary: "Nawigacja główna",` |

In `apps/tangent/content/pl.ts`, make these exact replacements:

| Find | Replace with |
|---|---|
| `{ question: "Czy potem musimy zlecić Wam realizację?", answer: "Nie. Przegląd jest Wasz i możecie go wykorzystać, jak chcecie." }` | `{ question: "Czy potem muszę zlecić Wam realizację?", answer: "Nie. Przegląd jest Twój i możesz go wykorzystać, jak chcesz." }` |
| `"Polegacie na agencji albo freelancerach bez technicznego właściciela",` | `"Firma polega na agencji albo freelancerach bez technicznego właściciela",` |
| `"Za chwilę zatrudniacie pierwszych programistów",` | `"Za chwilę zatrudnisz pierwszych programistów",` |
| `który korzystny jest dla gospodarstw` | `który jest korzystny dla gospodarstw` |
| `dziesiątki tysięcy kryptowalut,` | `dziesiątki tysięcy różnych kryptowalut,` |
| `users: "ludzie"` | `users: "użytkownicy"` |

In `turbo.json`, change `"test:build": { "dependsOn": ["build"] }` to:
```json
    "test:build": {
      "dependsOn": ["build"],
      "env": ["NEXT_PUBLIC_SITE_URL"]
    },
```

- [ ] **Step 4: Rebuild and run everything**

Run:
```bash
cd /Users/pio/projects/pio-yoga && export NODE_OPTIONS=--no-network-family-autoselection
pnpm typecheck && pnpm test && pnpm build && pnpm turbo run test:build
```
Expected: everything passes, including the new content and build tests.

- [ ] **Step 5: Commit**

```bash
git add apps turbo.json
git commit -m "fix(apps): brand in every title, root-404 language link, Polish copy review, turbo env

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: E2E package and shared browser tests (both apps)

**Files:**
- Create: `packages/e2e/{package.json,tsconfig.json,playwright.config.ts}`, `packages/e2e/tests/helpers.ts`
- Create: `packages/e2e/tests/{shared.colormode,shared.consent,shared.contact,hm.routing}.spec.ts`
- Modify: `turbo.json` (add `test:e2e`), `.gitignore` (Playwright output)

**Interfaces:**
- Produces:
  - `pnpm --filter @repo/e2e test:e2e`, which runs Playwright projects `hm` (http://localhost:3001) and `tangent` (http://localhost:3002), both started from the built apps
  - Helpers: `storeColorMode(page, mode)`, `resendConfigured(app)`, `luminance(rgb)`

- [ ] **Step 1: Create the package**

`packages/e2e/package.json`:
```json
{
  "name": "@repo/e2e",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test:e2e": "playwright test",
    "test:lighthouse": "node scripts/lighthouse.mjs",
    "screenshots": "node scripts/screenshots.mjs",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4.13.0",
    "@lhci/cli": "^0.15.1",
    "@playwright/test": "^1.64.0",
    "@repo/config": "workspace:*",
    "@types/node": "^22.15.0",
    "typescript": "^5.9.3"
  }
}
```

`packages/e2e/tsconfig.json`:
```json
{
  "extends": "@repo/config/tsconfig/base.json",
  "include": ["playwright.config.ts", "tests"]
}
```

`packages/e2e/playwright.config.ts`:
```ts
import { defineConfig, devices } from "@playwright/test";

/** Runs against the BUILT apps (turbo builds them first). Never sends real email: see tests/helpers.ts. */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: { trace: "retain-on-failure", reducedMotion: "reduce" },
  webServer: [
    {
      command: "pnpm --filter helpful-machines start",
      url: "http://localhost:3001/robots.txt",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter tangent start",
      url: "http://localhost:3002/robots.txt",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "hm",
      testMatch: /(shared|hm)\..*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3001" },
    },
    {
      name: "tangent",
      testMatch: /(shared|tangent)\..*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:3002" },
    },
  ],
});
```

Add to `turbo.json` tasks:
```json
    "test:e2e": {
      "dependsOn": ["helpful-machines#build", "tangent#build"],
      "cache": false
    },
    "test:lighthouse": {
      "dependsOn": ["helpful-machines#build", "tangent#build"],
      "cache": false
    },
```

Append to `.gitignore`:
```
playwright-report
test-results
.lighthouseci
```

Run:
```bash
cd /Users/pio/projects/pio-yoga && export NODE_OPTIONS=--no-network-family-autoselection
pnpm install && pnpm --filter @repo/e2e exec playwright install chromium
```
Expected: installs. Chromium for this Playwright version is downloaded into the user's Playwright cache (not the repo).

- [ ] **Step 2: Helpers**

`packages/e2e/tests/helpers.ts`:
```ts
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";

/** Pre-set the stored colour mode before any page script runs. */
export async function storeColorMode(page: Page, mode: "light" | "dark") {
  await page.addInitScript((m) => {
    try {
      localStorage.setItem("colorMode", m);
    } catch {
      // storage blocked: test will see the system mode
    }
  }, mode);
}

/** True when an app's .env.local configures Resend: the no-JS contact test would send a real email, so it skips. */
export function resendConfigured(app: "helpful-machines" | "tangent"): boolean {
  const file = fileURLToPath(new URL(`../../../apps/${app}/.env.local`, import.meta.url));
  return existsSync(file) && /^\s*RESEND_API_KEY\s*=\s*\S+/m.test(readFileSync(file, "utf8"));
}

/** Relative luminance of a CSS rgb() colour (0 = black, 1 = white). */
export function luminance(rgb: string): number {
  const [r, g, b] = (rgb.match(/\d+(\.\d+)?/g) ?? ["0", "0", "0"]).slice(0, 3).map((v) => {
    const c = Number(v) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export const appOf = (baseURL: string | undefined) => (baseURL?.endsWith(":3002") ? "tangent" : "helpful-machines");
```

- [ ] **Step 3: Shared specs**

`packages/e2e/tests/shared.colormode.spec.ts`:
```ts
import { expect, test } from "@playwright/test";
import { luminance, storeColorMode } from "./helpers";

test.describe("colour mode", () => {
  test("a stored choice applies before the page renders (no flash)", async ({ page }) => {
    await storeColorMode(page, "dark");
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForFunction(() => document.body !== null);
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
  });

  test("the switch persists across reloads and pages", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const header = page.getByRole("banner");
    await header.getByRole("radio", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(header.getByRole("radio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
    await page.goto("/contact");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("System follows the OS live", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("without JavaScript the OS preference still applies", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/");
    expect(await page.locator("html").getAttribute("data-theme")).toBeNull();
    const bg = await page.locator("body").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(luminance(bg)).toBeLessThan(0.05);
    await context.close();
  });

  test("mobile menu: opens, keeps focus inside, closes on Escape and returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Menu" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
```

`packages/e2e/tests/shared.consent.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test.describe("consent", () => {
  test("Poland: asks, stores the choice, moves focus to the content, and can be reopened", async ({ page, context }) => {
    await page.goto("/pl");
    const banner = page.getByRole("region", { name: "Zgoda na pliki cookie" });
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Odrzucam" }).click();
    await expect(banner).toBeHidden();
    await expect(page.locator("#main")).toBeFocused();
    expect((await context.cookies()).find((c) => c.name === "consent")?.value).toBe("denied");

    await page.reload();
    await expect(page.getByRole("button", { name: "Ustawienia prywatności" })).toBeVisible();
    await expect(banner).toBeHidden();

    const settings = page.getByRole("button", { name: "Ustawienia prywatności" });
    await settings.click();
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Akceptuję" }).click();
    await expect(settings).toBeFocused();
    expect((await context.cookies()).find((c) => c.name === "consent")?.value).toBe("granted");
  });

  test("Australia never shows a banner", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("region", { name: "Cookie consent" })).toHaveCount(0);
  });
});
```

`packages/e2e/tests/shared.contact.spec.ts`:
```ts
import { expect, test } from "@playwright/test";
import { appOf, resendConfigured } from "./helpers";

async function fill(page: import("@playwright/test").Page) {
  await page.locator('[name="name"]').fill("Ania");
  await page.locator('[name="email"]').fill("ania@example.pl");
  await page.locator('[name="message"]').fill("We would like some help with our processes.");
}

test.describe("contact form", () => {
  test("with JavaScript: confirms success in the live region", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }),
    );
    await page.goto("/contact");
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Thanks! Your message is on its way." })).toBeVisible();
  });

  test("with JavaScript: field errors are linked, styled and focused", async ({ page }) => {
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ ok: false, error: "validation", fields: { email: "bad" } }) }),
    );
    await page.goto("/contact");
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    // Scoped to the form: Next.js adds its own (empty) role="alert" route announcer.
    const alert = page.locator("form").getByRole("alert");
    await expect(alert).toBeFocused();
    await expect(alert.getByRole("link")).toHaveAttribute("href", "#contact-email");
    await expect(page.locator('[name="email"]')).toHaveAttribute("aria-invalid", "true");
  });

  test("without JavaScript: the static page shows the API's result", async ({ browser, baseURL }) => {
    test.skip(resendConfigured(appOf(baseURL)), "Resend is configured locally: this would send a real email");
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/contact");
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page).toHaveURL(/\/contact\?error=unavailable#contact-error-unavailable$/);
    const result = page.locator("#contact-error-unavailable");
    await expect(result).toBeVisible();
    await expect(result.getByRole("link")).toHaveAttribute("href", /^mailto:/);
    await context.close();
  });
});
```

`packages/e2e/tests/hm.routing.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test.describe("Helpful Machines routing", () => {
  test("visitors in Poland land on /pl, keeping the page", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, extraHTTPHeaders: { "x-vercel-ip-country": "PL" } });
    const page = await context.newPage();
    await page.goto("/services");
    await expect(page).toHaveURL(/\/pl\/services$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "pl-PL");
    await context.close();
  });

  test("the footer language link keeps the page both ways, and the choice sticks", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, extraHTTPHeaders: { "x-vercel-ip-country": "PL" } });
    const page = await context.newPage();
    await page.goto("/pl/pricing");
    await page.getByRole("contentinfo").getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/:3001\/pricing$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en-AU");
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en-AU");
    await page.getByRole("contentinfo").getByRole("link", { name: "Polski" }).click();
    await expect(page).toHaveURL(/\/pl$/);
    await context.close();
  });

  test("the hero variant stays the same across reloads", async ({ page }) => {
    await page.goto("/");
    const first = await page.getByRole("heading", { level: 1 }).textContent();
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(first!);
    }
  });

  test("a forced variant shows its headline", async ({ context, page, baseURL }) => {
    await context.addCookies([{ name: "exp", value: "hero:easy-mode", url: baseURL! }]);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Put your business on easy mode.");
  });

  test("unknown pages get the branded 404", async ({ page }) => {
    const res = await page.goto("/nope");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  });

  test("trailing slashes redirect to the canonical URL", async ({ page }) => {
    await page.goto("/services/");
    await expect(page).toHaveURL(/:3001\/services$/);
  });
});
```

- [ ] **Step 4: Run them**

Run: `cd /Users/pio/projects/pio-yoga && export NODE_OPTIONS=--no-network-family-autoselection && pnpm turbo run test:e2e`
Expected: every test in projects `hm` and `tangent` passes. (Tangent runs the shared specs here. Its own specs come in Task 5.) A failure is either a product bug (debug it, fix it test-first in the owning package, ledger it) or a selector that doesn't match the real accessible name (fix the test to match the real UI and ledger it).

- [ ] **Step 5: Commit**

```bash
git add packages/e2e turbo.json .gitignore pnpm-lock.yaml
git commit -m "test(e2e): Playwright suite for colour modes, consent, contact form and HM routing

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Tangent browser tests: routing, designs, case studies without JS

**Files:**
- Create: `packages/e2e/tests/tangent.routing.spec.ts`, `packages/e2e/tests/tangent.designs.spec.ts`

**Interfaces:**
- Consumes: Task 4 config and helpers.

- [ ] **Step 1: Write the specs**

`packages/e2e/tests/tangent.routing.spec.ts`:
```ts
import { expect, test } from "@playwright/test";

test.describe("Tangent routing", () => {
  test("visitors in Poland land on the Polish case study", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, extraHTTPHeaders: { "x-vercel-ip-country": "PL" } });
    const page = await context.newPage();
    await page.goto("/work/onchain");
    await expect(page).toHaveURL(/\/pl\/work\/onchain$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Płatności kartą za kryptowaluty przy minimalnym kapitale");
    await context.close();
  });

  test("unknown Polish case studies get the branded 404", async ({ page }) => {
    const res = await page.goto("/pl/work/xyz");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Polski" })).toHaveAttribute("href", "/pl");
  });

  test("case-study cards credit Piotr's work at the client", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByText("Piotr's work at Officeworks")).toBeVisible();
  });

  test("case studies read fully without JavaScript", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/pl/work/onchain");
    for (const heading of ["Problem", "Efekt", "Co się zmieniło", "Technologie"]) {
      await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
    }
    await expect(page.getByRole("list", { name: "Technologie" }).getByRole("listitem")).toHaveCount(7);
    await context.close();
  });
});
```

`packages/e2e/tests/tangent.designs.spec.ts`:
```ts
import { expect, test } from "@playwright/test";
import { storeColorMode } from "./helpers";

const backgrounds = {
  control: { light: "rgb(247, 247, 245)", dark: "rgb(11, 12, 14)", design: "tangent-precision" },
  editorial: { light: "rgb(250, 250, 247)", dark: "rgb(20, 19, 17)", design: "tangent-editorial" },
} as const;

test.describe("Tangent designs", () => {
  for (const variant of ["control", "editorial"] as const) {
    for (const mode of ["light", "dark"] as const) {
      test(`${variant} in ${mode} mode uses its own tokens`, async ({ context, page, baseURL }) => {
        await context.addCookies([{ name: "exp", value: `design:${variant}`, url: baseURL! }]);
        await storeColorMode(page, mode);
        await page.goto("/");
        await expect(page.locator("html")).toHaveAttribute("data-design", backgrounds[variant].design);
        await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
        await expect(page.locator("body")).toHaveCSS("background-color", backgrounds[variant][mode]);
      });
    }
  }

  test("a visitor keeps one design across pages", async ({ page }) => {
    await page.goto("/");
    const design = await page.locator("html").getAttribute("data-design");
    for (const path of ["/work", "/services/fresh-look", "/about"]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-design", design!);
    }
  });

  test("decorative eyebrow text isn't in the accessibility tree", async ({ context, page, baseURL }) => {
    await context.addCookies([{ name: "exp", value: "design:editorial", url: baseURL! }]);
    await page.goto("/");
    const snapshot = await page.locator("#flows").ariaSnapshot();
    expect(snapshot).not.toMatch(/0\d —/);
  });
});
```

- [ ] **Step 2: Run them**

Run: `pnpm turbo run test:e2e`
Expected: everything passes in both projects.

- [ ] **Step 3: Commit**

```bash
git add packages/e2e
git commit -m "test(e2e): Tangent routing, both designs in both colour modes, no-JS case studies

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Accessibility scan of every page (axe)

**Files:**
- Create: `packages/e2e/tests/hm.a11y.spec.ts`, `packages/e2e/tests/tangent.a11y.spec.ts`

**Interfaces:**
- Consumes: each app's `allPaths` (imported from the app's `lib/routes.ts`) and `localizedPath`.

- [ ] **Step 1: Write the scans**

`packages/e2e/tests/hm.a11y.spec.ts`:
```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { allPaths } from "../../../apps/helpful-machines/lib/routes";
import { localizedPath } from "../../web/src/locale";
import { storeColorMode } from "./helpers";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const locale of ["en", "pl"] as const) {
  for (const mode of ["light", "dark"] as const) {
    for (const path of allPaths) {
      test(`a11y ${locale} ${mode} ${path}`, async ({ page }) => {
        await storeColorMode(page, mode);
        await page.goto(localizedPath(locale, path));
        await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
        await page.waitForLoadState("networkidle");
        const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
        expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
      });
    }
  }
}
```

`packages/e2e/tests/tangent.a11y.spec.ts`:
```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { allPaths } from "../../../apps/tangent/lib/routes";
import { localizedPath } from "../../web/src/locale";
import { storeColorMode } from "./helpers";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const variant of ["control", "editorial"] as const) {
  for (const locale of ["en", "pl"] as const) {
    for (const mode of ["light", "dark"] as const) {
      for (const path of allPaths) {
        test(`a11y ${variant} ${locale} ${mode} ${path}`, async ({ context, page, baseURL }) => {
          await context.addCookies([{ name: "exp", value: `design:${variant}`, url: baseURL! }]);
          await storeColorMode(page, mode);
          await page.goto(localizedPath(locale, path));
          await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
          await page.waitForLoadState("networkidle");
          const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
          const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
          expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
        });
      }
    }
  }
}
```

- [ ] **Step 2: Run them**

Run: `pnpm --filter @repo/e2e exec playwright test a11y` (servers already built; run `pnpm turbo run test:e2e` first if not).
Expected: all 216 scans pass (HM 14×2×2, Tangent 20×2×2×2). Each violation is a product defect: fix it test-first in the owning package (for example a contrast token, a missing label or a landmark), rebuild, re-run, and ledger `Task 6: fixed <rule> on <pages>`. Never disable a rule.

- [ ] **Step 3: Commit**

```bash
git add packages/e2e
git commit -m "test(a11y): axe scan of every page, market, colour mode and design

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Lighthouse budgets

**Files:**
- Create: `packages/e2e/lighthouserc.helpful-machines.cjs`, `packages/e2e/lighthouserc.tangent.cjs`, `packages/e2e/scripts/lighthouse.mjs`

**Interfaces:**
- Produces: `pnpm turbo run test:lighthouse`, which fails when a page drops below the budgets. Reports go to `packages/e2e/.lighthouseci/<app>/` (git-ignored).

- [ ] **Step 1: Configs and runner**

`packages/e2e/lighthouserc.helpful-machines.cjs`:
```js
/** Lighthouse CI for Helpful Machines (mobile, default throttling). Reports stay local (filesystem). */
const base = "http://localhost:3001";
module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm --filter helpful-machines start",
      startServerReadyPattern: "Ready",
      url: ["/", "/pl", "/services", "/services/custom-apps-websites", "/pricing", "/contact"].map((p) => base + p),
      numberOfRuns: 3,
      settings: { chromeFlags: "--headless=new --no-sandbox" },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95, aggregationMethod: "median-run" }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        // Canonicals point at the production domain, not localhost; the build-output tests check them.
        canonical: "off",
        "resource-summary:script:size": ["error", { maxNumericValue: 184320 }],
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci/helpful-machines" },
  },
};
```

`packages/e2e/lighthouserc.tangent.cjs`:
```js
/** Lighthouse CI for Tangent (mobile). Pages are served in whichever design the fresh visitor is bucketed into. */
const base = "http://localhost:3002";
module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm --filter tangent start",
      startServerReadyPattern: "Ready",
      url: ["/", "/pl", "/services/fresh-look", "/work", "/work/onchain", "/about", "/contact"].map((p) => base + p),
      numberOfRuns: 3,
      settings: { chromeFlags: "--headless=new --no-sandbox" },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95, aggregationMethod: "median-run" }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        canonical: "off",
        "resource-summary:script:size": ["error", { maxNumericValue: 184320 }],
      },
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci/tangent" },
  },
};
```

`packages/e2e/scripts/lighthouse.mjs`:
```js
import { execFileSync } from "node:child_process";
import { chromium } from "@playwright/test";

// Use Playwright's Chromium so Lighthouse doesn't depend on a system Chrome.
const env = { ...process.env, CHROME_PATH: chromium.executablePath() };
let failed = false;
for (const app of ["helpful-machines", "tangent"]) {
  try {
    execFileSync("pnpm", ["exec", "lhci", "autorun", `--config=lighthouserc.${app}.cjs`], { stdio: "inherit", env });
  } catch {
    failed = true;
  }
}
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Run it**

Run: `cd /Users/pio/projects/pio-yoga && export NODE_OPTIONS=--no-network-family-autoselection && pnpm turbo run test:lighthouse`
Expected: all assertions pass for both apps.
- If a category is under budget, read the failing audits in `.lighthouseci/<app>/*.json` and fix the product test-first (for example LCP image priority, font preload, render-blocking CSS or a missing meta). Ledger each change.
- Only if the cause is the local machine or the emulation itself (for example a CPU-bound score that's consistently ≥ 0.95 on a re-run in CI), record a ruling with the evidence. Never lower a threshold.

- [ ] **Step 3: Commit**

```bash
git add packages/e2e
git commit -m "test(perf): Lighthouse CI budgets for both business sites

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: CI jobs for E2E, accessibility and Lighthouse

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add the jobs**

Append to the `jobs:` map in `.github/workflows/ci.yml`:
```yaml
  e2e:
    runs-on: ubuntu-latest
    needs: check
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @repo/e2e exec playwright install --with-deps chromium
      - run: pnpm turbo run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: packages/e2e/playwright-report

  lighthouse:
    runs-on: ubuntu-latest
    needs: check
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @repo/e2e exec playwright install --with-deps chromium
      - run: pnpm turbo run test:lighthouse
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: lighthouse
          path: packages/e2e/.lighthouseci
```

- [ ] **Step 2: Validate the YAML locally**

Run: `cd /Users/pio/projects/pio-yoga && node -e "const y=require('fs').readFileSync('.github/workflows/ci.yml','utf8'); for (const j of ['check:','e2e:','lighthouse:']) if(!y.includes('  '+j)) throw new Error(j); console.log('ok')"`
Expected: `ok`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: run E2E, accessibility and Lighthouse jobs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Screenshot design and accessibility review

**Files:**
- Create: `packages/e2e/scripts/screenshots.mjs`, `docs/quality/2026-10-13-design-review.md`

**Interfaces:**
- Produces: screenshots in `.superpowers/quality/screens/` (git-ignored), plus a written review. Critical and Important findings get fixed in this task. The user asked for full completion, so there's no pause for decisions. Minor findings are listed in the report.

- [ ] **Step 1: Screenshot script**

`packages/e2e/scripts/screenshots.mjs`:
```js
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const out = new URL("../../../.superpowers/quality/screens/", import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const shots = [];
for (const mode of ["light", "dark"]) {
  for (const [w, h, label] of [[1280, 900, "desktop"], [390, 844, "phone"]]) {
    for (const path of ["/", "/services/custom-apps-websites", "/contact", "/pl/pricing"]) shots.push({ app: "hm", base: "http://localhost:3001", cookie: null, mode, w, h, label, path });
    for (const variant of ["control", "editorial"]) {
      for (const path of ["/", "/work/onchain", "/about"]) shots.push({ app: `tangent-${variant}`, base: "http://localhost:3002", cookie: `design:${variant}`, mode, w, h, label, path });
    }
  }
}

const browser = await chromium.launch();
for (const s of shots) {
  const context = await browser.newContext({ viewport: { width: s.w, height: s.h }, reducedMotion: "reduce" });
  if (s.cookie) await context.addCookies([{ name: "exp", value: s.cookie, url: s.base }]);
  const page = await context.newPage();
  await page.addInitScript((m) => localStorage.setItem("colorMode", m), s.mode);
  await page.goto(s.base + s.path, { waitUntil: "networkidle" });
  const name = `${s.app}_${s.label}_${s.mode}_${s.path.replace(/\W+/g, "-") || "home"}.png`;
  await page.screenshot({ path: out + name, fullPage: true });
  await context.close();
}
await browser.close();
console.log(`${shots.length} screenshots → ${out}`);
```

- [ ] **Step 2: Capture**

Run (both apps built):
```bash
cd /Users/pio/projects/pio-yoga/apps/helpful-machines && (pnpm start > /tmp/hm.log 2>&1 &)
cd /Users/pio/projects/pio-yoga/apps/tangent && (pnpm start > /tmp/tg.log 2>&1 &)
sleep 6 && cd /Users/pio/projects/pio-yoga && pnpm --filter @repo/e2e screenshots
```
Expected: `64 screenshots → …/.superpowers/quality/screens/`.

- [ ] **Step 3: Review with the design skills**

Invoke `design:design-critique`, then `design:accessibility-review`, on the screenshots (open them with the Read tool), covering:
- hierarchy and spacing on phone and desktop
- readability of both Tangent designs in both modes
- tap target sizes
- visible focus (check with the keyboard on the running site)
- anything that looks broken (overflow, clipping, overlaps)

Write the findings to `docs/quality/2026-10-13-design-review.md`. Group them Critical / Important / Minor, and give each a screenshot name, what's wrong and a suggested fix.

- [ ] **Step 4: Fix Critical and Important findings**

For each Critical or Important finding:
1. Add a failing test where one can express it: a unit test in `@repo/ui`, a build-output test, or a Playwright assertion.
2. Fix it.
3. Re-run the affected suites.
4. Re-capture the screenshot.

Mark each finding "fixed in <commit>" in the report. Minor findings stay listed for the user. Stop the two servers afterwards (`lsof -ti tcp:3001,3002 | xargs -r kill`).

- [ ] **Step 5: Full verification and commit**

Run:
```bash
cd /Users/pio/projects/pio-yoga && export NODE_OPTIONS=--no-network-family-autoselection
pnpm typecheck && pnpm test && pnpm build && pnpm turbo run test:build && pnpm turbo run test:e2e
```
Expected: everything passes.

```bash
git add packages/e2e docs/quality packages apps
git commit -m "docs(quality): design and accessibility review with fixes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
