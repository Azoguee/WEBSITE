import { notFound } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/db'
import { CategoryPage } from '@/components/CategoryPage'
import { Metadata } from 'next'
import { CategorySidebar } from '@/components/CategorySidebar'

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
    where: { name: slug },
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
    isActive: boolean
    priceVnd?: { gte?: number; lte?: number }
    OR?: Array<{ name?: { contains: string }; description?: { contains: string }; sku?: { contains: string } }>
  } = {
    categoryId,
    isActive: true,
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.priceVnd = {}
    if (minPrice !== undefined) where.priceVnd.gte = minPrice
    if (maxPrice !== undefined) where.priceVnd.lte = maxPrice
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { sku: { contains: search } },
    ]
  }

  const orderBy: { priceVnd?: 'asc' | 'desc'; name?: 'asc' | 'desc'; createdAt?: 'asc' | 'desc' } = {}
  switch (sort) {
    case 'price_asc':
      orderBy.priceVnd = 'asc'
      break
    case 'price_desc':
      orderBy.priceVnd = 'desc'
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
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return {
    products: products,
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
    title: `${category.name} - KyoSHOP`,
    description: `Khám phá các sản phẩm ${category.name} chất lượng cao.`,
    keywords: `${category.name}, tài khoản premium, ${category.name} giá rẻ`,
    openGraph: {
      title: `${category.name} - KyoSHOP`,
      description: `Khám phá các sản phẩm ${category.name} chất lượng cao.`,
    },
    alternates: {
      canonical: `/danh-muc/${params.slug}`,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <CategorySidebar />
        <div className="lg:col-span-3">
          <CategoryPage
            category={category}
            products={products}
            pagination={pagination}
            searchParams={searchParams}
          />
        </div>
      </div>
    </div>
  )
}