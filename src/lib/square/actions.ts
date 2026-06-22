"use server";

import type { Square } from "square";
import { squareClient, isSquareConfigured } from "./client";
import { prisma } from "@/lib/db";
import { getProductBySlug } from "@/lib/data/queries";
import { recordSold } from "@/lib/actions/products";

interface CheckoutItem {
  slug: string;
  quantity: number;
}

type OrderLine = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
};

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

  if (!items.length) {
    return { error: "Your cart is empty." };
  }

  try {
    // Validate prices server-side — never trust client-sent prices
    let totalAmount = 0;
    const orderLines: OrderLine[] = [];

    for (const item of items) {
      const product = await getProductBySlug(item.slug);
      if (!product) throw new Error(`Product not found: ${item.slug}`);
      if (!product.inStock)
        throw new Error(`Product out of stock: ${product.name}`);

      const unitPrice = getCheckoutUnitPrice(product, item.quantity);
      totalAmount += unitPrice * item.quantity;
      orderLines.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
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
        itemsSnapshot: orderLines,
      },
    });

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
    });

    const paymentLink = response.paymentLink;
    if (!paymentLink?.url) {
      throw new Error("Square did not return a checkout link.");
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { squareOrderId: paymentLink.orderId ?? null },
    });

    return { success: true, url: paymentLink.url };
  } catch (error) {
    console.error("Square checkout link error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to start checkout",
    };
  }
}

interface ConfirmedLine {
  name: string;
  quantity: number;
  price: number;
}

export interface ConfirmOrderResult {
  status: "paid" | "pending" | "not_found" | "error";
  buyerEmail?: string | null;
  items?: ConfirmedLine[];
  subtotal?: number;
}

function isPaid(order: Square.Order | undefined): boolean {
  if (!order) return false;
  if (order.state === "COMPLETED") return true;
  return (order.tenders?.length ?? 0) > 0;
}

/**
 * Called by the success page after Square redirects back. Verifies the
 * Square order is actually paid, then records the sale lines exactly once
 * (page refreshes and double-clicks must not double-record) and copies the
 * buyer/shipping details Square collected onto our local Order row.
 */
export async function confirmOrder(ref: string): Promise<ConfirmOrderResult> {
  if (!ref) return { status: "not_found" };
  if (!isSquareConfigured() || !squareClient) return { status: "error" };

  const order = await prisma.order.findUnique({ where: { ref } });
  if (!order) return { status: "not_found" };

  const lines = (order.itemsSnapshot ?? []) as unknown as OrderLine[];
  const summary = {
    items: lines.map(({ name, quantity, price }) => ({ name, quantity, price })),
    subtotal: order.subtotal,
  };

  if (order.status === "paid") {
    return { status: "paid", buyerEmail: order.buyerEmail, ...summary };
  }
  if (!order.squareOrderId) return { status: "pending", ...summary };

  try {
    const response = await squareClient.orders.get({
      orderId: order.squareOrderId,
    });
    const squareOrder = response.order;
    if (!isPaid(squareOrder)) {
      return { status: "pending", ...summary };
    }

    // Claim the pending → paid transition atomically; whoever loses the
    // race (concurrent refresh) returns without recording again.
    const claimed = await prisma.order.updateMany({
      where: { id: order.id, status: "pending" },
      data: { status: "paid" },
    });
    if (claimed.count === 0) {
      return { status: "paid", buyerEmail: order.buyerEmail, ...summary };
    }

    // Buyer + shipping as collected by Square's hosted page: prefer the
    // shipment fulfillment recipient, fall back to the payment record.
    let recipientName: string | null = null;
    let recipientEmail: string | null = null;
    let address: Square.Address | null | undefined = null;

    const recipient = squareOrder?.fulfillments?.[0]?.shipmentDetails?.recipient;
    if (recipient) {
      recipientName = recipient.displayName ?? null;
      recipientEmail = recipient.emailAddress ?? null;
      address = recipient.address;
    }
    const paymentId = squareOrder?.tenders?.[0]?.paymentId;
    if ((!recipientEmail || !address) && paymentId) {
      try {
        const paymentResponse = await squareClient.payments.get({ paymentId });
        recipientEmail = recipientEmail ?? paymentResponse.payment?.buyerEmailAddress ?? null;
        address = address ?? paymentResponse.payment?.shippingAddress;
      } catch (paymentError) {
        console.error(`Failed to fetch Square payment ${paymentId}:`, paymentError);
      }
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        buyerName: recipientName,
        buyerEmail: recipientEmail,
        shippingLine1: address?.addressLine1 ?? null,
        shippingLine2: address?.addressLine2 ?? null,
        shippingCity: address?.locality ?? null,
        shippingState: address?.administrativeDistrictLevel1 ?? null,
        shippingZip: address?.postalCode ?? null,
      },
    });

    // Payment is complete — record each line as a Square sale, which also
    // decrements availability, bumps sold count/revenue, and flips
    // one-of-a-kind pieces out of stock. eventId is explicitly null so web
    // sales are never attributed to an in-person event. A bookkeeping
    // failure here must NOT fail the customer (they already paid); log it
    // for manual reconciliation instead.
    for (const line of lines) {
      try {
        await recordSold(line.productId, line.quantity, line.price, "square", null, order.id);
      } catch (recordError) {
        console.error(
          `Square order ${order.squareOrderId} paid but failed to record sale for product ${line.productId}:`,
          recordError
        );
      }
    }

    return { status: "paid", buyerEmail: recipientEmail, ...summary };
  } catch (error) {
    console.error("Square order confirmation error:", error);
    return { status: "error", ...summary };
  }
}
