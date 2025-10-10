import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'
export const dynamic = 'force-dynamic'
import { Category, Product } from '@/types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.SITE_URL || 'http://localhost:3000'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/danh-muc`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lien-he`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/chinh-sach`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // Categories
  const categories = await prisma.category.findMany({
    select: { name: true, updatedAt: true },
  })

  const categoryPages = categories.map((category: { name: string; updatedAt: Date }) => ({
    url: `${baseUrl}/danh-muc/${category.name}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { sku: true, updatedAt: true },
  })

  const productPages = products.filter(p => p.sku).map((product: { sku: string | null; updatedAt: Date }) => ({
    url: `${baseUrl}/san-pham/${product.sku}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}

