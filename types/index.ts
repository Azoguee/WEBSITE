export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  originalPrice?: number | null;
  currency: string;
  categoryId: string;
  images: string[];
  status: 'active' | 'inactive' | 'out_of_stock';
  isFeatured: boolean;
  sortOrder: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  price: number;
  isDefault: boolean;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  products?: Product[];
}

export interface Lead {
  id: string;
  orderRef: string;
  productId?: string;
  productName: string;
  price: number;
  variant?: string;
  quantity: number;
  status: 'pending_chat' | 'contacted' | 'success' | 'lost';
  sessionId?: string;
  clientIp?: string;
  userAgent?: string;
  landingUrl?: string;
  referrer?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  deviceType?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
}

export interface ZaloMessage {
  productName: string;
  sku: string;
  price: string;
  variant?: string;
  sourcePage: string;
  orderRef: string;
}

export interface AnalyticsEvent {
  event: string;
  parameters: {
    product_id?: string;
    product_name?: string;
    value?: number;
    currency?: string;
    variant?: string;
    source_page?: string;
    order_ref?: string;
  };
}

export interface CSVProduct {
  sku: string;
  name: string;
  price_vnd: number;
  category: string;
  unit?: string;
  images?: string;
  description?: string;
  status?: string;
}