import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Chính sách - Tài Khoản Siêu Rẻ',
  description: 'Chính sách bảo hành, hoàn tiền và bảo mật của Tài Khoản Siêu Rẻ. Cam kết chất lượng và dịch vụ tốt nhất.',
  keywords: 'chính sách, bảo hành, hoàn tiền, bảo mật, tài khoản siêu rẻ',
  openGraph: {
    title: 'Chính sách - Tài Khoản Siêu Rẻ',
    description: 'Chính sách bảo hành, hoàn tiền và bảo mật của Tài Khoản Siêu Rẻ.',
  },
  alternates: {
    canonical: '/chinh-sach',
  },
}

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Chính sách</h1>
          <p className="text-lg text-gray-600">
            Chúng tôi cam kết mang đến dịch vụ tốt nhất với chính sách rõ ràng
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Chính sách bảo hành</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h3>Cam kết bảo hành</h3>
              <ul>
                <li>Tất cả tài khoản đều được bảo hành trong suốt thời gian sử dụng</li>
                <li>Nếu tài khoản bị lỗi, chúng tôi sẽ thay thế miễn phí</li>
                <li>Hỗ trợ kỹ thuật 24/7 qua Zalo và hotline</li>
                <li>Cam kết chất lượng tài khoản chính chủ</li>
              </ul>

              <h3>Điều kiện bảo hành</h3>
              <ul>
                <li>Tài khoản được sử dụng đúng mục đích</li>
                <li>Không chia sẻ thông tin tài khoản với người khác</li>
                <li>Báo cáo lỗi trong vòng 24h</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chính sách hoàn tiền</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h3>Hoàn tiền 100%</h3>
              <ul>
                <li>Hoàn tiền 100% nếu tài khoản không hoạt động trong 24h đầu</li>
                <li>Hoàn tiền 50% nếu tài khoản bị lỗi sau 7 ngày</li>
                <li>Thời gian xử lý hoàn tiền: 1-3 ngày làm việc</li>
              </ul>

              <h3>Điều kiện hoàn tiền</h3>
              <ul>
                <li>Không sử dụng tài khoản sau khi nhận</li>
                <li>Báo cáo lỗi trong thời gian quy định</li>
                <li>Cung cấp đầy đủ thông tin giao dịch</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chính sách bảo mật</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h3>Bảo mật thông tin</h3>
              <ul>
                <li>Thông tin khách hàng được bảo mật tuyệt đối</li>
                <li>Không chia sẻ thông tin với bên thứ ba</li>
                <li>Sử dụng mã hóa SSL cho tất cả giao dịch</li>
                <li>Tuân thủ quy định bảo vệ dữ liệu cá nhân</li>
              </ul>

              <h3>Bảo mật thanh toán</h3>
              <ul>
                <li>Thông tin thanh toán được mã hóa</li>
                <li>Không lưu trữ thông tin thẻ tín dụng</li>
                <li>Sử dụng cổng thanh toán uy tín</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chính sách giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h3>Thời gian giao hàng</h3>
              <ul>
                <li>Giao hàng ngay sau khi thanh toán</li>
                <li>Thời gian giao hàng: 5-15 phút</li>
                <li>Giao hàng 24/7, kể cả cuối tuần</li>
              </ul>

              <h3>Phương thức giao hàng</h3>
              <ul>
                <li>Gửi thông tin tài khoản qua Zalo</li>
                <li>Gửi email với hướng dẫn chi tiết</li>
                <li>Hỗ trợ cài đặt và hướng dẫn sử dụng</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liên hệ hỗ trợ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Zalo</h3>
                  <p className="text-gray-600">Chat trực tiếp để được hỗ trợ nhanh nhất</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Hotline</h3>
                  <p className="text-gray-600">0123.456.789 - Hỗ trợ 24/7</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

