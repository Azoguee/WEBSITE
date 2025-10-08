import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyOwnerOfPaidOrder, sendPaymentConfirmedEmail } from '@/lib/notifications';
import { OrderStatus } from '@prisma/client';

interface SepayWebhookPayload {
  orderId: string;
  transactionId: string;
  status: 'PAID' | 'FAILED' | 'EXPIRED';
  amount: number;
  // Sepay might include a signature for verification
  signature?: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as SepayWebhookPayload;

    // TODO: In production, verify the webhook signature to ensure it's from Sepay.
    // For now, we'll proceed based on the payload content.
    // const isVerified = verifySepaySignature(payload, request.headers.get('sepay-signature'));
    // if (!isVerified) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const { orderId, status, transactionId } = payload;

    if (status !== 'PAID') {
      // We only care about successful payments.
      // We could add logic here to handle failed payments if needed.
      return NextResponse.json({ message: 'Webhook received, but no action taken for non-PAID status.' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      // The order doesn't exist in our system.
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      // The order has already been processed. Acknowledge receipt to prevent retries.
      return NextResponse.json({ message: 'Order already processed.' });
    }

    // --- Update Order Status and Log ---
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PENDING_FULFILLMENT,
        sepayTransactionId: transactionId, // Ensure transaction ID is updated
      },
    });

    await prisma.auditLog.create({
      data: {
        orderId: order.id,
        actor: 'system_webhook',
        message: `Payment confirmed via Sepay. Status changed from PENDING_PAYMENT to PENDING_FULFILLMENT.`,
      },
    });

    // --- Trigger Notifications ---
    // These can run in the background. We don't need to wait for them.
    notifyOwnerOfPaidOrder(order.id, order.totalAmount, order.customerName).catch(console.error);
    sendPaymentConfirmedEmail(order.customerEmail, order.id).catch(console.error);

    // Acknowledge the webhook successfully
    return NextResponse.json({ success: true, message: 'Webhook processed successfully.' });

  } catch (error) {
    console.error('Error processing Sepay webhook:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}