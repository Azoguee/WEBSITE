import { Prisma, PrismaClient, StockStatus } from '@prisma/client';
import { NormalizedProduct } from './normalization';

const prisma = new PrismaClient();

// A simple slug generation function
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export async function syncProductsToDb(
  normalizedProducts: NormalizedProduct[],
  deactivateMissing: boolean = false,
) {
  const syncResult = await prisma.$transaction(
    async (tx) => {
      // 1. Upsert all categories in one batch to get their IDs
      const categoryNames = [
        ...new Set(
          normalizedProducts
            .map((p) => p.category)
            .filter((c): c is string => !!c),
        ),
      ];
      const categoryMap = new Map<string, string>();

      if (categoryNames.length > 0) {
        await tx.category.createMany({
          data: categoryNames.map((name) => ({ name })),
          skipDuplicates: true,
        });

        const categories = await tx.category.findMany({
          where: { name: { in: categoryNames } },
        });

        for (const category of categories) {
          categoryMap.set(category.name, category.id);
        }
      }

      // 2. Find all existing products by SKU or by name+category
      const skusToFind = normalizedProducts
        .map((p) => p.sku)
        .filter((sku): sku is string => !!sku);

      const nameCatPairsToFind = normalizedProducts
        .filter((p) => !p.sku && p.category)
        .map((p) => ({
          name: p.name,
          categoryId: categoryMap.get(p.category as string)!,
        }));

      const existingProducts = await tx.product.findMany({
        where: {
          OR: [
            { sku: { in: skusToFind } },
            ...nameCatPairsToFind,
          ],
        },
      });

      const existingProductMapBySku = new Map<string, (typeof existingProducts)[0]>();
      const existingProductMapByNameCat = new Map< string, (typeof existingProducts)[0]>();

      for (const p of existingProducts) {
        if (p.sku) {
          existingProductMapBySku.set(p.sku, p);
        }
        if (p.categoryId) {
          existingProductMapByNameCat.set(`${p.name}_${p.categoryId}`, p);
        }
      }

      // 3. Separate products into "to create" and "to update"
      const productsToCreate: Prisma.ProductCreateManyInput[] = [];
      const updatePromises: Promise<any>[] = [];

      for (const productData of normalizedProducts) {
        const categoryId = productData.category
          ? categoryMap.get(productData.category)
          : null;

        let existingProduct;
        if (productData.sku) {
          existingProduct = existingProductMapBySku.get(productData.sku);
        } else if (categoryId) {
          existingProduct = existingProductMapByNameCat.get(
            `${productData.name}_${categoryId}`,
          );
        }

        const dataForDb = {
          name: productData.name,
          slug: generateSlug(productData.name),
          priceVnd: productData.priceVnd,
          priceNote: productData.priceNote,
          stockStatus: productData.stockStatus,
          type: productData.type,
          sku: productData.sku || null,
          isActive: true,
          categoryId: categoryId,
        };

        if (existingProduct) {
          updatePromises.push(
            tx.product.update({
              where: { id: existingProduct.id },
              data: dataForDb,
            }),
          );
        } else {
          productsToCreate.push(dataForDb);
        }
      }

      // 4. Execute batch operations
      if (productsToCreate.length > 0) {
        await tx.product.createMany({ data: productsToCreate });
      }

      await Promise.all(updatePromises);
      console.log(`Created ${productsToCreate.length} products, updated ${updatePromises.length} products.`);


      // 5. Deactivate missing products
      let deactivatedCount = 0;
      if (deactivateMissing) {
        const allSkusInCsv = new Set(skusToFind);
        const result = await tx.product.updateMany({
          where: {
            sku: {
              notIn: Array.from(allSkusInCsv),
              not: null,
            },
          },
          data: { isActive: false },
        });
        deactivatedCount = result.count;
        console.log(`Deactivated ${deactivatedCount} products not in the CSV.`);
      }

      return {
        createdCount: productsToCreate.length,
        updatedCount: updatePromises.length,
        deactivatedCount,
      };
    },
    {
      maxWait: 10000, // default: 2000
      timeout: 20000, // default: 5000
    },
  );

  return { deactivatedCount: syncResult.deactivatedCount };
}
