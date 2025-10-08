import { type ClassValue, clsx } from "clsx"
import { v4 as uuidv4 } from 'uuid'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatPrice(price: number, currency: string = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

export function generateOrderRef(): string {
  const shortId = uuidv4().split('-')[0].toUpperCase()
  return `ORD-${Date.now()}-${shortId}`
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function getDeviceType(userAgent: string): string {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    return 'mobile'
  }
  if (/Tablet|iPad/.test(userAgent)) {
    return 'tablet'
  }
  return 'desktop'
}

export function buildZaloLink(params: {
  productName: string;
  sku: string;
  price: string;
  variant?: string;
  sourcePage: string;
  orderRef: string;
  zaloOaLink: string;
}): string {
  const message = `Mình muốn mua: ${params.productName} (SKU: ${params.sku}) – Giá: ${params.price}${params.variant ? ` – Gói: ${params.variant}` : ''} – Từ: ${params.sourcePage} – Ref: ${params.orderRef}`
  
  const encodedMessage = encodeURIComponent(message)
  return `${params.zaloOaLink}?text=${encodedMessage}`
}

export function parseCSVPrice(priceStr: string): number {
  // Remove currency symbols and convert to number
  const cleanPrice = priceStr.replace(/[^\d.,]/g, '').replace(',', '.')
  return parseFloat(cleanPrice) || 0
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getUTMParams(searchParams: URLSearchParams) {
  return {
    utm_source: searchParams.get('utm_source'),
    utm_medium: searchParams.get('utm_medium'),
    utm_campaign: searchParams.get('utm_campaign'),
    utm_term: searchParams.get('utm_term'),
    utm_content: searchParams.get('utm_content'),
  }
}

