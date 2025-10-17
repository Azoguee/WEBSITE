'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, X } from 'lucide-react'

export function FloatingZaloButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    // Show button after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isMinimized ? (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Cần hỗ trợ?</h3>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Chat Zalo để được tư vấn và hỗ trợ mua hàng
          </p>
          <Button
            variant="default"
            size="sm"
            className="w-full animate-pulse-zalo"
            asChild
          >
            <a href="https://zalo.me/your-zalo" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat Zalo
            </a>
          </Button>
        </div>
      ) : (
        <Button
          variant="default"
          size="lg"
          className="rounded-full w-14 h-14 animate-pulse-zalo"
          onClick={() => setIsMinimized(false)}
          asChild
        >
          <a href="https://zalo.me/your-zalo" target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-6 h-6" />
          </a>
        </Button>
      )}
    </div>
  )
}

