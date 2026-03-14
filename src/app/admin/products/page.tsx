import Link from "next/link";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { deleteProduct } from "@/lib/actions/products";

export default async function ProductsPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div>
        <h1 className="font-heading text-3xl text-warm-white mb-4">Products</h1>
        <p className="text-warm-white/50">Database not configured.</p>
      </div>
    );
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl text-warm-white">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-copper hover:bg-copper-dark text-white rounded-lg text-sm transition-colors"
        >
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-warm-white/50">No products yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-warm-white/10">
                <th className="pb-3 text-warm-white/50 text-sm font-medium">Name</th>
                <th className="pb-3 text-warm-white/50 text-sm font-medium">Price</th>
                <th className="pb-3 text-warm-white/50 text-sm font-medium">Category</th>
                <th className="pb-3 text-warm-white/50 text-sm font-medium">Status</th>
                <th className="pb-3 text-warm-white/50 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-warm-white/5">
                  <td className="py-3 text-warm-white">
                    {product.name}
                    {product.featured && (
                      <span className="ml-2 text-xs bg-copper/20 text-copper px-1.5 py-0.5 rounded">Featured</span>
                    )}
                  </td>
                  <td className="py-3 text-warm-white/70">{formatPrice(product.price)}</td>
                  <td className="py-3 text-warm-white/70">{product.category?.title || "—"}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${product.inStock ? "bg-green-500/20 text-green-400" : "bg-rose-gold/20 text-rose-gold"}`}>
                      {product.inStock ? "In Stock" : "Sold"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-copper text-sm hover:text-copper-light"
                      >
                        Edit
                      </Link>
                      <form action={async () => {
                        "use server";
                        await deleteProduct(product.id);
                      }}>
                        <button type="submit" className="text-rose-gold/70 text-sm hover:text-rose-gold">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
