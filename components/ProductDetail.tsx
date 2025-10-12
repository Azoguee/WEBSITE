'use client'

import { useState } from 'react'
import { Product, Category } from '@/types'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import { Star, Shield, Truck, CheckCircle, ShoppingCart, Zap, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ProductDetailProps {
  product: Product & { category?: Category | null }
  relatedProducts: Product[]
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

const StarRating = ({ rating, reviewCount }: { rating: number, reviewCount?: number }) => {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 !== 0
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
        {halfStar && <Star key="half" className="w-5 h-5 text-yellow-400" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
        ))}
      </div>
      {reviewCount && (
        <span className="text-sm text-gray-500">({reviewCount} đánh giá)</span>
      )}
    </div>
  )
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [activeImage, setActiveImage] = useState(product.images ? product.images.split(',')[0] : null)

  const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Gallery */}
        <div>
          <div className="aspect-w-1 aspect-h-1 w-full bg-gray-100 rounded-lg overflow-hidden mb-4">
            {activeImage ? (
              <Image
                src={activeImage}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-24 h-24 text-gray-300" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {product.images?.split(',').map((image, index) => (
              <button
                key={index}
                className={cn(
                  'aspect-w-1 aspect-h-1 w-full bg-gray-100 rounded-md overflow-hidden transition-all',
                  activeImage === image ? 'ring-2 ring-primary-500' : 'hover:opacity-80'
                )}
                onClick={() => setActiveImage(image)}
              >
                <Image
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              {product.rating && <StarRating rating={product.rating} reviewCount={123} />}
              <span className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg my-6">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-red-600">
                {product.priceVnd ? formatCurrency(product.priceVnd) : 'Liên hệ'}
              </span>
              {product.oldPrice && (
                <span className="text-xl text-gray-500 line-through">
                  {formatCurrency(product.oldPrice)}
                </span>
              )}
            </div>
            {product.discount && (
              <p className="text-green-600 font-medium mt-2">Tiết kiệm: {product.discount}</p>
            )}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary-600" />
                <span className="text-sm">Bảo hành uy tín</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-6 h-6 text-primary-600" />
                <span className="text-sm">Giao hàng tức thì</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 my-6">
            <label className="text-sm font-medium">Số lượng:</label>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                -
              </button>
              <span className="px-6 py-2 border-x">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            <Button size="lg" disabled={isOutOfStock}>
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
            </Button>
            <Button size="lg" variant="outline" disabled={isOutOfStock}>
              <Zap className="w-5 h-5 mr-2" />
              Mua ngay
            </Button>
          </div>
        </div>
      </div>

      {/* Description and Related Products */}
      <div className="mt-16">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              className={cn(
                'py-4 px-1 border-b-2 font-medium text-lg',
                activeTab === 'description'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
              onClick={() => setActiveTab('description')}
            >
              Mô tả sản phẩm
            </button>
          </nav>
        </div>
        <div className="py-8">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <p>{product.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
            </div>
          )}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}