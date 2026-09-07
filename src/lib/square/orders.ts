import type { Order as StoredOrder, Prisma } from "@prisma/client";
import type { Square } from "square";
import { prisma } from "@/lib/db";
import { recordInventorySale } from "@/lib/inventory/sales";
import { computeProcessingFee } from "@/lib/constants";
import { squareClient } from "./client";

export interface OrderLine {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface ConfirmOrderResult {
  status: "paid" | "pending" | "not_found" | "error";
  buyerEmail?: string | null;
  items?: Array<Omit<OrderLine, "productId">>;
  subtotal?: number;
}

interface PaymentAddress {
  addressLine1?: string | null;
  addressLine2?: string | null;
  locality?: string | null;
  administrativeDistrictLevel1?: string | null;
  postalCode?: string | null;
}

export interface SquarePaymentEvidence {
  id: string;
  orderId: string;
  status: string;
  amount: bigint;
  currency: string;
  buyerEmail?: string | null;
  shippingAddress?: PaymentAddress | null;
}

function parseOrderLines(value: Prisma.JsonValue | null): OrderLine[] {
  if (!Array.isArray(value)) throw new Error("Order item snapshot is missing");

  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("Order item snapshot is invalid");
    }
    const line = item as Record<string, unknown>;
    if (
      typeof line.productId !== "string" ||
      typeof line.name !== "string" ||
      !Number.isInteger(line.quantity) ||
      Number(line.quantity) <= 0 ||
      !Number.isInteger(line.price) ||
      Number(line.price) < 0
    ) {
      throw new Error("Order item snapshot is invalid");
    }
    return {
      productId: line.productId,
      name: line.name,
      quantity: Number(line.quantity),
      price: Number(line.price),
    };
  });
}

function summarize(order: StoredOrder, lines: OrderLine[]): ConfirmOrderResult {
  return {
    status: order.status === "paid" ? "paid" : "pending",
    buyerEmail: order.buyerEmail,
    items: lines.map(({ name, quantity, price }) => ({ name, quantity, price })),
    subtotal: order.subtotal,
  };
}

function paymentEvidence(payment: Square.Payment): SquarePaymentEvidence | null {
  const amount = payment.amountMoney?.amount;
  if (!payment.id || !payment.orderId || amount == null || !payment.amountMoney?.currency) {
    return null;
  }
  return {
    id: payment.id,
    orderId: payment.orderId,
    status: payment.status ?? "",
    amount,
    currency: payment.amountMoney.currency,
    buyerEmail: payment.buyerEmailAddress,
    shippingAddress: payment.shippingAddress,
  };
}

function fulfillmentDetails(squareOrder?: Square.Order) {
  const recipient = squareOrder?.fulfillments?.[0]?.shipmentDetails?.recipient;
  return {
    name: recipient?.displayName ?? null,
    email: recipient?.emailAddress ?? null,
    address: recipient?.address ?? null,
  };
}

/**
 * Record a completed Square payment and its inventory changes atomically.
 * Repeated redirects and webhook deliveries become no-ops after the first commit.
 */
export async function reconcileSquarePayment(
  evidence: SquarePaymentEvidence,
  suppliedSquareOrder?: Square.Order
): Promise<ConfirmOrderResult> {
  if (evidence.status !== "COMPLETED") return { status: "pending" };
  if (evidence.currency !== "USD") throw new Error("Square payment currency did not match the order");

  const order = await prisma.order.findUnique({ where: { squareOrderId: evidence.orderId } });
  if (!order) return { status: "not_found" };
  const lines = parseOrderLines(order.itemsSnapshot);
  if (evidence.amount !== BigInt(order.subtotal)) {
    throw new Error("Square payment amount did not match the order");
  }
  if (order.status === "paid") return summarize(order, lines);

  let squareOrder = suppliedSquareOrder;
  if (!squareOrder && squareClient) {
    squareOrder = (await squareClient.orders.get({ orderId: evidence.orderId })).order;
  }
  const fulfillment = fulfillmentDetails(squareOrder);
  const address = fulfillment.address ?? evidence.shippingAddress;
  const buyerEmail = fulfillment.email ?? evidence.buyerEmail ?? null;

  await prisma.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id: order.id, status: "pending" },
      data: { status: "processing" },
    });
    if (claimed.count === 0) return false;

    const orderProcessingFee = computeProcessingFee("square", order.subtotal);
    for (const [index, line] of lines.entries()) {
      await recordInventorySale(tx, {
        productId: line.productId,
        quantity: line.quantity,
        unitPriceCents: line.price,
        paymentType: "square",
        processingFeeCents: index === 0 ? orderProcessingFee : 0,
        eventId: null,
        orderId: order.id,
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        buyerName: fulfillment.name,
        buyerEmail,
        shippingLine1: address?.addressLine1 ?? null,
        shippingLine2: address?.addressLine2 ?? null,
        shippingCity: address?.locality ?? null,
        shippingState: address?.administrativeDistrictLevel1 ?? null,
        shippingZip: address?.postalCode ?? null,
      },
    });
    return true;
  });

  const finalOrder = await prisma.order.findUniqueOrThrow({ where: { id: order.id } });
  return summarize(finalOrder, lines);
}

export async function confirmSquareOrder(ref: string): Promise<ConfirmOrderResult> {
  if (!ref) return { status: "not_found" };
  if (!squareClient) return { status: "error" };

  const order = await prisma.order.findUnique({ where: { ref } });
  if (!order) return { status: "not_found" };
  const lines = parseOrderLines(order.itemsSnapshot);
  if (order.status === "paid") return summarize(order, lines);
  if (!order.squareOrderId) return { ...summarize(order, lines), status: "pending" };

  try {
    const squareOrder = (await squareClient.orders.get({ orderId: order.squareOrderId })).order;
    const paymentIds = squareOrder?.tenders
      ?.map((tender) => tender.paymentId)
      .filter((paymentId): paymentId is string => Boolean(paymentId)) ?? [];

    for (const paymentId of paymentIds) {
      const payment = (await squareClient.payments.get({ paymentId })).payment;
      const evidence = payment ? paymentEvidence(payment) : null;
      if (evidence?.status === "COMPLETED") {
        return reconcileSquarePayment(evidence, squareOrder);
      }
    }
    return { ...summarize(order, lines), status: "pending" };
  } catch (error) {
    console.error("Square order confirmation error:", error);
    return { ...summarize(order, lines), status: "error" };
  }
}
