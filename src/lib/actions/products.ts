"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const price = Math.round(parseFloat(formData.get("price") as string || "0") * 100);
  const categoryId = (formData.get("categoryId") as string) || null;
  const materials = (formData.get("materials") as string || "").split(",").map(m => m.trim()).filter(Boolean);
  const dimensions = (formData.get("dimensions") as string) || null;
  const inStock = formData.get("inStock") === "on";
  const featured = formData.get("featured") === "on";
  const images = JSON.parse(formData.get("images") as string || "[]") as string[];
  const laborHours = parseFloat(formData.get("laborHours") as string || "0");
  const costMode = formData.get("costMode") as string;
  const materialCostLump = costMode === "lump"
    ? Math.round(parseFloat(formData.get("materialCostLump") as string || "0") * 100)
    : null;
  const productMaterials = costMode === "itemized"
    ? JSON.parse(formData.get("productMaterials") as string || "[]") as { materialId: string; quantity: number }[]
    : [];

  if (!name?.trim()) return { error: "Name is required" };
  if (price <= 0) return { error: "Price must be greater than 0" };

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      slug: slugify(name),
      description,
      price,
      images,
      categoryId: categoryId || null,
      materials,
      dimensions,
      inStock,
      featured,
      laborHours,
      materialCostLump,
      productMaterials: {
        create: productMaterials.map((pm) => ({
          materialId: pm.materialId,
          quantity: pm.quantity,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const price = Math.round(parseFloat(formData.get("price") as string || "0") * 100);
  const categoryId = (formData.get("categoryId") as string) || null;
  const materials = (formData.get("materials") as string || "").split(",").map(m => m.trim()).filter(Boolean);
  const dimensions = (formData.get("dimensions") as string) || null;
  const inStock = formData.get("inStock") === "on";
  const featured = formData.get("featured") === "on";
  const images = JSON.parse(formData.get("images") as string || "[]") as string[];
  const laborHours = parseFloat(formData.get("laborHours") as string || "0");
  const costMode = formData.get("costMode") as string;
  const materialCostLump = costMode === "lump"
    ? Math.round(parseFloat(formData.get("materialCostLump") as string || "0") * 100)
    : null;
  const productMaterials = costMode === "itemized"
    ? JSON.parse(formData.get("productMaterials") as string || "[]") as { materialId: string; quantity: number }[]
    : [];

  if (!name?.trim()) return { error: "Name is required" };
  if (price <= 0) return { error: "Price must be greater than 0" };

  // Delete existing product materials and recreate
  await prisma.productMaterial.deleteMany({ where: { productId: id } });

  await prisma.product.update({
    where: { id },
    data: {
      name: name.trim(),
      slug: slugify(name),
      description,
      price,
      images,
      categoryId: categoryId || null,
      materials,
      dimensions,
      inStock,
      featured,
      laborHours,
      materialCostLump,
      productMaterials: {
        create: productMaterials.map((pm) => ({
          materialId: pm.materialId,
          quantity: pm.quantity,
        })),
      },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}
