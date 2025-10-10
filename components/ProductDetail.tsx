'use client'

import { useState } from 'react'
import { Product, Category } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import { generateOrderRef } from '@/lib/utils'
import { MessageCircle, Star, Shield, Truck, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface ProductDetailProps {
  product: Product & { category?: Category | null }
  relatedProducts: Product[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK';

  const handleBuyClick = async () => {
    if (isOutOfStock) {
      toast.error('Sản phẩm đã hết hàng')
      return
    }

    setIsLoading(true)
    
    try {
      // Create lead
      const orderRef = generateOrderRef()
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: product.priceVnd,
          quantity,
          sessionId: sessionStorage.getItem('sessionId') || null,
          landingUrl: window.location.href,
          referrer: document.referrer,
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        // Track analytics
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'click_chat_zalo',
            parameters: {
              product_id: product.id,
              product_name: product.name,
              value: product.priceVnd,
              currency: 'VND',
              source_page: window.location.href,
              order_ref: result.lead.orderRef,
            },
          }),
        })

        // Open Zalo
        window.open(result.lead.zaloLink, '_blank')
        toast.success('Đang chuyển đến Zalo...')
      } else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li><Link href="/" className="hover:text-primary-600">Trang chủ</Link></li>
          <li>/</li>
          <li><Link href="/danh-muc" className="hover:text-primary-600">Danh mục</Link></li>
          {product.category && (
            <>
              <li>/</li>
              <li><Link href={`/danh-muc/${product.category.name}`} className="hover:text-primary-600">{product.category.name}</Link></li>
            </>
          )}
          <li>/</li>
          <li className="text-gray-900">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images Placeholder */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-lg overflow-hidden">
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-lg">Không có ảnh</span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">(4.9/5)</span>
              </div>
              <span className="text-sm text-gray-500">SKU: {product.sku}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary-600">
                {product.priceVnd
                  ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.priceVnd)
                  : product.priceNote || 'Liên hệ'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <label className="text-sm font-medium mr-2">Số lượng:</label>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="zalo"
              size="lg"
              className="w-full animate-pulse-zalo"
              onClick={handleBuyClick}
              disabled={isOutOfStock || isLoading}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              {isLoading ? 'Đang xử lý...' : isOutOfStock ? 'Hết hàng' : 'Chat Zalo Mua Ngay'}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              asChild
            >
              <a href="tel:0123456789">
                Gọi Hotline: 0123.456.789
              </a>
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">Bảo hành lâu dài</span>
            </div>
            <div className="flex items-center">
              <Truck className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-sm">Giao hàng nhanh</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">Chất lượng cao</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onBuyClick={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}