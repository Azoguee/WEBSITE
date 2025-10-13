import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const userPayload = JSON.parse(req.headers.get('x-user-payload') || '{}');

    // RBAC Check: For now, let's assume any authenticated admin can view logs.
    // In a real app, you'd check for a specific role like 'SuperAdmin'.
    if (!userPayload.userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    const logs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Paginate this in a real application
      include: {
        adminUser: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(logs);

  } catch (error: any) {
    console.error('Error in GET /api/admin/logs:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}
