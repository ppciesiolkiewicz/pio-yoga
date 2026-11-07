# Project notes

## helpful-machines is English-only (Polish removed)

`apps/helpful-machines` has no Polish support: `content/pl.ts`, PLN pricing, and the Polish branches in the root 404 page are gone. Work in English only (`content/en.ts`); don't reintroduce Polish content or market entries here.

The shared locale/routing infra in `packages/web` and `packages/ui` (`locale.ts`, `LanguageLink`, consent/GDPR branching) is still multi-locale-aware because `apps/tangent` keeps its own active `content/pl.ts` on top of it — don't assume that shared code is dead.

## Polish is on hold for apps/tangent (English only)

Until this section is removed, work in English only on `apps/tangent`:

- Write and change copy in `content/en.ts` only. Don't update `content/pl.ts`, PLN prices or Polish legal pages, and don't suggest Polish improvements.
- Keep the Polish site building: if a change to `en.ts` adds a key, add the same key to `pl.ts` (copying the English text is fine), so types and tests pass.
- Polish is switched off, not deleted: `liveLocales` in `packages/web/src/locale.ts` is `["en"]`, so no `/pl` pages are built and old `/pl` links redirect to English. Adding `"pl"` back turns it on again. The yoga app has its own locales and still serves Polish.
