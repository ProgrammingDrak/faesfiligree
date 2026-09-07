import Link from "next/link";
import { isDatabaseConfigured } from "@/lib/db";
import { StatCard } from "@/components/admin/StatCard";

export default async function AdminDashboard() {
  const dbConfigured = isDatabaseConfigured();

  let stats = { products: 0, supplies: 0, lowStock: 0, commissions: 0 };

  if (dbConfigured) {
    const { prisma } = await import("@/lib/db");
    const [products, supplies, lowStockSupplies, commissions] = await Promise.all([
      prisma.product.count(),
      prisma.material.count(),
      prisma.material.findMany(),
      prisma.commission.count({ where: { status: "pending" } }),
    ]);
    stats = {
      products,
      supplies,
      lowStock: lowStockSupplies.filter((material) => material.reorderLevel > 0 && material.stockOnHand <= material.reorderLevel).length,
      commissions,
    };
  }

  return (
    <div>
      <h1 className="font-heading text-3xl text-warm-white mb-6">Dashboard</h1>

      {!dbConfigured && (
        <div className="bg-copper/20 border border-copper/30 rounded-lg p-4 mb-6">
          <p className="text-copper text-sm">
            Database not configured. Set <code className="bg-warm-white/10 px-1 rounded">DATABASE_URL</code> in your environment to enable data persistence.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Products" value={stats.products} />
        <StatCard label="Supplies" value={stats.supplies} />
        <StatCard label="Low Stock" value={stats.lowStock} />
        <StatCard label="Pending Commissions" value={stats.commissions} />
      </div>

      <h2 className="font-heading text-xl text-warm-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { href: "/admin/products/new", label: "Create Inventory Item" },
          { href: "/admin/products", label: "Review Product Costs" },
          { href: "/admin/materials", label: "Manage Materials" },
          { href: "/admin/events/new", label: "Create Event" },
          { href: "/admin/analytics", label: "View Analytics" },
          { href: "/admin/help", label: "Replay Help Walkthrough" },
          { href: "/admin/settings", label: "Site Settings" },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-warm-white/5 hover:bg-warm-white/10 border border-warm-white/10 rounded-lg p-4 text-warm-white/80 hover:text-warm-white transition-colors text-sm"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
