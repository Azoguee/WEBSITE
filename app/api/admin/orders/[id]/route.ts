import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import { isAuthorized } from '@/lib/admin-auth';

const patchSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  fulfillmentNotes: z.string().optional(),
});

// GET handler for a single order
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        auditLog: {
          orderBy: {
            timestamp: 'desc',
          },
        },
        credential: {
            select: { id: true }
        }
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(`Failed to fetch order ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// PATCH handler to update an order
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const body = await request.json();
    const validation = patchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const { status } = validation.data;

    const currentOrder = await prisma.order.findUnique({ where: { id } });
    if (!currentOrder) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
      },
    });

    await prisma.auditLog.create({
        data: {
            orderId: id,
            actor: 'admin@example.com', // Replace with actual admin user from session
            message: `Status changed from ${currentOrder.status} to ${status}.`
        }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error(`Failed to update order ${id}:`, error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}