"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { computeProcessingFee } from "@/lib/constants";

function revalidateSales() {
  revalidatePath("/admin/sales");
  revalidatePath("/admin/products");
  revalidatePath("/admin/events");
  revalidatePath("/admin/analytics");
  revalidatePath("/shop");
}

async function syncEventInventorySoldCount(
  eventId: string,
  productId: string,
  tx: Prisma.TransactionClient
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
 * Undo a sale: restore the sold units to availability, back out the sold
 * count + revenue on the product, and delete the sale record.
 */
export async function deleteSale(saleId: string) {
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { product: { select: { quantityAvailable: true } } },
  });
  if (!sale) return { error: "Sale not found" };

  const restored = sale.product.quantityAvailable + sale.quantity;
  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: sale.productId },
      data: {
        soldCount: { decrement: sale.quantity },
        soldRevenue: { decrement: sale.price * sale.quantity },
        quantityAvailable: restored,
        inStock: restored > 0,
      },
    });
    await tx.sale.delete({ where: { id: saleId } });
    if (sale.eventId) {
      await syncEventInventorySoldCount(sale.eventId, sale.productId, tx);
    }
  });

  revalidateSales();
  if (sale.eventId) revalidatePath(`/admin/events/${sale.eventId}`);
  return { success: true };
}

/**
 * Edit a sale's quantity / unit price / payment type. Re-syncs the product's
 * sold count, revenue, availability, and the sale's processing fee so all
 * downstream metrics stay correct.
 */
export async function updateSale(
  saleId: string,
  input: {
    quantity: number;
    priceCents: number;
    paymentType: string | null;
    eventId?: string | null;
  }
) {
  const quantity = Math.round(input.quantity);
  const price = Math.round(input.priceCents);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: "Quantity must be greater than 0" };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Price cannot be negative" };
  }

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { product: { select: { quantityAvailable: true } } },
  });
  if (!sale) return { error: "Sale not found" };

  const processingFee = computeProcessingFee(input.paymentType, price * quantity);
  // Add the old units back, then remove the new ones.
  const newAvailable = Math.max(0, sale.product.quantityAvailable + sale.quantity - quantity);
  const nextEventId = input.eventId === undefined ? sale.eventId : input.eventId || null;

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: sale.productId },
      data: {
        soldCount: { increment: quantity - sale.quantity },
        soldRevenue: { increment: price * quantity - sale.price * sale.quantity },
        quantityAvailable: newAvailable,
        inStock: newAvailable > 0,
      },
    });
    await tx.sale.update({
      where: { id: saleId },
      data: {
        quantity,
        price,
        paymentType: input.paymentType,
        processingFee,
        eventId: nextEventId,
      },
    });
    if (sale.eventId) {
      await syncEventInventorySoldCount(sale.eventId, sale.productId, tx);
    }
    if (nextEventId && nextEventId !== sale.eventId) {
      await syncEventInventorySoldCount(nextEventId, sale.productId, tx);
    }
  });

  revalidateSales();
  if (sale.eventId) revalidatePath(`/admin/events/${sale.eventId}`);
  if (nextEventId) revalidatePath(`/admin/events/${nextEventId}`);
  return { success: true };
}
