import { notFound } from "next/navigation";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { EventExpenses } from "@/components/admin/ExpenseTracker";
import { EventInventorySection } from "@/components/admin/InventoryAssignment";
import { BreakEvenCalculator } from "@/components/admin/BreakEvenCalculator";
import { EventSalesSection } from "@/components/admin/EventSalesRecorder";
import { calculateEventMetrics } from "@/lib/data/event-metrics";
import { updateEvent } from "@/lib/actions/events";

interface Props {
  params: Promise<{ id: string }>;
}

function dateInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

function formatHours(hours: number) {
  return `${Math.round(hours * 100) / 100} hrs`;
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

  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: { inStock: true },
      orderBy: { name: "asc" },
    }),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  const laborRate = settings?.laborRate ?? 2500;
  const metrics = calculateEventMetrics(event, laborRate);

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
          <p className={`text-xl font-heading ${metrics.profitAfterExpenses >= 0 ? "text-green-400" : "text-rose-gold"}`}>
            {metrics.profitAfterExpenses >= 0 ? "+" : ""}{formatPrice(metrics.profitAfterExpenses)}
          </p>
          <p className="text-warm-white/40 text-xs">Net after event costs</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
          <p className="text-warm-white/50 text-sm">Total Expenses</p>
          <p className="text-xl text-warm-white font-heading">{formatPrice(metrics.totalExpenses)}</p>
        </div>
        <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
          <p className="text-warm-white/50 text-sm">Gross Revenue</p>
          <p className="text-xl text-warm-white font-heading">{formatPrice(metrics.grossRevenue)}</p>
        </div>
        <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
          <p className="text-warm-white/50 text-sm">Partner Payout</p>
          <p className="text-xl text-warm-white font-heading">{formatPrice(metrics.partnerPayout)}</p>
        </div>
        <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
          <p className="text-warm-white/50 text-sm">Units Sold</p>
          <p className="text-xl text-warm-white font-heading">{metrics.totalUnitsSold}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
          <p className="text-warm-white/50 text-sm">ROI</p>
          <p className="text-xl text-warm-white font-heading">
            {metrics.roi == null ? "N/A" : `${metrics.roi}%`}
          </p>
        </div>
        <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
          <p className="text-warm-white/50 text-sm">Return per Hour</p>
          <p className="text-xl text-warm-white font-heading">
            {metrics.hourlyReturn == null ? "N/A" : formatPrice(metrics.hourlyReturn)}
          </p>
        </div>
        <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
          <p className="text-warm-white/50 text-sm">Time Value</p>
          <p className="text-xl text-warm-white font-heading">{formatPrice(metrics.timeValue)}</p>
          <p className="text-warm-white/35 text-xs">{formatHours(metrics.totalHours)} at site labor rate</p>
        </div>
        <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
          <p className="text-warm-white/50 text-sm">Attendance</p>
          <p className="text-xl text-warm-white font-heading">
            {event.attendeeCount ?? "N/A"}
          </p>
          {metrics.revenuePerAttendee != null && (
            <p className="text-warm-white/35 text-xs">{formatPrice(metrics.revenuePerAttendee)} revenue per attendee</p>
          )}
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-warm-white font-heading text-xl mb-4">Event Setup</h2>
        <form
          action={async (formData) => {
            "use server";
            await updateEvent(event.id, formData);
          }}
          className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="md:col-span-2">
            <label className="block text-sm text-warm-white/70 mb-1">Event Name</label>
            <input
              name="name"
              required
              defaultValue={event.name}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Start Date</label>
            <input
              name="startDate"
              type="date"
              required
              defaultValue={dateInputValue(event.startDate)}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">End Date</label>
            <input
              name="endDate"
              type="date"
              defaultValue={dateInputValue(event.endDate)}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Location</label>
            <input
              name="location"
              defaultValue={event.location ?? ""}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Attendance</label>
            <input
              name="attendeeCount"
              type="number"
              min="0"
              step="1"
              defaultValue={event.attendeeCount ?? ""}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Travel Hours</label>
            <input
              name="travelHours"
              type="number"
              min="0"
              step="0.25"
              defaultValue={event.travelHours}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Setup Hours</label>
            <input
              name="setupHours"
              type="number"
              min="0"
              step="0.25"
              defaultValue={event.setupHours}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Selling Hours</label>
            <input
              name="sellingHours"
              type="number"
              min="0"
              step="0.25"
              defaultValue={event.sellingHours}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-warm-white/70 mb-1">Notes</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={event.notes ?? ""}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="px-4 py-2 bg-copper hover:bg-copper-dark text-white rounded-lg text-sm transition-colors"
            >
              Save Event Setup
            </button>
          </div>
        </form>
      </section>

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
            partnerCompanyName: i.partnerCompanyName,
            partnerCommissionPercent: i.partnerCommissionPercent,
            partnerPricingNotes: i.partnerPricingNotes,
          }))}
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            isPartnerProduct: p.isPartnerProduct,
            partnerCompanyName: p.partnerCompanyName,
            partnerCommissionPercent: p.partnerCommissionPercent,
          }))}
        />
      </section>

      {/* Break-Even Calculator */}
      <section className="mb-8">
        <h2 className="text-warm-white font-heading text-xl mb-4">Break-Even Analysis</h2>
        <BreakEvenCalculator
          totalExpenses={metrics.totalExpenses}
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
            partnerCompanyName: i.partnerCompanyName,
            partnerCommissionPercent: i.partnerCommissionPercent,
            partnerPricingNotes: i.partnerPricingNotes,
          }))}
        />
      </section>

      {metrics.totalUnitsSold > 0 && (
        <section className="mb-8">
          <h2 className="text-warm-white font-heading text-xl mb-4">Per-Item Event Allocation</h2>
          <div className="overflow-x-auto bg-warm-white/5 border border-warm-white/10 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-warm-white/10 text-warm-white/50">
                  <th className="p-3 font-normal">Product</th>
                  <th className="p-3 font-normal text-right">Qty</th>
                  <th className="p-3 font-normal text-right">Revenue</th>
                  <th className="p-3 font-normal text-right">Event Cost Share</th>
                  <th className="p-3 font-normal text-right">Event Time Share</th>
                  <th className="p-3 font-normal text-right">Net After Share</th>
                </tr>
              </thead>
              <tbody>
                {event.sales.map((sale) => {
                  const revenue = sale.price * sale.quantity;
                  const costShare = metrics.costPerSoldUnit * sale.quantity;
                  const hoursShare = metrics.hoursPerSoldUnit * sale.quantity;
                  const timeValueShare = metrics.timeValuePerSoldUnit * sale.quantity;
                  const partnerPercent =
                    event.inventory.find((item) => item.productId === sale.productId)?.partnerCommissionPercent ?? 0;
                  const partnerShare = Math.round(revenue * (partnerPercent / 100));
                  const netAfterShare = revenue - sale.processingFee - partnerShare - costShare - timeValueShare;

                  return (
                    <tr key={sale.id} className="border-b border-warm-white/5 text-warm-white/80">
                      <td className="p-3 text-warm-white">{sale.product.name}</td>
                      <td className="p-3 text-right">{sale.quantity}</td>
                      <td className="p-3 text-right">{formatPrice(revenue)}</td>
                      <td className="p-3 text-right">{formatPrice(costShare)}</td>
                      <td className="p-3 text-right">{formatHours(hoursShare)}</td>
                      <td className={`p-3 text-right ${netAfterShare >= 0 ? "text-green-400" : "text-rose-gold"}`}>
                        {formatPrice(netAfterShare)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-warm-white/40">
            Each sold unit receives an equal share of event expenses and event time value.
          </p>
        </section>
      )}
    </div>
  );
}
