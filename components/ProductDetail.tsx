'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import { formatPrice, buildZaloLink, generateOrderRef } from '@/lib/utils'
import { MessageCircle, Star, Shield, Truck, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface ProductDetailProps {
  product: Product & {
    category: any
    variants: any[]
  }
  relatedProducts: Product[]
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.find(v => v.isDefault) || product.variants?.[0]
  )
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const isOutOfStock = product.status === 'out_of_stock'
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const finalPrice = selectedVariant?.price || product.price

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
          price: finalPrice,
          variant: selectedVariant?.name,
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
              value: finalPrice,
              currency: 'VND',
              variant: selectedVariant?.name,
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
          <li>/</li>
          <li><Link href={`/danh-muc/${product.category?.slug}`} className="hover:text-primary-600">{product.category?.name}</Link></li>
          <li>/</li>
          <li className="text-gray-900">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-lg">Không có ảnh</span>
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((image, index) => (
                <div key={index} className="aspect-square bg-white rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
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
                {formatPrice(finalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.originalPrice!)}
                </span>
              )}
              {hasDiscount && (
                <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                  -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
                </span>
              )}
            </div>

            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Chọn gói:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{variant.name}</div>
                      <div className="text-sm text-gray-600">{formatPrice(variant.price)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

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

      {/* Product Description */}
      {product.description && (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Mô tả sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </CardContent>
        </Card>
      )}

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

