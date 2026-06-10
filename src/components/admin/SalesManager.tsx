"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSale, updateSale } from "@/lib/actions/sales";
import { PAYMENT_METHODS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export interface SaleRow {
  id: string;
  dateLabel: string;
  productName: string;
  inventoryLabel: string | null;
  eventId: string | null;
  eventName: string | null;
  quantity: number;
  price: number;
  paymentType: string | null;
  processingFee: number;
}

export interface SaleEventOption {
  id: string;
  name: string;
  startDateLabel: string;
}

function paymentLabel(value: string | null) {
  if (!value) return "—";
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

export function SalesManager({
  sales,
  events,
}: {
  sales: SaleRow[];
  events: SaleEventOption[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<SaleRow | null>(null);
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [payment, setPayment] = useState<string>("");
  const [eventId, setEventId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const openEdit = (sale: SaleRow) => {
    setError(null);
    setQty(String(sale.quantity));
    setPrice((sale.price / 100).toFixed(2));
    setPayment(sale.paymentType ?? "");
    setEventId(sale.eventId ?? "");
    setEditing(sale);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const quantity = parseInt(qty, 10);
    const dollars = parseFloat(price);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }
    if (!Number.isFinite(dollars) || dollars < 0) {
      setError("Enter a valid price");
      return;
    }
    setBusy(true);
    const result = await updateSale(editing.id, {
      quantity,
      priceCents: Math.round(dollars * 100),
      paymentType: payment || null,
      eventId: eventId || null,
    });
    setBusy(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setEditing(null);
    router.refresh();
  };

  const remove = async (id: string) => {
    setPendingDelete(id);
    await deleteSale(id);
    setPendingDelete(null);
    router.refresh();
  };

  if (sales.length === 0) {
    return <p className="text-warm-white/50">No sales recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-warm-white/10 bg-warm-white/5">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-warm-white/10 text-warm-white/50">
            <th className="p-3 font-normal">Date</th>
            <th className="p-3 font-normal">Product</th>
            <th className="p-3 font-normal text-right">Qty</th>
            <th className="p-3 font-normal text-right">Unit</th>
            <th className="p-3 font-normal text-right">Total</th>
            <th className="p-3 font-normal">Payment</th>
            <th className="p-3 font-normal text-right">Fee</th>
            <th className="p-3 font-normal text-right">Net</th>
            <th className="p-3 font-normal text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => {
            const total = sale.price * sale.quantity;
            const net = total - sale.processingFee;
            return (
              <tr key={sale.id} className="border-b border-warm-white/5 text-warm-white/80">
                <td className="p-3 whitespace-nowrap text-warm-white/60">{sale.dateLabel}</td>
                <td className="p-3">
                  <span className="text-warm-white">{sale.productName}</span>
                  {sale.inventoryLabel && (
                    <span className="ml-1 text-xs text-warm-white/40">
                      {sale.inventoryLabel}
                    </span>
                  )}
                  {sale.eventName && (
                    <span className="ml-1 text-xs text-copper">· {sale.eventName}</span>
                  )}
                </td>
                <td className="p-3 text-right">{sale.quantity}</td>
                <td className="p-3 text-right">{formatPrice(sale.price)}</td>
                <td className="p-3 text-right">{formatPrice(total)}</td>
                <td className="p-3 whitespace-nowrap">{paymentLabel(sale.paymentType)}</td>
                <td className="p-3 text-right text-rose-gold/80">
                  {sale.processingFee > 0 ? `-${formatPrice(sale.processingFee)}` : "—"}
                </td>
                <td className="p-3 text-right text-warm-white">{formatPrice(net)}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(sale)}
                      className="rounded bg-warm-white/10 px-2.5 py-1 text-xs text-warm-white hover:bg-warm-white/15"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(sale.id)}
                      disabled={pendingDelete === sale.id}
                      className="rounded px-2.5 py-1 text-xs text-rose-gold/80 hover:text-rose-gold disabled:opacity-50"
                    >
                      {pendingDelete === sale.id ? "Undoing…" : "Undo"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4">
          <div className="w-full max-w-sm rounded-xl border border-warm-white/15 bg-charcoal p-5 shadow-xl">
            <h3 className="text-lg font-medium text-warm-white">Edit sale</h3>
            <p className="mt-1 text-sm text-warm-white/50">{editing.productName}</p>

            <label className="mt-4 mb-1 block text-sm text-warm-white/70">Quantity</label>
            <input
              type="number"
              min="1"
              step="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full rounded-lg border border-warm-white/20 bg-warm-white/10 px-3 py-2 text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />

            <label className="mt-3 mb-1 block text-sm text-warm-white/70">Sale price each ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-warm-white/20 bg-warm-white/10 px-3 py-2 text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />

            <label className="mt-3 mb-1 block text-sm text-warm-white/70">Payment type</label>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="w-full rounded-lg border border-warm-white/20 bg-warm-white/10 px-3 py-2 text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            >
              <option value="">Unspecified</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            <label className="mt-3 mb-1 block text-sm text-warm-white/70">Event</label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded-lg border border-warm-white/20 bg-warm-white/10 px-3 py-2 text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            >
              <option value="">No event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} ({event.startDateLabel})
                </option>
              ))}
            </select>

            {error && <p className="mt-2 text-sm text-rose-gold">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditing(null)}
                disabled={busy}
                className="rounded-lg px-4 py-2 text-sm text-warm-white/60 hover:text-warm-white"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={busy}
                className="rounded-lg bg-copper px-4 py-2 text-sm text-white hover:bg-copper-dark disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
