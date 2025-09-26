'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Search, MessageCircle, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  categories?: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function Header({ categories = [] }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">
              Tài Khoản Siêu Rẻ
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Trang chủ
            </Link>
            
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/danh-muc/${category.slug}`}
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                {category.name}
              </Link>
            ))}
            
            <Link href="/lien-he" className="text-gray-700 hover:text-primary-600 transition-colors">
              Liên hệ
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-4 h-4" />
            </Button>
            
            <Button
              variant="zalo"
              size="sm"
              asChild
            >
              <a href="https://zalo.me/your-zalo" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat Zalo
              </a>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href="tel:0123456789">
                <Phone className="w-4 h-4 mr-2" />
                Hotline
              </a>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t">
            <nav className="py-4 space-y-4">
              <Link
                href="/"
                className="block text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Trang chủ
              </Link>
              
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/danh-muc/${category.slug}`}
                  className="block text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              
              <Link
                href="/lien-he"
                className="block text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Liên hệ
              </Link>
              
              <div className="pt-4 space-y-2">
                <Button
                  variant="zalo"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a href="https://zalo.me/your-zalo" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat Zalo
                  </a>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <a href="tel:0123456789">
                    <Phone className="w-4 h-4 mr-2" />
                    Hotline
                  </a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

