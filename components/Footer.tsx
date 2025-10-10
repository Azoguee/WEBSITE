import Link from 'next/link'
import { Facebook, Youtube, Instagram, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Thông tin */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin</h3>
            <ul className="space-y-2">
              <li><Link href="/gioi-thieu" className="text-gray-300 hover:text-white">Giới thiệu</Link></li>
              <li><Link href="/lien-he" className="text-gray-300 hover:text-white">Liên hệ</Link></li>
              <li><Link href="/dieu-khoan" className="text-gray-300 hover:text-white">Điều khoản</Link></li>
              <li><Link href="/chinh-sach" className="text-gray-300 hover:text-white">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li><Link href="/huong-dan" className="text-gray-300 hover:text-white">Hướng dẫn mua hàng</Link></li>
              <li><Link href="/faq" className="text-gray-300 hover:text-white">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          {/* Tài khoản */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tài khoản</h3>
            <ul className="space-y-2">
              <li><Link href="/dang-nhap" className="text-gray-300 hover:text-white">Đăng nhập</Link></li>
              <li><Link href="/dang-ky" className="text-gray-300 hover:text-white">Đăng ký</Link></li>
              <li><Link href="/tai-khoan" className="text-gray-300 hover:text-white">Chi tiết tài khoản</Link></li>
            </ul>
          </div>

          {/* Kết nối */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kết nối</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-300 hover:text-white"><Facebook /></Link>
              <Link href="#" className="text-gray-300 hover:text-white"><Youtube /></Link>
              <Link href="#" className="text-gray-300 hover:text-white"><Instagram /></Link>
              <Link href="#" className="text-gray-300 hover:text-white"><Twitter /></Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">© 2024 KyoSHOP. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            {/* Payment icons can be added here */}
          </div>
        </div>
      </div>
    </footer>
  )
}

