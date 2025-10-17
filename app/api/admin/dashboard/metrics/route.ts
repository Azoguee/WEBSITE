import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const totalSales = await prisma.order.count({
      where: { status: 'DELIVERED' }, // Assuming 'DELIVERED' means a completed sale
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ordersToday = await prisma.order.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    const activeProducts = await prisma.product.count({
      where: { isActive: true },
    });

    const lowStockAlerts = await prisma.product.count({
        where: {
            stockStatus: 'OUT_OF_STOCK',
            isActive: true
        }
    });

    return NextResponse.json({
      totalSales,
      ordersToday,
      activeProducts,
      lowStockAlerts,
    });

  } catch (error: any) {
    console.error('Error in GET /api/admin/dashboard/metrics:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}
