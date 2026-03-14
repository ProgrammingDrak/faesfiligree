"use client";

import { recordEventSale } from "@/lib/actions/events";
import { formatPrice } from "@/lib/utils";

interface InventoryItem {
  id: string;
  productName: string;
  quantityBrought: number;
  quantitySold: number;
  priceAtEvent: number;
}

interface EventSalesSectionProps {
  eventId: string;
  inventory: InventoryItem[];
}

export function EventSalesSection({ eventId, inventory }: EventSalesSectionProps) {
  if (inventory.length === 0) {
    return (
      <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
        <p className="text-warm-white/40 text-sm">Add inventory first to record sales.</p>
      </div>
    );
  }

  const totalSold = inventory.reduce((sum, i) => sum + i.quantitySold, 0);
  const totalRevenue = inventory.reduce((sum, i) => sum + i.quantitySold * i.priceAtEvent, 0);

  return (
    <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
      <div className="space-y-3">
        {inventory.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div>
              <span className="text-warm-white text-sm">{item.productName}</span>
              <span className="text-warm-white/40 text-xs ml-2">
                (brought {item.quantityBrought} @ {formatPrice(item.priceAtEvent)})
              </span>
            </div>
            <form
              action={async (formData) => {
                formData.set("inventoryId", item.id);
                await recordEventSale(eventId, formData);
              }}
              className="flex items-center gap-2"
            >
              <label className="text-warm-white/50 text-xs">Sold:</label>
              <input
                name="quantitySold"
                type="number"
                min="0"
                max={item.quantityBrought}
                defaultValue={item.quantitySold}
                className="w-16 px-2 py-1 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-copper/80 hover:bg-copper text-white rounded text-xs transition-colors"
              >
                Save
              </button>
            </form>
          </div>
        ))}
      </div>

      {totalSold > 0 && (
        <div className="mt-4 pt-3 border-t border-warm-white/10">
          <p className="text-warm-white/60 text-sm">
            Total sold: {totalSold} items · Revenue: {formatPrice(totalRevenue)}
          </p>
        </div>
      )}
    </div>
  );
}
