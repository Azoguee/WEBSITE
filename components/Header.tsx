'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Menu, X, Search, ShoppingCart, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/danh-muc', label: 'Danh mục' },
    { href: '/khuyen-mai', label: 'Khuyến mãi' },
    { href: '/lien-he', label: 'Liên hệ' },
  ]

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-3xl font-bold text-primary-600">
              KyoSHOP
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search, Cart, Account */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Tìm kiếm..."
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <Button variant="ghost" size="icon">
              <ShoppingCart className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-6 h-6" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 ease-in-out',
          isMenuOpen ? 'max-h-screen py-4 border-t' : 'max-h-0'
        )}
      >
        <nav className="flex flex-col space-y-4 px-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-medium text-gray-700 hover:text-primary-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="relative pt-4">
            <Input
              type="search"
              placeholder="Tìm kiếm..."
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-center space-x-4 pt-4">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="w-7 h-7" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-7 h-7" />
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}

