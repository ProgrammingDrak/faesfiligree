"use client";

import { recordEventSale } from "@/lib/actions/events";
import { PAYMENT_METHODS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

interface InventoryItem {
  id: string;
  productName: string;
  quantityBrought: number;
  quantitySold: number;
  priceAtEvent: number;
  paymentType: string | null;
  partnerCompanyName: string | null;
  partnerCommissionPercent: number | null;
  partnerPricingNotes: string | null;
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
  const totalPartnerPayout = inventory.reduce((sum, i) => {
    const commissionPercent = i.partnerCommissionPercent ?? 0;
    return sum + Math.round(i.quantitySold * i.priceAtEvent * (commissionPercent / 100));
  }, 0);
  const faesShare = totalRevenue - totalPartnerPayout;

  return (
    <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4">
      <div className="space-y-3">
        {inventory.map((item) => {
          const commissionPercent = item.partnerCommissionPercent ?? 0;
          const itemRevenue = item.quantitySold * item.priceAtEvent;
          const partnerPayout = Math.round(itemRevenue * (commissionPercent / 100));
          const faeShare = itemRevenue - partnerPayout;

          return (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-warm-white text-sm">{item.productName}</span>
                <span className="text-warm-white/40 text-xs ml-2">
                  (brought {item.quantityBrought} @ {formatPrice(item.priceAtEvent)})
                </span>
                {item.partnerCompanyName && (
                  <p className="text-copper text-xs mt-1">
                    {item.partnerCompanyName}: {formatPrice(partnerPayout)} · Fae&apos;s Filigree: {formatPrice(faeShare)}
                  </p>
                )}
              </div>
              <form
                action={async (formData) => {
                  formData.set("inventoryId", item.id);
                  await recordEventSale(eventId, formData);
                }}
                className="flex flex-wrap items-center justify-end gap-2"
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
                <select
                  name="paymentType"
                  defaultValue={item.paymentType ?? ""}
                  className="px-2 py-1 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
                >
                  <option value="">Payment</option>
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="px-2 py-1 bg-copper/80 hover:bg-copper text-white rounded text-xs transition-colors"
                >
                  Save
                </button>
              </form>
            </div>
          );
        })}
      </div>

      {totalSold > 0 && (
        <div className="mt-4 pt-3 border-t border-warm-white/10">
          <p className="text-warm-white/60 text-sm">
            Total sold: {totalSold} items · Revenue: {formatPrice(totalRevenue)}
          </p>
          {totalPartnerPayout > 0 && (
            <p className="text-warm-white/60 text-sm mt-1">
              Partner payout: {formatPrice(totalPartnerPayout)} · Fae&apos;s Filigree: {formatPrice(faesShare)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
