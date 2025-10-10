import { Suspense } from 'react';
import { prisma as db } from '@/lib/db';
import { Product, Category } from '@prisma/client';
import ProductsList from './products-list';

type ProductWithCategory = Product & { category: { name: string } | null };

async function getProducts(searchParams: { [key: string]: string | string[] | undefined }): Promise<{
  data: ProductWithCategory[],
  pagination: { page: number, pages: number, total: number }
}> {
  const page = parseInt(searchParams.page as string || '1', 10);
  const take = 20;
  const skip = (page - 1) * take;

  const where: any = {};
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search as string, mode: 'insensitive' } },
      { sku: { contains: searchParams.search as string, mode: 'insensitive' } },
    ];
  }
  if (searchParams.categoryId && searchParams.categoryId !== 'all') {
    where.categoryId = searchParams.categoryId as string;
  }
  if (searchParams.stockStatus && searchParams.stockStatus !== 'all') {
    where.stockStatus = searchParams.stockStatus as any;
  }
  if (searchParams.isActive && searchParams.isActive !== 'all') {
    where.isActive = searchParams.isActive === 'true';
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: { select: { name: true } } },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    }),
    db.product.count({ where }),
  ]);

  return {
    data: products,
    pagination: {
      page,
      pages: Math.ceil(total / take),
      total,
    },
  };
}

async function getCategories(): Promise<Category[]> {
  return db.category.findMany();
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {

  const productsData = await getProducts(searchParams);
  const categories = await getCategories();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductsList initialProducts={productsData.data} initialPagination={productsData.pagination} categories={categories} />
      </Suspense>
    </div>
  );
}
