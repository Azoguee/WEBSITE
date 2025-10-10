-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'UNKNOWN');

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "slug",
DROP COLUMN "description",
DROP COLUMN "image",
DROP COLUMN "sortOrder";

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- AlterTable
ALTER TABLE "products" DROP COLUMN "slug",
DROP COLUMN "description",
DROP COLUMN "price",
DROP COLUMN "originalPrice",
DROP COLUMN "currency",
DROP COLUMN "images",
DROP COLUMN "status",
DROP COLUMN "isFeatured",
DROP COLUMN "sortOrder",
DROP COLUMN "metaTitle",
DROP COLUMN "metaDescription",
ADD COLUMN     "priceVnd" INTEGER,
ADD COLUMN     "priceNote" TEXT,
ADD COLUMN     "stockStatus" "StockStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "type" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "sku" DROP NOT NULL,
ALTER COLUMN "categoryId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "products_name_categoryId_unique" ON "products"("name", "categoryId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;