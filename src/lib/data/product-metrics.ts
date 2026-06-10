// Shared cost / pricing math for product inventory views.

export interface CostInputs {
  materialCostLump: number | null;
  laborHours: number;
  productMaterials: { quantity: number; material: { costPerUnit: number } }[];
}

export function getProductCost(product: CostInputs, laborRate: number) {
  const itemizedCost = product.productMaterials.reduce(
    (sum, row) => sum + row.material.costPerUnit * row.quantity,
    0
  );
  const supplyCost = product.materialCostLump ?? itemizedCost;
  const laborCost = Math.round(product.laborHours * laborRate);
  return { supplyCost, laborCost, totalCost: supplyCost + laborCost };
}

export interface BulkInputs {
  price: number;
  bulkPricingEnabled: boolean;
  bulkPricingMode: string | null;
  bulkDiscountPercent: number | null;
  bulkUnitPrice: number | null;
}

export function getBulkUnitPrice(product: BulkInputs) {
  if (!product.bulkPricingEnabled) return null;
  if (product.bulkPricingMode === "fixed") return product.bulkUnitPrice;
  if (product.bulkDiscountPercent == null) return null;
  return Math.round(product.price * (1 - product.bulkDiscountPercent / 100));
}
