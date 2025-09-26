import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { FloatingZaloButton } from '@/components/FloatingZaloButton'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tài Khoản Siêu Rẻ - Cung cấp tài khoản premium với giá siêu rẻ',
  description: 'Cung cấp tài khoản premium Netflix, ChatGPT, Spotify và nhiều dịch vụ khác với giá siêu rẻ. Chất lượng cao, bảo hành lâu dài.',
  keywords: 'tài khoản premium, netflix, chatgpt, spotify, tài khoản siêu rẻ, tài khoản giá rẻ',
  authors: [{ name: 'Tài Khoản Siêu Rẻ' }],
  creator: 'Tài Khoản Siêu Rẻ',
  publisher: 'Tài Khoản Siêu Rẻ',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Tài Khoản Siêu Rẻ - Cung cấp tài khoản premium với giá siêu rẻ',
    description: 'Cung cấp tài khoản premium Netflix, ChatGPT, Spotify và nhiều dịch vụ khác với giá siêu rẻ. Chất lượng cao, bảo hành lâu dài.',
    url: '/',
    siteName: 'Tài Khoản Siêu Rẻ',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tài Khoản Siêu Rẻ',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tài Khoản Siêu Rẻ - Cung cấp tài khoản premium với giá siêu rẻ',
    description: 'Cung cấp tài khoản premium Netflix, ChatGPT, Spotify và nhiều dịch vụ khác với giá siêu rẻ.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        {/* Google Analytics */}
        {process.env.GOOGLE_ANALYTICS_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.GOOGLE_ANALYTICS_ID}');
                `,
              }}
            />
          </>
        )}

        {/* Facebook Pixel */}
        {process.env.FACEBOOK_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.FACEBOOK_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}

        {/* Zalo Ads */}
        {process.env.ZALO_ADS_CONVERSION_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var zaloAds = document.createElement('script');
                  zaloAds.type = 'text/javascript';
                  zaloAds.async = true;
                  zaloAds.src = 'https://ads.zalo.me/ads/conv.js';
                  var s = document.getElementsByTagName('script')[0];
                  s.parentNode.insertBefore(zaloAds, s);
                })();
              `,
            }}
          />
        )}
      </head>
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <FloatingZaloButton />
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
