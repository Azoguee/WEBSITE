import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { Product } from '@/types'

interface CategoryGridProps {
  categories: Array<{
    id: string
    name: string
    products: Product[]
  }>
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Card key={category.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">{category.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {category.products && category.products.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {category.products.slice(0, 3).map((product) => (
                      <div key={product.id} className="flex justify-between items-center text-sm">
                        <span className="truncate">{product.name}</span>
                        <span className="font-medium text-primary-600">
                          {product.priceVnd
                            ? new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(product.priceVnd)
                            : product.priceNote || 'Liên hệ'}
                        </span>
                      </div>
                    ))}
                  </div>
                  {category.products.length > 3 && (
                    <p className="text-sm text-gray-500">
                      +{category.products.length - 3} sản phẩm khác
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-sm">Chưa có sản phẩm</p>
              )}
              
              <Button asChild className="w-full">
                <Link href={`/danh-muc/${category.name}`}>
                  Xem tất cả
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}