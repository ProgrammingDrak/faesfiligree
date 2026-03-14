import Stripe from "stripe";

function getStripeInstance(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  return new Stripe(key, {
    typescript: true,
  });
}

export const stripe = getStripeInstance();

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
