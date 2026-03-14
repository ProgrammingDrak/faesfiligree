"use client";

import { addEventInventory, removeEventInventory } from "@/lib/actions/events";
import { formatPrice } from "@/lib/utils";

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  quantityBrought: number;
  quantitySold: number;
  priceAtEvent: number;
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
}

interface EventInventorySectionProps {
  eventId: string;
  inventory: InventoryItem[];
  products: ProductOption[];
}

export function EventInventorySection({
  eventId,
  inventory,
  products,
}: EventInventorySectionProps) {
  const totalValue = inventory.reduce(
    (sum, i) => sum + i.priceAtEvent * i.quantityBrought,
    0
  );

  return (
    <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
      {inventory.length > 0 && (
        <div className="mb-4">
          <table className="w-full text-left mb-2">
            <thead>
              <tr className="border-b border-warm-white/10">
                <th className="pb-2 text-warm-white/50 text-xs">Product</th>
                <th className="pb-2 text-warm-white/50 text-xs">Qty</th>
                <th className="pb-2 text-warm-white/50 text-xs">Price</th>
                <th className="pb-2 text-warm-white/50 text-xs">Value</th>
                <th className="pb-2 text-warm-white/50 text-xs"></th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b border-warm-white/5">
                  <td className="py-2 text-warm-white text-sm">{item.productName}</td>
                  <td className="py-2 text-warm-white/70 text-sm">{item.quantityBrought}</td>
                  <td className="py-2 text-warm-white/70 text-sm">{formatPrice(item.priceAtEvent)}</td>
                  <td className="py-2 text-warm-white/70 text-sm">
                    {formatPrice(item.priceAtEvent * item.quantityBrought)}
                  </td>
                  <td className="py-2">
                    <form action={async () => {
                      await removeEventInventory(item.id, eventId);
                    }}>
                      <button type="submit" className="text-rose-gold/50 hover:text-rose-gold text-xs">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-warm-white/60 text-sm">
            Total inventory value: {formatPrice(totalValue)}
          </p>
        </div>
      )}

      {/* Add inventory form */}
      <form
        action={async (formData) => {
          await addEventInventory(eventId, formData);
        }}
        className="flex gap-2"
      >
        <select
          name="productId"
          required
          className="flex-1 px-2 py-1.5 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
        >
          <option value="">Select product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({formatPrice(p.price)})
            </option>
          ))}
        </select>
        <input
          name="quantityBrought"
          type="number"
          min="1"
          placeholder="Qty"
          required
          className="w-20 px-2 py-1.5 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
        />
        <input
          name="priceAtEvent"
          type="number"
          step="0.01"
          min="0"
          placeholder="Price ($)"
          required
          className="w-24 px-2 py-1.5 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-copper hover:bg-copper-dark text-white rounded text-sm transition-colors"
        >
          Add
        </button>
      </form>
    </div>
  );
}
