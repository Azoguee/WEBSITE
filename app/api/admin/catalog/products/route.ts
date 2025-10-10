import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

const searchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  stockStatus: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'UNKNOWN', 'all']).optional(),
  isActive: z.enum(['true', 'false', 'all']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const validation = searchParamsSchema.safeParse(searchParams);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: validation.error.flatten() }, { status: 400 });
    }

    let { page, limit, search, categoryId, stockStatus, isActive } = validation.data;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId;
    }
    if (stockStatus && stockStatus !== 'all') {
      where.stockStatus = stockStatus;
    }

    const isActiveFilter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    if (isActiveFilter !== undefined) {
      where.isActive = isActiveFilter;
    }

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      error: 'An unexpected error occurred while fetching products.',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}