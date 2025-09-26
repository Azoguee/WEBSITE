import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, Phone, Mail, MapPin, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Liên hệ - Tài Khoản Siêu Rẻ',
  description: 'Liên hệ với chúng tôi để được hỗ trợ mua tài khoản premium. Hotline, Zalo, email hỗ trợ 24/7.',
  keywords: 'liên hệ, hỗ trợ, hotline, zalo, tài khoản siêu rẻ',
  openGraph: {
    title: 'Liên hệ - Tài Khoản Siêu Rẻ',
    description: 'Liên hệ với chúng tôi để được hỗ trợ mua tài khoản premium.',
  },
  alternates: {
    canonical: '/lien-he',
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-lg text-gray-600">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-zalo-500" />
                  Chat Zalo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Cách nhanh nhất để liên hệ với chúng tôi
                </p>
                <Button
                  variant="zalo"
                  size="lg"
                  className="w-full animate-pulse-zalo"
                  asChild
                >
                  <a href="https://zalo.me/your-zalo" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat Zalo Ngay
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-green-500" />
                  Hotline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Gọi điện trực tiếp để được tư vấn
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <a href="tel:0123456789">
                    <Phone className="w-5 h-5 mr-2" />
                    0123.456.789
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-blue-500" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Gửi email để được hỗ trợ chi tiết
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <a href="mailto:support@example.com">
                    <Mail className="w-5 h-5 mr-2" />
                    support@example.com
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Gửi tin nhắn</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nhập email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tin nhắn
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nhập tin nhắn của bạn"
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Gửi tin nhắn
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Business Hours */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Giờ làm việc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Hỗ trợ khách hàng</h3>
                <p className="text-gray-600">24/7 - Luôn sẵn sàng hỗ trợ</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Giao hàng</h3>
                <p className="text-gray-600">Ngay sau khi thanh toán</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

