# Pio – yoga, Thai yoga massage, movement & voice

Bilingual (English / Polish) personal site, built with Next.js (App Router) and deployed on Vercel.

## Pages

| Path | What it is |
| --- | --- |
| `/en`, `/pl` | Home: story, training, classes, Thai yoga massage, other disciplines, contact |
| `/[locale]/program` | Guided transformation program (yoga, yin yoga, dynamic fascia release) |
| `/[locale]/video` | Video program with a free consultation; shows "coming soon" until enabled |
| `/[locale]/timer` | Gong interval timer for practice (sounds in `public/sounds/`, generated with ElevenLabs) |
| `/[locale]/checkout/success`, `/cancel` | Stripe Checkout return pages (not indexed) |

Visiting `/` redirects to `/pl` or `/en` based on the browser language (and remembers the choice from the language switch in a cookie).

All copy lives in `content/en.ts` and `content/pl.ts`. Edit text there; the Polish file must have the same shape as the English one (TypeScript checks this).

## Local development

```bash
npm install
cp .env.example .env.local   # fill in what you have
npm run dev
```

## Environment variables

See `.env.example`. On Vercel: Project → Settings → Environment Variables.

- `NEXT_PUBLIC_SITE_URL` – the public domain (used for canonical URLs, hreflang and the sitemap). Update it when you add a custom domain.
- `NEXT_PUBLIC_CONTACT_EMAIL` – shown on the contact section.
- `NEXT_PUBLIC_BOOKING_URL` – Calendly or Cal.com link for the free consultation. Without it, booking buttons scroll to the contact section.

## Stripe (video program)

The checkout is built but switched off until you're ready:

1. In Stripe, create a product "Video program" with a one-time price in your base currency (e.g. EUR or PLN). Copy the price ID (`price_…`).
2. Turn on **Adaptive Pricing** (Stripe Dashboard → Settings → Payments → Adaptive Pricing). Customers then see and pay in their local currency automatically, so one price covers all currencies.
3. Set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_VIDEO_PROGRAM`, and `NEXT_PUBLIC_VIDEO_PROGRAM_ENABLED=true` on Vercel, then redeploy.
4. Add a webhook endpoint in Stripe pointing to `https://YOUR-DOMAIN/api/stripe/webhook` for the event `checkout.session.completed`, and set `STRIPE_WEBHOOK_SECRET` to its signing secret.
5. Finish the `TODO` in `app/api/stripe/webhook/route.ts` to email buyers their access (video links + consultation booking link).

## SEO and analytics

Built in:

- Static pre-rendering of every page, self-hosted fonts (`next/font`), AVIF/WebP images, security headers.
- Per-page titles and descriptions, canonical URLs, `hreflang` alternates (en, pl, x-default), Open Graph and Twitter tags.
- `sitemap.xml` (with language alternates) and `robots.txt`.
- JSON-LD structured data (Person with credentials and offers; Service for the program).
- Vercel Analytics and Speed Insights (enable both in the Vercel project dashboard).

**Semrush:** Semrush crawls the public site, so Site Audit and Position Tracking work as soon as it's live; add the domain as a project in Semrush. For deeper data, connect Google Search Console and Google Analytics to Semrush:

- Verify the domain in Google Search Console (DNS record on the domain, or set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`). Bing and Yandex have their own variables.
- Set `NEXT_PUBLIC_GTM_ID` and add GA4 (and any ad pixels) inside Google Tag Manager, so new tags never need a code change.
