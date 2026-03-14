"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function createEvent(formData: FormData) {
  const name = formData.get("name") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = (formData.get("endDate") as string) || null;
  const location = (formData.get("location") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  if (!name?.trim() || !startDate) {
    return { error: "Name and start date are required" };
  }

  const event = await prisma.event.create({
    data: {
      name: name.trim(),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      location,
      notes,
    },
  });

  revalidatePath("/admin/events");
  redirect(`/admin/events/${event.id}`);
}

export async function updateEvent(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = (formData.get("endDate") as string) || null;
  const location = (formData.get("location") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  if (!name?.trim() || !startDate) {
    return { error: "Name and start date are required" };
  }

  await prisma.event.update({
    where: { id },
    data: {
      name: name.trim(),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      location,
      notes,
    },
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
  const quantityBrought = parseInt(formData.get("quantityBrought") as string || "0");
  const priceAtEvent = Math.round(parseFloat(formData.get("priceAtEvent") as string || "0") * 100);

  if (!productId || quantityBrought <= 0 || priceAtEvent <= 0) {
    return { error: "Product, quantity, and price are required" };
  }

  await prisma.eventInventory.upsert({
    where: { eventId_productId: { eventId, productId } },
    create: { eventId, productId, quantityBrought, priceAtEvent },
    update: { quantityBrought, priceAtEvent },
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
  const quantitySold = parseInt(formData.get("quantitySold") as string || "0");

  if (!inventoryId || quantitySold <= 0) {
    return { error: "Inventory item and quantity are required" };
  }

  const inventory = await prisma.eventInventory.findUnique({
    where: { id: inventoryId },
  });
  if (!inventory) return { error: "Inventory item not found" };

  // Update the inventory sold count
  await prisma.eventInventory.update({
    where: { id: inventoryId },
    data: { quantitySold },
  });

  // Create/update sale record
  const existingSale = await prisma.sale.findFirst({
    where: { eventId, productId: inventory.productId },
  });

  if (existingSale) {
    await prisma.sale.update({
      where: { id: existingSale.id },
      data: { quantity: quantitySold, price: inventory.priceAtEvent },
    });
  } else {
    await prisma.sale.create({
      data: {
        productId: inventory.productId,
        eventId,
        quantity: quantitySold,
        price: inventory.priceAtEvent,
      },
    });
  }

  // Update product sold stats
  await prisma.product.update({
    where: { id: inventory.productId },
    data: {
      soldCount: { increment: quantitySold },
      soldRevenue: { increment: inventory.priceAtEvent * quantitySold },
    },
  });

  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/analytics");
  return { success: true };
}
