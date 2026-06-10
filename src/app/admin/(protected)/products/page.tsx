import Link from "next/link";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import {
  completeBuild,
  removeBuildQueueItem,
  startBuild,
} from "@/lib/actions/products";
import { CategoryBoard, type CategoryCard } from "@/components/admin/CategoryBoard";
import { ensureMerchCategories } from "@/lib/data/categories";
import { getProductCost } from "@/lib/data/product-metrics";
import { MERCH_CATEGORIES } from "@/lib/constants";

function statusLabel(status: string) {
  if (status === "in_progress") return "Working";
  if (status === "completed") return "Built";
  return "Need to build";
}

export default async function ProductsPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div>
        <h1 className="font-heading text-3xl text-warm-white mb-4">Inventory Library</h1>
        <p className="text-warm-white/50">Database not configured.</p>
      </div>
    );
  }

  const [products, buildQueue, settings] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        productMaterials: { include: { material: true } },
        category: true,
      },
    }),
    prisma.productBuild.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      include: {
        product: {
          include: {
            productMaterials: { include: { material: true } },
          },
        },
      },
    }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);
  const laborRate = settings?.laborRate ?? 2500;
  const activeBuilds = buildQueue.filter((item) => item.status !== "completed");
  const completedBuilds = buildQueue.filter((item) => item.status === "completed").slice(0, 6);

  await ensureMerchCategories();
  const categories = await prisma.category.findMany();
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  type ProductRow = (typeof products)[number];
  const buildCard = (slug: string, title: string, items: ProductRow[]): CategoryCard => ({
    slug,
    title,
    image: items.find((p) => p.images[0])?.images[0] ?? null,
    itemCount: items.length,
    availableUnits: items.reduce((sum, p) => sum + p.quantityAvailable, 0),
    soldUnits: items.reduce((sum, p) => sum + p.soldCount, 0),
    items: items.map((p) => ({
      id: p.id,
      name: p.name,
      image: p.images[0] ?? null,
      price: p.price,
      hagglePrice: p.hagglePrice,
      quantityAvailable: p.quantityAvailable,
    })),
  });

  // One card per canonical category (even empty ones, so you can add into them),
  // plus an "Uncategorized" bucket for anything without a category.
  const categoryCards: CategoryCard[] = MERCH_CATEGORIES.map((mc) => {
    const cat = categoryBySlug.get(mc.slug);
    const items = cat ? products.filter((p) => p.categoryId === cat.id) : [];
    return buildCard(mc.slug, mc.title, items);
  });
  const uncategorized = products.filter((p) => !p.categoryId);
  if (uncategorized.length > 0) {
    categoryCards.push(buildCard("uncategorized", "Uncategorized", uncategorized));
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-warm-white">Inventory Library</h1>
          <p className="text-warm-white/50 text-sm mt-1">
            New products start at 1 in stock. Use + Made and Sold to keep counts current.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-copper hover:bg-copper-dark text-white rounded-lg text-sm transition-colors"
        >
          Add Product
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-xl text-warm-white">Build Queue</h2>
          <p className="text-warm-white/40 text-sm">
            {activeBuilds.length} active
          </p>
        </div>

        {activeBuilds.length === 0 ? (
          <div className="border border-warm-white/10 rounded-lg p-4 text-warm-white/50 text-sm">
            No queued builds yet. Add one from the inventory library below.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {activeBuilds.map((item) => {
              const { totalCost } = getProductCost(item.product, laborRate);
              return (
                <div
                  key={item.id}
                  className="border border-warm-white/10 bg-warm-white/5 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-copper mb-1">
                        {statusLabel(item.status)}
                      </p>
                      <h3 className="text-warm-white font-medium">{item.product.name}</h3>
                      <p className="text-warm-white/45 text-sm">
                        {item.product.inventoryLabel || "Inventory item"}
                      </p>
                    </div>
                    <span className="rounded bg-warm-white/10 px-2 py-1 text-sm text-warm-white">
                      x{item.quantity}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-warm-white/35">Made</p>
                      <p className="text-warm-white">{item.product.quantityMade}</p>
                    </div>
                    <div>
                      <p className="text-warm-white/35">Available</p>
                      <p className="text-warm-white">{item.product.quantityAvailable}</p>
                    </div>
                    <div>
                      <p className="text-warm-white/35">Cost</p>
                      <p className="text-warm-white">{formatPrice(totalCost)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.status === "planned" && (
                      <form action={async () => {
                        "use server";
                        await startBuild(item.id);
                      }}>
                        <button className="px-3 py-1.5 bg-warm-white/10 hover:bg-warm-white/15 text-warm-white rounded text-sm">
                          Start
                        </button>
                      </form>
                    )}
                    <form action={async () => {
                      "use server";
                      await completeBuild(item.id);
                    }}>
                      <button className="px-3 py-1.5 bg-copper hover:bg-copper-dark text-white rounded text-sm">
                        Built: Add to Inventory
                      </button>
                    </form>
                    <form action={async () => {
                      "use server";
                      await removeBuildQueueItem(item.id);
                    }}>
                      <button className="px-3 py-1.5 text-rose-gold/80 hover:text-rose-gold text-sm">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {completedBuilds.length > 0 && (
          <div className="mt-4">
            <h3 className="text-warm-white/60 text-sm mb-2">Recently built</h3>
            <div className="flex flex-wrap gap-2">
              {completedBuilds.map((item) => (
                <span
                  key={item.id}
                  className="rounded bg-green-500/10 px-2 py-1 text-xs text-green-400"
                >
                  {item.product.name} +{item.quantity}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading text-xl text-warm-white">Categories</h2>
          <p className="text-warm-white/40 text-sm">
            Open a category to add or manage items. Hit Sold to pick what sold.
          </p>
        </div>

        <CategoryBoard categories={categoryCards} />
      </section>
    </div>
  );
}
