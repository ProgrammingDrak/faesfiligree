"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteProduct,
  recordBulkMade,
  recordBulkSold,
  recordSold,
} from "@/lib/actions/products";
import { formatPrice } from "@/lib/utils";
import { PAYMENT_METHODS } from "@/lib/constants";

export interface InventoryProduct {
  id: string;
  name: string;
  inventoryLabel: string | null;
  categoryTitle: string | null;
  labels: string[];
  image: string | null;
  quantityMade: number;
  quantityAvailable: number;
  queuedCount: number;
  soldCount: number;
  soldRevenue: number;
  price: number;
  hagglePrice: number | null;
  totalCost: number;
  bulkLabel: string | null;
  isPartnerProduct: boolean;
  partnerCompanyName: string | null;
  partnerCommissionPercent: number | null;
}

type DialogMode = "made" | "sold";

interface DialogState {
  mode: DialogMode;
  ids: string[];
  label: string;
  bulk: boolean;
  listPrice?: number;
  hagglePrice?: number | null;
}

function formatPriceCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function InventoryManager({ products }: { products: InventoryProduct[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [qty, setQty] = useState("1");
  const [salePrice, setSalePrice] = useState("");
  const [discountPct, setDiscountPct] = useState("");
  const [payment, setPayment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allSelected = products.length > 0 && selected.size === products.length;

  const toggle = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  };

  const openMade = (ids: string[], label: string, bulk: boolean) => {
    setQty("1");
    setError(null);
    setDialog({ mode: "made", ids, label, bulk });
  };

  const openSoldSingle = (product: InventoryProduct) => {
    setQty("1");
    setError(null);
    setPayment("");
    setSalePrice((product.price / 100).toFixed(2));
    setDialog({
      mode: "sold",
      ids: [product.id],
      label: product.name,
      bulk: false,
      listPrice: product.price,
      hagglePrice: product.hagglePrice,
    });
  };

  const openSoldBulk = (ids: string[], label: string) => {
    setQty("1");
    setError(null);
    setPayment("");
    setDiscountPct("");
    setDialog({ mode: "sold", ids, label, bulk: true });
  };

  const confirm = async () => {
    if (!dialog) return;
    const quantity = parseInt(qty, 10);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Enter a quantity greater than 0");
      return;
    }

    setBusy(true);
    let result: { error?: string; success?: boolean } | undefined;
    if (dialog.mode === "made") {
      result = await recordBulkMade(dialog.ids, quantity);
    } else if (dialog.bulk) {
      const discount = parseFloat(discountPct) || 0;
      if (discount < 0 || discount >= 100) {
        setBusy(false);
        setError("Discount must be between 0% and 100%");
        return;
      }
      result = await recordBulkSold(dialog.ids, quantity, discount, payment || null);
    } else {
      const dollars = parseFloat(salePrice);
      if (!Number.isFinite(dollars) || dollars < 0) {
        setBusy(false);
        setError("Enter a valid sale price");
        return;
      }
      result = await recordSold(
        dialog.ids[0],
        quantity,
        Math.round(dollars * 100),
        payment || null
      );
    }
    setBusy(false);

    if (result?.error) {
      setError(result.error);
      return;
    }
    setDialog(null);
    setSelected(new Set());
    router.refresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await deleteProduct(id);
    router.refresh();
  };

  if (products.length === 0) {
    return <p className="text-warm-white/50">No inventory items yet.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Selection / bulk action bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-warm-white/10 bg-warm-white/5 px-4 py-2.5">
        <label className="flex items-center gap-2 text-sm text-warm-white/70">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="rounded border-warm-white/20"
          />
          Select all
        </label>
        <span className="text-sm text-warm-white/45">
          {selected.size > 0 ? `${selected.size} selected` : `${products.length} items`}
        </span>
        {selected.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() =>
                openMade([...selected], `${selected.size} selected`, true)
              }
              className="rounded bg-copper px-3 py-1.5 text-sm text-white hover:bg-copper-dark"
            >
              + Made
            </button>
            <button
              onClick={() =>
                openSoldBulk([...selected], `${selected.size} selected`)
              }
              className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
            >
              Sold
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm text-warm-white/50 hover:text-warm-white"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((product) => {
          const isSelected = selected.has(product.id);
          return (
            <article
              key={product.id}
              className={`overflow-hidden rounded-lg border bg-warm-white/5 transition-colors ${
                isSelected ? "border-copper" : "border-warm-white/10"
              }`}
            >
              <div className="relative aspect-[4/3] bg-charcoal/70">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-warm-white/25">
                    No image
                  </div>
                )}
                <label className="absolute left-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded bg-charcoal/80">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(product.id)}
                    className="rounded border-warm-white/30"
                  />
                </label>
              </div>
              <div className="space-y-4 p-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium text-warm-white">{product.name}</h3>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        product.quantityAvailable > 0
                          ? "bg-green-500/20 text-green-400"
                          : "bg-rose-gold/20 text-rose-gold"
                      }`}
                    >
                      {product.quantityAvailable > 0 ? "Available" : "Out"}
                    </span>
                  </div>
                  <p className="text-sm text-warm-white/45">
                    {product.inventoryLabel || "Inventory item"}
                  </p>
                  {product.isPartnerProduct && product.partnerCompanyName && (
                    <p className="mt-1 text-xs text-copper">
                      Partner: {product.partnerCompanyName} ·{" "}
                      {product.partnerCommissionPercent ?? 0}%
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-warm-white/35">Made</p>
                    <p className="text-warm-white">{product.quantityMade}</p>
                  </div>
                  <div>
                    <p className="text-warm-white/35">Available</p>
                    <p className="text-warm-white">{product.quantityAvailable}</p>
                  </div>
                  <div>
                    <p className="text-warm-white/35">Queued</p>
                    <p className="text-warm-white">{product.queuedCount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded bg-warm-white/5 p-2">
                    <p className="text-warm-white/35">Price</p>
                    <p className="text-warm-white">{formatPrice(product.price)}</p>
                    {product.bulkLabel && (
                      <p className="text-xs text-copper">{product.bulkLabel}</p>
                    )}
                  </div>
                  <div className="rounded bg-warm-white/5 p-2">
                    <p className="text-warm-white/35">Cost</p>
                    <p className="text-warm-white">{formatPrice(product.totalCost)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded bg-warm-white/5 p-2">
                    <p className="text-warm-white/35">Sold</p>
                    <p className="text-warm-white">{product.soldCount}</p>
                  </div>
                  <div className="rounded bg-warm-white/5 p-2">
                    <p className="text-warm-white/35">Revenue</p>
                    <p className="text-warm-white">{formatPrice(product.soldRevenue)}</p>
                  </div>
                </div>

                {(product.categoryTitle || product.labels.length > 0) && (
                  <div className="flex flex-wrap gap-1">
                    {product.categoryTitle && (
                      <span className="rounded bg-copper/20 px-1.5 py-0.5 text-[11px] text-copper">
                        {product.categoryTitle}
                      </span>
                    )}
                    {product.labels.map((label) => (
                      <span
                        key={label}
                        className="rounded bg-warm-white/10 px-1.5 py-0.5 text-[11px] text-warm-white/50"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => openMade([product.id], product.name, false)}
                    className="rounded bg-copper px-3 py-1.5 text-sm text-white hover:bg-copper-dark"
                  >
                    + Made
                  </button>
                  <button
                    onClick={() => openSoldSingle(product)}
                    className="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
                  >
                    Sold
                  </button>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="rounded bg-warm-white/10 px-3 py-1.5 text-sm text-warm-white hover:bg-warm-white/15"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="text-sm text-rose-gold/70 hover:text-rose-gold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Quantity dialog */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/70 p-4">
          <div className="w-full max-w-sm rounded-xl border border-warm-white/15 bg-charcoal p-5 shadow-xl">
            <h3 className="text-lg font-medium text-warm-white">
              {dialog.mode === "made" ? "Add made pieces" : "Record sale"}
            </h3>
            <p className="mt-1 text-sm text-warm-white/50">
              {dialog.mode === "made"
                ? `How many were made for ${dialog.label}?`
                : `Recording a sale for ${dialog.label}.`}
            </p>

            <label className="mt-4 mb-1 block text-sm text-warm-white/70">Quantity</label>
            <input
              type="number"
              min="1"
              step="1"
              value={qty}
              autoFocus
              onChange={(e) => setQty(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirm();
              }}
              className="w-full rounded-lg border border-warm-white/20 bg-warm-white/10 px-3 py-2 text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />

            {dialog.mode === "sold" && !dialog.bulk && (
              <div className="mt-3">
                <label className="mb-1 block text-sm text-warm-white/70">Sale price each ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirm();
                  }}
                  className="w-full rounded-lg border border-warm-white/20 bg-warm-white/10 px-3 py-2 text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
                />
                <p className="mt-1 text-xs text-warm-white/40">
                  Defaults to list
                  {dialog.listPrice != null ? ` (${formatPriceCents(dialog.listPrice)})` : ""}.
                  {dialog.hagglePrice != null &&
                    ` Haggle floor: ${formatPriceCents(dialog.hagglePrice)}.`}
                </p>
                {dialog.hagglePrice != null &&
                  parseFloat(salePrice) * 100 < dialog.hagglePrice && (
                    <p className="mt-1 text-xs text-amber-400">
                      Below your haggle floor of {formatPriceCents(dialog.hagglePrice)}.
                    </p>
                  )}
              </div>
            )}

            {dialog.mode === "sold" && dialog.bulk && (
              <div className="mt-3">
                <label className="mb-1 block text-sm text-warm-white/70">
                  Discount % off list (optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  step="0.01"
                  value={discountPct}
                  placeholder="0"
                  onChange={(e) => setDiscountPct(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirm();
                  }}
                  className="w-full rounded-lg border border-warm-white/20 bg-warm-white/10 px-3 py-2 text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
                />
                <p className="mt-1 text-xs text-warm-white/40">
                  Applied to each item&apos;s own list price. Leave blank to sell at list.
                </p>
              </div>
            )}

            {dialog.mode === "sold" && (
              <div className="mt-3">
                <label className="mb-1 block text-sm text-warm-white/70">Payment type</label>
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
                {(() => {
                  if (!dialog.bulk) {
                    const quantity = parseInt(qty, 10) || 0;
                    const cents = Math.round((parseFloat(salePrice) || 0) * 100) * quantity;
                    const method = PAYMENT_METHODS.find((m) => m.value === payment);
                    if (method && cents > 0 && (method.percentFee > 0 || method.flatFeeCents > 0)) {
                      const fee = Math.round((cents * method.percentFee) / 100) + method.flatFeeCents;
                      return (
                        <p className="mt-1 text-xs text-warm-white/40">
                          Fee {formatPriceCents(fee)} · net {formatPriceCents(cents - fee)}
                        </p>
                      );
                    }
                  }
                  return null;
                })()}
              </div>
            )}

            {error && <p className="mt-2 text-sm text-rose-gold">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDialog(null)}
                disabled={busy}
                className="rounded-lg px-4 py-2 text-sm text-warm-white/60 hover:text-warm-white"
              >
                Cancel
              </button>
              <button
                onClick={confirm}
                disabled={busy}
                className={`rounded-lg px-4 py-2 text-sm text-white disabled:opacity-60 ${
                  dialog.mode === "made"
                    ? "bg-copper hover:bg-copper-dark"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {busy ? "Saving…" : dialog.mode === "made" ? "Add to inventory" : "Record sale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
