import { PrismaClient } from '@prisma/client'
import { parseCSVPrice, generateSlug } from '../lib/utils'
import fs from 'fs'
import csv from 'csv-parser'

const prisma = new PrismaClient()

interface CSVRow {
  [key: string]: string
}

async function parseCSVFile(filePath: string): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    const results: CSVRow[] = []
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: CSVRow) => {
        // Clean and normalize data
        const cleanData: CSVRow = {}
        for (const [key, value] of Object.entries(data)) {
          if (value && typeof value === 'string') {
            cleanData[key.trim()] = value.trim()
          } else {
            cleanData[key.trim()] = value
          }
        }
        results.push(cleanData)
      })
      .on('end', () => {
        resolve(results)
      })
      .on('error', (error: any) => {
        reject(error)
      })
  })
}

async function importProductsFromCSV(csvData: CSVRow[]): Promise<{
  success: number;
  errors: string[];
}> {
  const errors: string[] = []
  let successCount = 0

  try {
    // Create categories first
    const categories = new Set<string>()
    const categoryMap = new Map<string, string>()

    // Extract categories from CSV data
    for (const row of csvData) {
      // Look for category in different columns
      const categoryName = row['bang_gia'] || row['SẢN PHẨM'] || row['category']
      if (categoryName && categoryName.trim() && !categoryName.includes('BEST SELLER') && !categoryName.includes('GÓI')) {
        categories.add(categoryName.trim())
      }
    }

    // Create categories in database
    for (const categoryName of categories) {
      if (categoryName && categoryName.length > 2) {
        const slug = generateSlug(categoryName)
        try {
          const category = await prisma.category.upsert({
            where: { slug },
            update: {},
            create: {
              name: categoryName,
              slug,
              description: `Danh mục ${categoryName}`,
              isActive: true,
              sortOrder: 0,
            },
          })
          categoryMap.set(categoryName, category.id)
        } catch (error) {
          errors.push(`Lỗi tạo category ${categoryName}: ${error}`)
        }
      }
    }

    // Process products
    for (const row of csvData) {
      try {
        // Skip header rows and empty rows
        if (!row['SẢN PHẨM'] || row['SẢN PHẨM'].includes('SẢN PHẨM') || row['SẢN PHẨM'].includes('BEST SELLER')) {
          continue
        }

        const productName = row['SẢN PHẨM']
        const priceStr = row['GIÁ'] || row['price_vnd']
        
        if (!productName || !priceStr) {
          continue
        }

        const price = parseCSVPrice(priceStr)
        if (price <= 0) {
          errors.push(`Giá không hợp lệ: ${productName} - ${priceStr}`)
          continue
        }

        // Determine category
        let categoryName = 'Khác'
        if (row['bang_gia']) {
          categoryName = row['bang_gia']
        } else if (productName.includes('Netflix')) {
          categoryName = 'Giải trí'
        } else if (productName.includes('ChatGPT') || productName.includes('Claude') || productName.includes('Gemini')) {
          categoryName = 'App AI'
        } else if (productName.includes('Spotify') || productName.includes('Youtube')) {
          categoryName = 'Giải trí'
        } else if (productName.includes('Adobe') || productName.includes('Figma')) {
          categoryName = 'Công việc'
        }

        const categoryId = categoryMap.get(categoryName) || categoryMap.get('Khác')
        if (!categoryId) {
          errors.push(`Không tìm thấy category: ${categoryName}`)
          continue
        }

        const slug = generateSlug(productName)
        const sku = `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

        // Check if product already exists
        const existingProduct = await prisma.product.findUnique({
          where: { sku }
        })

        if (existingProduct) {
          // Update existing product
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              name: productName,
              price,
              description: `Tài khoản ${productName} với giá siêu rẻ`,
              status: priceStr.includes('HẾT HÀNG') ? 'out_of_stock' : 'active',
              images: [],
            }
          })
        } else {
          // Create new product
          await prisma.product.create({
            data: {
              sku,
              name: productName,
              slug,
              description: `Tài khoản ${productName} với giá siêu rẻ`,
              price,
              currency: 'VND',
              categoryId,
              images: [],
              status: priceStr.includes('HẾT HÀNG') ? 'out_of_stock' : 'active',
              isFeatured: productName.includes('Netflix') || productName.includes('ChatGPT'),
              sortOrder: 0,
            }
          })
        }

        successCount++
      } catch (error) {
        errors.push(`Lỗi xử lý sản phẩm ${row['SẢN PHẨM']}: ${error}`)
      }
    }

    return { success: successCount, errors }
  } catch (error) {
    errors.push(`Lỗi tổng thể: ${error}`)
    return { success: successCount, errors }
  }
}

async function main() {
  console.log('🚀 Bắt đầu import dữ liệu từ CSV...')
  
  try {
    const csvData = await parseCSVFile('./pricing_clean.csv')
    console.log(`📊 Tìm thấy ${csvData.length} dòng trong CSV`)
    
    const result = await importProductsFromCSV(csvData)
    console.log(`✅ Import thành công ${result.success} sản phẩm`)
    
    if (result.errors.length > 0) {
      console.log(`⚠️ ${result.errors.length} lỗi:`)
      result.errors.forEach(error => console.log(`  - ${error}`))
    }
    
    console.log('🎉 Hoàn thành import!')
  } catch (error) {
    console.error('❌ Lỗi import:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

