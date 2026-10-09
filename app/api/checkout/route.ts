import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { isLocale } from "@/lib/i18n";
import { site } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  const price = process.env.STRIPE_PRICE_VIDEO_PROGRAM;
  if (!stripe || !price || !site.videoProgramEnabled) {
    return NextResponse.json({ error: "checkout_unavailable" }, { status: 503 });
  }

  let locale = "en";
  try {
    const body = (await req.json()) as { locale?: string };
    if (body.locale && isLocale(body.locale)) locale = body.locale;
  } catch {
    // keep default locale
  }

  const origin = new URL(req.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      locale: locale === "pl" ? "pl" : "en",
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_creation: "always",
      metadata: { product: "video_program", locale },
      success_url: `${origin}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/checkout/cancel`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error", err);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
