import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import {
  InventoryManager,
  type InventoryProduct,
} from "@/components/admin/InventoryManager";
import { ensureMerchCategories } from "@/lib/data/categories";
import { getProductCost, getBulkUnitPrice } from "@/lib/data/product-metrics";
import { formatPrice } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  if (!isDatabaseConfigured()) return notFound();

  await ensureMerchCategories();

  const isUncategorized = slug === "uncategorized";
  const category = isUncategorized
    ? null
    : await prisma.category.findUnique({ where: { slug } });
  if (!isUncategorized && !category) return notFound();

  const title = category?.title ?? "Uncategorized";

  const [products, buildQueue, settings] = await Promise.all([
    prisma.product.findMany({
      where: isUncategorized ? { categoryId: null } : { categoryId: category!.id },
      orderBy: { createdAt: "desc" },
      include: {
        productMaterials: { include: { material: true } },
        category: true,
      },
    }),
    prisma.productBuild.findMany({
      where: { status: { not: "completed" } },
      select: { productId: true, quantity: true },
    }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);
  const laborRate = settings?.laborRate ?? 2500;

  const inventoryProducts: InventoryProduct[] = products.map((product) => {
    const { totalCost } = getProductCost(product, laborRate);
    const queuedCount = buildQueue
      .filter((item) => item.productId === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    const bulkUnit = getBulkUnitPrice(product);
    const bulkLabel =
      product.bulkPricingEnabled && product.bulkMinQuantity
        ? `${product.bulkMinQuantity}+ for ${formatPrice(bulkUnit ?? product.price)} each`
        : null;
    return {
      id: product.id,
      name: product.name,
      inventoryLabel: product.inventoryLabel,
      categoryTitle: product.category?.title ?? null,
      labels: product.labels,
      image: product.images[0] ?? null,
      quantityMade: product.quantityMade,
      quantityAvailable: product.quantityAvailable,
      queuedCount,
      soldCount: product.soldCount,
      soldRevenue: product.soldRevenue,
      price: product.price,
      hagglePrice: product.hagglePrice,
      totalCost,
      bulkLabel,
      isPartnerProduct: product.isPartnerProduct,
      partnerCompanyName: product.partnerCompanyName,
      partnerCommissionPercent: product.partnerCommissionPercent,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="text-sm text-warm-white/50 hover:text-copper"
        >
          ← All categories
        </Link>
        <div className="mt-2 flex items-center justify-between gap-4">
          <h1 className="font-heading text-3xl text-warm-white">{title}</h1>
          {!isUncategorized && (
            <Link
              href={`/admin/products/new?category=${slug}`}
              className="rounded-lg bg-copper px-4 py-2 text-sm text-white transition-colors hover:bg-copper-dark"
            >
              Add Item
            </Link>
          )}
        </div>
      </div>

      <InventoryManager products={inventoryProducts} />
    </div>
  );
}
