import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
      }
    });

    const recentStockChanges = await prisma.auditLog.findMany({
        where: { action: { in: ['product_created', 'product_updated'] } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { adminUser: { select: { name: true } } },
    });

    const recentCustomerSignups = await prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        }
    });

    // Format data for a consistent activity feed
    const activityFeed = [
      ...recentOrders.map(o => ({ type: 'NEW_ORDER', ...o })),
      ...recentStockChanges.map(s => ({ type: 'STOCK_CHANGE', ...s })),
      ...recentCustomerSignups.map(c => ({ type: 'NEW_CUSTOMER', ...c })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

    return NextResponse.json(activityFeed);

  } catch (error: any) {
    console.error('Error in GET /api/admin/dashboard/recent-activity:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}
