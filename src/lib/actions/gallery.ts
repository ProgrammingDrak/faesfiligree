"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function createGalleryPiece(formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const categoryId = (formData.get("categoryId") as string) || null;
  const materials = (formData.get("materials") as string || "").split(",").map(m => m.trim()).filter(Boolean);
  const year = parseInt(formData.get("year") as string || "0") || null;
  const isSold = formData.get("isSold") === "on";
  const isCommission = formData.get("isCommission") === "on";
  const featured = formData.get("featured") === "on";
  const images = JSON.parse(formData.get("images") as string || "[]") as string[];

  if (!title?.trim()) return { error: "Title is required" };

  await prisma.galleryPiece.create({
    data: {
      title: title.trim(),
      slug: slugify(title),
      description,
      images,
      categoryId: categoryId || null,
      materials,
      year,
      isSold,
      isCommission,
      featured,
    },
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery");
}

export async function updateGalleryPiece(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const categoryId = (formData.get("categoryId") as string) || null;
  const materials = (formData.get("materials") as string || "").split(",").map(m => m.trim()).filter(Boolean);
  const year = parseInt(formData.get("year") as string || "0") || null;
  const isSold = formData.get("isSold") === "on";
  const isCommission = formData.get("isCommission") === "on";
  const featured = formData.get("featured") === "on";
  const images = JSON.parse(formData.get("images") as string || "[]") as string[];

  if (!title?.trim()) return { error: "Title is required" };

  await prisma.galleryPiece.update({
    where: { id },
    data: {
      title: title.trim(),
      slug: slugify(title),
      description,
      images,
      categoryId: categoryId || null,
      materials,
      year,
      isSold,
      isCommission,
      featured,
    },
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryPiece(id: string) {
  await prisma.galleryPiece.delete({ where: { id } });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  return { success: true };
}
