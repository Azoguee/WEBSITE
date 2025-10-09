import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { ProductDetail } from '@/components/ProductDetail'
import { Metadata } from 'next'
import { Product } from '@/types'

interface ProductPageProps {
  params: {
    slug: string
  }
}

async function getProduct(slug: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!product) {
    return null
  }

  let parsedImages: string[] = []
  try {
    if (product.images) {
      const parsed = JSON.parse(product.images as unknown as string)
      if (Array.isArray(parsed)) {
        parsedImages = parsed
      }
    }
  } catch (e) {
    console.error(`Failed to parse images for product ${product.id}`, e)
  }

  return {
    ...product,
    images: parsedImages,
    status: product.status as Product['status'],
  }
}

async function getRelatedProducts(
  categoryId: string,
  productId: string
): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: productId },
      status: 'active',
    },
    include: {
      category: true,
    },
    take: 4,
    orderBy: {
      createdAt: 'desc',
    },
  })

  return products.map((product) => {
    let parsedImages: string[] = []
    try {
      if (product.images) {
        const parsed = JSON.parse(product.images as unknown as string)
        if (Array.isArray(parsed)) {
          parsedImages = parsed
        }
      }
    } catch (e) {
      console.error(`Failed to parse images for product ${product.id}`, e)
    }
    return {
      ...product,
      images: parsedImages,
      status: product.status as Product['status'],
    }
  })
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

  return {
    title: `${product.name} - Tài Khoản Siêu Rẻ`,
    description:
      product.metaDescription ||
      product.description ||
      `Mua ${product.name} với giá siêu rẻ. Chất lượng cao, bảo hành lâu dài.`,
    keywords: `${product.name}, tài khoản premium, ${product.category?.name}`,
    openGraph: {
      title: `${product.name} - Tài Khoản Siêu Rẻ`,
      description:
        product.metaDescription ||
        product.description ||
        `Mua ${product.name} với giá siêu rẻ.`,
      images: product.images.length > 0 ? [product.images[0]] : [],
    },
    alternates: {
      canonical: `/san-pham/${product.slug}`,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
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
      <ProductDetail product={product} relatedProducts={relatedProducts} />
    </div>
  )
}