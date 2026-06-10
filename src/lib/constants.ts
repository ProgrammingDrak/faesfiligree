export const SITE_NAME = "Fae's Filigree";
export const SITE_DESCRIPTION =
  "Enchanted handcrafted jewelry — delicate filigree, copper wirework, and bespoke commissions crafted with love.";

export const NAV_LINKS = [
  { label: "Gallery", href: "/gallery" },
  { label: "Shop", href: "/shop" },
  { label: "Commissions", href: "/commissions" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

// Merch categories for the shop. Each carries a SKU prefix used to
// auto-generate a product's Inventory Label (e.g. FF-SUN-001). Add or
// rename freely — categories are upserted into the database by slug.
export const MERCH_CATEGORIES = [
  { slug: "suncatchers", title: "Suncatchers", skuPrefix: "SUN" },
  { slug: "shibari-ladies", title: "Shibari Ladies", skuPrefix: "SHIB" },
  { slug: "jewelry", title: "Jewelry", skuPrefix: "JWL" },
  { slug: "pendants", title: "Pendants", skuPrefix: "PEND" },
  { slug: "necklaces", title: "Necklaces", skuPrefix: "NECK" },
  { slug: "earrings", title: "Earrings", skuPrefix: "EAR" },
  { slug: "rings", title: "Rings", skuPrefix: "RING" },
  { slug: "other", title: "Other", skuPrefix: "MISC" },
] as const;

export type MerchCategory = (typeof MERCH_CATEGORIES)[number];

// Payment methods and their processing fees. Fee on a sale =
// total * percentFee% + flatFeeCents (per transaction). Tweak the rates here.
export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", percentFee: 0, flatFeeCents: 0 },
  { value: "square", label: "Square", percentFee: 2.6, flatFeeCents: 10 },
  { value: "card", label: "Card (other)", percentFee: 2.9, flatFeeCents: 30 },
  { value: "venmo", label: "Venmo / PayPal", percentFee: 1.9, flatFeeCents: 10 },
  { value: "other", label: "Other", percentFee: 0, flatFeeCents: 0 },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

/** Processing fee in cents for a sale total, given a payment method value. */
export function computeProcessingFee(paymentType: string | null | undefined, totalCents: number): number {
  const method = PAYMENT_METHODS.find((m) => m.value === paymentType);
  if (!method || totalCents <= 0) return 0;
  return Math.round((totalCents * method.percentFee) / 100) + method.flatFeeCents;
}

export const MATERIALS = [
  "Copper",
  "Sterling Silver",
  "Gold-filled",
  "Brass",
  "Bronze",
  "Gemstone",
  "Crystal",
  "Pearl",
  "Glass",
  "Wood",
] as const;

export const BUDGET_RANGES = [
  { value: "under-50", label: "Under $50" },
  { value: "50-100", label: "$50 – $100" },
  { value: "100-250", label: "$100 – $250" },
  { value: "250-500", label: "$250 – $500" },
  { value: "500-plus", label: "$500+" },
] as const;

export const TIMELINES = [
  { value: "flexible", label: "Flexible / No rush" },
  { value: "1-2-weeks", label: "1–2 weeks" },
  { value: "3-4-weeks", label: "3–4 weeks" },
  { value: "1-2-months", label: "1–2 months" },
  { value: "specific-date", label: "I have a specific date" },
] as const;

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/faesfiligree" },
  { label: "Etsy", href: "https://etsy.com/shop/faesfiligree" },
  { label: "Pinterest", href: "https://pinterest.com/faesfiligree" },
] as const;
