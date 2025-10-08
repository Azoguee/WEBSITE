import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { createSepayPayment } from '@/lib/sepay';
import { sendOrderPlacedEmail } from '@/lib/notifications';
import { encryptForVault } from '@/lib/crypto';
import { FulfillmentMode } from '@prisma/client';

const orderSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1),
  customerName: z.string().min(2, 'Name is required.'),
  customerEmail: z.string().email('Invalid email address.'),
  customerPhone: z.string().optional(),
  credentials: z.record(z.string()).optional(), // For SERVICE_CREDENTIALS mode
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = orderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const { productId, quantity, customerName, customerEmail, customerPhone, credentials } = validation.data;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const totalAmount = product.price * quantity;

    // --- Create Order and Vault Entry in a Transaction ---
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerName,
          customerEmail,
          customerPhone,
          totalAmount,
          status: 'PENDING_PAYMENT',
          items: {
            create: {
              productId: product.id,
              productName: product.name,
              quantity,
              price: product.price,
            },
          },
        },
      });

      // If fulfillment requires credentials, encrypt and store them
      if (product.fulfillmentMode === FulfillmentMode.SERVICE_CREDENTIALS && credentials) {
        if (!process.env.ENCRYPTION_KEY) {
            throw new Error('ENCRYPTION_KEY is not set.');
        }
        const { encryptedCredentials, iv } = encryptForVault(credentials);
        await tx.credentialVault.create({
          data: {
            orderId: newOrder.id,
            encryptedCredentials,
            iv,
          },
        });
      }

      return newOrder;
    });

    // --- Create Payment Request with Sepay ---
    const sepayResponse = await createSepayPayment(order.id, totalAmount);

    if (!sepayResponse.success || !sepayResponse.data) {
      // If Sepay fails, we still have the order record but can't proceed with payment.
      // A cron job could clean up unpaid orders later.
      return NextResponse.json({ error: 'Failed to create payment link.', details: sepayResponse.message }, { status: 500 });
    }

    // --- Update Order with Payment Details ---
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        sepayTransactionId: sepayResponse.data.transactionId,
        sepayQrCodeUrl: sepayResponse.data.qrCodeUrl,
        sepayCheckoutUrl: sepayResponse.data.checkoutUrl,
      },
    });

    // --- Log Audit Trail ---
    await prisma.auditLog.create({
        data: {
            orderId: order.id,
            actor: 'system',
            message: `Order created with status PENDING_PAYMENT. Sepay transaction ID: ${sepayResponse.data.transactionId}`
        }
    });

    // --- Notify Customer ---
    // This can be done asynchronously and doesn't need to block the response
    sendOrderPlacedEmail(
        customerEmail,
        order.id,
        totalAmount,
        `Bank: Sepay Bank\nAccount Number: 123456789\nAmount: ${totalAmount}\nContent: ${order.id}` // Replace with actual details from Sepay if available
    ).catch(console.error);

    return NextResponse.json({
      orderId: updatedOrder.id,
      paymentInfo: {
        qrCodeUrl: updatedOrder.sepayQrCodeUrl,
        checkoutUrl: updatedOrder.sepayCheckoutUrl,
        amount: updatedOrder.totalAmount,
        transferContent: updatedOrder.id, // The order ID is the unique transfer content
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'An internal error occurred.' }, { status: 500 });
  }
}