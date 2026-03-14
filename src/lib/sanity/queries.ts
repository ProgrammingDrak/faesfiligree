import { sanityClient, isSanityConfigured } from "./client";
import type {
  Product,
  GalleryPiece,
  Category,
  SiteSettings,
} from "./types";

// ── Mock Data ──────────────────────────────────────────────────────────
// Used when Sanity is not configured (no env vars)

const MOCK_CATEGORIES: Category[] = [
  { _id: "cat-1", title: "Rings", slug: { current: "rings" }, description: "Handcrafted rings" },
  { _id: "cat-2", title: "Necklaces", slug: { current: "necklaces" }, description: "Elegant necklaces" },
  { _id: "cat-3", title: "Earrings", slug: { current: "earrings" }, description: "Delicate earrings" },
  { _id: "cat-4", title: "Bracelets", slug: { current: "bracelets" }, description: "Woven bracelets" },
  { _id: "cat-5", title: "Brooches", slug: { current: "brooches" }, description: "Ornate brooches" },
];

const PLACEHOLDER_IMAGE = {
  _type: "image" as const,
  asset: { _ref: "placeholder", _type: "reference" as const },
  alt: "Placeholder jewelry image",
};

const MOCK_PRODUCTS: Product[] = [
  {
    _id: "prod-1",
    name: "Moonlit Copper Vine Ring",
    slug: { current: "moonlit-copper-vine-ring" },
    price: 4500,
    images: [PLACEHOLDER_IMAGE],
    category: MOCK_CATEGORIES[0],
    materials: ["Copper", "Crystal"],
    dimensions: 'Size 7, band width 3mm',
    inStock: true,
    featured: true,
  },
  {
    _id: "prod-2",
    name: "Enchanted Forest Pendant",
    slug: { current: "enchanted-forest-pendant" },
    price: 7800,
    images: [PLACEHOLDER_IMAGE],
    category: MOCK_CATEGORIES[1],
    materials: ["Sterling Silver", "Gemstone"],
    dimensions: 'Pendant 25mm, chain 18"',
    inStock: true,
    featured: true,
  },
  {
    _id: "prod-3",
    name: "Dewdrop Crystal Earrings",
    slug: { current: "dewdrop-crystal-earrings" },
    price: 3200,
    images: [PLACEHOLDER_IMAGE],
    category: MOCK_CATEGORIES[2],
    materials: ["Gold-filled", "Crystal"],
    dimensions: "Drop length 35mm",
    inStock: true,
    featured: true,
  },
  {
    _id: "prod-4",
    name: "Woven Starlight Bracelet",
    slug: { current: "woven-starlight-bracelet" },
    price: 5600,
    images: [PLACEHOLDER_IMAGE],
    category: MOCK_CATEGORIES[3],
    materials: ["Copper", "Pearl"],
    dimensions: '7" adjustable',
    inStock: true,
    featured: false,
  },
  {
    _id: "prod-5",
    name: "Autumn Leaf Brooch",
    slug: { current: "autumn-leaf-brooch" },
    price: 4200,
    images: [PLACEHOLDER_IMAGE],
    category: MOCK_CATEGORIES[4],
    materials: ["Brass", "Gemstone"],
    dimensions: "45mm x 30mm",
    inStock: true,
    featured: false,
  },
  {
    _id: "prod-6",
    name: "Fae's Whisper Choker",
    slug: { current: "faes-whisper-choker" },
    price: 8900,
    images: [PLACEHOLDER_IMAGE],
    category: MOCK_CATEGORIES[1],
    materials: ["Sterling Silver", "Pearl"],
    dimensions: '14-16" adjustable',
    inStock: false,
    featured: true,
  },
];

const MOCK_GALLERY_PIECES: GalleryPiece[] = [
  {
    _id: "gal-1",
    title: "Titania's Crown",
    slug: { current: "titanias-crown" },
    images: [PLACEHOLDER_IMAGE],
    description: "An ornate copper crown inspired by the fairy queen, with woven vine motifs and crystal accents.",
    category: MOCK_CATEGORIES[0],
    materials: ["Copper", "Crystal"],
    year: 2024,
    isSold: true,
    isCommission: true,
    featured: true,
  },
  {
    _id: "gal-2",
    title: "Serpentine River Necklace",
    slug: { current: "serpentine-river-necklace" },
    images: [PLACEHOLDER_IMAGE],
    description: "A flowing silver chain with interlocking wave patterns, evoking the movement of water over stones.",
    category: MOCK_CATEGORIES[1],
    materials: ["Sterling Silver"],
    year: 2024,
    isSold: false,
    isCommission: false,
    featured: true,
  },
  {
    _id: "gal-3",
    title: "Gossamer Wing Earrings",
    slug: { current: "gossamer-wing-earrings" },
    images: [PLACEHOLDER_IMAGE],
    description: "Delicate dragonfly wing earrings in hammered copper with translucent glass details.",
    category: MOCK_CATEGORIES[2],
    materials: ["Copper", "Glass"],
    year: 2023,
    isSold: true,
    isCommission: false,
    featured: true,
  },
  {
    _id: "gal-4",
    title: "Bramble & Thorn Cuff",
    slug: { current: "bramble-thorn-cuff" },
    images: [PLACEHOLDER_IMAGE],
    description: "A bold brass cuff with thorny vine details and tiny rose-shaped copper accents.",
    category: MOCK_CATEGORIES[3],
    materials: ["Brass", "Copper"],
    year: 2024,
    isSold: false,
    isCommission: false,
    featured: false,
  },
  {
    _id: "gal-5",
    title: "Moth & Moonstone Brooch",
    slug: { current: "moth-moonstone-brooch" },
    images: [PLACEHOLDER_IMAGE],
    description: "A luna moth brooch in oxidized silver with a luminous moonstone body.",
    category: MOCK_CATEGORIES[4],
    materials: ["Sterling Silver", "Gemstone"],
    year: 2023,
    isSold: true,
    isCommission: true,
    featured: true,
  },
  {
    _id: "gal-6",
    title: "Wildflower Wreath Ring",
    slug: { current: "wildflower-wreath-ring" },
    images: [PLACEHOLDER_IMAGE],
    description: "A dainty ring of tiny wildflowers wreathed around the finger in gold-filled wire.",
    category: MOCK_CATEGORIES[0],
    materials: ["Gold-filled"],
    year: 2024,
    isSold: false,
    isCommission: false,
    featured: false,
  },
];

const MOCK_SITE_SETTINGS: SiteSettings = {
  heroHeading: "Handcrafted with Enchantment",
  heroSubheading:
    "Delicate filigree and copper wirework — each piece tells a story woven in metal and light.",
  processSteps: [
    { title: "Dream", description: "Share your vision and inspiration with me.", icon: "✨" },
    { title: "Design", description: "I sketch concepts and select the perfect materials.", icon: "✏️" },
    { title: "Create", description: "Each piece is hand-shaped, woven, and polished with care.", icon: "🔨" },
    { title: "Deliver", description: "Your treasure arrives beautifully packaged and ready to enchant.", icon: "🎁" },
  ],
  contactEmail: "hello@faesfiligree.com",
  socialLinks: [
    { platform: "Instagram", url: "https://instagram.com/faesfiligree" },
    { platform: "Etsy", url: "https://etsy.com/shop/faesfiligree" },
    { platform: "Pinterest", url: "https://pinterest.com/faesfiligree" },
  ],
};

// ── GROQ Queries ───────────────────────────────────────────────────────

const PRODUCT_FIELDS = `
  _id,
  name,
  slug,
  description,
  price,
  images,
  "category": category->{_id, title, slug},
  materials,
  dimensions,
  inStock,
  featured,
`;

const GALLERY_PIECE_FIELDS = `
  _id,
  title,
  slug,
  images,
  description,
  "category": category->{_id, title, slug},
  materials,
  year,
  isSold,
  isCommission,
  featured
`;

// ── Data Fetching Functions ────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  if (!isSanityConfigured()) return MOCK_PRODUCTS;
  return sanityClient.fetch(
    `*[_type == "product"] | order(_createdAt desc) { ${PRODUCT_FIELDS} }`,
    {},
    { next: { tags: ["products"] } }
  );
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!isSanityConfigured()) return MOCK_PRODUCTS.filter((p) => p.featured);
  return sanityClient.fetch(
    `*[_type == "product" && featured == true] | order(_createdAt desc) { ${PRODUCT_FIELDS} }`,
    {},
    { next: { tags: ["products"] } }
  );
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSanityConfigured())
    return MOCK_PRODUCTS.find((p) => p.slug.current === slug) || null;
  return sanityClient.fetch(
    `*[_type == "product" && slug.current == $slug][0] { ${PRODUCT_FIELDS} }`,
    { slug },
    { next: { tags: ["products"] } }
  );
}

export async function getProductSlugs(): Promise<string[]> {
  if (!isSanityConfigured()) return MOCK_PRODUCTS.map((p) => p.slug.current);
  const slugs = await sanityClient.fetch<{ current: string }[]>(
    `*[_type == "product"].slug`,
    {},
    { next: { tags: ["products"] } }
  );
  return slugs.map((s) => s.current);
}

export async function getGalleryPieces(): Promise<GalleryPiece[]> {
  if (!isSanityConfigured()) return MOCK_GALLERY_PIECES;
  return sanityClient.fetch(
    `*[_type == "galleryPiece"] | order(_createdAt desc) { ${GALLERY_PIECE_FIELDS} }`,
    {},
    { next: { tags: ["gallery"] } }
  );
}

export async function getFeaturedGalleryPieces(): Promise<GalleryPiece[]> {
  if (!isSanityConfigured())
    return MOCK_GALLERY_PIECES.filter((p) => p.featured);
  return sanityClient.fetch(
    `*[_type == "galleryPiece" && featured == true] | order(_createdAt desc) { ${GALLERY_PIECE_FIELDS} }`,
    {},
    { next: { tags: ["gallery"] } }
  );
}

export async function getCategories(): Promise<Category[]> {
  if (!isSanityConfigured()) return MOCK_CATEGORIES;
  return sanityClient.fetch(
    `*[_type == "category"] | order(title asc) { _id, title, slug, description }`,
    {},
    { next: { tags: ["categories"] } }
  );
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSanityConfigured()) return MOCK_SITE_SETTINGS;
  const settings = await sanityClient.fetch(
    `*[_type == "siteSettings"][0]`,
    {},
    { next: { tags: ["siteSettings"] } }
  );
  return settings || MOCK_SITE_SETTINGS;
}
