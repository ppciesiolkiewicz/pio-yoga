# Plan 3: Tangent site (two designs under A/B test)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Tangent site (`apps/tangent`) for the Australian (`/`) and Polish (`/pl`) markets. Every page is pre-rendered for both variants of the `design` experiment: `control` = dark precision, `editorial` = light editorial. Each design has a light and a dark colour mode. The site reuses `@repo/ui` and `@repo/web`, and adds a few shared improvements both sites need.

**Architecture:**
- Same shape as Helpful Machines: pages under `app/[bucket]/[locale]/…`, a pass-through root layout, a full-document root `not-found`, and middleware with `isKnownPath`.
- The bucket decides `<html data-design>` (`tangent-precision` or `tangent-editorial`). Each design is pure CSS (tokens plus a few `[data-design]` style hooks), so both variants share every component and only the look changes.

**Tech Stack:** Next 15.5, React 19, Tailwind v4, Radix (via `@repo/ui`), next-intl ^4.14.9, PostHog, `next/font` (Inter Tight, JetBrains Mono, Instrument Serif).

**Spec:** `docs/superpowers/specs/2026-10-11-multi-brand-monorepo-design.md`
**Builds on:** Plans 1 and 2 (merged to `main`).

## Positioning (decided with the user on 2026-10-12)

- **Main message:** analysing and improving processes and flows, connecting the dots, and bringing many years of experience, delivered as better processes plus custom apps and platforms. Idea-to-product is one of the offers.
- **Hero:**
  - Eyebrow: *Process, product and software · for startups*
  - Headline: **Connect the dots. Fix the flow.**
  - Subtitle: *We map how your product, data and team really work, find where things get stuck, and make it flow again: a simpler process, a smarter workflow, or a custom app built for exactly what you need. Over ten years of building fintech, e-commerce and health products, now working for you.*
- **Services, in order:** A fresh look → Process & workflow improvement → Custom apps & platforms → Product & idea sprints → Fractional tech lead → Payments, AI & Web3.
- **Process:** Listen → Map → Improve → Hand over.
- **Copy rules:** avoid clinical words ("diagnose", "diagnosis"), and don't mention yoga or dance teaching. A subtle nod to music and movement on About is fine. Work case studies use only resume facts and are credited as Piotr's work at those companies.
- **Difference from Helpful Machines:** the same way of thinking, aimed at startups and scale-ups, with a more senior tone and bigger platforms.

## Global Constraints

- Every page is SSG. Runtime pieces: middleware, `/api/contact`, and the root 404.
- Locales `en` (no prefix) and `pl` (`/pl/...`), with the same slugs. `<html lang>` is `en-AU` / `pl-PL`.
- Experiment `design`: variants `control` and `editorial`, weights 50/50, markets en and pl. The variant's description is the design key: `control` → `tangent-precision`, `editorial` → `tangent-editorial`.
- Public URLs never contain a bucket. Canonical, hreflang, sitemap and OG URLs are identical for both variants.
- Colour mode on `data-theme`. No-JS fallback via `prefers-color-scheme`. A single shared ColorModeSwitch store (Plan 2).
- Contrast: body text ≥ 4.5:1, large text and UI boundaries (input borders, focus, active nav) ≥ 3:1, in all 4 token sets.
- Consent banner on `pl` only. PostHog flags are disabled (Plan 2 fix). Exposure goes out as `$feature_flag_called` for `design`.
- Footer legal text: en `ABN 48 737 987 261`, pl `NIP: do uzupełnienia`.
- Never invent metrics. Collaborators appear only when `consent: true`. Never call collaborators employees.
- Local commands need `NODE_OPTIONS=--no-network-family-autoselection`. Never commit it.
- The app serves on port **3002** (`dev` / `start`).

## Review Focus

1. **The same visitor across pages and reloads.** The design stays the same (sticky bucket), and so does the colour mode. Switching colour mode in one design never shows another design's colours. Covered in Task 6 (build output: each bucket has its own `data-design`) and Task 2 (token selectors scoped by design and theme).
2. **Keyboard and screen-reader users in both designs.** Visible focus, ≥ 3:1 input borders (`border-control`), the connect-the-dots SVG hidden from assistive tech, one `h1` per page, no skipped heading levels on case-study pages. Covered in Tasks 1, 2 and 6.
3. **Case-study pages on a phone without JavaScript.** Problem, what changed, result and stack all render as plain HTML, and nothing depends on hover. Covered in Task 5.
4. **A Polish visitor:** geo `/pl`, Polish case studies and services, the footer English link keeps the page, and unknown `/pl/work/xyz` gets the branded 404 with status 404. Covered in Task 6 (smoke).
5. **Building or running locally over `http://`.** No `upgrade-insecure-requests` and no HSTS unless deployed on Vercel, so `next start` and Playwright work. Covered in Task 1 (security-headers tests).

## Deviations from the spec (decided in this plan)

- **Tangent services and pages follow the 2026-10-12 positioning above**, not the spec's original six services. There's no pricing page (startup work is quoted).
- **No sector filter on `/work`:** with 7 case studies a filter adds JS and no value. The Radix Tabs from the spec aren't needed.
- **One shared security-headers helper** (`@repo/web/headers`) for both apps. `upgrade-insecure-requests` and HSTS apply only when `VERCEL=1`. This fixes Plan 2's deferred minor about `http://localhost`.
- **New shared tokens:** `--button-radius` (`rounded-button`) and `--control-border` (`border-control`), so Tangent can use subtle card lines with properly visible input borders. Helpful Machines keeps its look: its `--button-radius` stays 12px and its `--control-border` matches `--line`.

---

## File structure

```
packages/web/src/headers.ts                     securityHeaders(), posthogRewrites()
packages/ui/src/styles/base.css                 + --radius-button, --color-control
packages/ui/src/styles/helpful-machines.css     + --button-radius, --control-border
packages/ui/src/styles/tangent.css              precision + editorial × light/dark, style hooks
packages/ui/src/components/
  Button.tsx (rounded-button)  Section.tsx / Hero.tsx (data-eyebrow, Hero visual slot)
  ChipList.tsx (data-chips)  ContactForm.tsx / ColorModeSwitch.tsx (border-control)
  ConnectDots.tsx  PersonCard.tsx
apps/helpful-machines/next.config.ts            uses @repo/web/headers
apps/tangent/
  package.json tsconfig.json vitest.config.ts vitest.build.config.ts next.config.ts postcss.config.mjs
  middleware.ts experiments.ts site.config.ts .env.example vercel.json README.md
  i18n/request.ts public/icon.svg
  content/{services,work,people,en,pl,index}.ts
  lib/{params,links,routes,metadata}.ts
  components/{Document,Logo,Breadcrumbs,Prose,CaseStudyCard}.tsx
  app/globals.css app/layout.tsx app/not-found.tsx app/sitemap.ts app/robots.ts
  app/api/contact/route.ts app/og/[locale]/[page]/route.tsx
  app/[bucket]/[locale]/{layout,page,not-found}.tsx
  app/[bucket]/[locale]/{services,services/[slug],work,work/[slug],about,contact,privacy,terms}/page.tsx
  test/{content,routes}.test.ts test-build/output.test.ts
```

---

### Task 1: Shared improvements: security headers helper, button radius, control borders, design hooks

**Files:**
- Create: `packages/web/src/headers.ts`, `packages/web/test/headers.test.ts`
- Modify: `packages/web/package.json` (export `./headers`), `apps/helpful-machines/next.config.ts`
- Modify: `packages/ui/src/styles/base.css`, `packages/ui/src/styles/helpful-machines.css`
- Modify: `packages/ui/src/components/{Button,Section,Hero,ChipList,ContactForm,ColorModeSwitch}.tsx`
- Test: `packages/ui/test/primitives.test.tsx`, `packages/ui/test/content.test.tsx`

**Interfaces:**
- Produces:
  - `securityHeaders(o: { dev: boolean; https: boolean }): { key: string; value: string }[]`
  - `posthogRewrites(): { source: string; destination: string }[]`
  - Utilities `rounded-button` and `border-control`
  - Eyebrows render with `data-eyebrow`, chip lists with `data-chips`
  - `Hero` accepts an optional `visual?: ReactNode`, shown beside the text on large screens and hidden on small ones

- [ ] **Step 1: Write the failing tests**

`packages/web/test/headers.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { posthogRewrites, securityHeaders } from "../src/headers";

const get = (headers: { key: string; value: string }[], key: string) => headers.find((h) => h.key === key)?.value;

describe("securityHeaders", () => {
  it("locks the CSP to self, with no framing, objects or foreign forms", () => {
    const csp = get(securityHeaders({ dev: false, https: true }), "Content-Security-Policy")!;
    for (const part of ["default-src 'self'", "frame-ancestors 'none'", "form-action 'self'", "object-src 'none'", "connect-src 'self'"]) {
      expect(csp).toContain(part);
    }
    expect(csp).not.toContain("unsafe-eval");
  });
  it("allows eval only in development", () =>
    expect(get(securityHeaders({ dev: true, https: false }), "Content-Security-Policy")).toContain("'unsafe-eval'"));
  it("upgrades requests and sends HSTS only over https deployments", () => {
    const deployed = securityHeaders({ dev: false, https: true });
    expect(get(deployed, "Content-Security-Policy")).toContain("upgrade-insecure-requests");
    expect(get(deployed, "Strict-Transport-Security")).toContain("max-age=63072000");
    const local = securityHeaders({ dev: false, https: false });
    expect(get(local, "Content-Security-Policy")).not.toContain("upgrade-insecure-requests");
    expect(get(local, "Strict-Transport-Security")).toBeUndefined();
  });
  it("sends the usual hardening headers", () => {
    const h = securityHeaders({ dev: false, https: true });
    expect(get(h, "X-Content-Type-Options")).toBe("nosniff");
    expect(get(h, "X-Frame-Options")).toBe("DENY");
    expect(get(h, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });
});

describe("posthogRewrites", () => {
  it("proxies the EU host and assets through /ingest", () =>
    expect(posthogRewrites()).toEqual([
      { source: "/ingest/static/:path*", destination: "https://eu-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/:path*", destination: "https://eu.i.posthog.com/:path*" },
    ]));
});
```

Append to `packages/ui/test/primitives.test.tsx`:
```tsx
describe("design hooks", () => {
  it("buttons use the per-design button radius", () => {
    expect(buttonClasses("primary")).toContain("rounded-button");
    expect(buttonClasses("secondary")).toContain("rounded-button");
  });
  it("section eyebrows carry data-eyebrow for design styling", () => {
    render(<Section id="x" eyebrow="What we do" title="T">x</Section>);
    expect(screen.getByText("What we do").hasAttribute("data-eyebrow")).toBe(true);
  });
  it("chip lists carry data-chips", () => {
    render(<ChipList items={["A"]} label="L" />);
    expect(screen.getByRole("list", { name: "L" }).hasAttribute("data-chips")).toBe(true);
  });
});
```

Append to `packages/ui/test/content.test.tsx`:
```tsx
describe("Hero visual slot", () => {
  it("renders an optional decorative visual and marks the eyebrow", () => {
    const { container } = render(
      <Hero eyebrow="E" title="T" lead="L" primary={{ href: "/c", label: "Go" }} visual={<svg data-testid="v" aria-hidden="true" />} />,
    );
    expect(container.querySelector('[data-testid="v"]')).not.toBeNull();
    expect(screen.getByText("E").hasAttribute("data-eyebrow")).toBe(true);
  });
});
```

Append to `packages/ui/test/contact-form.test.tsx`:
```tsx
describe("ContactForm borders", () => {
  it("draws inputs with the control border token (≥3:1 in every design)", () => {
    render(<ContactForm locale="en" labels={labels} email="hello@attunr.com" />);
    expect(screen.getByLabelText("Your name").className).toContain("border-control");
  });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `cd /Users/pio/projects/pio-yoga && pnpm --filter @repo/web test headers; pnpm --filter @repo/ui test`
Expected: web FAILS ("Cannot find module '../src/headers'"). ui FAILS on `rounded-button`, `data-eyebrow`, `data-chips`, the Hero visual slot and `border-control`.

- [ ] **Step 3: Implement**

`packages/web/src/headers.ts`:
```ts
/**
 * Security headers shared by the Next apps. Next's App Router inlines bootstrap scripts, so a static
 * site can't use nonces: script-src allows 'unsafe-inline'. Upgrades and HSTS only on https deploys,
 * so `next start` and E2E tests over http://localhost keep working.
 */
export function securityHeaders(o: { dev: boolean; https: boolean }): { key: string; value: string }[] {
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${o.dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    ...(o.https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ...(o.https ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
  ];
}

/** PostHog EU, proxied through the site's own /ingest so ad-blockers and CSP stay simple. */
export function posthogRewrites() {
  return [
    { source: "/ingest/static/:path*", destination: "https://eu-assets.i.posthog.com/static/:path*" },
    { source: "/ingest/:path*", destination: "https://eu.i.posthog.com/:path*" },
  ];
}
```

In `packages/web/package.json` exports add `"./headers": "./src/headers.ts",`.

Replace `apps/helpful-machines/next.config.ts` with:
```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { posthogRewrites, securityHeaders } from "@repo/web/headers";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@repo/ui", "@repo/web"],
  images: { formats: ["image/avif", "image/webp"] },
  // PostHog's API paths end with a slash; don't redirect them.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return posthogRewrites();
  },
  async headers() {
    const headers = securityHeaders({ dev: process.env.NODE_ENV === "development", https: process.env.VERCEL === "1" });
    return [{ source: "/(.*)", headers }];
  },
};

export default withNextIntl(config);
```
(If `next.config.ts` can't import a workspace TS file, which shows up as "Cannot find module '@repo/web/headers'" during `next build`, add `"@repo/web": "workspace:*"` resolution through `transpilePackages`. That doesn't apply to config files, so instead fall back to a relative import `../../packages/web/src/headers` and ledger it.)

In `packages/ui/src/styles/base.css`, inside `@theme inline`, add:
```css
  --radius-button: var(--button-radius);
  --color-control: var(--control-border);
```

In `packages/ui/src/styles/helpful-machines.css`, in the first (light) block add:
```css
  --button-radius: 12px;
  --control-border: #1e1a15;
```
and in **both** dark blocks add:
```css
  --control-border: #fff3e2;
```

In `packages/ui/src/components/Button.tsx`, replace `rounded-card` with `rounded-button` in the `primary` and `secondary` variant strings.

In `packages/ui/src/components/Section.tsx`, change the eyebrow line to:
```tsx
        {eyebrow && <p data-eyebrow className="mb-3 text-sm font-bold uppercase tracking-widest text-accent-text">{eyebrow}</p>}
```

In `packages/ui/src/components/ChipList.tsx`, change `<ul aria-label={label} className="flex flex-wrap gap-2">` to `<ul data-chips aria-label={label} className="flex flex-wrap gap-2">`.

Replace `packages/ui/src/components/Hero.tsx` with:
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
  visual,
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
  /** Decorative illustration beside the text on large screens (must be aria-hidden). */
  visual?: ReactNode;
}) {
  return (
    <section aria-labelledby="hero-title" className="pt-12 pb-14 sm:pt-20 sm:pb-20">
      <Container className={visual ? "grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]" : undefined}>
        <div>
          {eyebrow && (
            <p data-eyebrow className="mb-4 text-sm font-bold uppercase tracking-widest text-accent-text">
              {eyebrow}
            </p>
          )}
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
        </div>
        {visual && <div className="hidden lg:block">{visual}</div>}
      </Container>
    </section>
  );
}
```

In `packages/ui/src/components/ContactForm.tsx`, change `inputClass` to:
```ts
const inputClass = "min-h-11 w-full rounded-card border-2 border-control bg-surface px-3 py-2 text-ink";
```

In `packages/ui/src/components/ColorModeSwitch.tsx`, change the root class `border-line` to `border-control`.

- [ ] **Step 4: Run all tests, typecheck and build Helpful Machines**

Run:
```bash
cd /Users/pio/projects/pio-yoga && export NODE_OPTIONS=--no-network-family-autoselection
pnpm --filter @repo/web test && pnpm --filter @repo/ui test && pnpm typecheck
pnpm --filter helpful-machines build > /tmp/hm.txt 2>&1 && pnpm --filter helpful-machines test:build
```
Expected: everything PASSES. Helpful Machines looks the same (its button radius and control border equal the previous values).

- [ ] **Step 5: Commit**

```bash
git add packages apps/helpful-machines
git commit -m "feat: shared security headers, button radius and control-border tokens, design hooks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Tangent design tokens, ConnectDots and PersonCard

**Files:**
- Create: `packages/ui/src/styles/tangent.css`, `packages/ui/src/components/ConnectDots.tsx`, `packages/ui/src/components/PersonCard.tsx`
- Test: `packages/ui/test/tangent.test.tsx`

**Interfaces:**
- Consumes: `Card` (Plan 2).
- Produces:
  - `[data-design="tangent-precision"]` and `[data-design="tangent-editorial"]` token sets (light and dark, plus the no-JS fallback)
  - Classes `.tg-accent` (headline accent words) and `.tg-dots` (the ConnectDots svg)
  - `ConnectDots({ labels: { idea, market, users, data, tech, product } })`: a decorative `aria-hidden` svg
  - `PersonCard({ name, role, bio?, photo?: { src, alt }, links?: { label, href }[], headingLevel? })`, which shows a monogram avatar when there's no photo
  - `initials(name: string): string`

- [ ] **Step 1: Write the failing test**

`packages/ui/test/tangent.test.tsx`:
```tsx
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConnectDots } from "../src/components/ConnectDots";
import { initials, PersonCard } from "../src/components/PersonCard";

const css = readFileSync(new URL("../src/styles/tangent.css", import.meta.url), "utf8");

describe("tangent tokens", () => {
  it("defines both designs in light, dark and the no-JS fallback", () => {
    for (const design of ["tangent-precision", "tangent-editorial"]) {
      expect(css).toContain(`:root[data-design="${design}"] {`);
      expect(css).toContain(`:root[data-design="${design}"][data-theme="dark"]`);
      expect(css).toContain(`:root[data-design="${design}"]:not([data-theme])`);
    }
  });
  it("sets every token the components use, in every set", () => {
    const blocks = css.split(/\n(?=:root|@media)/).filter((b) => b.includes("--bg:"));
    expect(blocks.length).toBe(6);
    for (const block of blocks) {
      for (const token of ["--bg", "--surface", "--ink", "--muted", "--line", "--control-border", "--accent", "--accent-text", "--accent-ink", "--highlight", "--focus"]) {
        expect(block, token).toContain(`${token}:`);
      }
    }
  });
});

describe("ConnectDots", () => {
  it("is decorative and labels each dot", () => {
    const { container } = render(
      <ConnectDots labels={{ idea: "idea", market: "market", users: "users", data: "data", tech: "tech", product: "product" }} />,
    );
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.classList.contains("tg-dots")).toBe(true);
    expect([...svg.querySelectorAll("text")].map((t) => t.textContent)).toEqual(["idea", "market", "users", "data", "tech", "product"]);
  });
});

describe("PersonCard", () => {
  it("derives initials", () => {
    expect(initials("Piotr Ciesiolkiewicz")).toBe("PC");
    expect(initials("Ana")).toBe("A");
    expect(initials("  maria  de la cruz ")).toBe("MC");
  });
  it("shows a monogram when there's no photo", () => {
    render(<PersonCard name="Piotr Ciesiolkiewicz" role="Founder" links={[{ label: "LinkedIn", href: "https://linkedin.com/in/x" }]} />);
    expect(screen.getByRole("heading", { level: 3, name: "Piotr Ciesiolkiewicz" })).toBeTruthy();
    expect(screen.getByText("PC").getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("link", { name: "LinkedIn" }).getAttribute("href")).toBe("https://linkedin.com/in/x");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @repo/ui test tangent`
Expected: FAIL (missing `tangent.css` and components).

- [ ] **Step 3: Implement**

`packages/ui/src/styles/tangent.css` (values approved by the user on 2026-10-12):
```css
/* ---------- Tangent A: dark precision (variant "control") ---------- */
:root[data-design="tangent-precision"] {
  --bg: #f7f7f5;
  --surface: #ffffff;
  --ink: #0b0c0e;
  --muted: #4a4f57;
  --line: #dadce0;
  --control-border: #80858e;
  --accent: #e05e00;
  --accent-text: #b34700;
  --accent-ink: #0b0c0e;
  --highlight: #ffd9bf;
  --focus: #0b0c0e;
  --grid: #ececea;
  --radius: 10px;
  --button-radius: 8px;
  --cta-shadow: none;
  --card-shadow: none;
  --font-display-family: var(--font-inter-tight);
  --font-body-family: var(--font-inter-tight);
  --font-mono-family: var(--font-jetbrains);
  color-scheme: light;
}
:root[data-design="tangent-precision"][data-theme="dark"] {
  --bg: #0b0c0e;
  --surface: #121418;
  --ink: #ecedef;
  --muted: #a0a5ae;
  --line: #23262c;
  --control-border: #6b717c;
  --accent: #ff7a1a;
  --accent-text: #ff9a4d;
  --accent-ink: #0b0c0e;
  --highlight: #5a2d0c;
  --focus: #ff9a4d;
  --grid: #16181c;
  color-scheme: dark;
}
@media (prefers-color-scheme: dark) {
:root[data-design="tangent-precision"]:not([data-theme]) {
  --bg: #0b0c0e;
  --surface: #121418;
  --ink: #ecedef;
  --muted: #a0a5ae;
  --line: #23262c;
  --control-border: #6b717c;
  --accent: #ff7a1a;
  --accent-text: #ff9a4d;
  --accent-ink: #0b0c0e;
  --highlight: #5a2d0c;
  --focus: #ff9a4d;
  --grid: #16181c;
  color-scheme: dark;
}
}

/* ---------- Tangent B: light editorial (variant "editorial") ---------- */
:root[data-design="tangent-editorial"] {
  --bg: #fafaf7;
  --surface: #ffffff;
  --ink: #111111;
  --muted: #555555;
  --line: #dddddd;
  --control-border: #808080;
  --accent: #e5402a;
  --accent-text: #c2321e;
  --accent-ink: #111111;
  --highlight: #f6d4cd;
  --focus: #111111;
  --radius: 4px;
  --button-radius: 999px;
  --cta-shadow: none;
  --card-shadow: none;
  --font-display-family: var(--font-inter-tight);
  --font-body-family: var(--font-inter-tight);
  --font-serif-family: var(--font-instrument);
  color-scheme: light;
}
:root[data-design="tangent-editorial"][data-theme="dark"] {
  --bg: #141311;
  --surface: #1c1b18;
  --ink: #f2efe8;
  --muted: #b3ada2;
  --line: #34312c;
  --control-border: #7d776d;
  --accent: #ff6b55;
  --accent-text: #ff8a78;
  --accent-ink: #141311;
  --highlight: #5a2620;
  --focus: #f2efe8;
  color-scheme: dark;
}
@media (prefers-color-scheme: dark) {
:root[data-design="tangent-editorial"]:not([data-theme]) {
  --bg: #141311;
  --surface: #1c1b18;
  --ink: #f2efe8;
  --muted: #b3ada2;
  --line: #34312c;
  --control-border: #7d776d;
  --accent: #ff6b55;
  --accent-text: #ff8a78;
  --accent-ink: #141311;
  --highlight: #5a2620;
  --focus: #f2efe8;
  color-scheme: dark;
}
}

/* ---------- Design style hooks (same components, different look) ---------- */
[data-design="tangent-precision"] body {
  background-image: linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 28px 28px;
}
[data-design="tangent-precision"] [data-eyebrow] {
  font-family: var(--font-mono-family), ui-monospace, monospace;
  font-weight: 500;
  letter-spacing: 0.08em;
}
[data-design="tangent-precision"] [data-eyebrow]::before {
  content: "// ";
}
[data-design="tangent-precision"] [data-chips] li {
  border: 0;
  background: none;
  padding: 0 0.75rem 0 0;
  font-family: var(--font-mono-family), ui-monospace, monospace;
  font-weight: 500;
  color: var(--muted);
}
[data-design="tangent-precision"] .tg-accent {
  font-style: normal;
  color: var(--muted);
}
[data-design="tangent-precision"] h1,
[data-design="tangent-precision"] h2,
[data-design="tangent-precision"] h3 {
  font-weight: 600;
}

[data-design="tangent-editorial"] main {
  counter-reset: tg-section;
}
[data-design="tangent-editorial"] main [data-eyebrow]::before {
  counter-increment: tg-section;
  content: counter(tg-section, decimal-leading-zero) " — ";
}
[data-design="tangent-editorial"] .tg-accent {
  font-family: var(--font-serif-family), Georgia, serif;
  font-style: italic;
  font-weight: 400;
}
[data-design="tangent-editorial"] h1,
[data-design="tangent-editorial"] h2 {
  font-weight: 500;
}
[data-design="tangent-editorial"] [data-chips] li {
  border-width: 1px;
}

/* Connect-the-dots hero illustration: the path draws itself once. */
.tg-dots .tg-path {
  stroke-dasharray: 320;
  stroke-dashoffset: 320;
  animation: tg-draw 1.4s 0.3s ease-out forwards;
}
@keyframes tg-draw {
  to {
    stroke-dashoffset: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tg-dots .tg-path {
    stroke-dashoffset: 0;
  }
}
```

`packages/ui/src/components/ConnectDots.tsx`:
```tsx
type Labels = { idea: string; market: string; users: string; data: string; tech: string; product: string };

/** Decorative: scattered dots joined into one path that ends at the product. */
export function ConnectDots({ labels }: { labels: Labels }) {
  return (
    <svg className="tg-dots h-auto w-full max-w-md" viewBox="0 0 240 200" aria-hidden="true" focusable="false">
      <g stroke="var(--line)" strokeWidth="1" strokeDasharray="3 4" fill="none">
        <path d="M30 40 L95 70 M40 150 L95 70 M95 70 L150 120 M120 25 L150 120 M60 105 L150 120" />
      </g>
      <path className="tg-path" d="M30 40 L95 70 L150 120 L215 150" stroke="var(--accent)" strokeWidth="2" fill="none" />
      <g fill="var(--bg)" stroke="var(--ink)" strokeWidth="1.4">
        <circle cx="30" cy="40" r="6" />
        <circle cx="40" cy="150" r="5" />
        <circle cx="120" cy="25" r="5" />
        <circle cx="60" cy="105" r="4" />
        <circle cx="95" cy="70" r="6" />
        <circle cx="150" cy="120" r="6" />
      </g>
      <circle cx="215" cy="150" r="11" fill="var(--accent)" />
      <g fontSize="9" fill="var(--muted)" fontFamily="var(--font-mono-family), ui-monospace, monospace">
        <text x="18" y="28">{labels.idea}</text>
        <text x="104" y="16">{labels.market}</text>
        <text x="20" y="168">{labels.users}</text>
        <text x="66" y="100">{labels.data}</text>
        <text x="160" y="112">{labels.tech}</text>
        <text x="186" y="178">{labels.product}</text>
      </g>
    </svg>
  );
}
```

`packages/ui/src/components/PersonCard.tsx`:
```tsx
import Image from "next/image";
import { Card } from "./Card";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0]!.charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : "";
  return (first + last).toUpperCase();
}

export function PersonCard({
  name,
  role,
  bio,
  photo,
  links = [],
  headingLevel: Heading = "h3",
}: {
  name: string;
  role: string;
  bio?: string;
  photo?: { src: string; alt: string };
  links?: { label: string; href: string }[];
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Card as="article" className="flex h-full flex-col gap-4">
      {photo ? (
        <Image src={photo.src} alt={photo.alt} width={96} height={96} className="size-24 rounded-full object-cover" />
      ) : (
        <span aria-hidden="true" className="grid size-24 place-items-center rounded-full bg-accent font-display text-2xl font-bold text-accent-ink">
          {initials(name)}
        </span>
      )}
      <div>
        <Heading className="font-display text-xl font-bold">{name}</Heading>
        <p className="text-muted">{role}</p>
      </div>
      {bio && <p>{bio}</p>}
      {links.length > 0 && (
        <ul className="mt-auto flex flex-wrap gap-x-4">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="inline-flex min-h-11 items-center font-bold underline underline-offset-4" rel="noopener noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
```

- [ ] **Step 4: Run the tests and typecheck**

Run: `pnpm --filter @repo/ui test && pnpm --filter @repo/ui typecheck`
Expected: PASS. Typecheck clean.

- [ ] **Step 5: Commit**

```bash
git add packages/ui
git commit -m "feat(ui): Tangent precision and editorial designs (light/dark), ConnectDots, PersonCard

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Tangent package and content (English and Polish draft)

**Files:**
- Create: `apps/tangent/{package.json,tsconfig.json,vitest.config.ts,experiments.ts}`
- Create: `apps/tangent/content/{services,work,people,en,pl,index}.ts`
- Test: `apps/tangent/test/content.test.ts`

**Interfaces:**
- Consumes: `defineExperiments`, `collectStrings`.
- Produces:
  - `experiments.design` (variants `control: "tangent-precision"`, `editorial: "tangent-editorial"`)
  - `serviceSlugs`, `isServiceSlug`, `workSlugs`, `isWorkSlug`, `featuredWork`
  - `people: Person[]` with `type Person = { id: "piotr"; name: string; kind: "lead" | "collaborator"; consent: boolean; photo?: { src: string }; links: { label: string; href: string }[] }`, and `visiblePeople(): Person[]`
  - `en`, `type Content = typeof en`, `pl: Content`, `getContent(locale)`
  - Keys used later: `meta.*`, `nav`, `hero` (`eyebrow`, `title: [string, string]`, `lead`, `secondary`, `proof`, `proofLabel`, `dots`), `flows`, `services` (`items[slug]` with `title`, `summary`, `intro`, `signs`, `whatWeDo`, `outcomes`, `faq`), `process`, `work` (`items[slug]` with `client`, `sector`, `period`, `title`, `summary`, `problem`, `whatChanged`, `result`, `stack`, plus `credit` containing `{client}`), `about`, `people.items[id]` (`role`, `bio`), `cta`, `contact` (with `form` = `ContactFormLabels`), `footer`, `consent`, `privacy`, `terms`, `notFound`

- [ ] **Step 1: Create the package**

`apps/tangent/package.json`:
```json
{
  "name": "tangent",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "start": "next start -p 3002",
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

`apps/tangent/tsconfig.json`:
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

`apps/tangent/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["test/**/*.test.ts"] },
});
```

Run: `cd /Users/pio/projects/pio-yoga && pnpm install`
Expected: installs and links the `tangent` workspace.

- [ ] **Step 2: Write the failing content test**

`apps/tangent/test/content.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { collectStrings } from "@repo/web/content-rules";
import { en } from "../content/en";
import { people, visiblePeople } from "../content/people";
import { pl } from "../content/pl";
import { serviceSlugs } from "../content/services";
import { featuredWork, workSlugs } from "../content/work";
import { experiments } from "../experiments";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return "array";
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(obj).sort().map((k) => [k, shape(obj[k])]));
  }
  return typeof value;
}

describe("Tangent content", () => {
  it("Polish has exactly the same shape as English", () => expect(shape(pl)).toEqual(shape(en)));

  it("has no empty strings", () => {
    for (const dict of [en, pl]) for (const { path, value } of collectStrings(dict)) expect(value.trim(), path).not.toBe("");
  });

  it("covers every service, case study and person in both languages", () => {
    for (const dict of [en, pl]) {
      expect(Object.keys(dict.services.items).sort()).toEqual([...serviceSlugs].sort());
      expect(Object.keys(dict.work.items).sort()).toEqual([...workSlugs].sort());
      expect(Object.keys(dict.people.items).sort()).toEqual(people.map((p) => p.id).sort());
      for (const slug of workSlugs) {
        const item = dict.work.items[slug];
        expect(item.whatChanged.length, slug).toBeGreaterThan(0);
        expect(item.stack.length, slug).toBeGreaterThan(0);
      }
    }
    for (const slug of featuredWork) expect(workSlugs).toContain(slug);
  });

  it("keeps the agreed positioning", () => {
    expect(en.hero.title.join("")).toBe("Connect the dots. Fix the flow.");
    expect(serviceSlugs[0]).toBe("fresh-look");
    for (const dict of [en, pl]) {
      const text = collectStrings(dict).map((s) => s.value.toLowerCase()).join(" ");
      expect(text).not.toMatch(/diagnos/);
      expect(text).not.toMatch(/yoga|joga|dance teacher|nauczyciel tańca/);
    }
  });

  it("never invents metrics in case studies", () => {
    for (const dict of [en, pl]) {
      for (const slug of workSlugs) {
        const { result, summary } = dict.work.items[slug];
        expect(`${result} ${summary}`, slug).not.toMatch(/\d+\s?%|\d+x\b/);
      }
    }
  });

  it("credits case studies as Piotr's work at the client", () => {
    for (const dict of [en, pl]) expect(dict.work.credit).toContain("{client}");
  });

  it("only shows people who consented", () => {
    expect(visiblePeople().every((p) => p.consent)).toBe(true);
    expect(visiblePeople().map((p) => p.id)).toContain("piotr");
  });

  it("design variants map to the two design keys", () =>
    expect(experiments.design.variants).toEqual({ control: "tangent-precision", editorial: "tangent-editorial" }));
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm --filter tangent test`
Expected: FAIL, "Cannot find module '../content/en'".

- [ ] **Step 4: Experiment, slugs and people**

`apps/tangent/experiments.ts`:
```ts
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
```

`apps/tangent/content/services.ts`:
```ts
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
```

`apps/tangent/content/work.ts`:
```ts
export const workSlugs = ["onchain", "lysn", "highsnobiety", "officeworks", "udrew", "displaysweet", "nokia"] as const;
export type WorkSlug = (typeof workSlugs)[number];
export const featuredWork: readonly WorkSlug[] = ["onchain", "lysn", "officeworks"];

export function isWorkSlug(value: string): value is WorkSlug {
  return (workSlugs as readonly string[]).includes(value);
}
```

`apps/tangent/content/people.ts`:
```ts
/** Language-neutral facts. Roles and bios live in content/<locale>.ts under people.items[id]. */
export type Person = {
  id: "piotr";
  name: string;
  kind: "lead" | "collaborator";
  /** Shown on the site only when true (written consent for name, photo and bio). */
  consent: boolean;
  photo?: { src: string };
  links: { label: string; href: string }[];
};

export const people: Person[] = [
  {
    id: "piotr",
    name: "Piotr Ciesiolkiewicz",
    kind: "lead",
    consent: true,
    links: [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/piotr-ciesiolkiewicz" },
      { label: "GitHub", href: "https://github.com/ppciesiolkiewicz" },
    ],
  },
];

export function visiblePeople(): Person[] {
  return people.filter((person) => person.consent);
}
```

- [ ] **Step 5: English content**

`apps/tangent/content/en.ts`:
```ts
/** English (Australia). The type source for every other locale. */
export const en = {
  meta: {
    siteDescription:
      "Tangent helps startups connect the dots: we map how your product, data and team work, fix what's stuck, and build the custom apps and platforms you need. Over ten years in fintech, e-commerce and health.",
    home: {
      title: "Tangent · Process, product and software for startups",
      description:
        "Tangent helps startups connect the dots: we map how your product, data and team work, fix what's stuck, and build the custom apps and platforms you need.",
    },
    services: {
      title: "Services · process improvement, custom apps and technical leadership",
      description:
        "A fresh look at how your startup works, process and workflow improvement, custom apps and platforms, product sprints, fractional tech leadership, and payments, AI and Web3.",
    },
    work: {
      title: "Work · problems we've solved",
      description: "Case studies from fintech, health, e-commerce, retail, property tech and telecoms: the problem, what changed, and the result.",
    },
    about: {
      title: "About · the people behind Tangent",
      description:
        "Tangent is led by Piotr Ciesiolkiewicz, a software engineer and problem-solver with more than ten years of experience, with a network of senior specialists.",
    },
    contact: { title: "Contact · book a call", description: "Book a 30-minute call about your product, your processes or your idea. No obligation." },
    privacy: { title: "Privacy policy", description: "How Tangent handles personal information and analytics." },
    terms: { title: "Terms", description: "The terms for working with Tangent." },
  },
  nav: {
    services: "Services",
    work: "Work",
    about: "About",
    contact: "Contact",
    cta: "Book a call",
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
    eyebrow: "Process, product and software · for startups",
    title: ["Connect the dots. ", "Fix the flow."],
    lead: "We map how your product, data and team really work, find where things get stuck, and make it flow again: a simpler process, a smarter workflow, or a custom app built for exactly what you need. Over ten years of building fintech, e-commerce and health products, now working for you.",
    secondary: "See the work",
    proofLabel: "Experience",
    proof: ["10+ years building products", "Fintech & DeFi", "E-commerce", "Health", "Telecoms"],
    dots: { idea: "idea", market: "market", users: "users", data: "data", tech: "tech", product: "product" },
  },
  flows: {
    eyebrow: "What we do",
    title: "We look at the whole picture",
    intro:
      "Most problems in a growing startup don't live in one place. They sit between the product, the data, the tools and the people. We find where things get stuck and fix the cause.",
    items: [
      {
        title: "Slow, stressful releases",
        body: "We look at how work moves from idea to production, remove the waiting and the handoffs, and add the testing that lets you ship with confidence.",
      },
      { title: "Numbers nobody trusts", body: "We trace where your data comes from, close the gaps, and give the team reports they can act on." },
      {
        title: "Workarounds everywhere",
        body: "Spreadsheets, copy-paste and manual steps usually point to a missing tool. We build the custom app or integration that removes them.",
      },
      { title: "An idea that needs a path", body: "We shape it, test it with real users and data, and build the first version properly." },
    ],
  },
  services: {
    eyebrow: "Services",
    title: "How we can help",
    intro: "Start small with a fresh look, or bring us in for the whole journey from idea to platform.",
    linkLabel: "Learn more",
    signsTitle: "Signs you need this",
    whatWeDoTitle: "What we do",
    outcomesTitle: "What you get",
    faqTitle: "Questions",
    items: {
      "fresh-look": {
        title: "A fresh look",
        summary: "A fixed-price review of how work, data and customers flow through your startup, with a short list of the improvements worth making.",
        intro:
          "Sometimes you're too close to see what's slowing you down. In one to two weeks we look at your product, tech and processes with fresh eyes and tell you clearly what to change first.",
        signs: [
          "Releases keep slipping and nobody's quite sure why",
          "The same bugs and incidents keep coming back",
          "You're about to raise, hire or rebuild and want a second opinion",
        ],
        whatWeDo: [
          "Talk to your team and look at real work, not just documents",
          "Map how ideas, code, data and customers move through the business",
          "Review architecture, code and tooling where it matters",
          "Find the root causes behind the symptoms",
        ],
        outcomes: ["A short, prioritised list of improvements", "Effort and impact for each one", "A clear first step, whoever does the work"],
        faq: [
          { question: "Do we have to hire you for the work afterwards?", answer: "No. The review is yours to use however you like." },
          {
            question: "How much access do you need?",
            answer: "Usually a few conversations, read access to code and tools, and a look at your metrics. We're happy to sign an NDA.",
          },
        ],
      },
      "process-workflow": {
        title: "Process & workflow improvement",
        summary: "Fewer handoffs, less waiting and fewer mistakes, with automation where it pays off.",
        intro:
          "Good teams get slowed down by bad flows: waiting for reviews, manual steps, unclear ownership. We find the friction and remove it, without adding bureaucracy.",
        signs: ["Work waits in queues more than it moves", "Releases are stressful and manual", "Everyone keeps their own spreadsheet"],
        whatWeDo: [
          "Map the real flow, from idea to production and from order to delivery",
          "Remove waiting, handoffs and duplicate work",
          "Automate the repetitive steps and add checks that catch mistakes early",
          "Work alongside the team so the new way sticks",
        ],
        outcomes: ["A faster, calmer path to production", "Automations that save hours every week", "A team that owns the improved process"],
        faq: [
          {
            question: "Is this only about engineering?",
            answer: "No. We look at any flow that slows the business down, from releases to onboarding, orders and reporting.",
          },
        ],
      },
      "custom-apps-platforms": {
        title: "Custom apps & platforms",
        summary: "From idea to product, or the internal tool your team keeps wishing for.",
        intro:
          "When off-the-shelf tools don't fit, we design and build software around how your business actually works: web apps, platforms, integrations and internal tools.",
        signs: [
          "Workarounds and copy-paste are holding things together",
          "You have an idea that needs a first version people can use",
          "Your platform needs to grow without a rewrite",
        ],
        whatWeDo: [
          "Shape the product with you before writing code",
          "Build full stack with React, Node.js, NestJS, Django, Postgres and the cloud",
          "Design for growth: event-driven backends, clean data models, sensible architecture",
          "Test properly, so changes are safe",
        ],
        outcomes: ["Software you own, built for your flow", "A codebase your team can maintain", "Documentation and a proper handover"],
        faq: [
          { question: "Do you build mobile apps?", answer: "Yes, with React Native or web apps that work well on phones." },
          { question: "Who owns the code?", answer: "You do, from day one." },
        ],
      },
      "product-sprints": {
        title: "Product & idea sprints",
        summary: "Shape and test a new idea before you spend on building it.",
        intro:
          "The most expensive mistakes happen before the first line of code. A short sprint turns an idea into a clear, tested plan, and often a prototype you can put in front of users or investors.",
        signs: [
          "You have an idea but not a clear first version",
          "The team can't agree on what to build next",
          "You need something real to show customers or investors",
        ],
        whatWeDo: [
          "Clarify the problem, the users and what success looks like",
          "Find the riskiest assumptions and test them with real users and data",
          "Define the smallest product worth building",
          "Prototype it when that's the fastest way to learn",
        ],
        outcomes: ["A tested idea and a clear scope", "A costed build plan", "Often a clickable prototype"],
        faq: [{ question: "How long is a sprint?", answer: "Usually one to two weeks, at a fixed price agreed upfront." }],
      },
      "fractional-tech-lead": {
        title: "Fractional tech lead",
        summary: "Senior judgement on architecture, hiring and vendors, without a full-time hire.",
        intro:
          "Not every startup needs a full-time CTO yet, but every startup needs good technical decisions. We join for a few days a month to guide architecture, review work and help you hire.",
        signs: [
          "You rely on an agency or freelancers without a technical owner",
          "Big technical decisions are coming up",
          "You're about to hire your first engineers",
        ],
        whatWeDo: [
          "Own the technical roadmap with you",
          "Review architecture, code and vendor work",
          "Help hire and onboard engineers",
          "Represent tech in investor and partner conversations",
        ],
        outcomes: ["Clear technical direction", "Better vendors and better hires", "A team set up to grow"],
        faq: [{ question: "How much time do you commit?", answer: "Anything from a few hours a week to a few days a month, adjusted as you grow." }],
      },
      "payments-ai-web3": {
        title: "Payments, AI & Web3",
        summary: "Specialist depth in payments, subscriptions, AI features and blockchain.",
        intro:
          "Some problems need people who've done it before. We've built card-to-crypto payments, subscription engines, Medicare gap payments and checkouts for limited-edition drops, and we use AI where it genuinely helps.",
        signs: [
          "You're adding payments, subscriptions or pricing logic",
          "You want AI features that do something useful",
          "You're building on blockchain and need it to feel like normal fintech",
        ],
        whatWeDo: [
          "Payments and subscriptions with Stripe or crypto rails",
          "Pricing logic that's flexible and auditable",
          "AI features and automations with clear guardrails",
          "Smart contracts and account abstraction (ERC-4337) for gasless, user-friendly flows",
        ],
        outcomes: ["Payment flows that stay correct under load", "AI that earns its place", "Web3 that feels like a normal app"],
        faq: [
          {
            question: "Do you only work on crypto projects?",
            answer: "No. Payments and pricing work applies to any business. Web3 is one specialty among several.",
          },
        ],
      },
    },
  },
  process: {
    eyebrow: "How we work",
    title: "Listen. Map. Improve. Hand over.",
    intro: "Small, visible steps, and you always know what's next.",
    steps: [
      { title: "Listen", body: "We learn how your product, team and customers really work, and what success looks like for you." },
      { title: "Map", body: "We map the flows, the data and the pain points, and agree on the few changes that matter most." },
      { title: "Improve", body: "We fix the process, build the custom app or platform, or both, in small steps you can see." },
      { title: "Hand over", body: "Your team owns the result, with documentation and support until it runs on its own." },
    ],
  },
  work: {
    eyebrow: "Work",
    title: "Problems we've solved",
    intro:
      "The experience behind Tangent, from fintech to telecoms. Each story starts with a problem, not a technology.",
    link: "See all work",
    credit: "Work by Piotr Ciesiolkiewicz while working with {client}.",
    problemTitle: "The problem",
    changedTitle: "What changed",
    resultTitle: "The result",
    stackTitle: "Stack",
    readMore: "Read the case study",
    items: {
      onchain: {
        client: "ONCHAIN",
        sector: "Fintech · DeFi",
        period: "2024–2026",
        title: "Card-to-crypto payments, built to run lean",
        summary: "Payment rails that let people buy tens of thousands of cryptocurrencies by card, with gasless transactions and smart treasury management.",
        problem:
          "A DeFi payments startup needed people to pay by card and receive crypto in their own wallets, without the company holding large amounts of capital or users facing confusing network fees.",
        whatChanged: [
          "An event-driven payments backend on NestJS and Google Cloud, built for reliability across payment and blockchain flows",
          "On-demand liquidity and secure routing of assets to users' wallets",
          "Treasury algorithms that allocate funds across chains with minimal capital exposure",
          "Account abstraction (ERC-4337), so users pay fees in the currency they're sending",
          "A subscription engine that prices in US dollars and charges in crypto at the moment of payment",
          "Internal tools for spotting incidents and running safe experiments",
        ],
        result: "A banking-like experience on self-custodial wallets, run with minimal capital.",
        stack: ["TypeScript", "NestJS", "React", "Google Cloud", "Postgres", "Solidity", "ERC-4337"],
      },
      lysn: {
        client: "Lysn",
        sector: "Health",
        period: "2021–2023",
        title: "Bookings, pricing and payments for a mental health platform",
        summary: "Micro frontends, configurable pricing and Medicare gap payments for a platform that connects therapists and clients.",
        problem:
          "The platform needed to modernise without a risky rewrite, support more flexible pricing, and keep running smoothly while the product moved from an overseas team to Australia.",
        whatChanged: [
          "Micro frontends, so the stack could be upgraded step by step and the customer app loaded faster",
          "Pricing logic refactored for advanced, configurable pricing",
          "Medicare gap payments, to grow revenue and reduce the risk of no-show consultations",
          "The local team upskilled for a smooth handover from the overseas team",
          "Critical incidents resolved fast, pulling data straight from the database to keep the business running",
        ],
        result: "A faster customer app, more flexible pricing and the know-how kept in-house.",
        stack: ["React", "Redux-Saga", "TypeScript", "Python", "Django", "AWS", "PostgreSQL"],
      },
      highsnobiety: {
        client: "Highsnobiety",
        sector: "Fashion e-commerce",
        period: "2018–2020",
        title: "A checkout that holds up during limited-edition drops",
        summary: "Core shopping flows and launch-day reliability for a global fashion media brand.",
        problem:
          "Limited-stock releases bring huge, spiky traffic. The shop had to stay fast, fair and correct, with the right prices and content from the first second.",
        whatChanged: [
          "Product pages and checkout built on a CommerceTools stack",
          "Endpoints for highly limited stock that stayed secure and reliable under spiky traffic",
          "App start-up re-engineered so correct prices and content always rendered, with no flashes of stale items",
          "CI pipelines, Docker containers and Terraform on Google Cloud",
          "Unit and end-to-end tests that kept deployments error-free",
        ],
        result: "Reliable launches and a checkout customers could trust.",
        stack: ["React", "Redux", "Node.js", "Google Cloud", "CommerceTools", "Terraform"],
      },
      officeworks: {
        client: "Officeworks",
        sector: "Retail",
        period: "2020",
        title: "Recurring orders and a smoother path to production",
        summary: "A new recurring-orders feature, and a workflow change that removed the waiting between developers and QA.",
        problem:
          "Developers were waiting for testers to become free, which slowed every release, while the business wanted more repeat sales from business customers.",
        whatChanged: [
          "A team workflow that cut developers' wait for QA to zero",
          "Recurring orders, so businesses can buy products automatically on a schedule",
          "Content targeting fixed in Adobe Target, so marketing reached the right audience",
        ],
        result: "Faster delivery, and a new way for business customers to keep buying.",
        stack: ["React", "Redux", "Node.js", "Micro frontends", "Contentful", "Algolia", "AWS"],
      },
      udrew: {
        client: "uDrew",
        sector: "Property tech",
        period: "2020–2021",
        title: "Configurable forms that streamline building approvals",
        summary: "Dynamic data-collection flows and an auditable document store for residential building projects.",
        problem:
          "Getting a building project approved depends on collecting the right information in the right order, and every file needs an audit trail.",
        whatChanged: [
          "A system for dynamic, configurable data-collection flows at the core of the approval process",
          "Document management on AWS S3 with an auditable record of every upload",
          "Stronger TypeScript across the frontend to speed up development",
        ],
        result: "A smoother, more reliable path from design to approval.",
        stack: ["React", "TypeScript", "Node.js", "PostgreSQL", "PostGIS", "AWS"],
      },
      displaysweet: {
        client: "DisplaySweet",
        sector: "Property tech",
        period: "2017–2018",
        title: "Prototypes that helped sell new ideas",
        summary: "Software for running live off-the-plan property sales, and rapid prototypes the sales team could show clients.",
        problem: "The company needed to show clients new capabilities quickly, before committing to full builds.",
        whatChanged: [
          "Software for organising and running live sales events and overseeing sales agents",
          "Rapid prototypes using neural networks, computer vision, Dialogflow, IFC, React Native and BabylonJS to test what was feasible",
        ],
        result: "New ideas tested fast, and a sales team with something real to show.",
        stack: ["React", "Node.js", "C#", ".NET", "OpenCV", "PyTorch"],
      },
      nokia: {
        client: "Nokia Networks",
        sector: "Telecoms",
        period: "2013–2016",
        title: "Making gigabytes of logs make sense",
        summary: "Web tools that linked and visualised huge logs, and system-level work on the move to 4.5G.",
        problem: "Teams spent a long time searching gigabytes-long logs from different systems to find the root cause of unexpected behaviour.",
        whatChanged: [
          "A browser tool that links, sorts and interleaves entries from different log types",
          "A web app for tracking and visualising problems reported across the company",
          "System-level 4.5G features, in a multinational specification group and a cross-department integration team",
        ],
        result: "Teams could find what they needed in gigabytes of logs quickly.",
        stack: ["C++", "Python", "protobuf", "Jenkins", "MySQL"],
      },
    },
  },
  about: {
    eyebrow: "About",
    title: "One way of thinking, many disciplines",
    intro:
      "Tangent is led by Piotr Ciesiolkiewicz, a software engineer and problem-solver with more than ten years of experience in startups and global companies, with a network of senior specialists brought in for each project.",
    story: [
      "Piotr started out in telecoms at Nokia, digging through gigabytes of logs to find why systems behaved unexpectedly, and building tools so others could find answers faster.",
      "Since then he has built fintech, health, e-commerce and property products in Australia and Europe, always with one eye on the business: pricing, revenue, how teams work and what customers actually need.",
      "Outside software he has a long practice in music and movement, and finds the same habits work everywhere: listen first, find the rhythm, keep things in balance, and connect ideas that don't usually meet.",
    ],
    educationTitle: "Education",
    education: [
      {
        degree: "Master's degree, Computer Science",
        school: "Wrocław University of Science and Technology",
        detail: "GPA 5.0 / 5.0 · Thesis: classification methods in automatic speech recognition",
      },
      {
        degree: "Engineer's degree, Control Engineering and Robotics",
        school: "Wrocław University of Science and Technology",
        detail: "GPA 5.0 / 5.0 · Thesis: remote control with speech recognition",
      },
    ],
    awardsTitle: "Awards",
    awards: [
      {
        title: "RegHack Downunder 2017 · 1st prize",
        body: "Sharenergy: a model for community energy markets that benefits households with and without rooftop solar, plus the regulatory framework to enable it, built in under 40 hours.",
      },
      {
        title: "GovHack 2017 · Community Environment Data award",
        body: "Litterly Awesome: a crowd-sourcing app that combines litter reports with government open data to show littering trends and what drives them.",
      },
    ],
    peopleTitle: "People",
    peopleIntro: "Led by Piotr, with a network of senior specialists brought in for each project.",
  },
  people: {
    items: {
      piotr: {
        role: "Founder · software engineer",
        bio: "Full-stack engineer and analyst. Fintech and DeFi, e-commerce, health, property tech and telecoms. Speaks English and Polish.",
      },
    },
  },
  cta: {
    title: "Let's connect the dots",
    body: "Book a 30-minute call about your product, your processes or your idea. You'll leave with at least one useful next step.",
  },
  contact: {
    eyebrow: "Contact",
    title: "Book a call",
    intro: "Thirty minutes about your product, process or idea, with no obligation. Pick a time, or send a message and we'll reply within one business day.",
    bookTitle: "Pick a time",
    bookBody: "See open times and book in a couple of clicks.",
    formTitle: "Or send a message",
    form: {
      name: "Your name",
      email: "Email",
      company: "Company (optional)",
      message: "What would you like to talk about?",
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
    tagline: "Process, product and software for startups.",
    navLabel: "Footer",
    contactLabel: "Email",
    legal: "ABN 48 737 987 261",
    privacy: "Privacy",
    terms: "Terms",
    languages: { en: "English", pl: "Polski" },
  },
  consent: {
    label: "Cookie consent",
    text: "We use privacy-friendly analytics. Are analytics cookies okay?",
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
        paragraphs: ["Tangent is a sole-trader business run by Piotr Ciesiolkiewicz. You can reach us at the email address on our contact page."],
      },
      {
        heading: "What we collect",
        paragraphs: [
          "When you send a message, we receive your name, email, company and message. We use them only to reply to you.",
          "We use PostHog analytics to understand how the site is used: pages viewed, buttons clicked and general location (country). PostHog stores this data in the EU.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "We set cookies that remember your language and which version of a page you see, and analytics cookies. On our Polish site, analytics cookies are only set after you accept them.",
        ],
      },
      { heading: "Your rights", paragraphs: ["You can ask to see, correct or delete your personal information at any time by emailing us."] },
    ],
  },
  terms: {
    title: "Terms",
    updated: "Last updated: October 2026",
    sections: [
      { heading: "Quotes", paragraphs: ["Every engagement starts with a written proposal. Work begins once you accept it."] },
      { heading: "Payment", paragraphs: ["Invoices are due within 14 days unless we agree otherwise."] },
      { heading: "Ownership", paragraphs: ["Once paid, you own the work we create for you."] },
      { heading: "Confidentiality", paragraphs: ["We keep your information confidential and are happy to sign an NDA."] },
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

- [ ] **Step 6: Polish draft**

`apps/tangent/content/pl.ts`:
```ts
import type { Content } from "./en";

/** Polski (Polska). DRAFT for Piotr's review. Neutral forms preferred over masculine "-łeś". */
export const pl: Content = {
  meta: {
    siteDescription:
      "Tangent pomaga startupom łączyć kropki: sprawdzamy, jak działa Twój produkt, dane i zespół, usuwamy to, co blokuje pracę, i budujemy potrzebne aplikacje oraz platformy. Ponad dziesięć lat w fintechu, e-commerce i ochronie zdrowia.",
    home: {
      title: "Tangent · Procesy, produkt i oprogramowanie dla startupów",
      description:
        "Tangent pomaga startupom łączyć kropki: sprawdzamy, jak działa Twój produkt, dane i zespół, usuwamy to, co blokuje pracę, i budujemy potrzebne aplikacje oraz platformy.",
    },
    services: {
      title: "Usługi · usprawnianie procesów, aplikacje na zamówienie i wsparcie techniczne",
      description:
        "Świeże spojrzenie na to, jak działa Twój startup, usprawnianie procesów, aplikacje i platformy na zamówienie, sprinty produktowe, techniczne przywództwo na część etatu oraz płatności, AI i Web3.",
    },
    work: {
      title: "Realizacje · problemy, które rozwiązaliśmy",
      description: "Studia przypadków z fintechu, ochrony zdrowia, e-commerce, handlu, proptechu i telekomunikacji: problem, co się zmieniło i jaki był efekt.",
    },
    about: {
      title: "O nas · ludzie stojący za Tangent",
      description:
        "Tangent prowadzi Piotr Ciesiolkiewicz, inżynier oprogramowania z ponad dziesięcioletnim doświadczeniem, razem z siecią doświadczonych specjalistów.",
    },
    contact: { title: "Kontakt · umów rozmowę", description: "Umów 30-minutową rozmowę o produkcie, procesach albo pomyśle. Bez zobowiązań." },
    privacy: { title: "Polityka prywatności", description: "Jak Tangent przetwarza dane osobowe i dane analityczne." },
    terms: { title: "Warunki współpracy", description: "Zasady współpracy z Tangent." },
  },
  nav: {
    services: "Usługi",
    work: "Realizacje",
    about: "O nas",
    contact: "Kontakt",
    cta: "Umów rozmowę",
    menu: "Menu",
    close: "Zamknij menu",
    primary: "Nawigacja główna",
    skip: "Przejdź do treści",
    newTab: "(otwiera się w nowej karcie)",
    breadcrumbs: "Ścieżka nawigacji",
    home: "Strona główna",
    colorMode: { group: "Tryb kolorów", light: "Jasny", dark: "Ciemny", system: "Systemowy" },
  },
  hero: {
    eyebrow: "Procesy, produkt i oprogramowanie · dla startupów",
    title: ["Połącz kropki. ", "Odblokuj przepływ."],
    lead: "Sprawdzamy, jak naprawdę działa Twój produkt, dane i zespół, znajdujemy miejsca, w których praca się zacina, i przywracamy płynność: prostszym procesem, lepszym przepływem pracy albo aplikacją zbudowaną dokładnie pod Twoje potrzeby. Ponad dziesięć lat budowania produktów fintech, e-commerce i medycznych, teraz do Twojej dyspozycji.",
    secondary: "Zobacz realizacje",
    proofLabel: "Doświadczenie",
    proof: ["Ponad 10 lat budowania produktów", "Fintech i DeFi", "E-commerce", "Ochrona zdrowia", "Telekomunikacja"],
    dots: { idea: "pomysł", market: "rynek", users: "ludzie", data: "dane", tech: "technologia", product: "produkt" },
  },
  flows: {
    eyebrow: "Co robimy",
    title: "Patrzymy na całość",
    intro:
      "Większość problemów rosnącego startupu nie leży w jednym miejscu. Siedzą pomiędzy produktem, danymi, narzędziami i ludźmi. Znajdujemy miejsca, w których praca się zacina, i usuwamy przyczynę.",
    items: [
      {
        title: "Powolne, stresujące wdrożenia",
        body: "Sprawdzamy, jak praca przechodzi od pomysłu do produkcji, usuwamy czekanie i przekazywanie zadań, i dodajemy testy, dzięki którym wdrażasz bez obaw.",
      },
      { title: "Liczby, którym nikt nie ufa", body: "Sprawdzamy, skąd biorą się dane, uzupełniamy luki i dajemy zespołowi raporty, na podstawie których można działać." },
      {
        title: "Wszędzie obejścia",
        body: "Arkusze, kopiowanie i ręczne kroki zwykle oznaczają brakujące narzędzie. Budujemy aplikację lub integrację, która je eliminuje.",
      },
      { title: "Pomysł, który potrzebuje drogi", body: "Kształtujemy go, testujemy z prawdziwymi użytkownikami i danymi, i porządnie budujemy pierwszą wersję." },
    ],
  },
  services: {
    eyebrow: "Usługi",
    title: "Jak możemy pomóc",
    intro: "Zacznij od świeżego spojrzenia albo zaproś nas na całą drogę od pomysłu do platformy.",
    linkLabel: "Dowiedz się więcej",
    signsTitle: "Kiedy tego potrzebujesz",
    whatWeDoTitle: "Co robimy",
    outcomesTitle: "Co dostajesz",
    faqTitle: "Pytania",
    items: {
      "fresh-look": {
        title: "Świeże spojrzenie",
        summary: "Przegląd za stałą cenę: jak w Twoim startupie płynie praca, dane i klienci, plus krótka lista usprawnień, które warto wprowadzić.",
        intro:
          "Czasem jest się zbyt blisko, żeby zobaczyć, co spowalnia firmę. W tydzień lub dwa przyglądamy się produktowi, technologii i procesom świeżym okiem i jasno mówimy, co zmienić najpierw.",
        signs: [
          "Wdrożenia ciągle się opóźniają i nikt nie wie do końca dlaczego",
          "Te same błędy i awarie wciąż wracają",
          "Przed rundą inwestycyjną, rekrutacją albo przebudową przyda się druga opinia",
        ],
        whatWeDo: [
          "Rozmawiamy z zespołem i patrzymy na prawdziwą pracę, nie tylko na dokumenty",
          "Mapujemy, jak pomysły, kod, dane i klienci przepływają przez firmę",
          "Przeglądamy architekturę, kod i narzędzia tam, gdzie to ma znaczenie",
          "Znajdujemy przyczyny stojące za objawami",
        ],
        outcomes: ["Krótka lista usprawnień według priorytetów", "Nakład pracy i efekt dla każdego z nich", "Jasny pierwszy krok, niezależnie od tego, kto wykona pracę"],
        faq: [
          { question: "Czy potem musimy zlecić Wam realizację?", answer: "Nie. Przegląd jest Wasz i możecie go wykorzystać, jak chcecie." },
          {
            question: "Jakiego dostępu potrzebujecie?",
            answer: "Zwykle kilku rozmów, dostępu do odczytu kodu i narzędzi oraz wglądu w metryki. Chętnie podpiszemy NDA.",
          },
        ],
      },
      "process-workflow": {
        title: "Usprawnianie procesów i przepływu pracy",
        summary: "Mniej przekazywania zadań, mniej czekania i mniej błędów, a automatyzacja tam, gdzie się opłaca.",
        intro:
          "Dobre zespoły spowalniają złe przepływy: czekanie na przegląd, ręczne kroki, niejasna odpowiedzialność. Znajdujemy tarcia i je usuwamy, bez dokładania biurokracji.",
        signs: ["Praca częściej czeka w kolejce, niż się posuwa", "Wdrożenia są stresujące i ręczne", "Każdy prowadzi własny arkusz"],
        whatWeDo: [
          "Mapujemy prawdziwy przepływ, od pomysłu do produkcji i od zamówienia do dostawy",
          "Usuwamy czekanie, przekazywanie zadań i dublowanie pracy",
          "Automatyzujemy powtarzalne kroki i dodajemy kontrole, które wcześnie wyłapują błędy",
          "Pracujemy razem z zespołem, żeby nowy sposób działania się utrwalił",
        ],
        outcomes: ["Szybsza, spokojniejsza droga do produkcji", "Automatyzacje, które co tydzień oszczędzają godziny", "Zespół, który sam prowadzi usprawniony proces"],
        faq: [
          {
            question: "Czy chodzi tylko o programowanie?",
            answer: "Nie. Patrzymy na każdy przepływ, który spowalnia firmę: od wdrożeń po onboarding, zamówienia i raportowanie.",
          },
        ],
      },
      "custom-apps-platforms": {
        title: "Aplikacje i platformy na zamówienie",
        summary: "Od pomysłu do produktu albo narzędzie wewnętrzne, o którym zespół marzy od dawna.",
        intro:
          "Gdy gotowe narzędzia nie pasują, projektujemy i budujemy oprogramowanie wokół tego, jak naprawdę działa Twoja firma: aplikacje webowe, platformy, integracje i narzędzia wewnętrzne.",
        signs: [
          "Wszystko trzyma się na obejściach i kopiowaniu",
          "Pomysł potrzebuje pierwszej wersji, z której ludzie mogą korzystać",
          "Platforma musi rosnąć bez przepisywania od zera",
        ],
        whatWeDo: [
          "Kształtujemy produkt razem z Tobą, zanim powstanie kod",
          "Budujemy full stack: React, Node.js, NestJS, Django, Postgres i chmura",
          "Projektujemy z myślą o wzroście: backend oparty na zdarzeniach, czyste modele danych, rozsądna architektura",
          "Porządnie testujemy, żeby zmiany były bezpieczne",
        ],
        outcomes: ["Oprogramowanie, które należy do Ciebie i pasuje do Twojego przepływu pracy", "Kod, który zespół może utrzymać", "Dokumentacja i porządne przekazanie"],
        faq: [
          { question: "Czy budujecie aplikacje mobilne?", answer: "Tak, w React Native albo jako aplikacje webowe, które dobrze działają na telefonach." },
          { question: "Do kogo należy kod?", answer: "Do Ciebie, od pierwszego dnia." },
        ],
      },
      "product-sprints": {
        title: "Sprinty produktowe",
        summary: "Ukształtuj i przetestuj nowy pomysł, zanim zainwestujesz w budowę.",
        intro:
          "Najdroższe błędy zdarzają się przed pierwszą linijką kodu. Krótki sprint zamienia pomysł w jasny, przetestowany plan, a często też w prototyp, który można pokazać użytkownikom albo inwestorom.",
        signs: [
          "Jest pomysł, ale brakuje jasnej pierwszej wersji",
          "Zespół nie może się zgodzić, co budować dalej",
          "Potrzebujesz czegoś konkretnego do pokazania klientom albo inwestorom",
        ],
        whatWeDo: [
          "Doprecyzowujemy problem, użytkowników i to, jak wygląda sukces",
          "Znajdujemy najbardziej ryzykowne założenia i testujemy je z prawdziwymi użytkownikami i danymi",
          "Określamy najmniejszy produkt, który warto zbudować",
          "Budujemy prototyp, gdy to najszybszy sposób, żeby się czegoś dowiedzieć",
        ],
        outcomes: ["Przetestowany pomysł i jasny zakres", "Plan budowy z wyceną", "Często klikalny prototyp"],
        faq: [{ question: "Ile trwa sprint?", answer: "Zwykle tydzień lub dwa, za stałą cenę ustaloną z góry." }],
      },
      "fractional-tech-lead": {
        title: "Tech lead na część etatu",
        summary: "Doświadczone wsparcie w sprawach architektury, rekrutacji i dostawców, bez zatrudniania na pełen etat.",
        intro:
          "Nie każdy startup potrzebuje już CTO na pełen etat, ale każdy potrzebuje dobrych decyzji technicznych. Dołączamy na kilka dni w miesiącu, żeby prowadzić architekturę, przeglądać pracę i pomagać w rekrutacji.",
        signs: [
          "Polegacie na agencji albo freelancerach bez technicznego właściciela",
          "Zbliżają się ważne decyzje techniczne",
          "Za chwilę zatrudniacie pierwszych programistów",
        ],
        whatWeDo: [
          "Współtworzymy z Tobą techniczną mapę drogową",
          "Przeglądamy architekturę, kod i pracę dostawców",
          "Pomagamy rekrutować i wdrażać programistów",
          "Reprezentujemy stronę techniczną w rozmowach z inwestorami i partnerami",
        ],
        outcomes: ["Jasny kierunek techniczny", "Lepsi dostawcy i lepsze rekrutacje", "Zespół przygotowany na wzrost"],
        faq: [{ question: "Ile czasu poświęcacie?", answer: "Od kilku godzin w tygodniu do kilku dni w miesiącu, w miarę jak firma rośnie." }],
      },
      "payments-ai-web3": {
        title: "Płatności, AI i Web3",
        summary: "Specjalistyczna wiedza o płatnościach, subskrypcjach, funkcjach AI i blockchainie.",
        intro:
          "Niektóre problemy wymagają ludzi, którzy już to robili. Budowaliśmy płatności kartą za kryptowaluty, silniki subskrypcji, dopłaty Medicare i koszyki na premiery limitowanych kolekcji, a AI używamy tam, gdzie naprawdę pomaga.",
        signs: [
          "Dodajesz płatności, subskrypcje albo logikę cenową",
          "Chcesz funkcji AI, które robią coś naprawdę użytecznego",
          "Budujesz na blockchainie i chcesz, żeby to działało jak zwykły fintech",
        ],
        whatWeDo: [
          "Płatności i subskrypcje przez Stripe albo kanały kryptowalutowe",
          "Elastyczna logika cenowa, którą łatwo skontrolować",
          "Funkcje AI i automatyzacje z jasnymi zabezpieczeniami",
          "Smart kontrakty i account abstraction (ERC-4337) dla wygodnych transakcji bez opłat za gaz po stronie użytkownika",
        ],
        outcomes: ["Płatności, które działają poprawnie pod obciążeniem", "AI, które ma sens", "Web3, które działa jak zwykła aplikacja"],
        faq: [
          {
            question: "Czy pracujecie tylko przy projektach krypto?",
            answer: "Nie. Płatności i logika cenowa przydają się w każdej firmie. Web3 to jedna z kilku specjalizacji.",
          },
        ],
      },
    },
  },
  process: {
    eyebrow: "Jak pracujemy",
    title: "Słuchamy. Mapujemy. Usprawniamy. Przekazujemy.",
    intro: "Małe, widoczne kroki. Zawsze wiesz, co dalej.",
    steps: [
      { title: "Słuchamy", body: "Poznajemy, jak naprawdę działa Twój produkt, zespół i klienci, i co oznacza dla Ciebie sukces." },
      { title: "Mapujemy", body: "Mapujemy przepływy, dane i problemy, i wspólnie wybieramy kilka zmian, które mają największe znaczenie." },
      { title: "Usprawniamy", body: "Poprawiamy proces, budujemy aplikację lub platformę albo jedno i drugie, w małych, widocznych krokach." },
      { title: "Przekazujemy", body: "Efekt należy do Twojego zespołu, z dokumentacją i wsparciem, dopóki wszystko nie działa samodzielnie." },
    ],
  },
  work: {
    eyebrow: "Realizacje",
    title: "Problemy, które rozwiązaliśmy",
    intro: "Doświadczenie stojące za Tangent, od fintechu po telekomunikację. Każda historia zaczyna się od problemu, nie od technologii.",
    link: "Zobacz wszystkie realizacje",
    credit: "Praca Piotra Ciesiolkiewicza we współpracy z {client}.",
    problemTitle: "Problem",
    changedTitle: "Co się zmieniło",
    resultTitle: "Efekt",
    stackTitle: "Technologie",
    readMore: "Przeczytaj studium przypadku",
    items: {
      onchain: {
        client: "ONCHAIN",
        sector: "Fintech · DeFi",
        period: "2024–2026",
        title: "Płatności kartą za kryptowaluty przy minimalnym kapitale",
        summary: "Infrastruktura płatnicza, dzięki której można kupić kartą dziesiątki tysięcy kryptowalut, z transakcjami bez opłat za gaz i inteligentnym zarządzaniem środkami.",
        problem:
          "Startup płatniczy DeFi chciał, żeby ludzie płacili kartą i otrzymywali kryptowaluty we własnych portfelach, bez utrzymywania przez firmę dużego kapitału i bez mylących opłat sieciowych dla użytkowników.",
        whatChanged: [
          "Backend płatności oparty na zdarzeniach, na NestJS i Google Cloud, zaprojektowany z myślą o niezawodności płatności i transakcji blockchain",
          "Pozyskiwanie płynności na żądanie i bezpieczne przekazywanie środków do portfeli użytkowników",
          "Algorytmy zarządzania środkami na wielu blockchainach przy minimalnej ekspozycji kapitału",
          "Account abstraction (ERC-4337), dzięki któremu użytkownicy płacą opłaty w walucie, którą wysyłają",
          "Silnik subskrypcji z cenami w dolarach i płatnością w kryptowalutach w chwili transakcji",
          "Narzędzia wewnętrzne do wykrywania awarii i bezpiecznego testowania nowych funkcji",
        ],
        result: "Doświadczenie jak w banku na portfelach, które w pełni należą do użytkowników, przy minimalnym kapitale.",
        stack: ["TypeScript", "NestJS", "React", "Google Cloud", "Postgres", "Solidity", "ERC-4337"],
      },
      lysn: {
        client: "Lysn",
        sector: "Ochrona zdrowia",
        period: "2021–2023",
        title: "Rezerwacje, ceny i płatności dla platformy zdrowia psychicznego",
        summary: "Mikrofrontendy, konfigurowalne ceny i dopłaty Medicare dla platformy łączącej terapeutów z klientami.",
        problem:
          "Platforma musiała się unowocześnić bez ryzykownego przepisywania, obsłużyć bardziej elastyczne ceny i działać płynnie w trakcie przenoszenia produktu z zagranicznego zespołu do Australii.",
        whatChanged: [
          "Mikrofrontendy, dzięki którym technologię można było wymieniać krok po kroku, a aplikacja dla klientów ładowała się szybciej",
          "Przebudowana logika cenowa, pozwalająca na zaawansowane, konfigurowalne ceny",
          "Dopłaty Medicare, które zwiększyły przychody i zmniejszyły ryzyko nieodbytych konsultacji",
          "Przeszkolony lokalny zespół, który płynnie przejął projekt od zespołu zagranicznego",
          "Szybkie rozwiązywanie krytycznych awarii, z danymi pobieranymi wprost z bazy, żeby firma mogła dalej działać",
        ],
        result: "Szybsza aplikacja dla klientów, elastyczniejsze ceny i wiedza zatrzymana w firmie.",
        stack: ["React", "Redux-Saga", "TypeScript", "Python", "Django", "AWS", "PostgreSQL"],
      },
      highsnobiety: {
        client: "Highsnobiety",
        sector: "E-commerce modowy",
        period: "2018–2020",
        title: "Koszyk, który wytrzymuje premiery limitowanych kolekcji",
        summary: "Kluczowe ścieżki zakupowe i niezawodność w dniu premiery dla globalnej marki medialnej i modowej.",
        problem:
          "Premiery limitowanych kolekcji przynoszą ogromny, skokowy ruch. Sklep musiał działać szybko, uczciwie i poprawnie, z właściwymi cenami i treściami od pierwszej sekundy.",
        whatChanged: [
          "Strony produktów i koszyk zbudowane na platformie CommerceTools",
          "Endpointy dla mocno limitowanych produktów, bezpieczne i niezawodne przy skokowym ruchu",
          "Przebudowany start aplikacji, dzięki któremu zawsze wyświetlały się poprawne ceny i treści, bez mignięć nieaktualnych produktów",
          "Pipeline'y CI, kontenery Docker i Terraform w Google Cloud",
          "Testy jednostkowe i end-to-end, dzięki którym wdrożenia przebiegały bez błędów",
        ],
        result: "Niezawodne premiery i koszyk, któremu klienci mogli ufać.",
        stack: ["React", "Redux", "Node.js", "Google Cloud", "CommerceTools", "Terraform"],
      },
      officeworks: {
        client: "Officeworks",
        sector: "Handel",
        period: "2020",
        title: "Zamówienia cykliczne i płynniejsza droga do produkcji",
        summary: "Nowa funkcja zamówień cyklicznych i zmiana sposobu pracy, która usunęła czekanie między programistami a testerami.",
        problem:
          "Programiści czekali, aż zwolnią się testerzy, co spowalniało każde wdrożenie, a firma chciała więcej powtarzalnej sprzedaży do klientów biznesowych.",
        whatChanged: [
          "Nowy sposób pracy zespołu, który skrócił czekanie programistów na testy do zera",
          "Zamówienia cykliczne, dzięki którym firmy kupują produkty automatycznie według harmonogramu",
          "Naprawione targetowanie treści w Adobe Target, żeby marketing trafiał do właściwych odbiorców",
        ],
        result: "Szybsze wdrożenia i nowy sposób na powracające zakupy klientów biznesowych.",
        stack: ["React", "Redux", "Node.js", "Mikrofrontendy", "Contentful", "Algolia", "AWS"],
      },
      udrew: {
        client: "uDrew",
        sector: "Proptech",
        period: "2020–2021",
        title: "Konfigurowalne formularze, które usprawniają pozwolenia budowlane",
        summary: "Dynamiczne ścieżki zbierania danych i archiwum dokumentów z pełną historią dla projektów budowy domów.",
        problem:
          "Zatwierdzenie projektu budowlanego zależy od zebrania właściwych informacji we właściwej kolejności, a każdy plik musi mieć historię zmian.",
        whatChanged: [
          "System dynamicznych, konfigurowalnych ścieżek zbierania danych w sercu procesu zatwierdzania",
          "Zarządzanie dokumentami na AWS S3 z pełnym zapisem każdego przesłanego pliku",
          "Lepsze typowanie w TypeScripcie we frontendzie, które przyspieszyło pracę",
        ],
        result: "Płynniejsza i bardziej niezawodna droga od projektu do zatwierdzenia.",
        stack: ["React", "TypeScript", "Node.js", "PostgreSQL", "PostGIS", "AWS"],
      },
      displaysweet: {
        client: "DisplaySweet",
        sector: "Proptech",
        period: "2017–2018",
        title: "Prototypy, które pomagały sprzedawać nowe pomysły",
        summary: "Oprogramowanie do prowadzenia sprzedaży mieszkań z rynku pierwotnego na żywo i szybkie prototypy, które dział sprzedaży mógł pokazać klientom.",
        problem: "Firma potrzebowała szybko pokazywać klientom nowe możliwości, zanim zdecyduje się na pełną realizację.",
        whatChanged: [
          "Oprogramowanie do organizowania i prowadzenia sprzedaży na żywo oraz nadzorowania agentów",
          "Szybkie prototypy z sieciami neuronowymi, widzeniem komputerowym, Dialogflow, IFC, React Native i BabylonJS do sprawdzania, co jest wykonalne",
        ],
        result: "Szybko przetestowane pomysły i dział sprzedaży z czymś konkretnym do pokazania.",
        stack: ["React", "Node.js", "C#", ".NET", "OpenCV", "PyTorch"],
      },
      nokia: {
        client: "Nokia Networks",
        sector: "Telekomunikacja",
        period: "2013–2016",
        title: "Porządek w gigabajtach logów",
        summary: "Narzędzia webowe, które łączyły i wizualizowały ogromne logi, oraz praca systemowa przy przejściu na 4.5G.",
        problem: "Zespoły długo przeszukiwały gigabajty logów z różnych systemów, żeby znaleźć przyczynę nieoczekiwanego zachowania.",
        whatChanged: [
          "Narzędzie w przeglądarce, które łączy, sortuje i przeplata wpisy z różnych typów logów",
          "Aplikacja webowa do śledzenia i wizualizacji problemów zgłaszanych w całej firmie",
          "Funkcje systemowe 4.5G w międzynarodowej grupie specyfikacyjnej i międzydziałowym zespole integracyjnym",
        ],
        result: "Zespoły mogły szybko znaleźć to, czego szukały, w gigabajtach logów.",
        stack: ["C++", "Python", "protobuf", "Jenkins", "MySQL"],
      },
    },
  },
  about: {
    eyebrow: "O nas",
    title: "Jeden sposób myślenia, wiele dziedzin",
    intro:
      "Tangent prowadzi Piotr Ciesiolkiewicz, inżynier oprogramowania i osoba, która lubi rozwiązywać problemy, z ponad dziesięcioletnim doświadczeniem w startupach i globalnych firmach, razem z siecią doświadczonych specjalistów dobieranych do każdego projektu.",
    story: [
      "Piotr zaczynał w telekomunikacji w Nokii: przekopywał się przez gigabajty logów, żeby zrozumieć nieoczekiwane zachowanie systemów, i budował narzędzia, dzięki którym inni szybciej znajdowali odpowiedzi.",
      "Od tamtej pory tworzył produkty fintech, medyczne, e-commerce i proptech w Australii i Europie, zawsze z myślą o biznesie: cenach, przychodach, sposobie pracy zespołu i tym, czego naprawdę potrzebują klienci.",
      "Poza oprogramowaniem od lat zajmuje się muzyką i ruchem. Wszędzie sprawdzają się te same nawyki: najpierw słuchać, znaleźć rytm, zachować równowagę i łączyć pomysły, które zwykle się nie spotykają.",
    ],
    educationTitle: "Wykształcenie",
    education: [
      {
        degree: "Magister, informatyka",
        school: "Politechnika Wrocławska",
        detail: "Średnia 5,0 / 5,0 · Praca: metody klasyfikacji w automatycznym rozpoznawaniu mowy",
      },
      {
        degree: "Inżynier, automatyka i robotyka",
        school: "Politechnika Wrocławska",
        detail: "Średnia 5,0 / 5,0 · Praca: zdalne sterowanie z rozpoznawaniem mowy",
      },
    ],
    awardsTitle: "Nagrody",
    awards: [
      {
        title: "RegHack Downunder 2017 · 1. miejsce",
        body: "Sharenergy: model lokalnego rynku energii, który korzystny jest dla gospodarstw z panelami słonecznymi i bez nich, razem z ramami prawnymi, które go umożliwiają. Stworzony w mniej niż 40 godzin.",
      },
      {
        title: "GovHack 2017 · nagroda Community Environment Data",
        body: "Litterly Awesome: aplikacja crowdsourcingowa, która łączy zgłoszenia śmieci z otwartymi danymi publicznymi, żeby pokazać trendy i ich przyczyny.",
      },
    ],
    peopleTitle: "Ludzie",
    peopleIntro: "Prowadzi Piotr, a do każdego projektu dołączają doświadczeni specjaliści z naszej sieci.",
  },
  people: {
    items: {
      piotr: {
        role: "Założyciel · inżynier oprogramowania",
        bio: "Inżynier full stack i analityk. Fintech i DeFi, e-commerce, ochrona zdrowia, proptech i telekomunikacja. Mówi po polsku i angielsku.",
      },
    },
  },
  cta: {
    title: "Połączmy kropki",
    body: "Umów 30-minutową rozmowę o produkcie, procesach albo pomyśle. Wyjdziesz z co najmniej jednym przydatnym kolejnym krokiem.",
  },
  contact: {
    eyebrow: "Kontakt",
    title: "Umów rozmowę",
    intro: "Trzydzieści minut o produkcie, procesie albo pomyśle, bez zobowiązań. Wybierz termin albo napisz wiadomość, a odpowiemy w ciągu jednego dnia roboczego.",
    bookTitle: "Wybierz termin",
    bookBody: "Zobacz wolne terminy i zarezerwuj w kilka kliknięć.",
    formTitle: "Albo napisz wiadomość",
    form: {
      name: "Imię i nazwisko",
      email: "E-mail",
      company: "Firma (opcjonalnie)",
      message: "O czym chcesz porozmawiać?",
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
    tagline: "Procesy, produkt i oprogramowanie dla startupów.",
    navLabel: "Stopka",
    contactLabel: "E-mail",
    legal: "NIP: do uzupełnienia",
    privacy: "Prywatność",
    terms: "Warunki",
    languages: { en: "English", pl: "Polski" },
  },
  consent: {
    label: "Zgoda na pliki cookie",
    text: "Używamy analityki szanującej prywatność. Czy zgadzasz się na analityczne pliki cookie?",
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
          "Administratorem danych jest Tangent, jednoosobowa działalność prowadzona przez Piotra Ciesiolkiewicza. Dane kontaktowe znajdziesz na stronie kontaktu.",
        ],
      },
      {
        heading: "Jakie dane zbieramy",
        paragraphs: [
          "Gdy wysyłasz wiadomość, otrzymujemy Twoje imię, e-mail, nazwę firmy i treść wiadomości. Używamy ich wyłącznie do odpowiedzi.",
          "Korzystamy z analityki PostHog, żeby zrozumieć, jak używana jest strona: wyświetlone strony, kliknięcia i przybliżona lokalizacja (kraj). Dopóki nie wyrazisz zgody, analityka działa bez plików cookie i bez zapisywania czegokolwiek w Twojej przeglądarce. PostHog przechowuje dane w UE.",
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
      { heading: "Oferta", paragraphs: ["Każda współpraca zaczyna się od pisemnej propozycji. Pracę rozpoczynamy po jej akceptacji."] },
      { heading: "Płatność", paragraphs: ["Faktury są płatne w ciągu 14 dni, chyba że ustalimy inaczej."] },
      { heading: "Prawa do pracy", paragraphs: ["Po opłaceniu faktury prawa do stworzonej dla Ciebie pracy przechodzą na Ciebie."] },
      { heading: "Poufność", paragraphs: ["Traktujemy Twoje informacje jako poufne i chętnie podpiszemy NDA."] },
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

`apps/tangent/content/index.ts`:
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

- [ ] **Step 7: Run the tests**

Run: `pnpm --filter tangent test`
Expected: PASS (8 tests). If "never invents metrics" or "keeps the agreed positioning" fails, fix the copy, not the test, and ledger the wording change.

- [ ] **Step 8: Commit**

```bash
git add apps/tangent pnpm-lock.yaml
git commit -m "feat(tangent): content in English and Polish draft, people, design experiment

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: App scaffold, Document, layouts, 404s and the home page

**Files:**
- Create: `apps/tangent/{next.config.ts,postcss.config.mjs,middleware.ts,site.config.ts,.env.example,vercel.json}`, `apps/tangent/i18n/request.ts`, `apps/tangent/public/icon.svg`
- Create: `apps/tangent/lib/{params,links,routes,metadata}.ts`
- Create: `apps/tangent/components/{Document,Logo,CaseStudyCard}.tsx`
- Create: `apps/tangent/app/globals.css`, `apps/tangent/app/layout.tsx`, `apps/tangent/app/not-found.tsx`
- Create: `apps/tangent/app/[bucket]/[locale]/{layout,page,not-found}.tsx`
- Test: `apps/tangent/test/routes.test.ts`

**Interfaces:**
- Consumes: `@repo/web` (`headers`, `middleware`, `experiments`, `locale`, `seo`, `json-ld`, `color-mode`, `consent`), `@repo/ui` components, `designFor` (Task 3), and the content.
- Produces:
  - `site` (`name`, `url`, `contactEmail`, `posthogKey`, `googleVerification`, `calUrl`)
  - `resolveParams(params) → { locale, assignment, design, t }`, `buckets`
  - `bookingLink`, `navItems`, `footerLinks`
  - `staticPaths` (7), `servicePaths` (6), `workPaths` (7), `allPaths` (20), `ogKey`, `pathFromOgKey`, `pageTitle`
  - `meta(locale, path, title, description)`
  - `Document({ locale, design, assignment, children })`, `Logo({ design })`
  - `CaseStudyCard({ slug, locale, item, readMore, headingLevel? })`

- [ ] **Step 1: Write the failing routes test**

`apps/tangent/test/routes.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { en } from "../content/en";
import { pl } from "../content/pl";
import { allPaths, ogKey, pageTitle, pathFromOgKey, servicePaths, staticPaths, workPaths } from "../lib/routes";

describe("routes", () => {
  it("lists 7 static pages, 6 services and 7 case studies", () => {
    expect(staticPaths).toEqual(["/", "/services", "/work", "/about", "/contact", "/privacy", "/terms"]);
    expect(servicePaths[0]).toBe("/services/fresh-look");
    expect(servicePaths).toHaveLength(6);
    expect(workPaths).toHaveLength(7);
    expect(allPaths).toHaveLength(20);
  });
  it("round-trips OG keys", () => {
    for (const path of allPaths) expect(pathFromOgKey(ogKey(path))).toBe(path);
    expect(ogKey("/work/onchain")).toBe("work--onchain");
  });
  it("has a title for every page in both languages", () => {
    for (const t of [en, pl]) for (const path of allPaths) expect(pageTitle(t, path), path).toBeTruthy();
    expect(pageTitle(en, "/work/nope")).toBeNull();
    expect(pageTitle(en, "/services/toString")).toBeNull();
    expect(pageTitle(en, "/pricing")).toBeNull();
  });
});
```

Run: `pnpm --filter tangent test routes`
Expected: FAIL, "Cannot find module '../lib/routes'".

- [ ] **Step 2: Implement `lib/routes.ts`**

`apps/tangent/lib/routes.ts`:
```ts
import type { Content } from "../content/en";
import { isServiceSlug, serviceSlugs } from "../content/services";
import { isWorkSlug, workSlugs } from "../content/work";

export const staticPaths = ["/", "/services", "/work", "/about", "/contact", "/privacy", "/terms"] as const;
export type StaticPath = (typeof staticPaths)[number];
export const servicePaths = serviceSlugs.map((slug) => `/services/${slug}`);
export const workPaths = workSlugs.map((slug) => `/work/${slug}`);
export const allPaths: string[] = [...staticPaths, ...servicePaths, ...workPaths];

const metaKey: Record<StaticPath, keyof Omit<Content["meta"], "siteDescription">> = {
  "/": "home",
  "/services": "services",
  "/work": "work",
  "/about": "about",
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
  const service = path.match(/^\/services\/([^/]+)$/)?.[1];
  if (service && isServiceSlug(service)) return t.services.items[service].title;
  const work = path.match(/^\/work\/([^/]+)$/)?.[1];
  if (work && isWorkSlug(work)) return t.work.items[work].title;
  return null;
}
```

Run: `pnpm --filter tangent test`
Expected: PASS (content + routes).

- [ ] **Step 3: Configuration**

`apps/tangent/next.config.ts`:
```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { posthogRewrites, securityHeaders } from "@repo/web/headers";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@repo/ui", "@repo/web"],
  images: { formats: ["image/avif", "image/webp"] },
  // PostHog's API paths end with a slash; don't redirect them.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return posthogRewrites();
  },
  async headers() {
    const headers = securityHeaders({ dev: process.env.NODE_ENV === "development", https: process.env.VERCEL === "1" });
    return [{ source: "/(.*)", headers }];
  },
};

export default withNextIntl(config);
```
(If Task 1 ruled on importing `@repo/web/headers` from a config file, use the same import form here.)

`apps/tangent/postcss.config.mjs`:
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

`apps/tangent/i18n/request.ts`:
```ts
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "@repo/web/locale";

const timeZones = { en: "Australia/Melbourne", pl: "Europe/Warsaw" } as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested) ? requested : defaultLocale;
  return { locale, messages: {}, timeZone: timeZones[locale] };
});
```

`apps/tangent/middleware.ts`:
```ts
import { createRoutingMiddleware } from "@repo/web/middleware";
import { experiments } from "./experiments";
import { allPaths } from "./lib/routes";

const known = new Set(allPaths);

/** Unknown paths go to the root 404 (app/not-found.tsx), a full branded page. */
export default createRoutingMiddleware({ experiments, isKnownPath: (rest) => known.has(rest) });

export const config = {
  matcher: ["/((?!(?:api|_next|_vercel|ingest|og)(?:/|$)|.*\\..*).*)"],
};
```

`apps/tangent/site.config.ts`:
```ts
import { resolveSiteUrl } from "@repo/web/site";

export const site = {
  name: "Tangent",
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

`apps/tangent/.env.example`:
```bash
# Copy to .env.local for local development. On Vercel: Project → Settings → Environment Variables.

# Public base URL (canonical links, hreflang, sitemap, OG images). Only one app can own the root of attunr.com.
NEXT_PUBLIC_SITE_URL=https://attunr.com
NEXT_PUBLIC_CONTACT_EMAIL=hello@attunr.com
# Cal.com booking links per market; empty = booking buttons go to /contact
NEXT_PUBLIC_CAL_URL_EN=
NEXT_PUBLIC_CAL_URL_PL=

# Contact form (Resend). Without both, the form shows the email address instead.
RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL="Tangent <hello@attunr.com>"

# PostHog (EU project). Empty = no analytics script.
NEXT_PUBLIC_POSTHOG_KEY=

# Optional
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
```

`apps/tangent/vercel.json`:
```json
{
  "ignoreCommand": "npx turbo-ignore --fallback=HEAD^1"
}
```

`apps/tangent/public/icon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0b0c0e"/><circle cx="16" cy="19" r="8" fill="none" stroke="#ecedef" stroke-width="2"/><line x1="3" y1="11" x2="29" y2="11" stroke="#ff7a1a" stroke-width="2"/></svg>
```

`apps/tangent/app/globals.css`:
```css
@import "tailwindcss";
@import "@repo/ui/styles/base.css";
@import "@repo/ui/styles/tangent.css";
@source "../../../packages/ui/src";
```

- [ ] **Step 4: Helpers and components**

`apps/tangent/lib/params.ts`:
```ts
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { allBuckets, parseBucket } from "@repo/web/experiments";
import { isLocale } from "@repo/web/locale";
import { getContent } from "@/content";
import { designFor, experiments } from "@/experiments";

export type RouteParams = { bucket: string; locale: string };
export const buckets = allBuckets(experiments);

export async function resolveParams(params: Promise<RouteParams>) {
  const { bucket, locale } = await params;
  const assignment = parseBucket(experiments, bucket);
  if (!isLocale(locale) || !assignment) notFound();
  setRequestLocale(locale);
  return { locale, assignment, design: designFor(assignment.design), t: getContent(locale) };
}
```

`apps/tangent/lib/links.ts`:
```ts
import type { NavItem } from "@repo/ui/NavLinks";
import type { CtaLink } from "@repo/ui/SmartLink";
import { localizedPath, type Locale } from "@repo/web/locale";
import type { Content } from "@/content";
import { site } from "@/site.config";

export function bookingLink(locale: Locale, t: Content, location: string): CtaLink {
  const url = site.calUrl[locale];
  return url
    ? { href: url, label: t.nav.cta, external: true, track: "booking_opened", trackLocation: location }
    : { href: localizedPath(locale, "/contact"), label: t.nav.cta, track: "cta_click", trackLocation: location };
}

export function navItems(locale: Locale, t: Content): NavItem[] {
  const items: [string, string][] = [
    ["/services", t.nav.services],
    ["/work", t.nav.work],
    ["/about", t.nav.about],
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

`apps/tangent/lib/metadata.ts`:
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

`apps/tangent/components/Logo.tsx`:
```tsx
import type { DesignKey } from "@/experiments";

/** Precision: the tangent mark + "Tangent". Editorial: lowercase wordmark with an accent dot. */
export function Logo({ design }: { design: DesignKey }) {
  if (design === "tangent-editorial") {
    return (
      <span>
        tangent<span aria-hidden="true" className="text-accent-text">.</span>
      </span>
    );
  }
  return (
    <>
      <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
        <circle cx="9" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <line x1="0" y1="5" x2="18" y2="5" stroke="var(--accent)" strokeWidth="1.6" />
      </svg>
      Tangent
    </>
  );
}
```

`apps/tangent/components/CaseStudyCard.tsx`:
```tsx
import Link from "next/link";
import { Card } from "@repo/ui/Card";
import { localizedPath, type Locale } from "@repo/web/locale";
import type { Content } from "@/content";
import type { WorkSlug } from "@/content/work";

export function CaseStudyCard({
  slug,
  locale,
  item,
  readMore,
  headingLevel: Heading = "h3",
}: {
  slug: WorkSlug;
  locale: Locale;
  item: Content["work"]["items"][WorkSlug];
  readMore: string;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Card as="article" className="relative flex h-full flex-col transition-transform focus-within:-translate-y-1 hover:-translate-y-1">
      <p className="text-sm font-bold uppercase tracking-widest text-accent-text">
        {item.sector} · {item.period}
      </p>
      <Heading className="mt-2 font-display text-xl font-bold">
        <Link href={localizedPath(locale, `/work/${slug}`)} className="no-underline after:absolute after:inset-0 after:content-['']">
          {item.title}
        </Link>
      </Heading>
      <p className="mt-3 text-muted">{item.summary}</p>
      <p className="mt-auto flex justify-between gap-4 pt-6 text-sm font-bold">
        <span>{item.client}</span>
        <span aria-hidden="true">{readMore} →</span>
      </p>
    </Card>
  );
}
```

`apps/tangent/components/Document.tsx`:
```tsx
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
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
import { activeAssignment, type Assignment } from "@repo/web/experiments";
import { organization, professionalService, website } from "@repo/web/json-ld";
import { htmlLang, localizedPath, type Locale } from "@repo/web/locale";
import { getContent } from "@/content";
import { experiments, type DesignKey } from "@/experiments";
import { bookingLink, footerLinks, navItems } from "@/lib/links";
import { buckets } from "@/lib/params";
import { site } from "@/site.config";
import { Logo } from "./Logo";
import "../app/globals.css";

const interTight = Inter_Tight({ subsets: ["latin", "latin-ext"], variable: "--font-inter-tight", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-jetbrains", display: "swap", preload: false });
const serif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
  preload: false,
});

/** The full HTML document for both designs; also used by the root 404. */
export function Document({ locale, design, assignment, children }: { locale: Locale; design: DesignKey; assignment: Assignment; children: ReactNode }) {
  const t = getContent(locale);
  const brand = <Logo design={design} />;
  const nav = navItems(locale, t);
  const askConsent = consentRequired(locale);
  return (
    <html
      lang={htmlLang[locale]}
      data-design={design}
      className={`${interTight.variable} ${mono.variable} ${serif.variable}`}
      suppressHydrationWarning
    >
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

- [ ] **Step 5: Layouts, 404s and the home page**

`apps/tangent/app/layout.tsx`:
```tsx
import type { ReactNode } from "react";

/** Pass-through root layout: the <html> lives in components/Document.tsx (see Plan 2's 404 ruling). */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
```

`apps/tangent/app/not-found.tsx`:
```tsx
import { Section } from "@repo/ui/Section";
import { ButtonLink } from "@repo/ui/SmartLink";
import { Document } from "@/components/Document";
import { getContent } from "@/content";

/** Server-side 404s render here (full document). English with a Polish line: the market is unknown. */
export default function RootNotFound() {
  const en = getContent("en");
  const pl = getContent("pl");
  return (
    <Document locale="en" design="tangent-precision" assignment={{}}>
      <title>{`${en.notFound.title} · ${pl.notFound.title}`}</title>
      <Section id="not-found" headingLevel="h1" title={en.notFound.title} intro={en.notFound.body}>
        <p lang="pl-PL" className="-mt-4 mb-8 text-lg text-muted">
          {pl.notFound.title}. {pl.notFound.body}
        </p>
        <div className="flex flex-wrap gap-4">
          <ButtonLink link={{ href: "/", label: en.notFound.home }} />
          <span lang="pl-PL">
            <ButtonLink link={{ href: "/pl", label: pl.notFound.home }} variant="secondary" />
          </span>
        </div>
      </Section>
    </Document>
  );
}
```

`apps/tangent/app/[bucket]/[locale]/layout.tsx`:
```tsx
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { locales } from "@repo/web/locale";
import { Document } from "@/components/Document";
import type { DesignKey } from "@/experiments";
import { buckets, resolveParams, type RouteParams } from "@/lib/params";
import { site } from "@/site.config";

type Props = { params: Promise<RouteParams> };

export const dynamicParams = false;

export function generateStaticParams() {
  return buckets.flatMap((bucket) => locales.map((locale) => ({ bucket, locale })));
}

const themeColors: Record<DesignKey, { light: string; dark: string }> = {
  "tangent-precision": { light: "#f7f7f5", dark: "#0b0c0e" },
  "tangent-editorial": { light: "#fafaf7", dark: "#141311" },
};

export async function generateViewport({ params }: Props): Promise<Viewport> {
  const { design } = await resolveParams(params);
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: themeColors[design].light },
      { media: "(prefers-color-scheme: dark)", color: themeColors[design].dark },
    ],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await resolveParams(params);
  return {
    metadataBase: new URL(site.url),
    description: t.meta.siteDescription,
    icons: { icon: "/icon.svg" },
    ...(site.googleVerification ? { verification: { google: site.googleVerification } } : {}),
  };
}

export default async function LocaleLayout({ children, params }: Props & { children: ReactNode }) {
  const { locale, design, assignment } = await resolveParams(params);
  return (
    <Document locale={locale} design={design} assignment={assignment}>
      {children}
    </Document>
  );
}
```

`apps/tangent/app/[bucket]/[locale]/not-found.tsx`:
```tsx
import { getLocale } from "next-intl/server";
import { Section } from "@repo/ui/Section";
import { ButtonLink } from "@repo/ui/SmartLink";
import { defaultLocale, isLocale, localizedPath, type Locale } from "@repo/web/locale";
import { getContent } from "@/content";

/** Used for client-side navigation 404s inside the layout; server-side 404s use app/not-found.tsx. */
export default async function NotFound() {
  let locale: Locale = defaultLocale;
  try {
    const current = await getLocale();
    if (isLocale(current)) locale = current;
  } catch {
    // no request locale: English
  }
  const t = getContent(locale);
  return (
    <Section id="not-found" headingLevel="h1" title={t.notFound.title} intro={t.notFound.body}>
      <ButtonLink link={{ href: localizedPath(locale, "/"), label: t.notFound.home }} />
    </Section>
  );
}
```

`apps/tangent/app/[bucket]/[locale]/page.tsx`:
```tsx
import { Card } from "@repo/ui/Card";
import { ConnectDots } from "@repo/ui/ConnectDots";
import { CtaBand } from "@repo/ui/CtaBand";
import { Hero } from "@repo/ui/Hero";
import { Section } from "@repo/ui/Section";
import { ServiceCard } from "@repo/ui/ServiceCard";
import { ButtonLink } from "@repo/ui/SmartLink";
import { StepList } from "@repo/ui/StepList";
import { localizedPath } from "@repo/web/locale";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { serviceSlugs } from "@/content/services";
import { featuredWork } from "@/content/work";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/", t.meta.home.title, t.meta.home.description);
}

export default async function HomePage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  const href = (path: string) => localizedPath(locale, path);
  const [first, accent] = t.hero.title;
  return (
    <>
      <Hero
        eyebrow={t.hero.eyebrow}
        title={
          <>
            {first}
            <em className="tg-accent">{accent}</em>
          </>
        }
        lead={t.hero.lead}
        primary={bookingLink(locale, t, "hero")}
        secondary={{ href: href("/work"), label: t.hero.secondary }}
        chips={t.hero.proof}
        chipsLabel={t.hero.proofLabel}
        newTabLabel={t.nav.newTab}
        visual={<ConnectDots labels={t.hero.dots} />}
      />

      <Section id="flows" eyebrow={t.flows.eyebrow} title={t.flows.title} intro={t.flows.intro}>
        <ul className="grid gap-5 sm:grid-cols-2">
          {t.flows.items.map((item) => (
            <li key={item.title}>
              <Card className="h-full">
                <h3 className="font-display text-xl font-bold">{item.title}</h3>
                <p className="mt-3 text-muted">{item.body}</p>
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

      <Section id="process" eyebrow={t.process.eyebrow} title={t.process.title} intro={t.process.intro}>
        <StepList steps={t.process.steps} />
      </Section>

      <Section id="work" eyebrow={t.work.eyebrow} title={t.work.title} intro={t.work.intro}>
        <ul className="grid gap-5 md:grid-cols-3">
          {featuredWork.map((slug) => (
            <li key={slug}>
              <CaseStudyCard slug={slug} locale={locale} item={t.work.items[slug]} readMore={t.work.readMore} />
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <ButtonLink link={{ href: href("/work"), label: t.work.link }} variant="ghost" />
        </div>
      </Section>

      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
    </>
  );
}
```

- [ ] **Step 6: Typecheck, build and check the home page output**

Run:
```bash
cd /Users/pio/projects/pio-yoga && export NODE_OPTIONS=--no-network-family-autoselection
pnpm --filter tangent typecheck && pnpm --filter tangent build 2>&1 | grep -E "●|ƒ|○|rror" | head -20
A=apps/tangent/.next/server/app
grep -o 'data-design="[a-z-]*"' $A/control/en.html $A/editorial/en.html
grep -o 'Connect the dots' $A/editorial/en.html | head -1
grep -o 'Połącz kropki' $A/control/pl.html | head -1
```
Expected: typecheck clean and build succeeds. `control/en.html` has `data-design="tangent-precision"`, `editorial/en.html` has `data-design="tangent-editorial"`, and both headlines are found.

- [ ] **Step 7: Commit**

```bash
git add apps/tangent
git commit -m "feat(tangent): scaffold, Document with both designs, 404s, home page

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Services, case studies, about, contact and legal pages

**Files:**
- Create: `apps/tangent/components/{Breadcrumbs,Prose}.tsx`
- Create: `apps/tangent/app/[bucket]/[locale]/{services,services/[slug],work,work/[slug],about,contact,privacy,terms}/page.tsx`

**Interfaces:**
- Consumes: Task 4 helpers and the content.
- Produces: every path in `allPaths`, each with `generateMetadata`, one `h1`, and heading levels that never skip.

- [ ] **Step 1: Shared page components**

`apps/tangent/components/Breadcrumbs.tsx`:
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

`apps/tangent/components/Prose.tsx`:
```tsx
export function Prose({ updated, sections }: { updated: string; sections: { heading: string; paragraphs: string[] }[] }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm text-muted">{updated}</p>
      {sections.map((section) => (
        <section key={section.heading} className="mt-10">
          <h2 className="font-display text-2xl font-bold">{section.heading}</h2>
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

- [ ] **Step 2: Services**

`apps/tangent/app/[bucket]/[locale]/services/page.tsx`:
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

`apps/tangent/app/[bucket]/[locale]/services/[slug]/page.tsx`:
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
    [t.services.signsTitle, item.signs],
    [t.services.whatWeDoTitle, item.whatWeDo],
    [t.services.outcomesTitle, item.outcomes],
  ];
  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
        <Breadcrumbs
          label={t.nav.breadcrumbs}
          items={[{ name: t.nav.home, href: localizedPath(locale, "/") }, { name: t.nav.services, href: localizedPath(locale, "/services") }, { name: item.title }]}
        />
      </div>
      <Section id="service" headingLevel="h1" title={item.title} intro={item.intro} className="pt-6 sm:pt-8">
        <div className="grid gap-5 md:grid-cols-3">
          {lists.map(([heading, entries]) => (
            <Card key={heading} className="h-full">
              <h2 className="font-display text-xl font-bold">{heading}</h2>
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

- [ ] **Step 3: Work index and case studies**

`apps/tangent/app/[bucket]/[locale]/work/page.tsx`:
```tsx
import { CtaBand } from "@repo/ui/CtaBand";
import { Section } from "@repo/ui/Section";
import { CaseStudyCard } from "@/components/CaseStudyCard";
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
              <CaseStudyCard slug={slug} locale={locale} item={t.work.items[slug]} readMore={t.work.readMore} headingLevel="h2" />
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
    </>
  );
}
```

`apps/tangent/app/[bucket]/[locale]/work/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { Card } from "@repo/ui/Card";
import { ChipList } from "@repo/ui/ChipList";
import { CtaBand } from "@repo/ui/CtaBand";
import { JsonLd } from "@repo/ui/JsonLd";
import { Section } from "@repo/ui/Section";
import { breadcrumbList } from "@repo/web/json-ld";
import { localizedPath } from "@repo/web/locale";
import { absoluteUrl } from "@repo/web/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { isWorkSlug, workSlugs } from "@/content/work";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";
import { site } from "@/site.config";

type Props = { params: Promise<RouteParams & { slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return workSlugs.map((slug) => ({ slug }));
}

async function load(params: Props["params"]) {
  const { slug, ...route } = await params;
  if (!isWorkSlug(slug)) notFound();
  const resolved = await resolveParams(Promise.resolve(route));
  return { ...resolved, slug, item: resolved.t.work.items[slug] };
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug, item } = await load(params);
  return meta(locale, `/work/${slug}`, `${item.title} · ${site.name}`, item.summary);
}

export default async function CaseStudyPage({ params }: Props) {
  const { locale, t, slug, item } = await load(params);
  const url = (path: string) => absoluteUrl(site.url, localizedPath(locale, path));
  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
        <Breadcrumbs
          label={t.nav.breadcrumbs}
          items={[{ name: t.nav.home, href: localizedPath(locale, "/") }, { name: t.nav.work, href: localizedPath(locale, "/work") }, { name: item.client }]}
        />
      </div>
      <Section id="case" headingLevel="h1" eyebrow={`${item.sector} · ${item.period}`} title={item.title} intro={item.summary} className="pt-6 sm:pt-8">
        <p className="-mt-4 mb-8 text-sm text-muted">{t.work.credit.replace("{client}", item.client)}</p>
        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <h2 className="font-display text-xl font-bold">{t.work.problemTitle}</h2>
            <p className="mt-3">{item.problem}</p>
          </Card>
          <Card>
            <h2 className="font-display text-xl font-bold">{t.work.resultTitle}</h2>
            <p className="mt-3">{item.result}</p>
          </Card>
          <Card className="lg:col-span-2">
            <h2 className="font-display text-xl font-bold">{t.work.changedTitle}</h2>
            <ul className="mt-4 grid list-disc gap-2 pl-5">
              {item.whatChanged.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </Card>
        </div>
        <h2 className="mt-10 font-display text-xl font-bold">{t.work.stackTitle}</h2>
        <div className="mt-4">
          <ChipList items={item.stack} label={t.work.stackTitle} />
        </div>
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
      <JsonLd
        data={breadcrumbList([
          { name: t.nav.home, url: url("/") },
          { name: t.nav.work, url: url("/work") },
          { name: item.client, url: url(`/work/${slug}`) },
        ])}
      />
    </>
  );
}
```

- [ ] **Step 4: About**

`apps/tangent/app/[bucket]/[locale]/about/page.tsx`:
```tsx
import { Card } from "@repo/ui/Card";
import { CtaBand } from "@repo/ui/CtaBand";
import { JsonLd } from "@repo/ui/JsonLd";
import { PersonCard } from "@repo/ui/PersonCard";
import { Section } from "@repo/ui/Section";
import { person } from "@repo/web/json-ld";
import { visiblePeople } from "@/content/people";
import { bookingLink } from "@/lib/links";
import { meta } from "@/lib/metadata";
import { resolveParams, type RouteParams } from "@/lib/params";

type Props = { params: Promise<RouteParams> };

export async function generateMetadata({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  return meta(locale, "/about", t.meta.about.title, t.meta.about.description);
}

export default async function AboutPage({ params }: Props) {
  const { locale, t } = await resolveParams(params);
  const team = visiblePeople();
  return (
    <>
      <Section id="about" headingLevel="h1" eyebrow={t.about.eyebrow} title={t.about.title} intro={t.about.intro}>
        <div className="grid max-w-3xl gap-4 text-lg">
          {t.about.story.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <section aria-labelledby="education-title">
            <h2 id="education-title" className="font-display text-2xl font-bold">
              {t.about.educationTitle}
            </h2>
            <ul className="mt-4 grid gap-4">
              {t.about.education.map((entry) => (
                <li key={entry.degree}>
                  <Card>
                    <p className="font-bold">{entry.degree}</p>
                    <p>{entry.school}</p>
                    <p className="mt-1 text-sm text-muted">{entry.detail}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="awards-title">
            <h2 id="awards-title" className="font-display text-2xl font-bold">
              {t.about.awardsTitle}
            </h2>
            <ul className="mt-4 grid gap-4">
              {t.about.awards.map((award) => (
                <li key={award.title}>
                  <Card>
                    <p className="font-bold">{award.title}</p>
                    <p className="mt-1 text-muted">{award.body}</p>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Section>
      <Section id="people" title={t.about.peopleTitle} intro={t.about.peopleIntro}>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <li key={member.id}>
              <PersonCard
                name={member.name}
                role={t.people.items[member.id].role}
                bio={t.people.items[member.id].bio}
                photo={member.photo ? { src: member.photo.src, alt: member.name } : undefined}
                links={member.links}
              />
            </li>
          ))}
        </ul>
      </Section>
      <CtaBand title={t.cta.title} body={t.cta.body} cta={bookingLink(locale, t, "cta_band")} newTabLabel={t.nav.newTab} />
      <JsonLd
        data={team.map((member) =>
          person({
            name: member.name,
            jobTitle: t.people.items[member.id].role,
            sameAs: member.links.map((link) => link.href),
            alumniOf: member.id === "piotr" ? ["Wrocław University of Science and Technology"] : undefined,
            award: member.id === "piotr" ? t.about.awards.map((award) => award.title) : undefined,
          }),
        )}
      />
    </>
  );
}
```

- [ ] **Step 5: Contact, privacy, terms**

`apps/tangent/app/[bucket]/[locale]/contact/page.tsx`:
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
            <h2 className="font-display text-2xl font-bold">{t.contact.bookTitle}</h2>
            <p className="mt-2 text-muted">{t.contact.bookBody}</p>
            <div className="mt-6">
              <ButtonLink link={booking} newTabLabel={t.nav.newTab} />
            </div>
          </Card>
        )}
        <Card className={booking.external ? undefined : "md:col-span-2"}>
          <h2 className="font-display text-2xl font-bold">{t.contact.formTitle}</h2>
          <div className="mt-6">
            <ContactForm locale={locale} labels={t.contact.form} email={site.contactEmail} />
          </div>
        </Card>
      </div>
    </Section>
  );
}
```

`apps/tangent/app/[bucket]/[locale]/privacy/page.tsx`:
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

`apps/tangent/app/[bucket]/[locale]/terms/page.tsx`:
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

- [ ] **Step 6: Build and count pages**

Run:
```bash
cd /Users/pio/projects/pio-yoga && export NODE_OPTIONS=--no-network-family-autoselection
pnpm --filter tangent typecheck && pnpm --filter tangent build 2>&1 | grep -E "rror" | head
find apps/tangent/.next/server/app/control apps/tangent/.next/server/app/editorial -name "*.html" | wc -l
```
Expected: typecheck clean, build succeeds, count **80** (2 buckets × 2 locales × 20 pages).

- [ ] **Step 7: Commit**

```bash
git add apps/tangent
git commit -m "feat(tangent): services, case studies, about with people, contact and legal pages

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: SEO routes, build-output test, smoke test and docs

**Files:**
- Create: `apps/tangent/app/{sitemap,robots}.ts`, `apps/tangent/app/og/[locale]/[page]/route.tsx`, `apps/tangent/app/api/contact/route.ts`
- Create: `apps/tangent/vitest.build.config.ts`, `apps/tangent/test-build/output.test.ts`, `apps/tangent/README.md`
- Modify: `README.md` (root: Tangent row)

**Interfaces:**
- Consumes: everything above.
- Produces: `/sitemap.xml` (40 URLs), `/robots.txt`, `/og/<locale>/<key>` (40 static PNGs), `POST /api/contact`, and `pnpm --filter tangent test:build`.

- [ ] **Step 1: Route files**

`apps/tangent/app/sitemap.ts`:
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

`apps/tangent/app/robots.ts`:
```ts
import type { MetadataRoute } from "next";
import { buildRobots } from "@repo/web/seo";
import { site } from "@/site.config";

export default function robots(): MetadataRoute.Robots {
  return buildRobots(site.url);
}
```

`apps/tangent/app/og/[locale]/[page]/route.tsx`:
```tsx
import { ImageResponse } from "next/og";
import { isLocale, locales } from "@repo/web/locale";
import { getContent } from "@/content";
import { allPaths, ogKey, pageTitle, pathFromOgKey } from "@/lib/routes";

export const dynamic = "force-static";

export function generateStaticParams() {
  return locales.flatMap((locale) => allPaths.map((path) => ({ locale, page: ogKey(path) })));
}

/** Neutral (precision, dark) look: OG images are shared by both A/B designs. */
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
          background: "#0b0c0e",
          color: "#ecedef",
          padding: 72,
          backgroundImage: "linear-gradient(#16181c 1px, transparent 1px), linear-gradient(90deg, #16181c 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 36 }}>
          <div style={{ display: "flex", width: 48, height: 4, background: "#ff7a1a" }} />
          Tangent
        </div>
        <div style={{ display: "flex", fontSize: 66, lineHeight: 1.05, letterSpacing: -1.5, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 28, color: "#a0a5ae" }}>{t.footer.tagline}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
```

`apps/tangent/app/api/contact/route.ts`:
```ts
import { createContactHandler, resendSender } from "@repo/web/contact";

export const runtime = "nodejs";

const apiKey = process.env.RESEND_API_KEY;
const to = process.env.CONTACT_TO_EMAIL;

export const POST = createContactHandler({
  send: apiKey && to ? resendSender(apiKey) : null,
  to: to ?? "",
  from: process.env.CONTACT_FROM_EMAIL || "Tangent <hello@attunr.com>",
  siteName: "Tangent",
});
```

- [ ] **Step 2: Write the build-output test**

`apps/tangent/vitest.build.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["test-build/**/*.test.ts"] },
});
```

`apps/tangent/test-build/output.test.ts`:
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
const same = (url: string | undefined) => (url ? new URL(url).href : url);
const siteUrl = resolveSiteUrl();

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? htmlFiles(full) : name.endsWith(".html") ? [full] : [];
  });
}

describe("Tangent build output", () => {
  it("exists (run `pnpm --filter tangent build` first)", () => expect(existsSync(root)).toBe(true));

  it("pre-renders every bucket × locale × page", () => {
    for (const bucket of buckets) for (const locale of locales) for (const path of allPaths) {
      expect(existsSync(fileFor(bucket, locale, path)), `${bucket}/${locale}${path}`).toBe(true);
    }
  });

  it("gives each bucket its own design on every page", () => {
    for (const locale of locales) for (const path of allPaths) {
      expect(html("control", locale, path)).toMatch(/<html[^>]*data-design="tangent-precision"/);
      expect(html("editorial", locale, path)).toMatch(/<html[^>]*data-design="tangent-editorial"/);
    }
  });

  it("shows the same copy in both designs", () => {
    for (const bucket of buckets) {
      expect(html(bucket, "en", "/")).toContain("Connect the dots.");
      expect(html(bucket, "pl", "/")).toContain("Połącz kropki.");
    }
  });

  it("sets <html lang>", () => {
    expect(html("control", "en", "/")).toMatch(/<html[^>]*lang="en-AU"/);
    expect(html("editorial", "pl", "/work")).toMatch(/<html[^>]*lang="pl-PL"/);
  });

  it("gives both designs the same public canonical", () => {
    for (const locale of locales) for (const path of ["/", "/services/fresh-look", "/work/onchain", "/about"]) {
      const expected = same(absoluteUrl(siteUrl, localizedPath(locale, path)));
      for (const bucket of buckets) expect(same(canonical(html(bucket, locale, path))), `${bucket}/${locale}${path}`).toBe(expected);
    }
  });

  it("never links to an internal bucket path", () => {
    const internal = new RegExp(`href="/(?:${buckets.join("|")})(?:/|")`);
    for (const file of htmlFiles(root)) expect(readFileSync(file, "utf8"), file).not.toMatch(internal);
  });

  it("has one h1 per page", () => {
    for (const bucket of buckets) for (const path of allPaths) {
      const count = html(bucket, "en", path).match(/<h1[\s>]/g)?.length ?? 0;
      expect(count, `${bucket}${path}`).toBe(1);
    }
  });

  it("hides the connect-the-dots illustration from assistive tech", () =>
    expect(html("control", "en", "/")).toMatch(/<svg class="tg-dots[^"]*"[^>]*aria-hidden="true"/));

  it("credits case studies and ships structured data", () => {
    expect(html("control", "en", "/work/officeworks")).toContain("Work by Piotr Ciesiolkiewicz while working with Officeworks.");
    expect(html("control", "en", "/about")).toContain('"@type":"Person"');
    expect(html("editorial", "pl", "/services/fresh-look")).toContain('"@type":"FAQPage"');
  });

  it("renders a branded, bilingual 404 page", () => {
    const page = readFileSync(join(root, "_not-found.html"), "utf8");
    expect(page).not.toContain("__next_error__");
    expect(page).toMatch(/<html[^>]*data-design="tangent-precision"/);
    expect(page).toMatch(/<h1[^>]*>[^<]*Page not found/);
    expect(page).toContain("Nie znaleziono strony");
  });
});
```

- [ ] **Step 3: Build and run it**

Run:
```bash
cd /Users/pio/projects/pio-yoga && export NODE_OPTIONS=--no-network-family-autoselection
pnpm --filter tangent typecheck && pnpm --filter tangent build > /tmp/tg.txt 2>&1; echo build=$?
pnpm --filter tangent test:build
```
Expected: build=0, test:build PASSES (11 tests). If an attribute-order regex misses (e.g. the svg `class` before `aria-hidden`), inspect the real HTML and fix the regex to match it, then ledger it.

- [ ] **Step 4: Smoke-test the running site**

```bash
cd /Users/pio/projects/pio-yoga/apps/tangent && (pnpm start > /tmp/tg-start.log 2>&1 &) ; sleep 6
B=http://localhost:3002
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; echo; }
loc() { curl -s -o /dev/null -D - "$@" | grep -i '^location' | tr -d '\r'; }
echo "home:"; code $B/
echo "design:"; curl -s $B/ | grep -oE 'data-design="[a-z-]+"' | head -1
echo "sticky:"; J=$(mktemp); curl -s -c $J -o /dev/null $B/; for i in 1 2 3; do curl -s -b $J $B/work | grep -oE 'data-design="[a-z-]+"' | head -1; done
echo "PL geo:"; loc -H "x-vercel-ip-country: PL" $B/work/onchain
echo "pl case:"; code $B/pl/work/onchain
echo "404 pl:"; code $B/pl/work/xyz
echo "404 body:"; curl -s $B/pl/work/xyz | grep -oE '<h1[^>]*>[^<]*' | sed 's/<h1[^>]*>//' | head -1
echo "no-JS form:"; loc -X POST -H "content-type: application/x-www-form-urlencoded" --data "name=Ania&email=ania@example.pl&message=Chcemy+usprawnic+procesy&locale=pl" $B/api/contact
echo "og:"; curl -s -o /dev/null -w "%{http_code} %{content_type}\n" $B/og/pl/work--onchain
echo "sitemap urls:"; curl -s $B/sitemap.xml | grep -c "<loc>"
echo "headers over http:"; curl -s -o /dev/null -D - $B/ | grep -ciE '^strict-transport-security|upgrade-insecure-requests'
lsof -ti tcp:3002 | xargs -r kill
```
Expected:
- `home:` 200, and `design:` one of the two keys.
- `sticky:` the same design printed three times.
- `PL geo:` location `/pl/work/onchain`. `pl case:` 200.
- `404 pl:` 404, with body h1 "Page not found".
- `no-JS form:` location `…/pl/contact?error=unavailable#contact-error-unavailable`.
- `og:` `200 image/png`. `sitemap urls:` 40. `headers over http:` 0.

- [ ] **Step 5: Docs**

`apps/tangent/README.md`:
````markdown
# Tangent

Process, product and software for startups. English (Australia) at `/`, Polish at `/pl/...`. Every page is pre-rendered for both A/B designs.

```bash
pnpm --filter tangent dev        # http://localhost:3002
pnpm --filter tangent test       # content and routes
pnpm --filter tangent build && pnpm --filter tangent test:build
```

## The design experiment

- PostHog experiment with feature-flag key **`design`**, variants **`control`** (dark precision) and **`editorial`** (light editorial), 50/50.
- The edge middleware assigns the variant (sticky cookie). The page reports it as `$feature_flag_called` plus `$feature/design`. PostHog's own flag evaluation is disabled, so it can't override the assignment.
- Both designs share the same copy and components. Only the CSS design tokens and style hooks differ (`packages/ui/src/styles/tangent.css`).
- Primary metric: `booking_opened` or `form_submitted` (`success: true`). Secondary: `cta_click`, `scroll_depth`, case-study page views. B2B traffic is low, so expect weeks to months before a result.
- To end the test, set the winner's weight to 100 in `experiments.ts`. To ship `editorial` permanently, make it the default design and delete the experiment.

## Before launch

- **NIP:** `footer.legal` in `content/pl.ts`. The ABN is set in `content/en.ts`.
- **Polish copy:** `content/pl.ts` is a draft. Review it all, including the legal pages.
- **Legal pages:** `privacy` and `terms` in both content files are templates. Have them reviewed.
- **People:** add collaborators in `content/people.ts`, with roles and bios in both content files. Set `consent: true` only after written consent. Photos go in `public/people/`.

## Vercel

New project from this repo with **Root Directory** `apps/tangent`, and environment variables from `.env.example`. `NEXT_PUBLIC_SITE_URL` must be this project's real URL. HSTS and `upgrade-insecure-requests` turn on automatically on Vercel (`VERCEL=1`).
````

In the root `README.md`, change the Tangent row's last column to: `Process, product and software for startups (see apps/tangent/README.md)`.

- [ ] **Step 6: Full pipeline**

Run:
```bash
cd /Users/pio/projects/pio-yoga && export NODE_OPTIONS=--no-network-family-autoselection
pnpm typecheck && pnpm test && pnpm build && pnpm turbo run test:build
```
Expected: everything passes across web, ui, helpful-machines, tangent and yoga.

- [ ] **Step 7: Commit and hand back**

```bash
git add apps/tangent README.md
git commit -m "feat(tangent): sitemap, robots, OG images, contact API, build checks and docs

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
Report the test counts, smoke results and commits. Remind the user of the NIP, the Polish review, the legal review, and the Vercel and PostHog setup. Don't push.
