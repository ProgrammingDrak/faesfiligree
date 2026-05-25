"use client";

import { useState, useEffect } from "react";
import { createMaterial, updateMaterial, deleteMaterial } from "@/lib/actions/materials";

interface Material {
  id: string;
  name: string;
  unit: string;
  purchaseQuantity: number | null;
  purchaseCost: number | null;
  costPerUnit: number;
  notes: string | null;
}

function formatUnitCost(costPerUnit: number) {
  const dollars = costPerUnit / 100;
  const precision = dollars > 0 && dollars < 0.1 ? 4 : 2;
  return `$${dollars.toFixed(precision)}`;
}

function formatMoneyInput(cents: number | null) {
  return cents == null ? "" : (cents / 100).toFixed(2);
}

function MaterialCostFields({
  material,
  compact = false,
}: {
  material?: Partial<Material>;
  compact?: boolean;
}) {
  const [purchaseQuantity, setPurchaseQuantity] = useState(
    material?.purchaseQuantity?.toString() || ""
  );
  const [purchaseCost, setPurchaseCost] = useState(formatMoneyInput(material?.purchaseCost ?? null));
  const costPerUnit =
    (parseFloat(purchaseCost) * 100) / parseFloat(purchaseQuantity);
  const calculatedCost = Number.isFinite(costPerUnit) && costPerUnit > 0 ? costPerUnit : 0;
  const inputClass = compact
    ? "px-2 py-1 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
    : "px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-copper";

  return (
    <>
      <input
        name="purchaseQuantity"
        aria-label="Amount purchased"
        type="number"
        step="0.0001"
        min="0"
        value={purchaseQuantity}
        onChange={(event) => setPurchaseQuantity(event.target.value)}
        placeholder="Amount purchased"
        required
        className={inputClass}
      />
      <input
        name="unit"
        aria-label="Unit"
        placeholder="Unit"
        defaultValue={material?.unit || "unit"}
        className={inputClass}
      />
      <input
        name="purchaseCost"
        aria-label="Purchase price"
        type="number"
        step="0.01"
        min="0"
        value={purchaseCost}
        onChange={(event) => setPurchaseCost(event.target.value)}
        placeholder="Price paid ($)"
        required
        className={inputClass}
      />
      <div className={`${inputClass} text-warm-white/70`}>
        <span className="text-warm-white/40">Cost/unit: </span>
        {formatUnitCost(calculatedCost)}
      </div>
    </>
  );
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/materials")
      .then((r) => r.json())
      .then((data) => {
        setMaterials(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async (formData: FormData) => {
    await createMaterial(formData);
    window.location.reload();
  };

  const handleUpdate = async (id: string, formData: FormData) => {
    await updateMaterial(id, formData);
    setEditingId(null);
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this material?")) return;
    await deleteMaterial(id);
    window.location.reload();
  };

  return (
    <div>
      <h1 className="font-heading text-3xl text-warm-white mb-6">Materials</h1>
      <p className="text-warm-white/50 text-sm mb-4">
        Enter what you bought and what you paid. Unit cost is calculated for itemized product tracking.
      </p>

      {/* Add new */}
      <form action={handleCreate} className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.8fr_0.9fr_1fr_auto] gap-2 mb-6">
        <input name="name" required placeholder="Supply name" className="px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-copper" />
        <MaterialCostFields />
        <input name="notes" placeholder="Vendor / notes" className="px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-copper" />
        <button
          type="submit"
          className="px-4 py-2 bg-copper hover:bg-copper-dark text-white rounded-lg text-sm transition-colors"
        >
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-warm-white/50">Loading...</p>
      ) : materials.length === 0 ? (
        <p className="text-warm-white/50">No materials yet. Add your first material above.</p>
      ) : (
        <div className="space-y-2">
          {materials.map((mat) => (
            <div
              key={mat.id}
              className="flex items-center justify-between bg-warm-white/5 border border-warm-white/10 rounded-lg p-3"
            >
              {editingId === mat.id ? (
                <form
                  action={(formData) => handleUpdate(mat.id, formData)}
                  className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.8fr_0.9fr_1fr_auto_auto] gap-2 flex-1"
                >
                  <input
                    name="name"
                    defaultValue={mat.name}
                    className="px-2 py-1 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
                  />
                  <MaterialCostFields material={mat} compact />
                  <input name="notes" defaultValue={mat.notes || ""} className="px-2 py-1 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm" />
                  <button type="submit" className="text-copper text-sm">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-warm-white/50 text-sm">Cancel</button>
                </form>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-2 flex-1">
                    <div>
                      <span className="text-warm-white font-medium">{mat.name}</span>
                      {mat.notes && <p className="text-warm-white/40 text-xs">{mat.notes}</p>}
                    </div>
                    <span className="text-warm-white/60 text-sm">
                      {mat.purchaseQuantity && mat.purchaseCost
                        ? `${mat.purchaseQuantity} ${mat.unit} for $${(mat.purchaseCost / 100).toFixed(2)} · `
                        : ""}
                      {formatUnitCost(mat.costPerUnit)} / {mat.unit}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(mat.id)} className="text-copper text-sm">Edit</button>
                    <button onClick={() => handleDelete(mat.id)} className="text-rose-gold/70 text-sm">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
