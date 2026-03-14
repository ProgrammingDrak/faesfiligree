"use client";

import { useState, useEffect } from "react";
import { createMaterial, updateMaterial, deleteMaterial } from "@/lib/actions/materials";

interface Material {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
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
        Define materials and their costs. These are used for itemized material cost tracking on products.
      </p>

      {/* Add new */}
      <form action={handleCreate} className="flex gap-2 mb-6">
        <input
          name="name"
          required
          placeholder="Material name"
          className="flex-1 px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-copper"
        />
        <input
          name="unit"
          placeholder="Unit (feet, grams...)"
          defaultValue="unit"
          className="w-32 px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-copper"
        />
        <input
          name="costPerUnit"
          type="number"
          step="0.01"
          min="0"
          placeholder="Cost per unit ($)"
          className="w-36 px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white text-sm focus:outline-none focus:ring-2 focus:ring-copper"
        />
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
                  className="flex gap-2 flex-1"
                >
                  <input
                    name="name"
                    defaultValue={mat.name}
                    className="flex-1 px-2 py-1 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
                  />
                  <input
                    name="unit"
                    defaultValue={mat.unit}
                    className="w-24 px-2 py-1 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
                  />
                  <input
                    name="costPerUnit"
                    type="number"
                    step="0.01"
                    defaultValue={(mat.costPerUnit / 100).toFixed(2)}
                    className="w-24 px-2 py-1 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
                  />
                  <button type="submit" className="text-copper text-sm">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-warm-white/50 text-sm">Cancel</button>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <span className="text-warm-white font-medium">{mat.name}</span>
                    <span className="text-warm-white/50 text-sm">${(mat.costPerUnit / 100).toFixed(2)} / {mat.unit}</span>
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
