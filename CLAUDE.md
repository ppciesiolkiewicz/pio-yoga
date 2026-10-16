# Project notes

## Polish is on hold (English only)

Until this section is removed, work in English only on the business sites (`apps/helpful-machines`, `apps/tangent`):

- Write and change copy in `content/en.ts` only. Don't update `content/pl.ts`, PLN prices or Polish legal pages, and don't suggest Polish improvements.
- Keep the Polish site building: if a change to `en.ts` adds a key, add the same key to `pl.ts` (copying the English text is fine), so types and tests pass.
- Don't remove the Polish locale or its routes without asking.
