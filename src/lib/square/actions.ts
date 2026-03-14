"use server";

import { squareClient, isSquareConfigured } from "./client";
import { getProductBySlug } from "@/lib/sanity/queries";

interface CheckoutItem {
  slug: string;
  quantity: number;
}

export async function createPayment(
  sourceId: string,
  items: CheckoutItem[]
) {
  if (!isSquareConfigured() || !squareClient) {
    return {
      error:
        "Square is not configured. Please set up your environment variables.",
    };
  }

  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
  if (!locationId) {
    return { error: "Square location ID is not configured." };
  }

  try {
    // Validate prices server-side — never trust client-sent prices
    let totalAmount = 0;
    const orderItems: { name: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const product = await getProductBySlug(item.slug);
      if (!product) throw new Error(`Product not found: ${item.slug}`);
      if (!product.inStock)
        throw new Error(`Product out of stock: ${product.name}`);

      totalAmount += product.price * item.quantity;
      orderItems.push({
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const response = await squareClient.payments.create({
      sourceId,
      amountMoney: {
        amount: BigInt(totalAmount),
        currency: "USD",
      },
      locationId,
      idempotencyKey: crypto.randomUUID(),
      note: orderItems
        .map((i) => `${i.name} x${i.quantity}`)
        .join(", "),
    });

    // BigInt values can't be serialized to JSON directly
    // In Square SDK v44, the response is the result directly
    const paymentId = response.payment?.id;

    return { success: true, paymentId: paymentId || null };
  } catch (error) {
    console.error("Square payment error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to process payment",
    };
  }
}
