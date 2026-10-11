# attunr monorepo

Three independent websites deployed from one repo.

| App | Path | What it is |
| --- | --- | --- |
| Yoga | `apps/yoga` | Pio – yoga, Thai yoga massage, program, video (see `apps/yoga/README.md`) |
| Tangent | `apps/tangent` | Senior engineering and business analysis for startups (Plan 3) |
| Helpful Machines | `apps/helpful-machines` | AI and IT for small businesses (see `apps/helpful-machines/README.md`) |

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
