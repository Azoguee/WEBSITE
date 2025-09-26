'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Product } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { Search, Filter, SortAsc, Grid, List } from 'lucide-react'

interface CategoryPageProps {
  category: {
    id: string
    name: string
    slug: string
    description?: string
    image?: string
  }
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  searchParams: {
    page?: string
    sort?: string
    min_price?: string
    max_price?: string
    search?: string
  }
}

export function CategoryPage({ category, products, pagination, searchParams }: CategoryPageProps) {
  const router = useRouter()
  const currentSearchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleSearch = (search: string) => {
    const params = new URLSearchParams(currentSearchParams.toString())
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }
    params.delete('page') // Reset to first page
    router.push(`/danh-muc/${category.slug}?${params.toString()}`)
  }

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(currentSearchParams.toString())
    params.set('sort', sort)
    params.delete('page') // Reset to first page
    router.push(`/danh-muc/${category.slug}?${params.toString()}`)
  }

  const handlePriceFilter = (minPrice?: number, maxPrice?: number) => {
    const params = new URLSearchParams(currentSearchParams.toString())
    if (minPrice !== undefined) {
      params.set('min_price', minPrice.toString())
    } else {
      params.delete('min_price')
    }
    if (maxPrice !== undefined) {
      params.set('max_price', maxPrice.toString())
    } else {
      params.delete('max_price')
    }
    params.delete('page') // Reset to first page
    router.push(`/danh-muc/${category.slug}?${params.toString()}`)
  }

  const handleBuyClick = (product: Product) => {
    // This will be handled by client-side JavaScript
    console.log('Buy clicked:', product)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><a href="/" className="hover:text-primary-600">Trang chủ</a></li>
            <li>/</li>
            <li><a href="/danh-muc" className="hover:text-primary-600">Danh mục</a></li>
            <li>/</li>
            <li className="text-gray-900">{category.name}</li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-lg text-gray-600">{category.description}</p>
          )}
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    defaultValue={searchParams.search || ''}
                    onChange={(e) => {
                      const timeoutId = setTimeout(() => handleSearch(e.target.value), 500)
                      return () => clearTimeout(timeoutId)
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <SortAsc className="w-5 h-5 text-gray-400" />
                <select
                  value={searchParams.sort || 'newest'}
                  onChange={(e) => handleSort(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="price_asc">Giá thấp đến cao</option>
                  <option value="price_desc">Giá cao đến thấp</option>
                  <option value="name">Tên A-Z</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Bộ lọc
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá từ
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      defaultValue={searchParams.min_price || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : undefined
                        handlePriceFilter(value, searchParams.max_price ? parseFloat(searchParams.max_price) : undefined)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá đến
                    </label>
                    <input
                      type="number"
                      placeholder="1000000"
                      defaultValue={searchParams.max_price || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : undefined
                        handlePriceFilter(searchParams.min_price ? parseFloat(searchParams.min_price) : undefined, value)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        handlePriceFilter(undefined, undefined)
                        setShowFilters(false)
                      }}
                      className="w-full"
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Hiển thị {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} trong {pagination.total} sản phẩm
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {products.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                onBuyClick={handleBuyClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
            <Button
              variant="outline"
              onClick={() => router.push(`/danh-muc/${category.slug}`)}
              className="mt-4"
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => {
                  const params = new URLSearchParams(currentSearchParams.toString())
                  params.set('page', (pagination.page - 1).toString())
                  router.push(`/danh-muc/${category.slug}?${params.toString()}`)
                }}
              >
                Trước
              </Button>
              
              {[...Array(pagination.pages)].map((_: any, i: number) => {
                const page = i + 1
                const isCurrentPage = page === pagination.page
                
                return (
                  <Button
                    key={page}
                    variant={isCurrentPage ? "default" : "outline"}
                    onClick={() => {
                      const params = new URLSearchParams(currentSearchParams.toString())
                      params.set('page', page.toString())
                      router.push(`/danh-muc/${category.slug}?${params.toString()}`)
                    }}
                    className="w-10"
                  >
                    {page}
                  </Button>
                )
              })}
              
              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => {
                  const params = new URLSearchParams(currentSearchParams.toString())
                  params.set('page', (pagination.page + 1).toString())
                  router.push(`/danh-muc/${category.slug}?${params.toString()}`)
                }}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

