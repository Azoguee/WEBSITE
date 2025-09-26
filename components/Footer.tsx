import Link from 'next/link'
import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Tài Khoản Siêu Rẻ</h3>
            <p className="text-gray-300 mb-4">
              Cung cấp tài khoản premium với giá siêu rẻ, chất lượng cao.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://zalo.me/your-zalo"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zalo-500 hover:bg-zalo-600 text-white p-2 rounded-full transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="tel:0123456789"
                className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/danh-muc" className="text-gray-300 hover:text-white transition-colors">
                  Danh mục
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="text-gray-300 hover:text-white transition-colors">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach" className="text-gray-300 hover:text-white transition-colors">
                  Chính sách
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Danh mục</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/danh-muc/app-ai" className="text-gray-300 hover:text-white transition-colors">
                  App AI
                </Link>
              </li>
              <li>
                <Link href="/danh-muc/giai-tri" className="text-gray-300 hover:text-white transition-colors">
                  Giải trí
                </Link>
              </li>
              <li>
                <Link href="/danh-muc/cong-viec" className="text-gray-300 hover:text-white transition-colors">
                  Công việc
                </Link>
              </li>
              <li>
                <Link href="/danh-muc/hoc-tap" className="text-gray-300 hover:text-white transition-colors">
                  Học tập
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-zalo-500" />
                <span className="text-gray-300">0123.456.789</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-3 text-zalo-500" />
                <a
                  href="https://zalo.me/your-zalo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Chat Zalo
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-gray-500" />
                <span className="text-gray-300">support@example.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Tài Khoản Siêu Rẻ. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/chinh-sach" className="text-gray-400 hover:text-white text-sm transition-colors">
                Chính sách bảo mật
              </Link>
              <Link href="/dieu-khoan" className="text-gray-400 hover:text-white text-sm transition-colors">
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

