# Design and accessibility review: Helpful Machines and Tangent

Date: 2026-10-13. Method:
- 40 full-page screenshots (both apps; Tangent in both designs; light and dark; desktop 1280 px and phone 390 px), plus viewport-only phone shots
- the `design:design-critique` and `design:accessibility-review` skills
- scripted checks: reflow at 320 px, tap-target sizes, keyboard focus
- axe on 216 page variants

Screenshots are in `.superpowers/quality/screens/` (git-ignored).

## Summary

| Severity | Found | Fixed |
| --- | --- | --- |
| Critical | 0 | 0 |
| Important | 2 | 2 |
| Minor | 6 | 0 (listed below) |

## Important (fixed)

1. **The header CTA was squeezed in next to the menu button on phones.**
   - Screenshots: `top/hm-dark.png`, `top/hm-light.png`, `top/tg-*.png`.
   - "Book a free chat" wrapped onto three lines beside "Menu" (in Polish: "Umów bezpłatną rozmowę").
   - Cause: `hidden sm:inline-flex` on the link lost to the button's own `inline-flex` class (CSS order).
   - Fix: the CTA now sits in a `hidden sm:block` wrapper (`SiteHeader.tsx`). On phones it's in the mobile menu.
   - Tests: ui `hides the header CTA on phones via a wrapper`, plus e2e `phones get the CTA in the menu`.
2. **Helpful Machines scrolled sideways at 320 px** (WCAG 1.4.10 Reflow): 11 px on most pages, 51 px on `/pl/pricing`.
   - Cause: the same header CTA.
   - After the fix, overflow is 0 px on every page checked.
   - Test: e2e `no horizontal scrolling at 320px` on 4 pages × 2 apps.

## What works well

- **Strong first impressions.** Helpful Machines: highlighted headline, sticker CTA, plain-language cards. Tangent precision: grid, mono labels, muted accent line. Tangent editorial: serif italic accent, numbered sections.
- **Consistent hierarchy.** One h1 per page, eyebrow → heading → intro → content, and the same card language in each design.
- **Contrast passes in all 6 token sets.**
  - axe found zero serious or critical issues in 216 variants.
  - Lighthouse accessibility is 1.00 on every audited page.
  - Focus is a 3 px solid outline, and the skip link is the first Tab stop.
- **Dark modes stay in character.** Helpful Machines keeps its sticker look (cream lines, coral shadows). Tangent's dark modes keep their accents readable.

## Minor (not fixed; for a later pass)

1. **Tangent precision eyebrow wrapping:** "// PROCESS, PRODUCT AND SOFTWARE · FOR STARTUPS" breaks after the "·" on phones. A shorter eyebrow, or `text-wrap: balance`, would read better.
2. **Section spacing:** the gaps between home-page sections (about 160 px on desktop) make both home pages long. Consider `py-12 sm:py-16` for inner sections.
3. **Consent banner size:** on phones it covers about 25% of the screen until a choice is made. That's acceptable for a consent prompt, but a more compact layout (buttons side by side, shorter text) would hide less.
4. **Helpful Machines dark highlighter:** the deep-coral band is readable but lower-energy than the yellow in light mode. A slightly brighter band (e.g. `#a3452c`) keeps contrast and adds pop.
5. **Tangent About page:** People and Awards could use the same card height, so the grid looks tidier with a single person card.
6. **Service-card titles:** the link text is 24 px tall. The whole card is clickable, so the target is fine, but a visible focus ring on the card (`focus-within` outline) would make keyboard focus clearer than the title-only outline.
