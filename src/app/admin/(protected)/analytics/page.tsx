import { isDatabaseConfigured } from "@/lib/db";
import { getAnalyticsSummary } from "@/lib/data/queries";
import { StatCard } from "@/components/admin/StatCard";
import { BarChart } from "@/components/admin/BarChart";
import { formatPrice } from "@/lib/utils";

interface Props {
  searchParams: Promise<{ start?: string; end?: string }>;
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const { start, end } = await searchParams;

  if (!isDatabaseConfigured()) {
    return (
      <div>
        <h1 className="font-heading text-3xl text-warm-white mb-4">Analytics</h1>
        <p className="text-warm-white/50">Database not configured. Connect a database to see analytics.</p>
      </div>
    );
  }

  const startDate = start ? new Date(start) : undefined;
  const endDate = end ? new Date(end) : undefined;

  const analytics = await getAnalyticsSummary(startDate, endDate);

  return (
    <div>
      <h1 className="font-heading text-3xl text-warm-white mb-6">Analytics</h1>

      {/* Date Range Filter */}
      <form className="flex gap-3 mb-6 items-end">
        <div>
          <label className="block text-warm-white/50 text-xs mb-1">Start Date</label>
          <input
            name="start"
            type="date"
            defaultValue={start || ""}
            className="px-3 py-1.5 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>
        <div>
          <label className="block text-warm-white/50 text-xs mb-1">End Date</label>
          <input
            name="end"
            type="date"
            defaultValue={end || ""}
            className="px-3 py-1.5 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-1.5 bg-copper hover:bg-copper-dark text-white rounded text-sm transition-colors"
        >
          Filter
        </button>
      </form>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Gross Revenue" value={formatPrice(analytics.grossRevenue)} />
        <StatCard
          label="After Materials"
          value={formatPrice(analytics.grossRevenue - analytics.totalMaterialCost)}
          detail={`Material cost: ${formatPrice(analytics.totalMaterialCost)}`}
        />
        <StatCard
          label="After Labor"
          value={formatPrice(analytics.grossRevenue - analytics.totalMaterialCost - analytics.totalLaborCost)}
          detail={`Labor cost: ${formatPrice(analytics.totalLaborCost)}`}
        />
        <StatCard
          label="Net Profit"
          value={formatPrice(analytics.netProfit)}
          detail={analytics.grossRevenue > 0
            ? `${Math.round((analytics.netProfit / analytics.grossRevenue) * 100)}% margin`
            : undefined}
        />
      </div>

      {/* Monthly Revenue Chart */}
      {analytics.salesByMonth.length > 0 && (
        <div className="bg-warm-white/5 border border-warm-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-warm-white font-medium mb-4">Monthly Revenue</h2>
          <BarChart
            data={analytics.salesByMonth.map((m) => ({
              label: m.month,
              value: m.revenue,
            }))}
            formatValue={(v) => formatPrice(v)}
          />
        </div>
      )}

      {/* Product Profitability */}
      {analytics.productBreakdown.length > 0 && (
        <div className="bg-warm-white/5 border border-warm-white/10 rounded-xl p-6">
          <h2 className="text-warm-white font-medium mb-4">Product Profitability</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-warm-white/10">
                  <th className="pb-2 text-warm-white/50 text-sm">Product</th>
                  <th className="pb-2 text-warm-white/50 text-sm">Units</th>
                  <th className="pb-2 text-warm-white/50 text-sm">Revenue</th>
                  <th className="pb-2 text-warm-white/50 text-sm">Materials</th>
                  <th className="pb-2 text-warm-white/50 text-sm">Labor</th>
                  <th className="pb-2 text-warm-white/50 text-sm">Profit</th>
                  <th className="pb-2 text-warm-white/50 text-sm">Margin</th>
                </tr>
              </thead>
              <tbody>
                {analytics.productBreakdown.map((p) => {
                  const profit = p.revenue - p.materialCost - p.laborCost;
                  const margin = p.revenue > 0 ? Math.round((profit / p.revenue) * 100) : 0;
                  return (
                    <tr key={p.name} className="border-b border-warm-white/5">
                      <td className="py-2 text-warm-white">{p.name}</td>
                      <td className="py-2 text-warm-white/70">{p.unitsSold}</td>
                      <td className="py-2 text-warm-white/70">{formatPrice(p.revenue)}</td>
                      <td className="py-2 text-warm-white/70">{formatPrice(p.materialCost)}</td>
                      <td className="py-2 text-warm-white/70">{formatPrice(p.laborCost)}</td>
                      <td className={`py-2 ${profit >= 0 ? "text-green-400" : "text-rose-gold"}`}>
                        {formatPrice(profit)}
                      </td>
                      <td className="py-2 text-warm-white/70">{margin}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {analytics.productBreakdown.length === 0 && (
        <p className="text-warm-white/40 text-sm">No sales data yet. Record sales to see analytics.</p>
      )}
    </div>
  );
}
