import { notFound } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { EventExpenses } from "@/components/admin/ExpenseTracker";
import { EventInventorySection } from "@/components/admin/InventoryAssignment";
import { BreakEvenCalculator } from "@/components/admin/BreakEvenCalculator";
import { EventSalesSection } from "@/components/admin/EventSalesRecorder";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  if (!isDatabaseConfigured()) return notFound();

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      expenses: true,
      inventory: { include: { product: true } },
      sales: { include: { product: true } },
    },
  });
  if (!event) return notFound();

  const products = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { name: "asc" },
  });

  const totalExpenses = event.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRevenue = event.sales.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const profitLoss = totalRevenue - totalExpenses;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl text-warm-white">{event.name}</h1>
          <p className="text-warm-white/50 text-sm mt-1">
            {event.startDate.toLocaleDateString()}
            {event.endDate && ` – ${event.endDate.toLocaleDateString()}`}
            {event.location && ` · ${event.location}`}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-xl font-heading ${profitLoss >= 0 ? "text-green-400" : "text-rose-gold"}`}>
            {profitLoss >= 0 ? "+" : ""}{formatPrice(profitLoss)}
          </p>
          <p className="text-warm-white/40 text-xs">Net P&L</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
          <p className="text-warm-white/50 text-sm">Total Expenses</p>
          <p className="text-xl text-warm-white font-heading">{formatPrice(totalExpenses)}</p>
        </div>
        <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
          <p className="text-warm-white/50 text-sm">Total Revenue</p>
          <p className="text-xl text-warm-white font-heading">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
          <p className="text-warm-white/50 text-sm">Items Brought</p>
          <p className="text-xl text-warm-white font-heading">
            {event.inventory.reduce((sum, i) => sum + i.quantityBrought, 0)}
          </p>
        </div>
      </div>

      {/* Expenses Section */}
      <section className="mb-8">
        <h2 className="text-warm-white font-heading text-xl mb-4">Expenses</h2>
        <EventExpenses
          eventId={event.id}
          expenses={event.expenses.map((e) => ({
            id: e.id,
            category: e.category,
            description: e.description,
            amount: e.amount,
          }))}
        />
      </section>

      {/* Inventory Section */}
      <section className="mb-8">
        <h2 className="text-warm-white font-heading text-xl mb-4">Inventory</h2>
        <EventInventorySection
          eventId={event.id}
          inventory={event.inventory.map((i) => ({
            id: i.id,
            productId: i.productId,
            productName: i.product.name,
            quantityBrought: i.quantityBrought,
            quantitySold: i.quantitySold,
            priceAtEvent: i.priceAtEvent,
          }))}
          products={products.map((p) => ({ id: p.id, name: p.name, price: p.price }))}
        />
      </section>

      {/* Break-Even Calculator */}
      <section className="mb-8">
        <h2 className="text-warm-white font-heading text-xl mb-4">Break-Even Analysis</h2>
        <BreakEvenCalculator
          totalExpenses={totalExpenses}
          inventory={event.inventory.map((i) => ({
            productName: i.product.name,
            quantityBrought: i.quantityBrought,
            priceAtEvent: i.priceAtEvent,
          }))}
        />
      </section>

      {/* Sales Recording */}
      <section className="mb-8">
        <h2 className="text-warm-white font-heading text-xl mb-4">Record Sales</h2>
        <EventSalesSection
          eventId={event.id}
          inventory={event.inventory.map((i) => ({
            id: i.id,
            productName: i.product.name,
            quantityBrought: i.quantityBrought,
            quantitySold: i.quantitySold,
            priceAtEvent: i.priceAtEvent,
          }))}
        />
      </section>
    </div>
  );
}
