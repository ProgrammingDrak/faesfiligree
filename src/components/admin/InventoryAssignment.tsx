"use client";

import {
  addEventInventory,
  removeEventInventory,
  updateEventInventoryPartnerTerms,
} from "@/lib/actions/events";
import { formatPrice } from "@/lib/utils";

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  quantityBrought: number;
  quantitySold: number;
  priceAtEvent: number;
  partnerCompanyName: string | null;
  partnerCommissionPercent: number | null;
  partnerPricingNotes: string | null;
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
  isPartnerProduct: boolean;
  partnerCompanyName: string | null;
  partnerCommissionPercent: number | null;
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
  const totalPartnerPayout = inventory.reduce((sum, item) => {
    const commissionPercent = item.partnerCommissionPercent ?? 0;
    return sum + Math.round(item.quantitySold * item.priceAtEvent * (commissionPercent / 100));
  }, 0);

  return (
    <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
      {inventory.length > 0 && (
        <div className="mb-4">
          <div className="space-y-3">
            {inventory.map((item) => {
              const commissionPercent = item.partnerCommissionPercent ?? 0;
              const grossSold = item.quantitySold * item.priceAtEvent;
              const partnerPayout = Math.round(grossSold * (commissionPercent / 100));

              return (
                <div
                  key={item.id}
                  className="border border-warm-white/10 rounded-lg bg-charcoal/35 p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-warm-white text-sm font-medium">{item.productName}</p>
                      <p className="text-warm-white/50 text-xs">
                        {item.quantityBrought} brought · {formatPrice(item.priceAtEvent)} each · {formatPrice(item.priceAtEvent * item.quantityBrought)} value
                      </p>
                      {item.partnerCompanyName && (
                        <p className="text-copper text-xs mt-1">
                          Partner: {item.partnerCompanyName} · {commissionPercent}% · payout so far {formatPrice(partnerPayout)}
                        </p>
                      )}
                    </div>
                    <form action={async () => {
                      await removeEventInventory(item.id, eventId);
                    }}>
                      <button type="submit" className="text-rose-gold/50 hover:text-rose-gold text-xs">
                        Remove
                      </button>
                    </form>
                  </div>

                  <form
                    action={async (formData) => {
                      await updateEventInventoryPartnerTerms(item.id, eventId, formData);
                    }}
                    className="mt-3 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_8rem_auto] gap-2"
                  >
                    <input
                      name="partnerCompanyName"
                      defaultValue={item.partnerCompanyName || ""}
                      placeholder="Partner company"
                      className="px-2 py-1.5 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
                    />
                    <input
                      name="partnerCommissionPercent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      defaultValue={item.partnerCommissionPercent ?? ""}
                      placeholder="%"
                      className="px-2 py-1.5 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-warm-white/10 hover:bg-warm-white/15 text-warm-white rounded text-sm"
                    >
                      Save Terms
                    </button>
                    <textarea
                      name="partnerPricingNotes"
                      defaultValue={item.partnerPricingNotes || ""}
                      placeholder="Partner pricing notes"
                      rows={2}
                      className="md:col-span-3 px-2 py-1.5 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
                    />
                  </form>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-warm-white/60 text-sm">
            <span>Total inventory value: {formatPrice(totalValue)}</span>
            {totalPartnerPayout > 0 && <span>Partner payout so far: {formatPrice(totalPartnerPayout)}</span>}
          </div>
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
              {p.name} ({formatPrice(p.price)}){p.isPartnerProduct && p.partnerCompanyName ? ` · ${p.partnerCompanyName}` : ""}
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
