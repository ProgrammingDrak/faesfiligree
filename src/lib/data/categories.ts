import { prisma } from "@/lib/db";
import { MERCH_CATEGORIES } from "@/lib/constants";

export interface CategoryOption {
  id: string;
  slug: string;
  title: string;
  skuPrefix: string;
  /** Suggested next SKU number for this category (max existing + 1). */
  nextNumber: number;
}

const SKU_PAD = 3;

function skuPrefixForSlug(slug: string): string | null {
  return MERCH_CATEGORIES.find((c) => c.slug === slug)?.skuPrefix ?? null;
}

/** Format a category prefix + number into a full inventory label. */
export function formatSku(skuPrefix: string, n: number): string {
  return `FF-${skuPrefix}-${String(n).padStart(SKU_PAD, "0")}`;
}

/**
 * Highest SKU number already used for a prefix, parsed from existing
 * product inventory labels (so deletions don't cause collisions).
 */
async function maxSkuNumber(skuPrefix: string): Promise<number> {
  const rows = await prisma.product.findMany({
    where: { inventoryLabel: { startsWith: `FF-${skuPrefix}-` } },
    select: { inventoryLabel: true },
  });
  let max = 0;
  for (const { inventoryLabel } of rows) {
    const match = inventoryLabel?.match(/-(\d+)$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return max;
}

/**
 * Idempotently make sure every canonical merch category exists as a
 * Category row, keyed by slug. Safe to call on every form load.
 */
export async function ensureMerchCategories(): Promise<void> {
  await Promise.all(
    MERCH_CATEGORIES.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        create: { slug: c.slug, title: c.title },
        update: { title: c.title },
      })
    )
  );
}

/**
 * Categories (in canonical order) with their DB id, SKU prefix, and the
 * suggested next SKU number — everything the product form needs.
 */
export async function getMerchCategoryOptions(): Promise<CategoryOption[]> {
  await ensureMerchCategories();
  const rows = await prisma.category.findMany();
  const bySlug = new Map(rows.map((r) => [r.slug, r]));

  return Promise.all(
    MERCH_CATEGORIES.map(async (c) => ({
      id: bySlug.get(c.slug)?.id ?? "",
      slug: c.slug,
      title: c.title,
      skuPrefix: c.skuPrefix,
      nextNumber: (await maxSkuNumber(c.skuPrefix)) + 1,
    }))
  );
}

/**
 * Authoritative SKU generator for the save action. Returns the next free
 * label for the category a product was assigned to, or null if the
 * category has no known prefix.
 */
export async function generateSkuForCategory(categoryId: string): Promise<string | null> {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return null;
  const skuPrefix = skuPrefixForSlug(category.slug);
  if (!skuPrefix) return null;
  return formatSku(skuPrefix, (await maxSkuNumber(skuPrefix)) + 1);
}
