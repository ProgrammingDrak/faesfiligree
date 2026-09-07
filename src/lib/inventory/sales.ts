import type { Prisma } from "@prisma/client";
import { computeProcessingFee } from "@/lib/constants";

export interface InventorySaleInput {
  productId: string;
  quantity: number;
  unitPriceCents?: number;
  discountPercent?: number;
  paymentType?: string | null;
  processingFeeCents?: number;
  eventId?: string | null;
  orderId?: string | null;
}

async function syncEventInventorySoldCount(
  tx: Prisma.TransactionClient,
  eventId: string,
  productId: string
) {
  const sold = await tx.sale.aggregate({
    where: { eventId, productId },
    _sum: { quantity: true },
  });

  await tx.eventInventory.updateMany({
    where: { eventId, productId },
    data: { quantitySold: sold._sum.quantity ?? 0 },
  });
}

/**
 * Record one inventory sale inside the caller's transaction.
 * The row lock prevents concurrent sales from losing inventory updates.
 */
export async function recordInventorySale(
  tx: Prisma.TransactionClient,
  input: InventorySaleInput
) {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new Error("Sale quantity must be a positive integer");
  }

  await tx.$queryRaw`
    SELECT id
    FROM "faesfiligree"."Product"
    WHERE id = ${input.productId}
    FOR UPDATE
  `;
  const product = await tx.product.findUnique({
    where: { id: input.productId },
    select: { price: true, quantityAvailable: true },
  });
  if (!product) throw new Error(`Product ${input.productId} was not found`);

  const unit = input.unitPriceCents != null
    ? Math.max(0, input.unitPriceCents)
    : Math.round(product.price * (1 - (input.discountPercent ?? 0) / 100));
  const unitPrice = Math.max(0, unit);
  const paymentType = input.paymentType ?? null;
  const processingFee = input.processingFeeCents ??
    computeProcessingFee(paymentType, unitPrice * input.quantity);
  const newAvailable = Math.max(0, product.quantityAvailable - input.quantity);

  await tx.product.update({
    where: { id: input.productId },
    data: {
      quantityAvailable: newAvailable,
      soldCount: { increment: input.quantity },
      soldRevenue: { increment: unitPrice * input.quantity },
      inStock: newAvailable > 0,
    },
  });
  await tx.sale.create({
    data: {
      productId: input.productId,
      eventId: input.eventId ?? null,
      orderId: input.orderId ?? null,
      quantity: input.quantity,
      price: unitPrice,
      paymentType,
      processingFee,
    },
  });

  if (input.eventId) {
    await syncEventInventorySoldCount(tx, input.eventId, input.productId);
  }
}
