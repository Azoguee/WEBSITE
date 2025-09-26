'use client'

import { Product } from '@/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { ShoppingCart, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
  onBuyClick: (product: Product) => void
}

export function ProductCard({ product, onBuyClick }: ProductCardProps) {
  const isOutOfStock = product.status === 'out_of_stock'
  const hasDiscount = product.originalPrice && product.originalPrice > product.price

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link href={`/san-pham/${product.slug}`}>
        <CardHeader className="p-0">
          <div className="relative aspect-square overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">Không có ảnh</span>
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Hết hàng
                </span>
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
              </div>
            )}
          </div>
        </CardHeader>
      </Link>

      <CardContent className="p-4">
        <Link href={`/san-pham/${product.slug}`}>
          <CardTitle className="text-lg font-semibold line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </CardTitle>
        </Link>
        
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>
          {product.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="w-full flex gap-2">
          <Button
            variant="zalo"
            size="sm"
            className="flex-1"
            onClick={() => onBuyClick(product)}
            disabled={isOutOfStock}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {isOutOfStock ? 'Hết hàng' : 'Chat Zalo'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <Link href={`/san-pham/${product.slug}`}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Chi tiết
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}