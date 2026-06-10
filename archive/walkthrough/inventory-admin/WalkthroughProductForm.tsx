"use client";

import { useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";

const demoMaterials = [
  { id: "copper-wire", name: "Copper wire", unit: "ft", costPerUnit: 45 },
  { id: "moonstone-bead", name: "Moonstone bead", unit: "piece", costPerUnit: 180 },
  { id: "silver-clasp", name: "Sterling clasp", unit: "piece", costPerUnit: 320 },
];

const demoCategories = [
  { id: "necklaces", slug: "necklaces", title: "Necklaces", skuPrefix: "NEC", nextNumber: 12 },
  { id: "earrings", slug: "earrings", title: "Earrings", skuPrefix: "EAR", nextNumber: 18 },
  { id: "bracelets", slug: "bracelets", title: "Bracelets", skuPrefix: "BRA", nextNumber: 9 },
];

export function WalkthroughProductForm() {
  const [saved, setSaved] = useState(false);

  return (
    <div
      onSubmitCapture={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setSaved(true);
      }}
      className="space-y-4"
    >
      {saved && (
        <div className="max-w-4xl rounded-lg border border-green-400/25 bg-green-400/10 px-4 py-3 text-sm text-green-300">
          Demo capture: this shows where the product would be saved. No inventory was changed.
        </div>
      )}
      <ProductForm
        materials={demoMaterials}
        categories={demoCategories}
        laborRate={2500}
        defaultCategoryId="necklaces"
        initialCostMode="lump"
      />
    </div>
  );
}
