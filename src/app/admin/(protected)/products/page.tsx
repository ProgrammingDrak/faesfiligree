import Link from "next/link";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import {
  addProductToBuildQueue,
  completeBuild,
  deleteProduct,
  removeBuildQueueItem,
  startBuild,
} from "@/lib/actions/products";

function getTotalCost(
  product: {
    materialCostLump: number | null;
    laborHours: number;
    productMaterials: { quantity: number; material: { costPerUnit: number } }[];
  },
  laborRate: number
) {
  const itemizedCost = product.productMaterials.reduce(
    (sum, row) => sum + row.material.costPerUnit * row.quantity,
    0
  );
  const supplyCost = product.materialCostLump ?? itemizedCost;
  const laborCost = Math.round(product.laborHours * laborRate);
  return { supplyCost, laborCost, totalCost: supplyCost + laborCost };
}

function statusLabel(status: string) {
  if (status === "in_progress") return "Working";
  if (status === "completed") return "Built";
  return "Need to build";
}

function getBulkUnitPrice(product: {
  price: number;
  bulkPricingEnabled: boolean;
  bulkPricingMode: string | null;
  bulkDiscountPercent: number | null;
  bulkUnitPrice: number | null;
}) {
  if (!product.bulkPricingEnabled) return null;
  if (product.bulkPricingMode === "fixed") return product.bulkUnitPrice;
  if (product.bulkDiscountPercent == null) return null;
  return Math.round(product.price * (1 - product.bulkDiscountPercent / 100));
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-warm-white">Inventory Library</h1>
          <p className="text-warm-white/50 text-sm mt-1">
            Click a library card to queue another build, then add finished pieces to inventory.
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
              const { totalCost } = getTotalCost(item.product, laborRate);
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
          <h2 className="font-heading text-xl text-warm-white">Inventory Cards</h2>
          <p className="text-warm-white/40 text-sm">{products.length} items</p>
        </div>

        {products.length === 0 ? (
          <p className="text-warm-white/50">No inventory items yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((product) => {
              const { supplyCost, laborCost, totalCost } = getTotalCost(product, laborRate);
              const queuedCount = activeBuilds
                .filter((item) => item.productId === product.id)
                .reduce((sum, item) => sum + item.quantity, 0);

              return (
                <article
                  key={product.id}
                  className="border border-warm-white/10 bg-warm-white/5 rounded-lg overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-charcoal/70">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-warm-white/25 text-sm">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-warm-white font-medium">{product.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${product.quantityAvailable > 0 ? "bg-green-500/20 text-green-400" : "bg-rose-gold/20 text-rose-gold"}`}>
                          {product.quantityAvailable > 0 ? "Available" : "Out"}
                        </span>
                      </div>
                      <p className="text-warm-white/45 text-sm">
                        {product.inventoryLabel || "Inventory item"}
                      </p>
                      {product.isPartnerProduct && product.partnerCompanyName && (
                        <p className="text-copper text-xs mt-1">
                          Partner: {product.partnerCompanyName} · {product.partnerCommissionPercent ?? 0}%
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-warm-white/35">Made</p>
                        <p className="text-warm-white">{product.quantityMade}</p>
                      </div>
                      <div>
                        <p className="text-warm-white/35">Available</p>
                        <p className="text-warm-white">{product.quantityAvailable}</p>
                      </div>
                      <div>
                        <p className="text-warm-white/35">Queued</p>
                        <p className="text-warm-white">{queuedCount}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded bg-warm-white/5 p-2">
                        <p className="text-warm-white/35">Price</p>
                        <p className="text-warm-white">{formatPrice(product.price)}</p>
                        {product.bulkPricingEnabled && product.bulkMinQuantity && (
                          <p className="text-copper text-xs">
                            {product.bulkMinQuantity}+ for {formatPrice(getBulkUnitPrice(product) ?? product.price)} each
                          </p>
                        )}
                      </div>
                      <div className="rounded bg-warm-white/5 p-2">
                        <p className="text-warm-white/35">Cost</p>
                        <p className="text-warm-white">{formatPrice(totalCost)}</p>
                        <p className="text-warm-white/35 text-xs">
                          {formatPrice(supplyCost)} + {formatPrice(laborCost)}
                        </p>
                      </div>
                    </div>

                    {product.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.labels.map((label) => (
                          <span key={label} className="text-[11px] bg-warm-white/10 text-warm-white/50 px-1.5 py-0.5 rounded">
                            {label}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      <form action={async () => {
                        "use server";
                        await addProductToBuildQueue(product.id);
                      }}>
                        <button className="px-3 py-1.5 bg-copper hover:bg-copper-dark text-white rounded text-sm">
                          Add to Build Queue
                        </button>
                      </form>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="px-3 py-1.5 bg-warm-white/10 hover:bg-warm-white/15 text-warm-white rounded text-sm"
                      >
                        Edit
                      </Link>
                      <form action={async () => {
                        "use server";
                        await deleteProduct(product.id);
                      }}>
                        <button className="text-rose-gold/70 hover:text-rose-gold text-sm">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
