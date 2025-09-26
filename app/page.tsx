import { prisma } from '@/lib/db'
import { ProductCard } from '@/components/ProductCard'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { MessageCircle, Star, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

async function getFeaturedProducts() {
  return await prisma.product.findMany({
    where: {
      isFeatured: true,
      status: 'active',
    },
    include: {
      category: true,
    },
    take: 8,
    orderBy: {
      sortOrder: 'asc',
    },
  })
}

async function getCategories() {
  return await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      sortOrder: 'asc',
    },
    take: 6,
  })
}

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ])

  const handleBuyClick = (product: Product) => {
    // This will be handled by client-side JavaScript
    console.log('Buy clicked:', product)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Tài Khoản Siêu Rẻ
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Cung cấp tài khoản premium với giá siêu rẻ, chất lượng cao
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="zalo"
                size="lg"
                className="animate-pulse-zalo"
                asChild
              >
                <a href="https://zalo.me/your-zalo" target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat Zalo Ngay
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100"
                asChild
              >
                <Link href="/danh-muc">
                  Xem Tất Cả Sản Phẩm
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-lg text-gray-600">
              Chúng tôi cam kết mang đến dịch vụ tốt nhất với giá cả hợp lý
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chất lượng cao</h3>
              <p className="text-gray-600">
                Tất cả tài khoản đều được kiểm tra kỹ lưỡng trước khi giao
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Bảo hành lâu dài</h3>
              <p className="text-gray-600">
                Cam kết bảo hành trong suốt thời gian sử dụng
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Giao hàng nhanh</h3>
              <p className="text-gray-600">
                Nhận tài khoản ngay sau khi thanh toán
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Danh mục sản phẩm
            </h2>
            <p className="text-lg text-gray-600">
              Khám phá các danh mục tài khoản premium phổ biến
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/danh-muc/${category.slug}`}
                className="bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-2xl mb-2">📱</div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Sản phẩm nổi bật
            </h2>
            <p className="text-lg text-gray-600">
              Những tài khoản premium được yêu thích nhất
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onBuyClick={handleBuyClick}
              />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/danh-muc">
                Xem Tất Cả Sản Phẩm
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Sẵn sàng mua tài khoản premium?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Liên hệ ngay để được tư vấn và hỗ trợ tốt nhất
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="zalo"
              size="lg"
              className="animate-pulse-zalo"
              asChild
            >
              <a href="https://zalo.me/your-zalo" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat Zalo Ngay
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-100"
              asChild
            >
              <a href="tel:0123456789">
                Gọi Hotline
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

