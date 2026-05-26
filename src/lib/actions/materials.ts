"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

function parsePurchase(formData: FormData) {
  const purchaseQuantity = parseFloat(String(formData.get("purchaseQuantity") ?? ""));
  const purchaseCostInput = parseFloat(String(formData.get("purchaseCost") ?? ""));
  const costPerUnitInput = parseFloat(String(formData.get("costPerUnit") ?? ""));

  if (!Number.isFinite(purchaseQuantity) || purchaseQuantity <= 0) {
    return { error: "Amount purchased must be greater than 0" };
  }

  if (
    (!Number.isFinite(purchaseCostInput) || purchaseCostInput <= 0) &&
    (!Number.isFinite(costPerUnitInput) || costPerUnitInput <= 0)
  ) {
    return { error: "Purchase price or cost per unit must be greater than 0" };
  }

  const purchaseCost = Number.isFinite(purchaseCostInput) && purchaseCostInput > 0
    ? Math.round(purchaseCostInput * 100)
    : Math.round(costPerUnitInput * purchaseQuantity * 100);

  return {
    purchaseQuantity,
    purchaseCost,
    costPerUnit: purchaseCost / purchaseQuantity,
  };
}

export async function createMaterial(formData: FormData) {
  const name = formData.get("name") as string;
  const unit = ((formData.get("unit") as string) || "unit").trim();
  const notes = (formData.get("notes") as string) || null;
  const purchase = parsePurchase(formData);

  if (!name?.trim()) return { error: "Name is required" };
  if ("error" in purchase) return { error: purchase.error };

  await prisma.material.create({
    data: {
      name: name.trim(),
      unit: unit || "unit",
      purchaseQuantity: purchase.purchaseQuantity,
      purchaseCost: purchase.purchaseCost,
      costPerUnit: purchase.costPerUnit,
      stockOnHand: 0,
      reorderLevel: 0,
      notes,
    },
  });

  revalidatePath("/admin/materials");
  return { success: true };
}

export async function updateMaterial(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const unit = ((formData.get("unit") as string) || "unit").trim();
  const notes = (formData.get("notes") as string) || null;
  const purchase = parsePurchase(formData);

  if (!name?.trim()) return { error: "Name is required" };
  if ("error" in purchase) return { error: purchase.error };

  await prisma.material.update({
    where: { id },
    data: {
      name: name.trim(),
      unit: unit || "unit",
      purchaseQuantity: purchase.purchaseQuantity,
      purchaseCost: purchase.purchaseCost,
      costPerUnit: purchase.costPerUnit,
      notes,
    },
  });

  revalidatePath("/admin/materials");
  return { success: true };
}

export async function deleteMaterial(id: string) {
  await prisma.material.delete({ where: { id } });
  revalidatePath("/admin/materials");
  return { success: true };
}
