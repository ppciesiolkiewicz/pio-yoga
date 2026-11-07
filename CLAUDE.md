# Project notes

## Polish is on hold (English only)

Until this section is removed, work in English only on the business sites (`apps/helpful-machines`, `apps/tangent`):

- Write and change copy in `content/en.ts` only. Don't update `content/pl.ts`, PLN prices or Polish legal pages, and don't suggest Polish improvements.
- Keep the Polish site building: if a change to `en.ts` adds a key, add the same key to `pl.ts` (copying the English text is fine), so types and tests pass.
- Polish is switched off, not deleted: `liveLocales` in `packages/web/src/locale.ts` is `["en"]`, so no `/pl` pages are built and old `/pl` links redirect to English. Adding `"pl"` back turns it on again. The yoga app has its own locales and still serves Polish.
