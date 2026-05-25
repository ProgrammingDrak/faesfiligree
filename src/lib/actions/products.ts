"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseInteger(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePartnerTerms(formData: FormData) {
  const isPartnerProduct = formData.get("isPartnerProduct") === "on";
  const partnerCompanyName = String(formData.get("partnerCompanyName") ?? "").trim();
  const partnerCommissionPercent = parseNumber(formData.get("partnerCommissionPercent"));
  const partnerPricingNotes = String(formData.get("partnerPricingNotes") ?? "").trim();

  if (!isPartnerProduct) {
    return {
      isPartnerProduct,
      partnerCompanyName: null,
      partnerCommissionPercent: null,
      partnerPricingNotes: null,
    };
  }

  if (!partnerCompanyName) return { error: "Partner company is required for partner products" };
  if (partnerCommissionPercent < 0 || partnerCommissionPercent > 100) {
    return { error: "Partner commission must be between 0 and 100%" };
  }

  return {
    isPartnerProduct,
    partnerCompanyName,
    partnerCommissionPercent,
    partnerPricingNotes: partnerPricingNotes || null,
  };
}

function parseBulkPricing(formData: FormData, basePrice: number) {
  const bulkPricingEnabled = formData.get("bulkPricingEnabled") === "on";
  const bulkMinQuantity = parseInteger(formData.get("bulkMinQuantity"), 2);
  const bulkPricingMode = String(formData.get("bulkPricingMode") || "percent");
  const bulkDiscountPercent = parseNumber(formData.get("bulkDiscountPercent"));
  const bulkUnitPrice = Math.round(parseNumber(formData.get("bulkUnitPrice")) * 100);
  const bulkPricingNotes = String(formData.get("bulkPricingNotes") ?? "").trim();

  if (!bulkPricingEnabled) {
    return {
      bulkPricingEnabled,
      bulkMinQuantity: null,
      bulkPricingMode: null,
      bulkDiscountPercent: null,
      bulkUnitPrice: null,
      bulkPricingNotes: null,
    };
  }

  if (bulkMinQuantity < 2) return { error: "Bulk minimum must be 2 or more" };

  if (bulkPricingMode === "percent") {
    if (bulkDiscountPercent <= 0 || bulkDiscountPercent >= 100) {
      return { error: "Bulk discount must be greater than 0% and less than 100%" };
    }
    return {
      bulkPricingEnabled,
      bulkMinQuantity,
      bulkPricingMode,
      bulkDiscountPercent,
      bulkUnitPrice: null,
      bulkPricingNotes: bulkPricingNotes || null,
    };
  }

  if (bulkUnitPrice <= 0) return { error: "Bulk unit price must be greater than 0" };
  if (bulkUnitPrice >= basePrice) return { error: "Bulk unit price should be less than the regular price" };

  return {
    bulkPricingEnabled,
    bulkMinQuantity,
    bulkPricingMode: "fixed",
    bulkDiscountPercent: null,
    bulkUnitPrice,
    bulkPricingNotes: bulkPricingNotes || null,
  };
}

function parseProductMaterials(value: FormDataEntryValue | null) {
  const rows = JSON.parse(String(value || "[]")) as { materialId: string; quantity: number }[];
  const byMaterial = new Map<string, number>();

  for (const row of rows) {
    if (!row.materialId) continue;
    const quantity = Number(row.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) continue;
    byMaterial.set(row.materialId, (byMaterial.get(row.materialId) || 0) + quantity);
  }

  return Array.from(byMaterial, ([materialId, quantity]) => ({ materialId, quantity }));
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const inventoryLabel = (formData.get("inventoryLabel") as string) || null;
  const labels = (formData.get("labels") as string || "").split(",").map(label => label.trim()).filter(Boolean);
  const description = (formData.get("description") as string) || null;
  const price = Math.round(parseNumber(formData.get("price")) * 100);
  const quantityMade = parseInteger(formData.get("quantityMade"), 1);
  const quantityAvailable = parseInteger(formData.get("quantityAvailable"), quantityMade);
  const inStock = formData.get("inStock") === "on";
  const featured = formData.get("featured") === "on";
  const images = JSON.parse(formData.get("images") as string || "[]") as string[];
  const laborHours = parseNumber(formData.get("laborHours"));
  const costMode = formData.get("costMode") as string;
  const materialCostLump = costMode === "lump"
    ? Math.round(parseNumber(formData.get("materialCostLump")) * 100)
    : null;
  const productMaterials = costMode === "itemized"
    ? parseProductMaterials(formData.get("productMaterials"))
    : [];
  const partnerTerms = parsePartnerTerms(formData);
  const bulkPricing = parseBulkPricing(formData, price);

  if (!name?.trim()) return { error: "Name is required" };
  if (price <= 0) return { error: "Price must be greater than 0" };
  if (quantityMade < 0 || quantityAvailable < 0) return { error: "Quantities cannot be negative" };
  if ("error" in partnerTerms) return { error: partnerTerms.error };
  if ("error" in bulkPricing) return { error: bulkPricing.error };

  await prisma.product.create({
    data: {
      name: name.trim(),
      slug: slugify(name),
      inventoryLabel: inventoryLabel?.trim() || null,
      labels,
      description,
      price,
      images,
      categoryId: null,
      materials: [],
      dimensions: null,
      quantityMade,
      quantityAvailable,
      inStock,
      featured,
      isPartnerProduct: partnerTerms.isPartnerProduct,
      partnerCompanyName: partnerTerms.partnerCompanyName,
      partnerCommissionPercent: partnerTerms.partnerCommissionPercent,
      partnerPricingNotes: partnerTerms.partnerPricingNotes,
      bulkPricingEnabled: bulkPricing.bulkPricingEnabled,
      bulkMinQuantity: bulkPricing.bulkMinQuantity,
      bulkPricingMode: bulkPricing.bulkPricingMode,
      bulkDiscountPercent: bulkPricing.bulkDiscountPercent,
      bulkUnitPrice: bulkPricing.bulkUnitPrice,
      bulkPricingNotes: bulkPricing.bulkPricingNotes,
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
  const inventoryLabel = (formData.get("inventoryLabel") as string) || null;
  const labels = (formData.get("labels") as string || "").split(",").map(label => label.trim()).filter(Boolean);
  const description = (formData.get("description") as string) || null;
  const price = Math.round(parseNumber(formData.get("price")) * 100);
  const quantityMade = parseInteger(formData.get("quantityMade"), 1);
  const quantityAvailable = parseInteger(formData.get("quantityAvailable"), quantityMade);
  const inStock = formData.get("inStock") === "on";
  const featured = formData.get("featured") === "on";
  const images = JSON.parse(formData.get("images") as string || "[]") as string[];
  const laborHours = parseNumber(formData.get("laborHours"));
  const costMode = formData.get("costMode") as string;
  const materialCostLump = costMode === "lump"
    ? Math.round(parseNumber(formData.get("materialCostLump")) * 100)
    : null;
  const productMaterials = costMode === "itemized"
    ? parseProductMaterials(formData.get("productMaterials"))
    : [];
  const partnerTerms = parsePartnerTerms(formData);
  const bulkPricing = parseBulkPricing(formData, price);

  if (!name?.trim()) return { error: "Name is required" };
  if (price <= 0) return { error: "Price must be greater than 0" };
  if (quantityMade < 0 || quantityAvailable < 0) return { error: "Quantities cannot be negative" };
  if ("error" in partnerTerms) return { error: partnerTerms.error };
  if ("error" in bulkPricing) return { error: bulkPricing.error };

  // Delete existing product materials and recreate
  await prisma.productMaterial.deleteMany({ where: { productId: id } });

  await prisma.product.update({
    where: { id },
    data: {
      name: name.trim(),
      slug: slugify(name),
      inventoryLabel: inventoryLabel?.trim() || null,
      labels,
      description,
      price,
      images,
      categoryId: null,
      quantityMade,
      quantityAvailable,
      inStock,
      featured,
      isPartnerProduct: partnerTerms.isPartnerProduct,
      partnerCompanyName: partnerTerms.partnerCompanyName,
      partnerCommissionPercent: partnerTerms.partnerCommissionPercent,
      partnerPricingNotes: partnerTerms.partnerPricingNotes,
      bulkPricingEnabled: bulkPricing.bulkPricingEnabled,
      bulkMinQuantity: bulkPricing.bulkMinQuantity,
      bulkPricingMode: bulkPricing.bulkPricingMode,
      bulkDiscountPercent: bulkPricing.bulkDiscountPercent,
      bulkUnitPrice: bulkPricing.bulkUnitPrice,
      bulkPricingNotes: bulkPricing.bulkPricingNotes,
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

export async function addProductToBuildQueue(productId: string) {
  await prisma.productBuild.create({
    data: {
      productId,
      quantity: 1,
      status: "planned",
    },
  });

  revalidatePath("/admin/products");
  return { success: true };
}

export async function startBuild(id: string) {
  await prisma.productBuild.update({
    where: { id },
    data: { status: "in_progress" },
  });

  revalidatePath("/admin/products");
  return { success: true };
}

export async function completeBuild(id: string) {
  const build = await prisma.productBuild.findUnique({
    where: { id },
    select: { productId: true, quantity: true },
  });

  if (!build) return { error: "Build queue item not found" };

  await prisma.$transaction([
    prisma.product.update({
      where: { id: build.productId },
      data: {
        quantityMade: { increment: build.quantity },
        quantityAvailable: { increment: build.quantity },
        inStock: true,
      },
    }),
    prisma.productBuild.update({
      where: { id },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    }),
  ]);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}

export async function removeBuildQueueItem(id: string) {
  await prisma.productBuild.delete({ where: { id } });
  revalidatePath("/admin/products");
  return { success: true };
}
