import Stripe from "stripe";

let client: Stripe | null = null;

/** Returns a Stripe client, or null until STRIPE_SECRET_KEY is configured. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) client = new Stripe(key);
  return client;
}
