import type Stripe from "stripe";
import { sanityWriteClient, isSanityConfigured } from "@/lib/sanity/client";

export async function handleCheckoutComplete(
  session: Stripe.Checkout.Session
) {
  console.log("Checkout completed:", session.id);

  // Update inventory in Sanity if configured
  if (isSanityConfigured() && session.line_items?.data) {
    for (const item of session.line_items.data) {
      if (item.price?.product && typeof item.price.product === "string") {
        try {
          // Mark product as out of stock (since pieces are one-of-a-kind)
          await sanityWriteClient
            .patch(item.price.product)
            .set({ inStock: false })
            .commit();
        } catch (error) {
          console.error("Failed to update inventory:", error);
        }
      }
    }
  }
}
