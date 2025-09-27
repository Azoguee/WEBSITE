import { z } from 'zod'

// Lead validation schema
export const createLeadSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1, 'Product name is required').max(255, 'Product name too long'),
  price: z.number().positive('Price must be positive'),
  variant: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  sessionId: z.string().optional(),
  landingUrl: z.string().url().optional(),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmMedium: z.string().optional(),
})

// Analytics validation schema
export const analyticsSchema = z.object({
  event: z.string().min(1),
  parameters: z.object({
    product_id: z.string().optional(),
    product_name: z.string().optional(),
    value: z.number().optional(),
    currency: z.string().optional(),
    variant: z.string().optional(),
    source_page: z.string().optional(),
    order_ref: z.string().optional(),
  }),
})

// Input sanitization
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS
    .substring(0, 1000) // Limit length
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
