import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ProductDetail } from '@/components/ProductDetail'
import { Metadata } from 'next'
import { Product } from '@/types'

interface ProductPageProps {
  params: {
    slug: string // This "slug" will now be the SKU
  }
}

// The 'slug' parameter is now treated as the SKU
async function getProduct(sku: string) {
  return await prisma.product.findUnique({
    where: { sku },
    include: {
      category: true,
    },
  })
}

async function getRelatedProducts(
  categoryId: string | null,
  productId: string
): Promise<Product[]> {
  if (!categoryId) {
    return []
  }
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
      isActive: true,
    },
    include: {
      category: true,
    },
    take: 4,
    orderBy: {
      createdAt: 'desc',
    },
  })
  return products as Product[] // Cast to the correct type from types/index.ts
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug)

  if (!product) {
    return {
      title: 'Sản phẩm không tồn tại',
    }
  }

  const description = `Mua ${product.name} với giá tốt nhất. ${product.priceNote || ''}. Chất lượng cao, bảo hành uy tín.`

  return {
    title: `${product.name} - KyoSHOP`,
    description: description,
    keywords: `${product.name}, tài khoản premium, ${product.category?.name}`,
    openGraph: {
      title: `${product.name} - KyoSHOP`,
      description: description,
    },
    alternates: {
      canonical: `/san-pham/${product.sku}`,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  // The "slug" from the URL is now the SKU
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(
    product.categoryId,
    product.id
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductDetail product={product as Product} relatedProducts={relatedProducts} />
    </div>
  )
}