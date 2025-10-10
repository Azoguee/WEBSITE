import { prisma } from '@/lib/db'
export const dynamic = 'force-dynamic'
import { CategoryGrid } from '@/components/CategoryGrid'
import { Metadata } from 'next'

async function getCategories() {
  return await prisma.category.findMany({
    include: {
      products: {
        where: {
          isActive: true,
        },
        take: 4,
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })
}

export const metadata: Metadata = {
  title: 'Danh mục sản phẩm - Tài Khoản Siêu Rẻ',
  description: 'Khám phá tất cả danh mục tài khoản premium với giá siêu rẻ. Netflix, ChatGPT, Spotify và nhiều dịch vụ khác.',
  keywords: 'danh mục, tài khoản premium, netflix, chatgpt, spotify, tài khoản siêu rẻ',
  openGraph: {
    title: 'Danh mục sản phẩm - Tài Khoản Siêu Rẻ',
    description: 'Khám phá tất cả danh mục tài khoản premium với giá siêu rẻ.',
  },
  alternates: {
    canonical: '/danh-muc',
  },
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Danh mục sản phẩm</h1>
          <p className="text-lg text-gray-600">
            Khám phá tất cả danh mục tài khoản premium với giá siêu rẻ
          </p>
        </div>

        <CategoryGrid categories={categories} />
      </div>
    </div>
  )
}

