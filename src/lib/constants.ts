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

export const CATEGORIES = [
  { slug: "rings", title: "Rings" },
  { slug: "necklaces", title: "Necklaces" },
  { slug: "earrings", title: "Earrings" },
  { slug: "bracelets", title: "Bracelets" },
  { slug: "brooches", title: "Brooches" },
  { slug: "hair-pieces", title: "Hair Pieces" },
  { slug: "custom", title: "Custom Pieces" },
] as const;

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
