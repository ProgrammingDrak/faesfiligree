"use client";

import { useState } from "react";
import { createProduct, updateProduct } from "@/lib/actions/products";

interface MaterialOption {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
}

interface CategoryOption {
  id: string;
  title: string;
}

interface ProductMaterialRow {
  materialId: string;
  quantity: number;
}

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  categoryId: string | null;
  materials: string[];
  dimensions: string | null;
  inStock: boolean;
  featured: boolean;
  laborHours: number;
  materialCostLump: number | null;
  productMaterials: { materialId: string; quantity: number }[];
}

interface ProductFormProps {
  product?: ProductData;
  categories: CategoryOption[];
  materials: MaterialOption[];
}

export function ProductForm({ product, categories, materials }: ProductFormProps) {
  const [images] = useState<string[]>(product?.images || []);
  const [costMode, setCostMode] = useState<"lump" | "itemized">(
    product?.materialCostLump != null ? "lump" : "itemized"
  );
  const [productMaterials, setProductMaterials] = useState<ProductMaterialRow[]>(
    product?.productMaterials || []
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    formData.set("images", JSON.stringify(images));
    formData.set("costMode", costMode);
    formData.set("productMaterials", JSON.stringify(productMaterials));

    const result = product
      ? await updateProduct(product.id, formData)
      : await createProduct(formData);

    if (result?.error) setError(result.error);
  };

  const addMaterialRow = () => {
    if (materials.length === 0) return;
    setProductMaterials([...productMaterials, { materialId: materials[0].id, quantity: 1 }]);
  };

  const removeMaterialRow = (index: number) => {
    setProductMaterials(productMaterials.filter((_, i) => i !== index));
  };

  const updateMaterialRow = (index: number, field: "materialId" | "quantity", value: string | number) => {
    const updated = [...productMaterials];
    if (field === "quantity") {
      updated[index] = { ...updated[index], quantity: Number(value) };
    } else {
      updated[index] = { ...updated[index], materialId: value as string };
    }
    setProductMaterials(updated);
  };

  const itemizedTotal = productMaterials.reduce((sum, pm) => {
    const mat = materials.find((m) => m.id === pm.materialId);
    return sum + (mat ? mat.costPerUnit * pm.quantity : 0);
  }, 0);

  return (
    <form action={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-rose-gold/20 border border-rose-gold/30 rounded-lg p-3 text-rose-gold text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-warm-white/70 mb-1">Name</label>
          <input
            name="name"
            defaultValue={product?.name}
            required
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>

        <div>
          <label className="block text-sm text-warm-white/70 mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={product?.description || ""}
            rows={3}
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Price ($)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product ? (product.price / 100).toFixed(2) : ""}
              required
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Category</label>
            <select
              name="categoryId"
              defaultValue={product?.categoryId || ""}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Materials (comma-separated)</label>
            <input
              name="materials"
              defaultValue={product?.materials.join(", ")}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
              placeholder="Copper, Crystal"
            />
          </div>
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Dimensions</label>
            <input
              name="dimensions"
              defaultValue={product?.dimensions || ""}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-warm-white/70">
            <input
              name="inStock"
              type="checkbox"
              defaultChecked={product?.inStock ?? true}
              className="rounded border-warm-white/20"
            />
            In Stock
          </label>
          <label className="flex items-center gap-2 text-sm text-warm-white/70">
            <input
              name="featured"
              type="checkbox"
              defaultChecked={product?.featured}
              className="rounded border-warm-white/20"
            />
            Featured
          </label>
        </div>
      </div>

      {/* Material Cost Section */}
      <div className="border border-warm-white/10 rounded-lg p-4">
        <h3 className="text-warm-white font-medium mb-3">Material Cost</h3>
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => setCostMode("lump")}
            className={`px-3 py-1.5 rounded text-sm ${
              costMode === "lump"
                ? "bg-copper text-white"
                : "bg-warm-white/10 text-warm-white/60"
            }`}
          >
            Lump Sum
          </button>
          <button
            type="button"
            onClick={() => setCostMode("itemized")}
            className={`px-3 py-1.5 rounded text-sm ${
              costMode === "itemized"
                ? "bg-copper text-white"
                : "bg-warm-white/10 text-warm-white/60"
            }`}
          >
            Itemized
          </button>
        </div>

        {costMode === "lump" ? (
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Total Material Cost ($)</label>
            <input
              name="materialCostLump"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.materialCostLump != null ? (product.materialCostLump / 100).toFixed(2) : ""}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
        ) : (
          <div className="space-y-2">
            {productMaterials.map((pm, i) => {
              const mat = materials.find((m) => m.id === pm.materialId);
              const lineCost = mat ? (mat.costPerUnit * pm.quantity) / 100 : 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={pm.materialId}
                    onChange={(e) => updateMaterialRow(i, "materialId", e.target.value)}
                    className="flex-1 px-2 py-1.5 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
                  >
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} (${(m.costPerUnit / 100).toFixed(2)}/{m.unit})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={pm.quantity}
                    onChange={(e) => updateMaterialRow(i, "quantity", e.target.value)}
                    className="w-20 px-2 py-1.5 bg-warm-white/10 border border-warm-white/20 rounded text-warm-white text-sm"
                    placeholder="Qty"
                  />
                  <span className="text-warm-white/50 text-sm w-16">${lineCost.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => removeMaterialRow(i)}
                    className="text-rose-gold/70 hover:text-rose-gold text-sm"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={addMaterialRow}
              className="text-copper text-sm hover:text-copper-light"
            >
              + Add Material
            </button>
            {productMaterials.length > 0 && (
              <p className="text-warm-white/60 text-sm mt-2">
                Total: ${(itemizedTotal / 100).toFixed(2)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Labor Hours */}
      <div>
        <label className="block text-sm text-warm-white/70 mb-1">Labor Hours</label>
        <input
          name="laborHours"
          type="number"
          step="0.25"
          min="0"
          defaultValue={product?.laborHours || ""}
          className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
        />
      </div>

      <button
        type="submit"
        className="px-6 py-2.5 bg-copper hover:bg-copper-dark text-white rounded-lg font-medium transition-colors"
      >
        {product ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
}
