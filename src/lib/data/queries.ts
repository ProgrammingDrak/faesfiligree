import { prisma, isDatabaseConfigured } from "@/lib/db";
import type {
  Product,
  GalleryPiece,
  Category,
  SiteSettings,
  CommissionRequest,
} from "./types";

// ── Helper: Map Prisma results to legacy type shapes ──────────────────

function mapCategory(c: {
  id: string;
  title: string;
  slug: string;
  description: string | null;
}): Category {
  return {
    _id: c.id,
    title: c.title,
    slug: { current: c.slug },
    description: c.description ?? undefined,
  };
}

function mapProduct(p: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[];
  category: { id: string; title: string; slug: string; description: string | null } | null;
  materials: string[];
  dimensions: string | null;
  inStock: boolean;
  featured: boolean;
}): Product {
  return {
    _id: p.id,
    name: p.name,
    slug: { current: p.slug },
    description: p.description ?? undefined,
    price: p.price,
    images: p.images,
    category: p.category ? mapCategory(p.category) : undefined,
    materials: p.materials,
    dimensions: p.dimensions ?? undefined,
    inStock: p.inStock,
    featured: p.featured,
  };
}

function mapGalleryPiece(g: {
  id: string;
  title: string;
  slug: string;
  images: string[];
  description: string | null;
  category: { id: string; title: string; slug: string; description: string | null } | null;
  materials: string[];
  year: number | null;
  isSold: boolean;
  isCommission: boolean;
  featured: boolean;
}): GalleryPiece {
  return {
    _id: g.id,
    title: g.title,
    slug: { current: g.slug },
    images: g.images,
    description: g.description ?? undefined,
    category: g.category ? mapCategory(g.category) : undefined,
    materials: g.materials,
    year: g.year ?? undefined,
    isSold: g.isSold,
    isCommission: g.isCommission,
    featured: g.featured,
  };
}

// ── Mock Data ──────────────────────────────────────────────────────────

const MOCK_CATEGORIES: Category[] = [
  { _id: "cat-1", title: "Rings", slug: { current: "rings" }, description: "Handcrafted rings" },
  { _id: "cat-2", title: "Necklaces", slug: { current: "necklaces" }, description: "Elegant necklaces" },
  { _id: "cat-3", title: "Earrings", slug: { current: "earrings" }, description: "Delicate earrings" },
  { _id: "cat-4", title: "Bracelets", slug: { current: "bracelets" }, description: "Woven bracelets" },
  { _id: "cat-5", title: "Brooches", slug: { current: "brooches" }, description: "Ornate brooches" },
];

const MOCK_PRODUCTS: Product[] = [
  {
    _id: "prod-1",
    name: "Moonlit Copper Vine Ring",
    slug: { current: "moonlit-copper-vine-ring" },
    price: 4500,
    images: [],
    category: MOCK_CATEGORIES[0],
    materials: ["Copper", "Crystal"],
    dimensions: "Size 7, band width 3mm",
    inStock: true,
    featured: true,
  },
  {
    _id: "prod-2",
    name: "Enchanted Forest Pendant",
    slug: { current: "enchanted-forest-pendant" },
    price: 7800,
    images: [],
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
    images: [],
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
    images: [],
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
    images: [],
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
    images: [],
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
    images: [],
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
    images: [],
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
    images: [],
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
    images: [],
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
    images: [],
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
    images: [],
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
    { title: "Dream", description: "Share your vision and inspiration with me.", icon: "sparkles" },
    { title: "Design", description: "I sketch concepts and select the perfect materials.", icon: "pencil" },
    { title: "Create", description: "Each piece is hand-shaped, woven, and polished with care.", icon: "hammer" },
    { title: "Deliver", description: "Your treasure arrives beautifully packaged and ready to enchant.", icon: "gift" },
  ],
  contactEmail: "hello@faesfiligree.com",
  socialLinks: [
    { platform: "Instagram", url: "https://instagram.com/faesfiligree" },
    { platform: "Etsy", url: "https://etsy.com/shop/faesfiligree" },
    { platform: "Pinterest", url: "https://pinterest.com/faesfiligree" },
  ],
};

// ── Public Data Fetching Functions ────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  if (!isDatabaseConfigured()) return MOCK_PRODUCTS;
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
  return products.map(mapProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!isDatabaseConfigured()) return MOCK_PRODUCTS.filter((p) => p.featured);
  const products = await prisma.product.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
  return products.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isDatabaseConfigured())
    return MOCK_PRODUCTS.find((p) => p.slug.current === slug) || null;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  return product ? mapProduct(product) : null;
}

export async function getProductSlugs(): Promise<string[]> {
  if (!isDatabaseConfigured()) return MOCK_PRODUCTS.map((p) => p.slug.current);
  const products = await prisma.product.findMany({ select: { slug: true } });
  return products.map((p) => p.slug);
}

export async function getGalleryPieces(): Promise<GalleryPiece[]> {
  if (!isDatabaseConfigured()) return MOCK_GALLERY_PIECES;
  const pieces = await prisma.galleryPiece.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
  return pieces.map(mapGalleryPiece);
}

export async function getFeaturedGalleryPieces(): Promise<GalleryPiece[]> {
  if (!isDatabaseConfigured())
    return MOCK_GALLERY_PIECES.filter((p) => p.featured);
  const pieces = await prisma.galleryPiece.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
  return pieces.map(mapGalleryPiece);
}

export async function getCategories(): Promise<Category[]> {
  if (!isDatabaseConfigured()) return MOCK_CATEGORIES;
  const categories = await prisma.category.findMany({
    orderBy: { title: "asc" },
  });
  return categories.map(mapCategory);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isDatabaseConfigured()) return MOCK_SITE_SETTINGS;
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  if (!settings) return MOCK_SITE_SETTINGS;
  return {
    heroHeading: settings.heroHeading,
    heroSubheading: settings.heroSubheading,
    aboutContent: settings.aboutContent ?? undefined,
    processSteps: (settings.processSteps as unknown as SiteSettings["processSteps"]) ?? undefined,
    contactEmail: settings.contactEmail ?? undefined,
    socialLinks: (settings.socialLinks as unknown as SiteSettings["socialLinks"]) ?? undefined,
    announcementBar: settings.announcementBar ?? undefined,
    shippingInfo: settings.shippingInfo ?? undefined,
    returnPolicy: settings.returnPolicy ?? undefined,
    laborRate: settings.laborRate,
  };
}

// ── Admin Data Fetching Functions ─────────────────────────────────────

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true, productMaterials: { include: { material: true } } },
  });
}

export async function getMaterials() {
  return prisma.material.findMany({ orderBy: { name: "asc" } });
}

export async function getCommissions() {
  return prisma.commission.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getCommissionById(id: string) {
  return prisma.commission.findUnique({ where: { id } });
}

export async function getEvents() {
  return prisma.event.findMany({
    orderBy: { startDate: "desc" },
    include: {
      expenses: true,
      inventory: { include: { product: true } },
      sales: true,
    },
  });
}

export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      expenses: true,
      inventory: { include: { product: true } },
      sales: { include: { product: true } },
    },
  });
}

export async function getAnalyticsSummary(startDate?: Date, endDate?: Date) {
  const dateFilter = {
    ...(startDate && { gte: startDate }),
    ...(endDate && { lte: endDate }),
  };
  const hasDateFilter = startDate || endDate;

  const sales = await prisma.sale.findMany({
    where: hasDateFilter ? { date: dateFilter } : undefined,
    include: {
      product: {
        include: { productMaterials: { include: { material: true } } },
      },
    },
  });

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  const laborRate = settings?.laborRate ?? 2500;

  let grossRevenue = 0;
  let totalMaterialCost = 0;
  let totalLaborCost = 0;
  const productBreakdown: Record<
    string,
    {
      name: string;
      revenue: number;
      materialCost: number;
      laborCost: number;
      unitsSold: number;
    }
  > = {};

  for (const sale of sales) {
    const revenue = sale.price * sale.quantity;
    grossRevenue += revenue;

    const product = sale.product;
    let materialCostPerUnit = 0;
    if (product.materialCostLump != null) {
      materialCostPerUnit = product.materialCostLump;
    } else {
      for (const pm of product.productMaterials) {
        materialCostPerUnit += pm.quantity * pm.material.costPerUnit;
      }
    }

    const laborCostPerUnit = product.laborHours * laborRate;
    const saleMaterialCost = materialCostPerUnit * sale.quantity;
    const saleLaborCost = laborCostPerUnit * sale.quantity;

    totalMaterialCost += saleMaterialCost;
    totalLaborCost += saleLaborCost;

    if (!productBreakdown[product.id]) {
      productBreakdown[product.id] = {
        name: product.name,
        revenue: 0,
        materialCost: 0,
        laborCost: 0,
        unitsSold: 0,
      };
    }
    productBreakdown[product.id].revenue += revenue;
    productBreakdown[product.id].materialCost += saleMaterialCost;
    productBreakdown[product.id].laborCost += saleLaborCost;
    productBreakdown[product.id].unitsSold += sale.quantity;
  }

  return {
    grossRevenue,
    totalMaterialCost,
    totalLaborCost,
    netProfit: grossRevenue - totalMaterialCost - totalLaborCost,
    productBreakdown: Object.values(productBreakdown),
    salesByMonth: aggregateSalesByMonth(sales),
  };
}

function aggregateSalesByMonth(
  sales: { price: number; quantity: number; date: Date }[]
) {
  const months: Record<string, number> = {};
  for (const sale of sales) {
    const key = `${sale.date.getFullYear()}-${String(sale.date.getMonth() + 1).padStart(2, "0")}`;
    months[key] = (months[key] || 0) + sale.price * sale.quantity;
  }
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }));
}
