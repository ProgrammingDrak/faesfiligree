import { isDatabaseConfigured, prisma } from "@/lib/db";
import { getSales } from "@/lib/data/queries";
import { SalesManager, type SaleRow } from "@/components/admin/SalesManager";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Sales" };

export default async function SalesPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div>
        <h1 className="font-heading text-3xl text-warm-white mb-4">Sales</h1>
        <p className="text-warm-white/50">Database not configured.</p>
      </div>
    );
  }

  const [sales, events] = await Promise.all([
    getSales(),
    prisma.event.findMany({
      orderBy: { startDate: "desc" },
      select: { id: true, name: true, startDate: true },
    }),
  ]);

  const rows: SaleRow[] = sales.map((sale) => ({
    id: sale.id,
    dateLabel: sale.date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    productName: sale.product?.name ?? "Unknown product",
    inventoryLabel: sale.product?.inventoryLabel ?? null,
    eventId: sale.eventId,
    eventName: sale.event?.name ?? null,
    quantity: sale.quantity,
    price: sale.price,
    paymentType: sale.paymentType,
    processingFee: sale.processingFee,
  }));

  const gross = sales.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const fees = sales.reduce((sum, s) => sum + s.processingFee, 0);
  const net = gross - fees;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-warm-white">Sales</h1>
        <p className="text-warm-white/50 text-sm mt-1">
          Every recorded sale. Edit or undo any of them — inventory and analytics resync automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-warm-white/10 bg-warm-white/5 p-4">
          <p className="text-warm-white/40 text-sm">Gross</p>
          <p className="text-warm-white text-xl font-medium">{formatPrice(gross)}</p>
        </div>
        <div className="rounded-xl border border-warm-white/10 bg-warm-white/5 p-4">
          <p className="text-warm-white/40 text-sm">Processing fees</p>
          <p className="text-rose-gold text-xl font-medium">-{formatPrice(fees)}</p>
        </div>
        <div className="rounded-xl border border-warm-white/10 bg-warm-white/5 p-4">
          <p className="text-warm-white/40 text-sm">Net after fees</p>
          <p className="text-warm-white text-xl font-medium">{formatPrice(net)}</p>
        </div>
      </div>

      <SalesManager
        sales={rows}
        events={events.map((event) => ({
          id: event.id,
          name: event.name,
          startDateLabel: event.startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        }))}
      />
    </div>
  );
}
