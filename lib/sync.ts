import { PrismaClient } from '@prisma/client';
import { NormalizedProduct } from './normalization';

const prisma = new PrismaClient();

export async function syncProductsToDb(
  normalizedProducts: NormalizedProduct[],
  deactivateMissing: boolean = false
) {
  // Get all SKUs from the CSV that are not null/empty
  const allSkusInCsv = new Set(
    normalizedProducts.map(p => p.sku).filter((sku): sku is string => !!sku)
  );

  for (const productData of normalizedProducts) {
    // 1. Upsert Category and get its ID
    let categoryId: string | null = null;
    if (productData.category) {
      const category = await prisma.category.upsert({
        where: { name: productData.category },
        update: { name: productData.category },
        create: { name: productData.category },
      });
      categoryId = category.id;
    }

    // 2. Prepare product data for create/update
    const dataForDb = {
      name: productData.name,
      priceVnd: productData.priceVnd,
      priceNote: productData.priceNote,
      stockStatus: productData.stockStatus,
      type: productData.type,
      sku: productData.sku || null,
      isActive: true,
      categoryId: categoryId,
    };

    // 3. Find existing product based on SKU or name+category
    let existingProduct;
    if (dataForDb.sku) {
      existingProduct = await prisma.product.findUnique({
        where: { sku: dataForDb.sku },
      });
    } else {
      existingProduct = await prisma.product.findFirst({
        where: {
          name: dataForDb.name,
          categoryId: categoryId,
        },
      });
    }

    // 4. Create or Update the product
    if (existingProduct) {
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: dataForDb,
      });
      console.log(`Updated product: ${dataForDb.name}`);
    } else {
      await prisma.product.create({
        data: dataForDb,
      });
      console.log(`Created product: ${dataForDb.name}`);
    }
  }

  // 5. Deactivate missing products (if flag is set)
  let deactivatedCount = 0;
  if (deactivateMissing) {
    const result = await prisma.product.updateMany({
      where: {
        sku: {
          notIn: Array.from(allSkusInCsv),
          not: null, // Correctly check for non-null SKUs
        },
      },
      data: {
        isActive: false,
      },
    });
    deactivatedCount = result.count;
    console.log(`Deactivated ${deactivatedCount} products not in the CSV.`);
  }

  return { deactivatedCount };
}