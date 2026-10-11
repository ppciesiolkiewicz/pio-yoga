# Multi-brand monorepo: Yoga, Tangent, Helpful Machines

Date: 2026-10-11
Status: Draft for review

## 1. Goal

Turn the current single-app yoga repo into one monorepo that deploys three independent websites:

| App | Brand | Audience | Offer |
| --- | --- | --- | --- |
| `apps/yoga` | Pio (existing) | Yoga clients | Unchanged: yoga, Thai massage, program, video |
| `apps/tangent` | **Tangent** | Startups, founders | Senior engineering and business analysis: architecture, full-stack builds, BA, fractional tech lead, AI integration, payments and Web3 |
| `apps/helpful-machines` | **Helpful Machines** | Small businesses | "Making AI work for you": AI assistants and automation, custom apps and websites, spreadsheets and data, migrations and integrations, business analysis. Affordable, free consult |

Each business (Tangent, Helpful Machines) runs in two markets: **Australia** (English, default, at `/`) and **Poland** (Polish, at `/pl/...`).

### Success criteria

- Three Vercel projects deploy from one repo. Each builds only when its code or a shared package changes.
- Every page is statically generated (SSG). The only runtime pieces are edge middleware and `/api/contact`.
- Lighthouse mobile ≥ 95 in all four categories on every page, in both markets and both colour modes.
- WCAG 2.2 AA. Axe reports no serious or critical violations on any route.
- A/B experiments run without flicker, without SEO harm, and report conversions in PostHog.
- Brand, domain, prices and copy can change through config and content files, without touching components.

### Decisions made during brainstorming

- Three separate Next.js apps, not one app with three zones.
- Two separate brands for the startup and small-business offers, sharing one design system.
- Brand names: **Tangent** (startups) and **Helpful Machines** (small business; also the company name).
- Market model: same page structure for AU and PL, with content, prices, contact and legal details per market.
- i18n: `next-intl`, `localePrefix: "as-needed"`, same slugs in both locales.
- Geolocation: visitors in Poland are redirected to `/pl`; everyone else gets English. An explicit choice wins.
- Language switch: built but hidden by default (`showLocaleSwitch: false`). A footer language link is always visible.
- Lead capture: Cal.com link plus a contact form (Resend email).
- Experiments and analytics: PostHog, EU region.
- Tangent tests two visual styles against each other: **A dark precision** vs **B light editorial**.
- Helpful Machines tests its hero headline: "AI that actually does the boring bits." vs "Put your business on easy mode."
- Every style variant has light and dark colour modes with a Light / Dark / System switch.
- Copy rule: Helpful Machines always says **"Custom apps"**, never "Apps" alone.
- Tooling: Turborepo + pnpm workspaces, Tailwind v4, Radix primitives.

## 2. Repository and deployment

### Structure

```
apps/
  yoga/               existing site, moved as-is (own CSS, /en + /pl, Stripe, own middleware)
  tangent/            Next 15 · Tailwind v4 · Radix · next-intl
  helpful-machines/   Next 15 · Tailwind v4 · Radix · next-intl
packages/
  ui/                 design tokens and components (Radix-based where interactive)
  web/                shared Next helpers: i18n, SEO, JSON-LD, sitemap/robots, OG template,
                      experiments, geo routing, colour-mode script, consent, contact route, analytics
  config/             tsconfig, eslint, prettier, tailwind base
docs/superpowers/specs/
turbo.json  pnpm-workspace.yaml  package.json
```

### Tooling

- **pnpm workspaces + Turborepo.** Tasks: `dev`, `build`, `typecheck`, `lint`, `test`, `test:e2e`. Build outputs are cached.
- The yoga app keeps its own `next.config.mjs`, `globals.css`, Stripe routes, content and middleware. Only import paths and the package manager change; the yoga site's URLs and behaviour stay the same.

### Deployment

- Three Vercel projects, each with **Root Directory** set to its app and **Ignored Build Step** set to `npx turbo-ignore`.
- Every app reads its public URL from one constant, `site.url`, taken from `NEXT_PUBLIC_SITE_URL`, with `https://attunr.com` as the fallback in each app.
  - Only one app can actually be served at the root of attunr.com. Before going live, each Vercel project must set its own real value (subdomain, path or new domain). Canonicals, hreflang, sitemaps and OG URLs all come from this one value, so a domain move is an env change plus a redeploy.
- Domain notes (for later, not part of this build): `helpfulmachines.ai` was available on 2026-10-11 (Vercel quote: $160 for the 2-year minimum). `helpfulmachines.com.au`, `.au` and `.pl` were also free. `.com.au` needs an ABN.

### Environment variables (per app)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public base URL (default `https://attunr.com`) |
| `NEXT_PUBLIC_CAL_URL_EN`, `NEXT_PUBLIC_CAL_URL_PL` | Booking links per market |
| `CONTACT_TO_EMAIL` | Where contact form messages go |
| `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` | Sending contact emails |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project key (EU host) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console (optional) |

Missing optional variables degrade gracefully. With no Cal URL, CTAs link to `/contact` (or `/pl/contact`). With no PostHog key, no analytics script loads. With no Resend key, the API returns 503 and the form shows "email us" with the address.

## 3. Markets and routing

### Locales

- `en` (Australia), the default, served without a prefix: `/`, `/services`, `/work/onchain`.
- `pl` (Poland), served at `/pl`, `/pl/services`, `/pl/work/onchain`.
- `<html lang>` is `en-AU` or `pl-PL`. hreflang alternates: `en-AU`, `pl-PL`, `x-default` → English.
- `next-intl` with `localeDetection: false`. Language choice is handled by the geo logic below.
- Every page uses `generateStaticParams` for locales (and slugs and variants) plus `setRequestLocale`, so pages stay static.

### Middleware order (Tangent and Helpful Machines)

1. **Skip** `/api/*`, `/_next/*`, `/ingest/*`, static files, OG image routes, and known bots and crawlers (user-agent check). Bots get the requested URL, with no redirect and variant `a`.
2. **Explicit choice:** a `NEXT_LOCALE` cookie (1 year) is respected. Visiting a `/pl/...` URL, or clicking a language link, sets it.
3. **Geo:** if there's no cookie, `x-vercel-ip-country === "PL"`, and the path has no `/pl` prefix → **307** redirect to `/pl` + path, keeping the query string.
4. **Experiment bucket:** read or set the `hm_exp` cookie (random bucket per active experiment, 90 days, `SameSite=Lax`, first-party, no personal data).
5. **Rewrite** to the pre-rendered variant route (Section 5). The browser URL doesn't change.

### Language switch

- `LocaleSwitch` component in the header, controlled by `showLocaleSwitch` in the app config (default `false`).
- The footer always shows a text link to the other market ("Polski" on English pages, "English" on Polish pages), with `hreflang` and `lang` attributes. It sets `NEXT_LOCALE`.

## 4. Content model

All copy lives in typed TypeScript in each app (no CMS).

```
apps/<app>/content/
  en.ts          all English (AU) copy; the source of the type
  pl.ts          Polish copy; must satisfy typeof en
  market.ts      per market: currency, prices, Cal URL key, contact, legal entity text
                 (ABN / NIP placeholders), enabled pages
  services.ts    service slugs and order (copy in en/pl)
  work.ts        case-study slugs, client, sector, stack, year (copy in en/pl)
  people.ts      Tangent only: name, role (lead | collaborator), skills, photo?, links, consent flag
apps/<app>/site.config.ts
  brand name, logo, showLocaleSwitch, nav, default style variant, social links
apps/<app>/experiments.ts
  experiment definitions (Section 5)
```

- Pages read content only through a `getContent(locale)` helper. Components get props, not dictionaries.
- A page can be switched off per market in `market.ts`. It's then left out of static params, the sitemap and the nav.
- **Helpful Machines copy rule:** "Custom apps", never "Apps" alone. Enforced by a Vitest content test that scans `en.ts`/`pl.ts` and fails on `\bapps?\b` (case-insensitive) without "custom" before it (Polish: "aplikacje" must have "dedykowane" or "na zamówienie" before it).
- **People on Tangent:** positioned as "Tangent is led by Piotr, with a network of senior specialists brought in per project." Collaborators are never described as employees, and no staff count is shown. A photo, name and bio appear only when `consent: true`. With no photo, a monogram avatar shows. Collaborators may be based outside Australia; no location claims are made for anyone.
- Polish copy: first draft machine-assisted, marked for Piotr's review before launch.

## 5. Experiments

### Definition

```ts
// apps/helpful-machines/experiments.ts
export const experiments = {
  hero: {
    variants: { a: "boring-bits", b: "easy-mode" },
    weights: [50, 50],
    markets: ["en", "pl"],
  },
} as const;

// apps/tangent/experiments.ts
export const experiments = {
  style: {
    variants: { a: "dark-precision", b: "editorial" },
    weights: [50, 50],
    markets: ["en", "pl"],
  },
} as const;
```

- Helpful Machines `hero`, variant a: "AI that actually does the boring bits." Variant b: "Put your business on easy mode." Polish equivalents live in `pl.ts`.
- Tangent `style` switches the whole site's design tokens and some layout details (grid background and mono labels in A; numbered sections and serif accent words in B). Components are shared.

### Mechanics

- **Build:** each app has a hidden route segment, `app/[variant]/[locale]/...`, and every variant × locale × page is pre-rendered. Variant ids come from the experiment config. With one experiment per app, that's two variants and twice the static pages.
- **Request:** middleware assigns the bucket and rewrites `/pl/services` → `/b/pl/services` internally (the exact internal prefix is an implementation detail and is never exposed or linked).
- **SEO safety:** one public URL per page, one canonical (no variant in it), and the sitemap lists public URLs only. Bots always get variant `a`.
- **Ending a test:** set the winner's weight to 100 (or remove the experiment) and deploy.
- **Low traffic:** Tangent's B2B traffic is low, so the style test may need months to reach significance. Secondary signals are tracked so a judgement call can be made earlier.

### Measurement (PostHog, EU region)

- Loaded after the page is interactive (`requestIdleCallback`, falling back to `setTimeout`) and proxied through `/ingest/*` on the app's own domain via Next rewrites.
- **Consent:** until the visitor accepts, PostHog runs with `persistence: "memory"` (no cookies, no localStorage). A small consent banner (Accept / Decline) appears on first visit in both markets. Accepting switches to `localStorage+cookie` persistence. Declining keeps memory mode. The choice is stored in a `consent` cookie.
- **Events:**
  - `experiment_exposure` {experiment, variant}, sent once per page view
  - `cta_click` {location, label}
  - `booking_opened` {market}
  - `form_submitted` {market, success}
  - `scroll_depth` {25 | 50 | 75 | 100}
- Every event carries `market`, `color_mode`, and each active experiment's variant as properties.
- Primary metric: Helpful Machines `booking_opened` + `form_submitted`; Tangent `booking_opened` + `form_submitted`. Secondary: `cta_click`, scroll depth, Work page views.

## 6. Design system (`packages/ui`)

### Tokens

Tailwind v4 `@theme` reads CSS variables: `--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-2`, `--accent-ink`, `--radius`, `--shadow-cta`, `--font-display`, `--font-body`, `--font-mono`, `--grid` (optional background pattern).

Each style ships a light and a dark token set, selected by `data-style` and `data-theme` on `<html>`:

| Style | Light | Dark |
| --- | --- | --- |
| Helpful Machines | Cream `#FFF6EA`, ink `#1E1A15`, coral `#FF5A36`, highlighter `#FFC94A`, Bricolage Grotesque, 4 px offset sticker shadow on CTAs, outlined pill chips | Warm charcoal, same coral and yellow, cream ink (to be mocked and approved) |
| Tangent A, dark precision | Off-white with a faint 28 px grid, same orange (to be mocked and approved) | Near-black `#0B0C0E` with a 28 px grid, Inter Tight + JetBrains Mono, orange `#FF7A1A` |
| Tangent B, editorial | `#FAFAF7`, Inter Tight + Instrument Serif accent words, vermilion `#E5402A`, numbered sections | Warm ink background, same vermilion and serif accents (to be mocked and approved) |

The three new mode designs are mocked in the visual companion and approved before they ship.

### Colour mode

- Default: System (`prefers-color-scheme`). The switch is **Light / Dark / System**, built with Radix ToggleGroup, in the header (in the mobile menu on small screens).
- No flash on load: an inline script of ~300 bytes in `<head>` reads `localStorage.colorMode` and sets `data-theme` and `color-scheme` before first paint. Pages stay static. Storage access is wrapped in try/catch; if it fails, the site falls back to System.

### Components

- **Radix (client):** NavigationMenu, Dialog (mobile menu), Accordion (FAQ and service details), Tabs (Work sector filter, with link fallback), Toast (form result), Tooltip (stack tags), ToggleGroup (colour mode), VisuallyHidden, Slot.
- **Server components (no client JavaScript):** Section, Hero, ServiceCard, CaseStudyCard, PersonCard, PricingCard, Stat, ProofStrip, StepList, CTABand, Header shell, Footer, Prose, Breadcrumbs.
- **Motion:** CSS only. Tangent's line draws on load and Helpful Machines' highlighter sweeps across the headline. Both are off under `prefers-reduced-motion`.
- **Fonts:** `next/font`, self-hosted, Latin + Latin Extended subsets (Polish characters), `display: swap`, only the display font preloaded.

## 7. Pages

### Shared on both business sites

- Header (logo, nav, CTA, colour-mode switch, optional locale switch), mobile Dialog menu.
- Footer (nav, contact, market language link, ABN/NIP placeholder, `/privacy`, `/terms`).
- A 404 page in the brand style with a real 404 status.
- `/contact`: Cal.com button (opens in a new tab, no embed) plus the contact form.
- OG images generated per page at build time with `next/og` in brand colours.
- `/privacy` and `/terms`: template text, marked for review.

### Tangent

| Route | Content |
| --- | --- |
| `/` | Hero → proof strip (10+ yrs; fintech and DeFi, e-commerce, health, telco) → services (6) → featured work (3) → how we work (Discover → Architect → Build → Hand over) → people → CTA |
| `/services` | Overview of the 6 services |
| `/services/[slug]` | product-architecture, full-stack-build, business-analysis, fractional-tech-lead, ai-integration, payments-web3. Each: problem → what we do → deliverables → related work → FAQ → CTA |
| `/work` | Case studies with a sector filter |
| `/work/[slug]` | onchain, lysn, udrew, officeworks, highsnobiety, displaysweet, nokia. Each: sector, challenge, what was built, stack, outcome. Framed as "experience behind Tangent" |
| `/about` | Story, education (MSc Computer Science, BEng Control Engineering and Robotics, both 5.0 GPA), awards (GovHack 2017, RegHack Downunder 2017 1st prize), people grid |
| `/contact`, `/privacy`, `/terms` | As above |

Source for case studies and claims: Piotr's resume (2026). No metrics are invented; outcomes are stated as written in the resume.

### Helpful Machines

| Route | Content |
| --- | --- |
| `/` | Hero (A/B headline) → what we fix (pain → fix pairs) → services → how it works (4 steps) → pricing teaser → work → FAQ → free-consult CTA |
| `/services` | Overview of the 5 services |
| `/services/[slug]` | ai-assistants-automation, custom-apps-websites, spreadsheets-data, migrations-integrations, find-what-works |
| `/how-it-works` | Free consult → plan and quote → build → support |
| `/pricing` | 3 "starting from" packages per market (AUD / PLN) plus custom quote. Figures are placeholders in `market.ts` |
| `/work` | Same experience, rewritten in plain language |
| `/faq` | Radix Accordion with FAQPage JSON-LD |
| `/contact`, `/privacy`, `/terms` | As above |

The site never mentions where Piotr lives.

## 8. Contact form

- Fields: name, email, business/company (optional), message, market (hidden), honeypot (hidden), render timestamp (hidden).
- `/api/contact` (Node runtime): zod validation. It rejects silently (fake success) if the honeypot is filled or the form was submitted under 3 s after rendering. A simple in-memory rate limit (best effort per instance). It sends one email to `CONTACT_TO_EMAIL` through Resend, with reply-to set to the sender.
- **Progressive enhancement:** without JavaScript, a plain `POST` is followed by a 303 redirect to `/contact?sent=1` (or an error state). With JavaScript, it submits in place, shows inline field errors and an error summary, and confirms with a Toast.
- Responses: 200 `{ok:true}`, 400 `{errors}`, 503 when email isn't configured (the UI then shows the email address).

## 9. SEO

- Per-page `generateMetadata` via a shared `pageMetadata()` helper: title template, description, canonical, hreflang (`en-AU`, `pl-PL`, `x-default`), Open Graph and Twitter tags, OG image.
- `sitemap.xml` with language alternates for every public, enabled page. `robots.txt` points to it.
- **JSON-LD builders in `packages/web`:**
  - Organization + WebSite on every page
  - ProfessionalService with `areaServed: ["AU", "PL"]`
  - Service on service pages
  - FAQPage where FAQs appear
  - BreadcrumbList on inner pages
  - Person on About (Piotr, plus collaborators with consent)
- One `h1` per page, semantic sections, descriptive link text, internal links between services ↔ work ↔ contact.
- Experiments and geo redirects never touch bots, canonicals or the sitemap.

## 10. Performance

- Budgets, checked by Lighthouse CI on preview deploys:
  - Lighthouse mobile ≥ 95 in every category
  - ≤ 70 KB first-load JavaScript (gzipped) per page
  - LCP < 1.8 s on slow 4G
  - CLS < 0.02
  - INP < 150 ms
- Static HTML on Vercel's CDN. Images through `next/image` (AVIF/WebP, explicit sizes, priority only on the LCP image).
- No third-party embeds. PostHog deferred and proxied. Cal.com is a link.
- Security headers carried over from the yoga app's `next.config.mjs` into a shared config helper, plus a strict CSP that allows only self, the PostHog proxy (same origin) and inline scripts by hash (the colour-mode script).

## 11. Accessibility

- WCAG 2.2 AA in all 6 token sets (3 styles × light/dark). Contrast is checked per token pair. Where an accent fails AA for body text (e.g. orange on near-black under 18 px, coral on cream for small text), it's used only for large text and decorative elements, or a darker or lighter shade is used for text.
- Skip link, visible focus styles per brand, `aria-current` in nav, keyboard paths through all Radix components, labelled form fields with `aria-describedby` errors and an error summary, `lang` and `hreflang` on the language links, a labelled colour-mode switch that announces its state.
- Touch targets ≥ 44 px. `prefers-reduced-motion` respected. Nothing auto-plays.

## 12. Testing

- **Vitest (unit):**
  - middleware precedence: bot skip, `NEXT_LOCALE` cookie, PL geo redirect with path and query kept, bucket assignment, rewrite target
  - weighted bucket distribution
  - contact validation, honeypot and timing rules
  - `pageMetadata` canonical and hreflang output
  - `pl` content matching `en`'s shape (type-level plus a runtime key check)
  - the "Custom apps" copy rule
- **Playwright (E2E), both markets:**
  - home → service → contact submit (Resend mocked)
  - no-JavaScript form submit
  - geo redirect with a faked `x-vercel-ip-country: PL`
  - cookie override of the geo redirect
  - sticky variant across pages
  - colour-mode persistence across reloads with no flash (checked by reading `data-theme` before hydration)
- **`@axe-core/playwright`** on every route in light and dark: the build fails on serious or critical issues.
- **Lighthouse CI** with the budgets in Section 10.
- During the build, the design skills `design:accessibility-review`, `design:design-critique` and `design:ux-copy` are run on the finished pages.

## 13. Build order

1. **Monorepo foundation:** pnpm + Turborepo, move yoga to `apps/yoga` (verify that build, routes and Stripe are unchanged), `packages/config`.
2. **Shared packages:** `packages/ui` tokens and components, `packages/web` (i18n, SEO, middleware, experiments, colour mode, consent, analytics, contact).
3. **Helpful Machines app:** pages, content (EN, then a PL draft), the hero experiment.
4. **Tangent app:** pages, content, people, the style experiment, new colour-mode designs approved first.
5. **Quality pass:** a11y, Lighthouse, design critique, copy review. Then Vercel project setup docs.

Each step is its own section of the implementation plan, with verification before moving on.

## 14. Out of scope

- CMS, blog, newsletter.
- Buying domains and DNS setup (`helpfulmachines.ai`, `.com.au`, `.pl`).
- Real prices, final Polish copy review, team photos and collaborator consent, legal text review.
- Payments on the business sites.
- Any change to the yoga site's design, content or routes.
