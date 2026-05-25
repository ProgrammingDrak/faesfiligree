"use client";

import Link from "next/link";
import { useState } from "react";
import { createProduct, updateProduct } from "@/lib/actions/products";

interface MaterialOption {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
}

interface ProductMaterialRow {
  materialId: string;
  quantity: number;
}

type LaborUnit = "minutes" | "hours" | "days";
type BulkPricingMode = "percent" | "fixed";

interface ProductData {
  id: string;
  name: string;
  inventoryLabel: string | null;
  labels: string[];
  description: string | null;
  price: number;
  images: string[];
  materials: string[];
  dimensions: string | null;
  quantityMade: number;
  quantityAvailable: number;
  inStock: boolean;
  featured: boolean;
  isPartnerProduct: boolean;
  partnerCompanyName: string | null;
  partnerCommissionPercent: number | null;
  partnerPricingNotes: string | null;
  bulkPricingEnabled: boolean;
  bulkMinQuantity: number | null;
  bulkPricingMode: string | null;
  bulkDiscountPercent: number | null;
  bulkUnitPrice: number | null;
  bulkPricingNotes: string | null;
  laborHours: number;
  materialCostLump: number | null;
  productMaterials: { materialId: string; quantity: number }[];
}

interface ProductFormProps {
  product?: ProductData;
  materials: MaterialOption[];
  laborRate: number;
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatUnitCost(cents: number) {
  const dollars = cents / 100;
  const precision = dollars > 0 && dollars < 0.1 ? 4 : 2;
  return `$${dollars.toFixed(precision)}`;
}

function formatDurationAmount(value: number) {
  return Number.isInteger(value) ? value.toString() : parseFloat(value.toFixed(2)).toString();
}

function getInitialLaborDuration(hours?: number): { amount: string; unit: LaborUnit } {
  if (!hours) return { amount: "", unit: "hours" };
  if (hours < 1) return { amount: formatDurationAmount(hours * 60), unit: "minutes" };
  if (hours >= 24 && hours % 24 === 0) {
    return { amount: formatDurationAmount(hours / 24), unit: "days" };
  }
  return { amount: formatDurationAmount(hours), unit: "hours" };
}

function getLaborHours(amount: string, unit: LaborUnit) {
  const value = parseFloat(amount) || 0;
  if (unit === "minutes") return value / 60;
  if (unit === "days") return value * 24;
  return value;
}

function parseIntegerInput(value: string, fallback: number) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function ProductForm({ product, materials, laborRate }: ProductFormProps) {
  const [images] = useState<string[]>(product?.images || []);
  const hasMaterialOptions = materials.length > 0;
  const initialLaborDuration = getInitialLaborDuration(product?.laborHours);
  const [costMode, setCostMode] = useState<"lump" | "itemized">(
    product?.materialCostLump != null ? "lump" : "itemized"
  );
  const [productMaterials, setProductMaterials] = useState<ProductMaterialRow[]>(
    product?.productMaterials || []
  );
  const [price, setPrice] = useState(product ? (product.price / 100).toFixed(2) : "");
  const [isPartnerProduct, setIsPartnerProduct] = useState(product?.isPartnerProduct ?? false);
  const [bulkPricingEnabled, setBulkPricingEnabled] = useState(product?.bulkPricingEnabled ?? false);
  const [bulkPricingMode, setBulkPricingMode] = useState<BulkPricingMode>(
    product?.bulkPricingMode === "fixed" ? "fixed" : "percent"
  );
  const [bulkMinQuantity, setBulkMinQuantity] = useState(product?.bulkMinQuantity?.toString() || "2");
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState(product?.bulkDiscountPercent?.toString() || "");
  const [bulkUnitPrice, setBulkUnitPrice] = useState(
    product?.bulkUnitPrice != null ? (product.bulkUnitPrice / 100).toFixed(2) : ""
  );
  const [laborAmount, setLaborAmount] = useState(initialLaborDuration.amount);
  const [laborUnit, setLaborUnit] = useState<LaborUnit>(initialLaborDuration.unit);
  const [lumpCost, setLumpCost] = useState(
    product?.materialCostLump != null ? (product.materialCostLump / 100).toFixed(2) : ""
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    formData.set("images", JSON.stringify(images));
    formData.set("costMode", costMode);
    formData.set("productMaterials", JSON.stringify(productMaterials));
    formData.set("laborHours", getLaborHours(laborAmount, laborUnit).toString());

    const result = product
      ? await updateProduct(product.id, formData)
      : await createProduct(formData);

    if (result?.error) setError(result.error);
  };

  const addMaterialRow = () => {
    if (!hasMaterialOptions) {
      setError("Add at least one material in the Materials section before itemizing product costs.");
      return;
    }
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
  const materialTotal = costMode === "lump"
    ? Math.round((parseFloat(lumpCost) || 0) * 100)
    : itemizedTotal;
  const laborHours = getLaborHours(laborAmount, laborUnit);
  const laborTotal = Math.round(laborHours * laborRate);
  const totalCost = materialTotal + laborTotal;
  const priceCents = Math.round((parseFloat(price) || 0) * 100);
  const profit = priceCents - totalCost;
  const margin = priceCents > 0 ? Math.round((profit / priceCents) * 100) : 0;
  const bulkMinQuantityNumber = Math.max(2, parseIntegerInput(bulkMinQuantity, 2));
  const bulkDiscountPercentNumber = parseFloat(bulkDiscountPercent) || 0;
  const fixedBulkUnitPrice = Math.round((parseFloat(bulkUnitPrice) || 0) * 100);
  const percentBulkUnitPrice = Math.round(priceCents * (1 - bulkDiscountPercentNumber / 100));
  const calculatedBulkUnitPrice = bulkPricingMode === "fixed" ? fixedBulkUnitPrice : percentBulkUnitPrice;
  const validBulkUnitPrice = bulkPricingEnabled && calculatedBulkUnitPrice > 0 ? calculatedBulkUnitPrice : 0;
  const bulkSavingsPerUnit = Math.max(0, priceCents - validBulkUnitPrice);
  const bulkTotalSavings = bulkSavingsPerUnit * bulkMinQuantityNumber;
  const bulkTotalRevenue = validBulkUnitPrice * bulkMinQuantityNumber;
  const bulkProfitPerUnit = validBulkUnitPrice - totalCost;
  const bulkMargin = validBulkUnitPrice > 0 ? Math.round((bulkProfitPerUnit / validBulkUnitPrice) * 100) : 0;

  return (
    <form action={handleSubmit} className="space-y-6 max-w-4xl">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Inventory Label / SKU</label>
            <input
              name="inventoryLabel"
              defaultValue={product?.inventoryLabel || ""}
              placeholder="FF-NECKLACE-001"
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Labels / Tags</label>
            <input
              name="labels"
              defaultValue={product?.labels.join(", ")}
              placeholder="ready-to-ship, wire wrap, pendant"
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
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

        <div>
          <label className="block text-sm text-warm-white/70 mb-1">Price ($)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>

        <div className="border border-warm-white/10 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-warm-white font-medium">Bulk Pricing</h3>
              <p className="text-warm-white/45 text-sm">
                Offer a lower unit price when someone buys a bundle quantity or more.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-warm-white/70">
              <input
                name="bulkPricingEnabled"
                type="checkbox"
                checked={bulkPricingEnabled}
                onChange={(event) => setBulkPricingEnabled(event.target.checked)}
                className="rounded border-warm-white/20"
              />
              Enable
            </label>
          </div>

          {bulkPricingEnabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)] gap-4">
                <div>
                  <label className="block text-sm text-warm-white/70 mb-1">Buy at least</label>
                  <input
                    name="bulkMinQuantity"
                    type="number"
                    min="2"
                    step="1"
                    value={bulkMinQuantity}
                    onChange={(event) => setBulkMinQuantity(event.target.value)}
                    className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
                  />
                </div>
                <div>
                  <label className="block text-sm text-warm-white/70 mb-1">Bulk price method</label>
                  <select
                    name="bulkPricingMode"
                    value={bulkPricingMode}
                    onChange={(event) => setBulkPricingMode(event.target.value as BulkPricingMode)}
                    className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
                  >
                    <option value="percent">Percent discount</option>
                    <option value="fixed">Set bulk unit price</option>
                  </select>
                </div>
                {bulkPricingMode === "percent" ? (
                  <div>
                    <label className="block text-sm text-warm-white/70 mb-1">Discount %</label>
                    <input
                      name="bulkDiscountPercent"
                      type="number"
                      min="0"
                      max="99"
                      step="0.01"
                      value={bulkDiscountPercent}
                      onChange={(event) => setBulkDiscountPercent(event.target.value)}
                      placeholder="10"
                      className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm text-warm-white/70 mb-1">Bulk unit price ($)</label>
                    <input
                      name="bulkUnitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={bulkUnitPrice}
                      onChange={(event) => setBulkUnitPrice(event.target.value)}
                      placeholder="24.00"
                      className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
                    />
                  </div>
                )}
              </div>
              <textarea
                name="bulkPricingNotes"
                defaultValue={product?.bulkPricingNotes || ""}
                rows={2}
                placeholder="Optional note: bundle pricing applies online, at events, or only for matching items..."
                className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-warm-white/5 rounded-lg p-3">
                  <p className="text-warm-white/40">Bulk unit price</p>
                  <p className="text-warm-white font-medium">{formatMoney(validBulkUnitPrice)}</p>
                </div>
                <div className="bg-warm-white/5 rounded-lg p-3">
                  <p className="text-warm-white/40">Savings</p>
                  <p className="text-green-400 font-medium">
                    {formatMoney(bulkSavingsPerUnit)} each
                  </p>
                </div>
                <div className="bg-warm-white/5 rounded-lg p-3">
                  <p className="text-warm-white/40">Bundle total</p>
                  <p className="text-warm-white font-medium">{formatMoney(bulkTotalRevenue)}</p>
                  <p className="text-warm-white/35 text-xs">
                    Saves {formatMoney(bulkTotalSavings)} at {bulkMinQuantityNumber}+
                  </p>
                </div>
                <div className="bg-warm-white/5 rounded-lg p-3">
                  <p className="text-warm-white/40">Bulk profit / margin</p>
                  <p className={bulkProfitPerUnit >= 0 ? "text-green-400 font-medium" : "text-rose-gold font-medium"}>
                    {formatMoney(bulkProfitPerUnit)} / {bulkMargin}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Quantity Made</label>
            <input
              name="quantityMade"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.quantityMade ?? 1}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Quantity Available</label>
            <input
              name="quantityAvailable"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.quantityAvailable ?? 1}
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
          <label className="flex items-center gap-2 text-sm text-warm-white/70">
            <input
              name="isPartnerProduct"
              type="checkbox"
              checked={isPartnerProduct}
              onChange={(event) => setIsPartnerProduct(event.target.checked)}
              className="rounded border-warm-white/20"
            />
            Partner Product
          </label>
        </div>

        {isPartnerProduct && (
          <div className="border border-warm-white/10 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-warm-white font-medium">Standard Partner Terms</h3>
              <span className="text-xs text-warm-white/40">
                Copied to events, editable per event
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_12rem] gap-4">
              <div>
                <label className="block text-sm text-warm-white/70 mb-1">Partner Company</label>
                <input
                  name="partnerCompanyName"
                  defaultValue={product?.partnerCompanyName || ""}
                  placeholder="Partner business name"
                  required={isPartnerProduct}
                  className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
                />
              </div>
              <div>
                <label className="block text-sm text-warm-white/70 mb-1">Commission %</label>
                <input
                  name="partnerCommissionPercent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  defaultValue={product?.partnerCommissionPercent ?? ""}
                  placeholder="40"
                  className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-warm-white/70 mb-1">Pricing Notes</label>
              <textarea
                name="partnerPricingNotes"
                defaultValue={product?.partnerPricingNotes || ""}
                rows={2}
                placeholder="Wholesale price, special event split, minimum advertised price..."
                className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] gap-4 items-start">
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
                value={lumpCost}
                onChange={(e) => setLumpCost(e.target.value)}
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
                        <option key={m.id} value={m.id}>{m.name} ({formatUnitCost(m.costPerUnit)}/{m.unit})</option>
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
              {hasMaterialOptions ? (
                <button
                  type="button"
                  onClick={addMaterialRow}
                  className="text-copper text-sm hover:text-copper-light"
                >
                  + Add Material
                </button>
              ) : (
                <div className="rounded-lg border border-copper/20 bg-copper/10 p-3 text-sm">
                  <p className="text-warm-white/70">
                    No saved materials are available yet.
                  </p>
                  <Link
                    href="/admin/materials"
                    className="mt-2 inline-block text-copper hover:text-copper-light"
                  >
                    Add materials first
                  </Link>
                </div>
              )}
              {productMaterials.length > 0 && (
                <p className="text-warm-white/60 text-sm mt-2">
                  Total: ${(itemizedTotal / 100).toFixed(2)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Build Time */}
        <div className="border border-warm-white/10 rounded-lg p-4">
          <h3 className="text-warm-white font-medium mb-3">Estimated Build Time</h3>
          <div className="grid grid-cols-[minmax(0,1fr)_8rem] gap-2">
            <input
              name="laborDurationAmount"
              type="number"
              step={laborUnit === "minutes" ? "1" : "0.25"}
              min="0"
              value={laborAmount}
              onChange={(e) => setLaborAmount(e.target.value)}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
            <select
              name="laborDurationUnit"
              value={laborUnit}
              onChange={(e) => setLaborUnit(e.target.value as LaborUnit)}
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            >
              <option value="minutes">Minute</option>
              <option value="hours">Hour</option>
              <option value="days">Day</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border border-warm-white/10 rounded-lg p-4">
        <h3 className="text-warm-white font-medium mb-3">Pricing Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="bg-warm-white/5 rounded-lg p-3">
            <p className="text-warm-white/40">Supply cost</p>
            <p className="text-warm-white font-medium">{formatMoney(materialTotal)}</p>
          </div>
          <div className="bg-warm-white/5 rounded-lg p-3">
            <p className="text-warm-white/40">Labor estimate</p>
            <p className="text-warm-white font-medium">{formatMoney(laborTotal)}</p>
          </div>
          <div className="bg-warm-white/5 rounded-lg p-3">
            <p className="text-warm-white/40">Total cost</p>
            <p className="text-warm-white font-medium">{formatMoney(totalCost)}</p>
          </div>
          <div className="bg-warm-white/5 rounded-lg p-3">
            <p className="text-warm-white/40">Profit / margin</p>
            <p className={profit >= 0 ? "text-green-400 font-medium" : "text-rose-gold font-medium"}>
              {formatMoney(profit)} / {margin}%
            </p>
          </div>
        </div>
        <p className="text-warm-white/40 text-xs mt-2">
          Labor uses the site labor rate of {formatMoney(laborRate)} per hour from Settings.
        </p>
        {bulkPricingEnabled && validBulkUnitPrice > 0 && (
          <p className="text-copper text-xs mt-2">
            Bulk offer: buy {bulkMinQuantityNumber}+ for {formatMoney(validBulkUnitPrice)} each. Profit at bulk price is {formatMoney(bulkProfitPerUnit)} per unit.
          </p>
        )}
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
