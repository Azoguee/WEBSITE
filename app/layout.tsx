import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LayoutProvider } from '@/components/LayoutProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KyoSHOP - Tài khoản premium giá rẻ',
  description: 'Cung cấp tài khoản premium Netflix, ChatGPT, Spotify và nhiều dịch vụ khác với giá siêu rẻ. Chất lượng cao, bảo hành lâu dài.',
  keywords: 'tài khoản premium, netflix, chatgpt, spotify, tài khoản giá rẻ',
  authors: [{ name: 'KyoSHOP' }],
  creator: 'KyoSHOP',
  publisher: 'KyoSHOP',
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'KyoSHOP - Tài khoản premium giá rẻ',
    description: 'Cung cấp tài khoản premium Netflix, ChatGPT, Spotify và nhiều dịch vụ khác với giá siêu rẻ.',
    url: '/',
    siteName: 'KyoSHOP',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'KyoSHOP',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <LayoutProvider>{children}</LayoutProvider>
      </body>
    </html>
  )
}
