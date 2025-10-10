import { prisma } from '@/lib/db'
import { ProductCard } from '@/components/ProductCard'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    })
    return products as Product[]
  } catch (error) {
    console.error('Failed to fetch featured products:', error)
    return []
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Chào mừng đến với KyoSHOP
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Nơi cung cấp các tài khoản premium uy tín, chất lượng.
            </p>
            <Button size="lg" asChild>
              <Link href="/danh-muc">Khám phá ngay</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sản phẩm nổi bật
            </h2>
            <p className="text-lg text-gray-600">
              Những sản phẩm được khách hàng yêu thích và tin dùng
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/danh-muc">Xem tất cả sản phẩm</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}