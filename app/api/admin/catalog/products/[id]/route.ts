import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  priceVnd: z.coerce.number().int().optional().nullable(),
  priceNote: z.string().optional().nullable(),
  stockStatus: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'UNKNOWN']).optional(),
  type: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  categoryId: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    const validation = updateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }

    const dataToUpdate = validation.data;

    // Ensure SKU is unique if it is being changed
    if (dataToUpdate.sku) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          sku: dataToUpdate.sku,
          id: { not: id },
        },
      });
      if (existingProduct) {
        return NextResponse.json({ error: 'SKU already exists' }, { status: 409 });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'An unexpected error occurred while updating the product.' }, { status: 500 });
  }
}