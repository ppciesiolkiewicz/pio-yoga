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
