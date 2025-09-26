# Website Bán Hàng Online - Tài Khoản Siêu Rẻ

Website bán hàng online với tích hợp Zalo chat, không thanh toán trên web. Khi người dùng bấm "Mua", website sẽ mở chat Zalo và ghi nhận lead trong backend.

## Tính năng chính

- 🛒 **Giao diện bán hàng**: Trang chủ, danh mục, chi tiết sản phẩm
- 💬 **Tích hợp Zalo**: Deeplink mở chat Zalo với prefill message
- 📊 **Ghi nhận Lead**: Tự động tạo lead trước khi chuyển sang Zalo
- 📈 **Analytics**: Tracking Google Analytics, Facebook Pixel, Zalo Ads
- 🔧 **Admin Panel**: Quản lý sản phẩm, leads, dashboard
- 📱 **Responsive**: Tối ưu cho mobile và desktop
- 🚀 **SEO**: Meta tags, sitemap, structured data
- ⚡ **Performance**: Core Web Vitals tối ưu

## Công nghệ sử dụng

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite với Prisma ORM
- **UI Components**: Custom components với Lucide icons
- **Analytics**: Google Analytics 4, Facebook Pixel
- **Deployment**: Vercel/Netlify ready

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd ecommerce-zalo-website
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Thiết lập environment variables

Copy file `.env.example` thành `.env` và cập nhật các giá trị:

```bash
cp env.example .env
```

Cập nhật các giá trị trong `.env`:

```env
# Database
DATABASE_URL="file:./dev.db"

# App Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Zalo Configuration
ZALO_OA_ID="your-zalo-oa-id"
ZALO_OA_LINK="https://zalo.me/your-zalo-oa-link"

# Analytics
GOOGLE_ANALYTICS_ID="GA_MEASUREMENT_ID"
FACEBOOK_PIXEL_ID="your-facebook-pixel-id"
ZALO_ADS_CONVERSION_ID="your-zalo-ads-conversion-id"

# Admin
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

# Site Configuration
SITE_NAME="Tài Khoản Siêu Rẻ"
SITE_URL="https://your-domain.com"
SITE_DESCRIPTION="Cung cấp tài khoản premium với giá siêu rẻ"
```

### 4. Khởi tạo database

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Import dữ liệu từ CSV
npm run db:seed
```

### 5. Chạy development server

```bash
npm run dev
```

Website sẽ chạy tại `http://localhost:3000`

## Cấu trúc dự án

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── danh-muc/          # Category pages
│   ├── san-pham/          # Product pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI components
│   ├── Header.tsx        # Header component
│   ├── Footer.tsx        # Footer component
│   ├── ProductCard.tsx   # Product card
│   └── ProductDetail.tsx # Product detail
├── lib/                  # Utilities
│   ├── db.ts            # Database connection
│   ├── utils.ts         # Utility functions
│   └── csv-import.ts    # CSV import logic
├── prisma/              # Database schema
│   ├── schema.prisma   # Prisma schema
│   └── seed.ts         # Database seed
├── scripts/            # Scripts
│   └── import-csv.ts   # CSV import script
└── types/              # TypeScript types
    └── index.ts        # Type definitions
```

## API Endpoints

### Leads API

- `POST /api/leads` - Tạo lead mới
- `GET /api/leads` - Lấy danh sách leads (admin)
- `PATCH /api/leads/[id]` - Cập nhật lead
- `DELETE /api/leads/[id]` - Xóa lead

### Analytics API

- `POST /api/analytics` - Gửi analytics event
- `GET /api/analytics` - Lấy analytics data

## Flow "Mua → Zalo"

1. **User bấm nút "Mua/Chat Zalo"**
2. **Tạo Lead**: API `/api/leads` tạo lead với status "pending_chat"
3. **Build Zalo Link**: Tạo deeplink Zalo với prefill message
4. **Open Zalo**: Mở Zalo app hoặc web với message đã điền sẵn
5. **Track Analytics**: Gửi event "click_chat_zalo" đến analytics

### Zalo Message Format

```
Mình muốn mua: {product_name} (SKU: {sku}) – Giá: {price} – Gói: {variant} – Từ: {source_page} – Ref: {order_ref}
```

## Admin Panel

Truy cập `/admin` để quản lý:

- **Dashboard**: Tổng quan leads, doanh thu, tỷ lệ chuyển đổi
- **Leads Management**: Xem, lọc, cập nhật trạng thái leads
- **Export**: Xuất leads ra CSV
- **Analytics**: Theo dõi hiệu suất

## SEO Features

- **Meta Tags**: Dynamic meta tags cho từng trang
- **Sitemap**: Auto-generated sitemap.xml
- **Robots.txt**: SEO-friendly robots.txt
- **Structured Data**: Schema.org Product markup
- **Open Graph**: Social media sharing optimization

## Analytics Integration

### Google Analytics 4
```javascript
gtag('event', 'click_chat_zalo', {
  product_id: 'product-123',
  product_name: 'Netflix Premium',
  value: 150000,
  currency: 'VND'
});
```

### Facebook Pixel
```javascript
fbq('track', 'InitiateCheckout', {
  content_ids: ['product-123'],
  content_type: 'product',
  value: 150000,
  currency: 'VND'
});
```

### Zalo Ads
```javascript
// Zalo Ads conversion tracking
zaloAds.track('purchase', {
  value: 150000,
  currency: 'VND'
});
```

## Performance Optimization

- **Image Optimization**: Next.js Image component với WebP
- **Code Splitting**: Dynamic imports cho admin pages
- **Caching**: Static generation cho product pages
- **CDN**: Vercel Edge Network
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1

## Deployment

### Vercel (Recommended)

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Monitoring & Analytics

- **Google Analytics**: Traffic và conversion tracking
- **Facebook Pixel**: Retargeting và lookalike audiences
- **Zalo Ads**: Conversion tracking cho Zalo campaigns
- **Admin Dashboard**: Real-time leads và revenue tracking

## Troubleshooting

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npm run db:push
npm run db:seed
```

### Import CSV Issues
```bash
# Manual CSV import
npx tsx scripts/import-csv.ts
```

### Performance Issues
- Check Core Web Vitals trong Google Search Console
- Optimize images với Next.js Image component
- Enable compression và caching

## Support

- **Documentation**: Xem code comments và README
- **Issues**: Tạo GitHub issue cho bugs
- **Features**: Tạo feature request

## License

MIT License - Xem file LICENSE để biết thêm chi tiết.

