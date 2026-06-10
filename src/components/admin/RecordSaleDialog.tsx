"use client";

import { useState } from "react";
import { recordSold } from "@/lib/actions/products";
import { PAYMENT_METHODS } from "@/lib/constants";

export interface SaleTarget {
  id: string;
  name: string;
  listPrice: number;
  hagglePrice: number | null;
}

function formatPriceCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Modal to record a sale of a single item: quantity, sale price (defaults to
 * list), and payment type with a live fee preview. Shared by the per-item
 * Sold button and the category Sold picker.
 */
export function RecordSaleDialog({
  target,
  onClose,
  onRecorded,
}: {
  target: SaleTarget;
  onClose: () => void;
  onRecorded: () => void;
}) {
  const [qty, setQty] = useState("1");
  const [salePrice, setSalePrice] = useState((target.listPrice / 100).toFixed(2));
  const [payment, setPayment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    const quantity = parseInt(qty, 10);
    const dollars = parseFloat(salePrice);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Enter a quantity greater than 0");
      return;
    }
    if (!Number.isFinite(dollars) || dollars < 0) {
      setError("Enter a valid sale price");
      return;
    }
    setBusy(true);
    const result = await recordSold(
      target.id,
      quantity,
      Math.round(dollars * 100),
      payment || null
    );
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    onRecorded();
  };

  const quantity = parseInt(qty, 10) || 0;
  const cents = Math.round((parseFloat(salePrice) || 0) * 100) * quantity;
  const method = PAYMENT_METHODS.find((m) => m.value === payment);
  const fee =
    method && cents > 0 ? Math.round((cents * method.percentFee) / 100) + method.flatFeeCents : 0;
  const belowFloor =
    target.hagglePrice != null && parseFloat(salePrice) * 100 < target.hagglePrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4">
      <div className="w-full max-w-sm rounded-xl border border-warm-white/15 bg-charcoal p-5 shadow-xl">
        <h3 className="text-lg font-medium text-warm-white">Record sale</h3>
        <p className="mt-1 text-sm text-warm-white/50">{target.name}</p>

        <label className="mt-4 mb-1 block text-sm text-warm-white/70">Quantity</label>
        <input
          type="number"
          min="1"
          step="1"
          value={qty}
          autoFocus
          onChange={(e) => setQty(e.target.value)}
          className="w-full rounded-lg border border-warm-white/20 bg-warm-white/10 px-3 py-2 text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
        />

        <label className="mt-3 mb-1 block text-sm text-warm-white/70">Sale price each ($)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
          className="w-full rounded-lg border border-warm-white/20 bg-warm-white/10 px-3 py-2 text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
        />
        <p className="mt-1 text-xs text-warm-white/40">
          Defaults to list ({formatPriceCents(target.listPrice)}).
          {target.hagglePrice != null && ` Haggle floor: ${formatPriceCents(target.hagglePrice)}.`}
        </p>
        {belowFloor && (
          <p className="mt-1 text-xs text-amber-400">
            Below your haggle floor of {formatPriceCents(target.hagglePrice!)}.
          </p>
        )}

        <label className="mt-3 mb-1 block text-sm text-warm-white/70">Payment type</label>
        <select
          value={payment}
          onChange={(e) => setPayment(e.target.value)}
          className="w-full rounded-lg border border-warm-white/20 bg-warm-white/10 px-3 py-2 text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
        >
          <option value="">Unspecified</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
              {m.percentFee > 0 || m.flatFeeCents > 0
                ? ` (${m.percentFee}%${m.flatFeeCents ? ` + ${formatPriceCents(m.flatFeeCents)}` : ""})`
                : ""}
            </option>
          ))}
        </select>
        {fee > 0 && (
          <p className="mt-1 text-xs text-warm-white/40">
            Fee {formatPriceCents(fee)} · net {formatPriceCents(cents - fee)}
          </p>
        )}

        {error && <p className="mt-2 text-sm text-rose-gold">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="rounded-lg px-4 py-2 text-sm text-warm-white/60 hover:text-warm-white"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={busy}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-60"
          >
            {busy ? "Saving…" : "Record sale"}
          </button>
        </div>
      </div>
    </div>
  );
}
