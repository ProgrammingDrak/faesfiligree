// Seed test data into the LOCAL dev database only.
// Run from the repo root: node --env-file=.env.local scripts/seed-local.ts
//
// Refuses to run against anything but localhost so it can never touch the
// shared Supabase hub.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/seed-local.ts");
}
const host = new URL(connectionString).hostname;
if (host !== "localhost" && host !== "127.0.0.1") {
  throw new Error(`Refusing to seed non-local database host "${host}". This script is local-only.`);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const CATEGORIES = [
  { slug: "suncatchers", title: "Suncatchers" },
  { slug: "pendants", title: "Pendants" },
  { slug: "earrings", title: "Earrings" },
];

const PRODUCTS = [
  {
    // Regular product: plenty of stock, simple pricing.
    slug: "test-copper-suncatcher",
    name: "Test Copper Suncatcher",
    inventoryLabel: "FF-SUN-901",
    description: "Seeded test product (regular). Safe to buy in sandbox checkout.",
    price: 4500,
    categorySlug: "suncatchers",
    quantityMade: 5,
    quantityAvailable: 5,
    inStock: true,
    featured: true,
  },
  {
    // One-of-a-kind: buying it must flip inStock=false.
    slug: "test-one-of-a-kind-pendant",
    name: "Test One-of-a-Kind Pendant",
    inventoryLabel: "FF-PEND-901",
    description: "Seeded test product (one of a kind). Buying it should flip out of stock.",
    price: 12000,
    categorySlug: "pendants",
    quantityMade: 1,
    quantityAvailable: 1,
    inStock: true,
    featured: false,
  },
  {
    // Bulk-priced: 3+ units get 10% off, exercising getCheckoutUnitPrice.
    slug: "test-bulk-earrings",
    name: "Test Bulk Earrings",
    inventoryLabel: "FF-EAR-901",
    description: "Seeded test product (bulk pricing: 10% off at 3+).",
    price: 2000,
    categorySlug: "earrings",
    quantityMade: 10,
    quantityAvailable: 10,
    inStock: true,
    featured: false,
    bulkPricingEnabled: true,
    bulkMinQuantity: 3,
    bulkPricingMode: "percent",
    bulkDiscountPercent: 10,
  },
];

async function main() {
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, title: c.title },
      update: { title: c.title },
    });
  }

  const categories = await prisma.category.findMany({
    where: { slug: { in: CATEGORIES.map((c) => c.slug) } },
  });
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  for (const p of PRODUCTS) {
    const { categorySlug, ...fields } = p;
    const categoryId = categoryIdBySlug.get(categorySlug) ?? null;
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: { ...fields, categoryId, images: [] },
      update: { ...fields, categoryId },
    });
  }

  const count = await prisma.product.count();
  console.log(`Seeded ${CATEGORIES.length} categories and ${PRODUCTS.length} products (${count} products total) into ${host}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
