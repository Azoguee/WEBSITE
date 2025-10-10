'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { FloatingZaloButton } from '@/components/FloatingZaloButton'
import { CartDrawer } from '@/components/CartDrawer'
import { Toaster } from 'react-hot-toast'

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false)

  // In a real app, you'd have a cart context or state management here
  // For now, we'll just pass down the handlers.

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <FloatingZaloButton />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <Toaster position="top-right" />
    </>
  )
}
