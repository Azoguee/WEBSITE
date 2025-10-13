import { StockStatus as PrismaStockStatus } from '@prisma/client';

export interface Product {
  id: string;
  name: string;
  priceVnd: number | null;
  priceNote: string | null;
  stockStatus: PrismaStockStatus;
  type: string | null;
  sku: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string | null;
  category?: Category | null;
}

export interface ProductDomain {
  id: string;
  name: string;
  priceVnd: number | null;
  oldPrice: number | null;
  discount: string | null;
  priceNote: string | null;
  rating: number | null;
  stockStatus: PrismaStockStatus;
  type: string | null;
  sku: string | null;
  images: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
}

export interface ProductDTO {
  id: string;
  name: string;
  priceVnd: number | null;
  oldPrice: number | null;
  discount: string | null;
  priceNote: string | null;
  rating: number | null;
  stockStatus: PrismaStockStatus;
  type: string | null;
  sku: string | null;
  images: string[];
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
}

export interface Category {
  id: string;
  name: string;
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