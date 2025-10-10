'use client'

import { Product } from '@/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

interface ProductCardProps {
  product: Product
  onBuyClick: (product: Product) => void
}

export function ProductCard({ product, onBuyClick }: ProductCardProps) {
  const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK';
  const linkHref = product.sku ? `/san-pham/${product.sku}` : '#';

  const renderPrice = () => {
    if (product.priceVnd) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(product.priceVnd);
    }
    return product.priceNote || 'Liên hệ';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link href={linkHref}>
        <CardHeader className="p-0">
          <div className="relative aspect-square overflow-hidden">
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">Không có ảnh</span>
            </div>
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Hết hàng
                </span>
              </div>
            )}
          </div>
        </CardHeader>
      </Link>

      <CardContent className="p-4">
        <Link href={linkHref}>
          <CardTitle className="text-lg font-semibold line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </CardTitle>
        </Link>
        
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-600">
              {renderPrice()}
            </span>
          </div>
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
            disabled={!product.sku}
          >
            <Link href={linkHref}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Chi tiết
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}