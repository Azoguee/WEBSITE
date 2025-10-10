'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart, X } from 'lucide-react'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Giỏ hàng</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6" />
          </Button>
        </div>
        <div className="flex-grow p-6 overflow-y-auto">
          {/* Placeholder for cart items */}
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ShoppingCart className="w-16 h-16 mb-4" />
            <p>Giỏ hàng của bạn đang trống.</p>
          </div>
        </div>
        <div className="p-6 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Tổng cộng:</span>
            <span className="text-xl font-bold">0đ</span>
          </div>
          <Button size="lg" className="w-full">
            Thanh toán
          </Button>
        </div>
      </div>
    </div>
  )
}
