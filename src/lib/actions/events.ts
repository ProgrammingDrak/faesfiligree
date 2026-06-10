"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { computeProcessingFee } from "@/lib/constants";

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseInteger(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseEventFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "") || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const attendeeCount = parseInteger(formData.get("attendeeCount"));
  const travelHours = parseNumber(formData.get("travelHours"));
  const setupHours = parseNumber(formData.get("setupHours"));
  const sellingHours = parseNumber(formData.get("sellingHours"));

  if (!name || !startDate) {
    return { error: "Name and start date are required" };
  }
  if (travelHours < 0 || setupHours < 0 || sellingHours < 0) {
    return { error: "Event time cannot be negative" };
  }

  return {
    name,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : null,
    location,
    notes,
    attendeeCount,
    travelHours,
    setupHours,
    sellingHours,
  };
}

function parsePartnerTerms(formData: FormData) {
  const partnerCompanyName = String(formData.get("partnerCompanyName") ?? "").trim();
  const commissionRaw = String(formData.get("partnerCommissionPercent") ?? "").trim();
  const partnerPricingNotes = String(formData.get("partnerPricingNotes") ?? "").trim();
  const partnerCommissionPercent = commissionRaw === "" ? null : parseFloat(commissionRaw);

  if (partnerCommissionPercent != null) {
    if (!Number.isFinite(partnerCommissionPercent) || partnerCommissionPercent < 0 || partnerCommissionPercent > 100) {
      return { error: "Partner commission must be between 0 and 100%" };
    }
  }

  return {
    partnerCompanyName: partnerCompanyName || null,
    partnerCommissionPercent,
    partnerPricingNotes: partnerPricingNotes || null,
  };
}

export async function createEvent(formData: FormData) {
  const fields = parseEventFields(formData);
  if ("error" in fields) return { error: fields.error };

  const event = await prisma.event.create({
    data: fields,
  });

  revalidatePath("/admin/events");
  redirect(`/admin/events/${event.id}`);
}

export async function updateEvent(id: string, formData: FormData) {
  const fields = parseEventFields(formData);
  if ("error" in fields) return { error: fields.error };

  await prisma.event.update({
    where: { id },
    data: fields,
  });

  revalidatePath(`/admin/events/${id}`);
  revalidatePath("/admin/events");
  return { success: true };
}

export async function deleteEvent(id: string) {
  await prisma.event.delete({ where: { id } });
  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function addEventExpense(eventId: string, formData: FormData) {
  const category = formData.get("category") as string;
  const description = (formData.get("description") as string) || null;
  const amount = Math.round(parseFloat(formData.get("amount") as string || "0") * 100);

  if (!category || amount <= 0) {
    return { error: "Category and amount are required" };
  }

  await prisma.eventExpense.create({
    data: { eventId, category, description, amount },
  });

  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function removeEventExpense(id: string, eventId: string) {
  await prisma.eventExpense.delete({ where: { id } });
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function addEventInventory(eventId: string, formData: FormData) {
  const productId = formData.get("productId") as string;
  const quantityBrought = parseInt(String(formData.get("quantityBrought") ?? "0"), 10);
  const priceAtEvent = Math.round(parseNumber(formData.get("priceAtEvent")) * 100);

  if (!productId || quantityBrought <= 0 || priceAtEvent <= 0) {
    return { error: "Product, quantity, and price are required" };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      isPartnerProduct: true,
      partnerCompanyName: true,
      partnerCommissionPercent: true,
      partnerPricingNotes: true,
    },
  });

  if (!product) return { error: "Product not found" };

  await prisma.eventInventory.upsert({
    where: { eventId_productId: { eventId, productId } },
    create: {
      eventId,
      productId,
      quantityBrought,
      priceAtEvent,
      partnerCompanyName: product.isPartnerProduct ? product.partnerCompanyName : null,
      partnerCommissionPercent: product.isPartnerProduct ? product.partnerCommissionPercent : null,
      partnerPricingNotes: product.isPartnerProduct ? product.partnerPricingNotes : null,
    },
    update: { quantityBrought, priceAtEvent },
  });

  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function updateEventInventoryPartnerTerms(id: string, eventId: string, formData: FormData) {
  const partnerTerms = parsePartnerTerms(formData);
  if ("error" in partnerTerms) return { error: partnerTerms.error };

  await prisma.eventInventory.update({
    where: { id },
    data: partnerTerms,
  });

  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function removeEventInventory(id: string, eventId: string) {
  await prisma.eventInventory.delete({ where: { id } });
  revalidatePath(`/admin/events/${eventId}`);
  return { success: true };
}

export async function recordEventSale(eventId: string, formData: FormData) {
  const inventoryId = formData.get("inventoryId") as string;
  const quantitySold = parseInt(String(formData.get("quantitySold") ?? "0"), 10);
  const paymentType = String(formData.get("paymentType") ?? "") || null;

  if (!inventoryId || quantitySold < 0) {
    return { error: "Inventory item and quantity are required" };
  }

  const inventory = await prisma.eventInventory.findUnique({
    where: { id: inventoryId },
  });
  if (!inventory) return { error: "Inventory item not found" };
  if (quantitySold > inventory.quantityBrought) return { error: "Quantity sold cannot exceed quantity brought" };

  const existingSale = await prisma.sale.findFirst({
    where: { eventId, productId: inventory.productId },
  });
  const previousQuantitySold = existingSale?.quantity ?? 0;
  const quantityDelta = quantitySold - previousQuantitySold;
  const previousRevenue = existingSale ? existingSale.quantity * existingSale.price : 0;
  const nextRevenue = quantitySold * inventory.priceAtEvent;
  const revenueDelta = nextRevenue - previousRevenue;
  const processingFee = computeProcessingFee(paymentType, nextRevenue);

  await prisma.$transaction(async (tx) => {
    await tx.eventInventory.update({
      where: { id: inventoryId },
      data: { quantitySold },
    });

    if (quantitySold === 0) {
      if (existingSale) await tx.sale.delete({ where: { id: existingSale.id } });
    } else if (existingSale) {
      await tx.sale.update({
        where: { id: existingSale.id },
        data: {
          quantity: quantitySold,
          price: inventory.priceAtEvent,
          paymentType,
          processingFee,
        },
      });
    } else {
      await tx.sale.create({
        data: {
          productId: inventory.productId,
          eventId,
          quantity: quantitySold,
          price: inventory.priceAtEvent,
          paymentType,
          processingFee,
        },
      });
    }

    if (quantityDelta !== 0 || revenueDelta !== 0) {
      const product = await tx.product.findUnique({
        where: { id: inventory.productId },
        select: { quantityAvailable: true },
      });
      if (!product) throw new Error("Product not found");
      const nextAvailable = Math.max(0, product.quantityAvailable - quantityDelta);
      await tx.product.update({
        where: { id: inventory.productId },
        data: {
          quantityAvailable: nextAvailable,
          soldCount: { increment: quantityDelta },
          soldRevenue: { increment: revenueDelta },
          inStock: nextAvailable > 0,
        },
      });
    }
  });

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/products");
  revalidatePath("/admin/sales");
  revalidatePath("/shop");
  revalidatePath("/admin/analytics");
  return { success: true };
}
