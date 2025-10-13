import { StockStatus } from '@prisma/client';
import { ProductFromDb, ProductDTO } from '@/types';

export interface NormalizedProduct {
  name: string;
  priceVnd: number | null;
  priceNote: string | null;
  stockStatus: StockStatus;
  type: string | null;
  category: string | null;
  sku: string | null;
  isActive: boolean;
}

const headerMapping: { [key: string]: keyof NormalizedProduct } = {
  'tên': 'name',
  'tên sản phẩm': 'name',
  'name': 'name',
  'giá': 'priceVnd',
  'price': 'priceVnd',
  'ghi chú giá': 'priceNote',
  'price note': 'priceNote',
  'loại': 'type',
  'type': 'type',
  'danh mục': 'category',
  'category': 'category',
  'sku': 'sku',
  'tình trạng kho': 'stockStatus',
  'stock status': 'stockStatus',
};

function normalizeHeaders(headers: string[]): (keyof NormalizedProduct | null)[] {
  return headers.map(header => headerMapping[header.toLowerCase().trim()] || null);
}

function parsePrice(priceStr: string | null | undefined): { priceVnd: number | null; priceNote: string | null } {
  if (!priceStr || priceStr.toLowerCase().includes('liên hệ')) {
    return { priceVnd: null, priceNote: priceStr || 'Liên hệ' };
  }
  const digits = priceStr.replace(/\D/g, '');
  const price = parseInt(digits, 10);
  return isNaN(price) ? { priceVnd: null, priceNote: priceStr } : { priceVnd: price, priceNote: null };
}

function inferStockStatus(row: { [key: string]: string }): StockStatus {
    for (const key in row) {
        const value = row[key].toLowerCase();
        if (value.includes('hết hàng')) {
            return StockStatus.OUT_OF_STOCK;
        }
        if (value.includes('còn hàng')) {
            return StockStatus.IN_STOCK;
        }
    }
    return StockStatus.UNKNOWN;
}

export function normalizeCsvRow(row: { [key: string]: string }, normalizedHeaders: (keyof NormalizedProduct | null)[]): NormalizedProduct {
  const headers = Object.keys(row);
  const normalizedRow: Partial<NormalizedProduct> = { isActive: true };

  normalizedHeaders.forEach((mappedHeader, index) => {
    if (mappedHeader) {
      const originalHeader = headers[index];
      const value = row[originalHeader]?.trim();

      if (mappedHeader === 'priceVnd') {
        const { priceVnd, priceNote } = parsePrice(value);
        normalizedRow.priceVnd = priceVnd;
        normalizedRow.priceNote = priceNote;
      } else {
        (normalizedRow as any)[mappedHeader] = value || null;
      }
    }
  });

  // Handle stock status separately as it can be inferred from multiple columns
  normalizedRow.stockStatus = inferStockStatus(row);

  if (!normalizedRow.name) {
    throw new Error('Row is missing a name.');
  }

  return normalizedRow as NormalizedProduct;
}

export function toProductDTO(p: ProductFromDb): ProductDTO {
  return {
    id: p.id,
    name: p.name,
    priceVnd: p.priceVnd,
    priceNote: p.priceNote,
    stockStatus: p.stockStatus,
    type: p.type,
    sku: p.sku,
    isActive: p.isActive,
    description: p.description,
    images: p.images,
    category: p.category,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    // Properties not in ProductFromDb, set to default null
    oldPrice: null,
    discount: null,
    rating: null,
    categoryId: p.categoryId,
  };
}

export function normalizeCsvData(data: { [key: string]: string }[]): NormalizedProduct[] {
    if (data.length === 0) {
        return [];
    }
    const headers = Object.keys(data[0]);
    const normalizedHeaders = normalizeHeaders(headers);
    return data.map(row => normalizeCsvRow(row, normalizedHeaders));
}