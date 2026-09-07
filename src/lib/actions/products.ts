"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { generateSkuForCategory } from "@/lib/data/categories";
import { recordInventorySale } from "@/lib/inventory/sales";

/**
 * Lowest price the maker will accept when haggling. Null means it's left to
 * the sales rep's discretion (either the discretion box is checked or no
 * floor was entered).
 */
function parseHagglePrice(formData: FormData): number | null {
  if (formData.get("haggleDiscretion") === "on") return null;
  const cents = Math.round(parseNumber(formData.get("hagglePrice")) * 100);
  return cents > 0 ? cents : null;
}

/**
 * Resolve the inventory label to store: an explicit one wins, otherwise
 * auto-generate the next SKU for the chosen category.
 */
async function resolveInventoryLabel(
  inventoryLabel: string | null,
  categoryId: string | null
) {
  if (inventoryLabel) return inventoryLabel;
  if (categoryId) return generateSkuForCategory(categoryId);
  return null;
}

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

async function findSingleActiveEventId(date = new Date()) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const events = await prisma.event.findMany({
    where: {
      startDate: { lte: dayEnd },
      OR: [
        { endDate: { gte: dayStart } },
        { endDate: null, startDate: { gte: dayStart, lte: dayEnd } },
      ],
    },
    select: { id: true },
  });

  return events.length === 1 ? events[0].id : null;
}

export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const inventoryLabel = ((formData.get("inventoryLabel") as string) || "").trim() || null;
  const categoryId = (formData.get("categoryId") as string) || null;
  const labels = (formData.get("labels") as string || "").split(",").map(label => label.trim()).filter(Boolean);
  const description = (formData.get("description") as string) || null;
  const price = Math.round(parseNumber(formData.get("price")) * 100);
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
  if ("error" in partnerTerms) return { error: partnerTerms.error };
  if ("error" in bulkPricing) return { error: bulkPricing.error };

  const resolvedLabel = await resolveInventoryLabel(inventoryLabel, categoryId);

  await prisma.product.create({
    data: {
      name: name.trim(),
      slug: slugify(name),
      inventoryLabel: resolvedLabel,
      labels,
      description,
      price,
      hagglePrice: parseHagglePrice(formData),
      images,
      categoryId,
      materials: [],
      dimensions: null,
      quantityMade: 1,
      quantityAvailable: 1,
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
  const inventoryLabel = ((formData.get("inventoryLabel") as string) || "").trim() || null;
  const categoryId = (formData.get("categoryId") as string) || null;
  const labels = (formData.get("labels") as string || "").split(",").map(label => label.trim()).filter(Boolean);
  const description = (formData.get("description") as string) || null;
  const price = Math.round(parseNumber(formData.get("price")) * 100);
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
  if ("error" in partnerTerms) return { error: partnerTerms.error };
  if ("error" in bulkPricing) return { error: bulkPricing.error };

  const resolvedLabel = await resolveInventoryLabel(inventoryLabel, categoryId);

  // Delete existing product materials and recreate
  await prisma.productMaterial.deleteMany({ where: { productId: id } });

  await prisma.product.update({
    where: { id },
    data: {
      name: name.trim(),
      slug: slugify(name),
      inventoryLabel: resolvedLabel,
      labels,
      description,
      price,
      hagglePrice: parseHagglePrice(formData),
      images,
      categoryId,
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

// --- Direct inventory adjustments -----------------------------------------

/** Record newly made pieces: more made, more available, back in stock. */
async function applyMade(productId: string, quantity: number) {
  await prisma.product.update({
    where: { id: productId },
    data: {
      quantityMade: { increment: quantity },
      quantityAvailable: { increment: quantity },
      inStock: true,
    },
  });
}

/**
 * Record a sale: fewer available (never below 0), more sold + revenue.
 * Revenue uses, in order of preference: an explicit unit price, the list
 * price minus a discount %, or the plain list price.
 */
async function applySold(
  productId: string,
  quantity: number,
  opts: {
    unitPriceCents?: number;
    discountPercent?: number;
    paymentType?: string | null;
    eventId?: string | null;
    orderId?: string | null;
  } = {}
) {
  const eventId = opts.eventId === undefined ? await findSingleActiveEventId() : opts.eventId;
  await prisma.$transaction(async (tx) => {
    await recordInventorySale(tx, {
      productId,
      quantity,
      unitPriceCents: opts.unitPriceCents,
      discountPercent: opts.discountPercent,
      paymentType: opts.paymentType,
      eventId,
      orderId: opts.orderId,
    });
  });
}

function validQuantity(quantity: number) {
  return Number.isFinite(quantity) && quantity > 0;
}

export async function recordMade(productId: string, quantity: number) {
  if (!validQuantity(quantity)) return { error: "Quantity must be greater than 0" };
  await applyMade(productId, quantity);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}

export async function recordSold(
  productId: string,
  quantity: number,
  unitPriceCents?: number,
  paymentType?: string | null,
  eventId?: string | null,
  orderId?: string | null
) {
  if (!validQuantity(quantity)) return { error: "Quantity must be greater than 0" };
  await applySold(productId, quantity, { unitPriceCents, paymentType, eventId, orderId });
  revalidatePath("/admin/products");
  revalidatePath("/admin/sales");
  if (eventId) revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  revalidatePath("/admin/analytics");
  revalidatePath("/shop");
  return { success: true };
}

export async function recordBulkMade(productIds: string[], quantity: number) {
  if (!validQuantity(quantity)) return { error: "Quantity must be greater than 0" };
  if (productIds.length === 0) return { error: "No products selected" };
  await Promise.all(productIds.map((id) => applyMade(id, quantity)));
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}

export async function recordBulkSold(
  productIds: string[],
  quantity: number,
  discountPercent?: number,
  paymentType?: string | null,
  eventId?: string | null
) {
  if (!validQuantity(quantity)) return { error: "Quantity must be greater than 0" };
  if (productIds.length === 0) return { error: "No products selected" };
  await Promise.all(
    productIds.map((id) => applySold(id, quantity, { discountPercent, paymentType, eventId }))
  );
  revalidatePath("/admin/products");
  revalidatePath("/admin/sales");
  if (eventId) revalidatePath(`/admin/events/${eventId}`);
  revalidatePath("/admin/events");
  revalidatePath("/admin/analytics");
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
