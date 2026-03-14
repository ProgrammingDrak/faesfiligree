export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  hotspot?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  alt?: string;
}

export interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  description?: any[];
  price: number;
  images: SanityImage[];
  category?: Category;
  materials?: string[];
  dimensions?: string;
  inStock: boolean;
  featured: boolean;
  stripePriceId?: string;
}

export interface GalleryPiece {
  _id: string;
  title: string;
  slug: { current: string };
  images: SanityImage[];
  description?: string;
  category?: Category;
  materials?: string[];
  year?: number;
  isSold: boolean;
  isCommission: boolean;
  featured: boolean;
}

export interface CommissionRequest {
  _id: string;
  name: string;
  email: string;
  pieceType?: string;
  stylePreferences?: string[];
  materials?: string[];
  budgetRange?: string;
  timeline?: string;
  targetDate?: string;
  description?: string;
  referenceImages?: SanityImage[];
  inspirationPieces?: GalleryPiece[];
  status: string;
  notes?: string;
}

export interface ProcessStep {
  title: string;
  description: string;
  icon?: string;
}

export interface SiteSettings {
  heroHeading: string;
  heroSubheading: string;
  aboutContent?: any[];
  processSteps?: ProcessStep[];
  contactEmail?: string;
  socialLinks?: { platform: string; url: string }[];
  announcementBar?: string;
  shippingInfo?: any[];
  returnPolicy?: any[];
}
