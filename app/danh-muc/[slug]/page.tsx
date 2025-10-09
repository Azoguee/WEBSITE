import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { CategoryPage } from '@/components/CategoryPage'
import { Metadata } from 'next'
import { Product } from '@/types'

interface CategoryPageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
    sort?: string
    min_price?: string
    max_price?: string
    search?: string
  }
}

async function getCategory(slug: string) {
  return await prisma.category.findUnique({
    where: { slug },
  })
}

async function getProducts(
  categoryId: string,
  page: number = 1,
  sort: string = 'newest',
  minPrice?: number,
  maxPrice?: number,
  search?: string
) {
  const limit = 12
  const skip = (page - 1) * limit

  const where: {
    categoryId: string
    status: string
    price?: { gte?: number; lte?: number }
    OR?: Array<{ name?: { contains: string }; description?: { contains: string }; sku?: { contains: string } }>
  } = {
    categoryId,
    status: 'active',
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) where.price.gte = minPrice
    if (maxPrice !== undefined) where.price.lte = maxPrice
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { sku: { contains: search } },
    ]
  }

  const orderBy: { price?: 'asc' | 'desc'; name?: 'asc' | 'desc'; createdAt?: 'asc' | 'desc' } = {}
  switch (sort) {
    case 'price_asc':
      orderBy.price = 'asc'
      break
    case 'price_desc':
      orderBy.price = 'desc'
      break
    case 'name':
      orderBy.name = 'asc'
      break
    case 'oldest':
      orderBy.createdAt = 'asc'
      break
    default:
      orderBy.createdAt = 'desc'
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  const productsWithParsedImages = products.map((product) => {
    let parsedImages: string[] = []
    try {
      if (product.images) {
        parsedImages = JSON.parse(product.images as unknown as string)
      }
    } catch (e) {
      console.error(`Failed to parse images for product ${product.id}`, e)
    }
    return {
      ...product,
      images: Array.isArray(parsedImages) ? parsedImages : [],
      status: product.status as Product['status'],
    }
  })

  return {
    products: productsWithParsedImages,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategory(params.slug)
  
  if (!category) {
    return {
      title: 'Danh mục không tồn tại',
    }
  }

  return {
    title: `${category.name} - Tài Khoản Siêu Rẻ`,
    description: category.description || `Khám phá các sản phẩm ${category.name} với giá siêu rẻ. Chất lượng cao, bảo hành lâu dài.`,
    keywords: `${category.name}, tài khoản premium, ${category.name} giá rẻ`,
    openGraph: {
      title: `${category.name} - Tài Khoản Siêu Rẻ`,
      description: category.description || `Khám phá các sản phẩm ${category.name} với giá siêu rẻ.`,
      images: category.image ? [category.image] : [],
    },
    alternates: {
      canonical: `/danh-muc/${category.slug}`,
    },
  }
}

export default async function CategoryPageComponent({ params, searchParams }: CategoryPageProps) {
  const category = await getCategory(params.slug)
  
  if (!category) {
    notFound()
  }

  const page = parseInt(searchParams.page || '1')
  const sort = searchParams.sort || 'newest'
  const minPrice = searchParams.min_price ? parseFloat(searchParams.min_price) : undefined
  const maxPrice = searchParams.max_price ? parseFloat(searchParams.max_price) : undefined
  const search = searchParams.search

  const { products, pagination } = await getProducts(
    category.id,
    page,
    sort,
    minPrice,
    maxPrice,
    search
  )

  return (
    <CategoryPage
      category={category}
      products={products}
      pagination={pagination}
      searchParams={searchParams}
    />
  )
}