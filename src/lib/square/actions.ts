"use server";

import type { Prisma } from "@prisma/client";
import { squareClient, isSquareConfigured } from "./client";
import { confirmSquareOrder, type ConfirmOrderResult, type OrderLine } from "./orders";
import { prisma } from "@/lib/db";

interface CheckoutItem {
  slug: string;
  quantity: number;
}

function getCheckoutUnitPrice(product: {
  price: number;
  bulkPricingEnabled: boolean;
  bulkMinQuantity: number | null;
  bulkPricingMode: string | null;
  bulkDiscountPercent: number | null;
  bulkUnitPrice: number | null;
}, quantity: number) {
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

/**
 * Create a Square-hosted checkout (Payment Links API) for the cart and
 * return its URL. Square's hosted page handles card entry, buyer email,
 * shipping address collection, and the receipt email. We validate prices
 * server-side and keep a local pending Order keyed by our own `ref` so the
 * success page can confirm payment and record the sale.
 */
export async function startCheckout(items: CheckoutItem[]) {
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

  if (!Array.isArray(items) || !items.length) {
    return { error: "Your cart is empty." };
  }

  let pendingOrderId: string | null = null;
  try {
    const quantities = new Map<string, number>();
    for (const item of items) {
      if (
        !item ||
        typeof item.slug !== "string" ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return { error: "Your cart contains an invalid quantity." };
      }
      quantities.set(item.slug, (quantities.get(item.slug) ?? 0) + item.quantity);
    }

    // Validate prices and availability on the server.
    let totalAmount = 0;
    const orderLines: OrderLine[] = [];

    for (const [slug, quantity] of quantities) {
      const product = await prisma.product.findUnique({ where: { slug } });
      if (!product) return { error: "A product in your cart is no longer available." };
      if (!product.inStock || product.quantityAvailable < quantity) {
        return { error: `${product.name} does not have enough stock for this order.` };
      }

      const unitPrice = getCheckoutUnitPrice(product, quantity);
      totalAmount += unitPrice * quantity;
      orderLines.push({
        productId: product.id,
        name: product.name,
        quantity,
        price: unitPrice,
      });
    }

    const ref = crypto.randomUUID();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Local pending row first, so a paid Square order can always be traced
    // back even if the buyer never returns to the success page.
    const order = await prisma.order.create({
      data: {
        ref,
        status: "pending",
        subtotal: totalAmount,
        itemsSnapshot: orderLines as unknown as Prisma.InputJsonValue,
      },
    });
    pendingOrderId = order.id;

    const response = await squareClient.checkout.paymentLinks.create({
      idempotencyKey: ref,
      order: {
        locationId,
        referenceId: ref,
        lineItems: orderLines.map((line) => ({
          name: line.name,
          quantity: String(line.quantity),
          basePriceMoney: {
            amount: BigInt(line.price),
            currency: "USD",
          },
        })),
      },
      checkoutOptions: {
        askForShippingAddress: true,
        redirectUrl: `${siteUrl}/checkout/success?ref=${ref}`,
      },
      paymentNote: ref,
    });

    const paymentLink = response.paymentLink;
    if (!paymentLink?.url || !paymentLink.orderId) {
      throw new Error("Square did not return a complete checkout link.");
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { squareOrderId: paymentLink.orderId },
    });

    return { success: true, url: paymentLink.url };
  } catch (error) {
    console.error("Square checkout link error:", error);
    if (pendingOrderId) {
      await prisma.order.updateMany({
        where: { id: pendingOrderId, status: "pending" },
        data: { status: "failed" },
      }).catch((updateError) => console.error("Failed to mark checkout attempt:", updateError));
    }
    return { error: "Failed to start checkout. Please try again." };
  }
}

export async function confirmOrder(ref: string): Promise<ConfirmOrderResult> {
  return confirmSquareOrder(ref);
}
