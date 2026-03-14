"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function createCommission(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const pieceType = (formData.get("pieceType") as string) || null;
  const stylePreferences = (formData.get("stylePreferences") as string || "").split(",").map(s => s.trim()).filter(Boolean);
  const materials = (formData.get("materials") as string || "").split(",").map(m => m.trim()).filter(Boolean);
  const budgetRange = (formData.get("budgetRange") as string) || null;
  const timeline = (formData.get("timeline") as string) || null;
  const description = (formData.get("description") as string) || null;

  if (!name?.trim() || !email?.trim()) {
    return { error: "Name and email are required" };
  }

  await prisma.commission.create({
    data: {
      name: name.trim(),
      email: email.trim(),
      pieceType,
      stylePreferences,
      materials,
      budgetRange,
      timeline,
      description,
    },
  });

  revalidatePath("/admin/commissions");
  return { success: true };
}

export async function updateCommissionStatus(
  id: string,
  status: string,
  notes?: string
) {
  await prisma.commission.update({
    where: { id },
    data: { status, ...(notes !== undefined ? { notes } : {}) },
  });

  revalidatePath("/admin/commissions");
  revalidatePath(`/admin/commissions/${id}`);
  return { success: true };
}
