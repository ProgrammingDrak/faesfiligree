"use client";

import { formatPrice } from "@/lib/utils";

interface InventoryItem {
  productName: string;
  quantityBrought: number;
  priceAtEvent: number;
}

interface BreakEvenCalculatorProps {
  totalExpenses: number;
  inventory: InventoryItem[];
}

export function BreakEvenCalculator({
  totalExpenses,
  inventory,
}: BreakEvenCalculatorProps) {
  if (inventory.length === 0 || totalExpenses === 0) {
    return (
      <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
        <p className="text-warm-white/40 text-sm">
          {totalExpenses === 0
            ? "Add expenses to see break-even analysis."
            : "Add inventory to see break-even analysis."}
        </p>
      </div>
    );
  }

  const totalItems = inventory.reduce((sum, i) => sum + i.quantityBrought, 0);
  const totalValue = inventory.reduce((sum, i) => sum + i.priceAtEvent * i.quantityBrought, 0);
  const avgPrice = totalItems > 0 ? totalValue / totalItems : 0;
  const unitsToBreakEven = avgPrice > 0 ? Math.ceil(totalExpenses / (avgPrice / 100) * 100 / avgPrice) : 0;
  const overallBreakEven = avgPrice > 0 ? Math.ceil(totalExpenses / avgPrice * 100) / 100 : 0;

  return (
    <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-warm-white/50 text-xs">Total Expenses</p>
          <p className="text-warm-white text-lg">{formatPrice(totalExpenses)}</p>
        </div>
        <div>
          <p className="text-warm-white/50 text-xs">Avg Price per Item</p>
          <p className="text-warm-white text-lg">{formatPrice(Math.round(avgPrice))}</p>
        </div>
      </div>

      <div className="bg-copper/10 border border-copper/20 rounded-lg p-3 mb-4">
        <p className="text-copper font-medium">
          Need to sell ~{Math.ceil(totalExpenses / avgPrice)} items to break even
        </p>
        <p className="text-copper/70 text-sm">
          ({overallBreakEven.toFixed(1)} items at avg price of {formatPrice(Math.round(avgPrice))})
        </p>
      </div>

      <h3 className="text-warm-white/60 text-sm font-medium mb-2">Per-Product Breakdown</h3>
      <div className="space-y-1">
        {inventory.map((item) => {
          const itemBreakEven = item.priceAtEvent > 0
            ? Math.ceil(totalExpenses / item.priceAtEvent)
            : 0;
          const canCoverExpenses = item.quantityBrought >= itemBreakEven;

          return (
            <div key={item.productName} className="flex items-center justify-between py-1">
              <span className="text-warm-white text-sm">{item.productName}</span>
              <div className="text-right">
                <span className="text-warm-white/70 text-sm">
                  {itemBreakEven} needed @ {formatPrice(item.priceAtEvent)}
                </span>
                {canCoverExpenses ? (
                  <span className="text-green-400 text-xs ml-2">
                    (bringing {item.quantityBrought})
                  </span>
                ) : (
                  <span className="text-rose-gold text-xs ml-2">
                    (only bringing {item.quantityBrought})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
