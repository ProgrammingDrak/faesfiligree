"use server";

import { squareClient, isSquareConfigured } from "./client";
import { getProductBySlug } from "@/lib/data/queries";

interface CheckoutItem {
  slug: string;
  quantity: number;
}

function getCheckoutUnitPrice(product: Awaited<ReturnType<typeof getProductBySlug>>, quantity: number) {
  if (!product) return 0;
  if (!product.bulkPricingEnabled || !product.bulkMinQuantity || quantity < product.bulkMinQuantity) {
    return product.price;
  }
  if (product.bulkPricingMode === "fixed" && product.bulkUnitPrice && product.bulkUnitPrice > 0) {
    return product.bulkUnitPrice;
  }
  if (product.bulkDiscountPercent && product.bulkDiscountPercent > 0) {
    return Math.round(product.price * (1 - product.bulkDiscountPercent / 100));
  }
  return product.price;
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

      const unitPrice = getCheckoutUnitPrice(product, item.quantity);
      totalAmount += unitPrice * item.quantity;
      orderItems.push({
        name: product.name,
        quantity: item.quantity,
        price: unitPrice,
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
