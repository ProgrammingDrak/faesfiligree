"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function createMaterial(formData: FormData) {
  const name = formData.get("name") as string;
  const unit = (formData.get("unit") as string) || "unit";
  const costPerUnit = Math.round(parseFloat(formData.get("costPerUnit") as string || "0") * 100);

  if (!name?.trim()) return { error: "Name is required" };

  await prisma.material.create({
    data: { name: name.trim(), unit, costPerUnit },
  });

  revalidatePath("/admin/materials");
  return { success: true };
}

export async function updateMaterial(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const unit = (formData.get("unit") as string) || "unit";
  const costPerUnit = Math.round(parseFloat(formData.get("costPerUnit") as string || "0") * 100);

  if (!name?.trim()) return { error: "Name is required" };

  await prisma.material.update({
    where: { id },
    data: { name: name.trim(), unit, costPerUnit },
  });

  revalidatePath("/admin/materials");
  return { success: true };
}

export async function deleteMaterial(id: string) {
  await prisma.material.delete({ where: { id } });
  revalidatePath("/admin/materials");
  return { success: true };
}
