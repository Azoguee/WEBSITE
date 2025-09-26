import { prisma } from './db'
import { parseCSVPrice, generateSlug } from './utils'
import { CSVProduct } from '@/types'

export async function importProductsFromCSV(csvData: any[]): Promise<{
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
      if (row.category && row.category.trim()) {
        categories.add(row.category.trim())
      }
    }

    // Create categories in database
    for (const categoryName of categories) {
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

    // Process products
    for (const row of csvData) {
      try {
        if (!row.name || !row.price_vnd) {
          errors.push(`Dòng thiếu thông tin: ${JSON.stringify(row)}`)
          continue
        }

        const price = parseCSVPrice(row.price_vnd.toString())
        if (price <= 0) {
          errors.push(`Giá không hợp lệ: ${row.name} - ${row.price_vnd}`)
          continue
        }

        const categoryId = categoryMap.get(row.category || 'Khác')
        if (!categoryId) {
          errors.push(`Không tìm thấy category: ${row.category}`)
          continue
        }

        const slug = generateSlug(row.name)
        const sku = row.sku || `SKU-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

        // Check if product already exists
        const existingProduct = await prisma.product.findUnique({
          where: { sku }
        })

        if (existingProduct) {
          // Update existing product
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              name: row.name,
              price,
              description: row.description || '',
              status: row.status === 'HẾT HÀNG' ? 'out_of_stock' : 'active',
              images: row.images ? [row.images] : [],
            }
          })
        } else {
          // Create new product
          await prisma.product.create({
            data: {
              sku,
              name: row.name,
              slug,
              description: row.description || '',
              price,
              currency: 'VND',
              categoryId,
              images: row.images ? [row.images] : [],
              status: row.status === 'HẾT HÀNG' ? 'out_of_stock' : 'active',
              isFeatured: false,
              sortOrder: 0,
            }
          })
        }

        successCount++
      } catch (error) {
        errors.push(`Lỗi xử lý sản phẩm ${row.name}: ${error}`)
      }
    }

    return { success: successCount, errors }
  } catch (error) {
    errors.push(`Lỗi tổng thể: ${error}`)
    return { success: successCount, errors }
  }
}

export async function parseCSVFile(filePath: string): Promise<any[]> {
  const fs = require('fs')
  const csv = require('csv-parser')
  
  return new Promise((resolve, reject) => {
    const results: any[] = []
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: any) => {
        // Clean and normalize data
        const cleanData: any = {}
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

