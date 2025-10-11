'use client'

import { Product } from '@/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Star, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product;
  onBuyClick?: (product: Product) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 !== 0
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-current" />
      ))}
      {halfStar && <Star key="half" className="w-4 h-4 text-yellow-400" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      ))}
    </div>
  )
}

export function ProductCard({ product, onBuyClick }: ProductCardProps) {
  const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK'
  const linkHref = product.sku ? `/san-pham/${product.sku}` : '#'

  return (
    <Card className="group flex flex-col h-full bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <Link href={linkHref} className="flex-shrink-0">
        <CardHeader className="p-0">
          <div className="relative aspect-w-1 aspect-h-1 w-full overflow-hidden">
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-300" />
            </div>
            {product.discount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                {product.discount}
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Hết hàng
                </span>
              </div>
            )}
          </div>
        </CardHeader>
      </Link>

      <CardContent className="p-4 flex-grow">
        <Link href={linkHref}>
          <CardTitle className="text-base font-semibold text-gray-800 line-clamp-2 h-12 hover:text-primary-600 transition-colors">
            {product.name}
          </CardTitle>
        </Link>

        <div className="mt-2">
          {product.rating && <StarRating rating={product.rating} />}
        </div>
        
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-red-600">
              {product.priceVnd ? formatCurrency(product.priceVnd) : 'Liên hệ'}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto">
        <Button
          size="sm"
          className="w-full"
          disabled={isOutOfStock}
          onClick={() => onBuyClick && onBuyClick(product)}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
        </Button>
      </CardFooter>
    </Card>
  )
}