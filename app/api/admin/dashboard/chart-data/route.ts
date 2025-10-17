import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // 1. Order Status Distribution
    const orderStatusDistribution = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // 2. Top Selling Products (simplified)
    const topSellingProducts = await prisma.product.findMany({
      where: {
        leads: {
          some: {
            status: 'success', // Assuming 'success' lead status means a sale
          },
        },
      },
      take: 5,
      orderBy: {
        leads: {
          _count: 'desc',
        },
      },
      select: {
        name: true,
        leads: {
          where: {
            status: 'success',
          },
        },
      },
    });

    const formattedTopProducts = topSellingProducts.map(p => ({
      name: p.name,
      sales: p.leads.length,
    }));

    // 3. Revenue Trend data for the last 6 months
    const revenueTrend: { name: string, revenue: number }[] = await prisma.$queryRaw`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as name,
          SUM("total") as revenue
        FROM "orders"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY 1
        ORDER BY DATE_TRUNC('month', "createdAt") ASC;
      `;

    return NextResponse.json({
      orderStatusDistribution,
      topSellingProducts: formattedTopProducts,
      revenueTrend,
    });

  } catch (error: any) {
    console.error('Error in GET /api/admin/dashboard/chart-data:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}
