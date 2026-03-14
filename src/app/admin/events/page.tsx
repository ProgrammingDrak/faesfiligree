import Link from "next/link";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export default async function EventsPage() {
  if (!isDatabaseConfigured()) {
    return (
      <div>
        <h1 className="font-heading text-3xl text-warm-white mb-4">Events</h1>
        <p className="text-warm-white/50">Database not configured.</p>
      </div>
    );
  }

  const events = await prisma.event.findMany({
    orderBy: { startDate: "desc" },
    include: {
      expenses: true,
      inventory: true,
      sales: true,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl text-warm-white">Events</h1>
        <Link
          href="/admin/events/new"
          className="px-4 py-2 bg-copper hover:bg-copper-dark text-white rounded-lg text-sm transition-colors"
        >
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-warm-white/50">No events yet. Create your first event to start tracking.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const totalExpenses = event.expenses.reduce((sum, e) => sum + e.amount, 0);
            const totalRevenue = event.sales.reduce((sum, s) => sum + s.price * s.quantity, 0);
            const profitLoss = totalRevenue - totalExpenses;

            return (
              <Link
                key={event.id}
                href={`/admin/events/${event.id}`}
                className="block bg-warm-white/5 border border-warm-white/10 rounded-lg p-4 hover:bg-warm-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-warm-white font-medium">{event.name}</p>
                    <p className="text-warm-white/50 text-sm">
                      {event.startDate.toLocaleDateString()}
                      {event.endDate && ` – ${event.endDate.toLocaleDateString()}`}
                      {event.location && ` · ${event.location}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-warm-white/50 text-xs">Expenses: {formatPrice(totalExpenses)}</p>
                    <p className="text-warm-white/50 text-xs">Revenue: {formatPrice(totalRevenue)}</p>
                    <p className={`text-sm font-medium ${profitLoss >= 0 ? "text-green-400" : "text-rose-gold"}`}>
                      {profitLoss >= 0 ? "+" : ""}{formatPrice(profitLoss)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
