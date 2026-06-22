export interface HelpWalkthroughStep {
  title: string;
  caption: string;
  image: string;
  alt: string;
  durationMs: number;
}

export const inventoryWalkthroughSteps: HelpWalkthroughStep[] = [
  {
    title: "Start a product",
    caption: "Start on New Product. This is where a new inventory item begins.",
    image: "/admin-help/inventory-walkthrough/01-new-product.jpg",
    alt: "The admin New Product page before any product details are entered.",
    durationMs: 4000,
  },
  {
    title: "Name and category",
    caption: "Add the item name, choose a category, and let the SKU fill in automatically.",
    image: "/admin-help/inventory-walkthrough/02-basic-info.jpg",
    alt: "The New Product form with item name, category, and generated SKU fields filled in.",
    durationMs: 5000,
  },
  {
    title: "Set price",
    caption: "Enter the list price, then uncheck discretion if you want to set a haggle floor.",
    image: "/admin-help/inventory-walkthrough/03-pricing.jpg",
    alt: "Pricing fields on the product form, including list price and haggle price controls.",
    durationMs: 5000,
  },
  {
    title: "Add material cost",
    caption: "Choose Lump Sum and enter what the materials cost for this item.",
    image: "/admin-help/inventory-walkthrough/04-material-cost.jpg",
    alt: "The material cost panel with Lump Sum selected and a material cost entered.",
    durationMs: 5000,
  },
  {
    title: "Add build time",
    caption: "Add the build time. The site multiplies that by the labor rate in Settings.",
    image: "/admin-help/inventory-walkthrough/05-build-time.jpg",
    alt: "The estimated build time panel with duration controls filled in.",
    durationMs: 5000,
  },
  {
    title: "Review profit",
    caption: "Review the pricing summary. Profit updates from list price minus materials and labor.",
    image: "/admin-help/inventory-walkthrough/06-profit-summary.jpg",
    alt: "The pricing summary showing supply cost, labor estimate, total cost, and profit.",
    durationMs: 6000,
  },
  {
    title: "Create product",
    caption: "When everything looks right, click Create Product to save the inventory item.",
    image: "/admin-help/inventory-walkthrough/07-create-product.jpg",
    alt: "The Create Product button at the bottom of the completed form.",
    durationMs: 4000,
  },
];
