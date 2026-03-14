"use server";

import { stripe, isStripeConfigured } from "./client";
import { getProductBySlug } from "@/lib/sanity/queries";

interface CheckoutItem {
  slug: string;
  quantity: number;
}

export async function createCheckoutSession(items: CheckoutItem[]) {
  if (!isStripeConfigured() || !stripe) {
    return { error: "Stripe is not configured. Please set up your environment variables." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    // Validate prices server-side — never trust client-sent prices
    const lineItems = await Promise.all(
      items.map(async (item) => {
        const product = await getProductBySlug(item.slug);
        if (!product) throw new Error(`Product not found: ${item.slug}`);
        if (!product.inStock) throw new Error(`Product out of stock: ${product.name}`);

        // Use Stripe Price ID if available, otherwise create a price on-the-fly
        if (product.stripePriceId) {
          return {
            price: product.stripePriceId,
            quantity: item.quantity,
          };
        }

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.materials?.join(", "),
            },
            unit_amount: product.price,
          },
          quantity: item.quantity,
        };
      })
    );

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
    });

    return { url: session.url };
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to create checkout session",
    };
  }
}
