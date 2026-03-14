"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function createCategory(formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;

  if (!title?.trim()) return { error: "Title is required" };

  await prisma.category.create({
    data: {
      title: title.trim(),
      slug: slugify(title),
      description,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/gallery");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;

  if (!title?.trim()) return { error: "Title is required" };

  await prisma.category.update({
    where: { id },
    data: { title: title.trim(), slug: slugify(title), description },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/gallery");
  return { success: true };
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/gallery");
  return { success: true };
}
