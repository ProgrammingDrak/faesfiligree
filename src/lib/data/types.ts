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
  description?: string;
  price: number;
  images: string[];
  category?: Category;
  materials?: string[];
  dimensions?: string;
  inStock: boolean;
  featured: boolean;
}

export interface GalleryPiece {
  _id: string;
  title: string;
  slug: { current: string };
  images: string[];
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
  referenceImages?: string[];
  status: string;
  notes?: string;
}

export interface ProcessStep {
  title: string;
  description: string;
  icon?: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SiteSettings {
  heroHeading: string;
  heroSubheading: string;
  aboutContent?: string;
  creatorName?: string;
  creatorImage?: string;
  processSteps?: ProcessStep[];
  contactEmail?: string;
  socialLinks?: SocialLink[];
  announcementBar?: string;
  shippingInfo?: string;
  returnPolicy?: string;
  laborRate?: number;
}
