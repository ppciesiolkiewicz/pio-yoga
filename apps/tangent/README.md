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

New project from this repo with **Root Directory** `apps/tangent`, and environment variables from `.env.example`. `NEXT_PUBLIC_SITE_URL` defaults to `https://tangentlabs.com.au`. Set it to the real URL until that domain is bought. HSTS and `upgrade-insecure-requests` turn on automatically on Vercel (`VERCEL=1`).
