import { PrismaClient } from '@prisma/client'
import { importProductsFromCSV, parseCSVFile } from '../lib/csv-import'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  await prisma.adminUser.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
    },
  })

  console.log('✅ Admin user created')

  // Import products from CSV
  try {
    const csvData = await parseCSVFile('./pricing_clean.csv')
    console.log(`📊 Found ${csvData.length} rows in CSV`)
    
    const result = await importProductsFromCSV(csvData)
    console.log(`✅ Imported ${result.success} products`)
    
    if (result.errors.length > 0) {
      console.log(`⚠️ ${result.errors.length} errors:`)
      result.errors.forEach(error => console.log(`  - ${error}`))
    }
  } catch (error) {
    console.log('❌ Error importing CSV:', error)
  }

  // Create some default pages
  await prisma.page.upsert({
    where: { slug: 'lien-he' },
    update: {},
    create: {
      title: 'Liên Hệ',
      slug: 'lien-he',
      content: `
        <h1>Liên Hệ Với Chúng Tôi</h1>
        <p>Để được hỗ trợ tốt nhất, vui lòng liên hệ qua Zalo hoặc hotline.</p>
        <p><strong>Hotline:</strong> 0123.456.789</p>
        <p><strong>Zalo:</strong> <a href="https://zalo.me/your-zalo">Chat ngay</a></p>
      `,
      metaTitle: 'Liên Hệ - Tài Khoản Siêu Rẻ',
      metaDescription: 'Liên hệ với chúng tôi để được hỗ trợ mua tài khoản premium',
      isActive: true,
      sortOrder: 1,
    },
  })

  await prisma.page.upsert({
    where: { slug: 'chinh-sach' },
    update: {},
    create: {
      title: 'Chính Sách',
      slug: 'chinh-sach',
      content: `
        <h1>Chính Sách</h1>
        <h2>Chính sách bảo hành</h2>
        <p>Chúng tôi cam kết bảo hành tất cả tài khoản trong thời gian sử dụng.</p>
        
        <h2>Chính sách hoàn tiền</h2>
        <p>Hoàn tiền 100% nếu tài khoản không hoạt động trong 24h đầu.</p>
        
        <h2>Chính sách bảo mật</h2>
        <p>Thông tin khách hàng được bảo mật tuyệt đối.</p>
      `,
      metaTitle: 'Chính Sách - Tài Khoản Siêu Rẻ',
      metaDescription: 'Chính sách bảo hành, hoàn tiền và bảo mật',
      isActive: true,
      sortOrder: 2,
    },
  })

  console.log('✅ Default pages created')

  // Create settings
  const settings = [
    { key: 'site_name', value: 'Tài Khoản Siêu Rẻ', type: 'string' },
    { key: 'site_description', value: 'Cung cấp tài khoản premium với giá siêu rẻ', type: 'string' },
    { key: 'zalo_oa_link', value: 'https://zalo.me/your-zalo-oa', type: 'string' },
    { key: 'hotline', value: '0123.456.789', type: 'string' },
    { key: 'google_analytics_id', value: '', type: 'string' },
    { key: 'facebook_pixel_id', value: '', type: 'string' },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('✅ Settings created')
  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

