import { prisma } from './db';

const SEPAY_API_URL = process.env.SEPAY_API_URL;
const SEPAY_API_KEY = process.env.SEPAY_API_KEY;

if (!SEPAY_API_URL || !SEPAY_API_KEY) {
  throw new Error('Sepay API URL and Key must be configured.');
}

interface SepayPaymentResponse {
  success: boolean;
  message: string;
  data?: {
    transactionId: string;
    qrCodeUrl: string;
    checkoutUrl: string;
    amount: number;
    description: string;
  };
  [key: string]: any;
}

/**
 * Creates a payment request with Sepay.
 * @param orderId The unique identifier for the order.
 * @param amount The total amount to be paid.
 * @returns The response from the Sepay API.
 */
export async function createSepayPayment(orderId: string, amount: number): Promise<SepayPaymentResponse> {
  try {
    const response = await fetch(`${SEPAY_API_URL}/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SEPAY_API_KEY}`,
      },
      body: JSON.stringify({
        orderId,
        amount,
        // The description will be used as the bank transfer content
        description: `Order ${orderId}`,
        // URL for Sepay to send webhook notifications
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/sepay`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sepay API responded with status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData as SepayPaymentResponse;

  } catch (error) {
    console.error('Error creating Sepay payment:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred.',
    };
  }
}

/**
 * Verifies a transaction with the Sepay API.
 * This can be used for polling if webhooks are unreliable.
 * @param transactionId The transaction ID provided by Sepay.
 * @returns The status of the transaction.
 */
export async function verifySepayTransaction(transactionId: string): Promise<{ success: boolean; paid: boolean; data?: any }> {
  try {
    const response = await fetch(`${SEPAY_API_URL}/verify-payment/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SEPAY_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Sepay API responded with status: ${response.status}`);
    }

    const responseData = await response.json();

    return {
      success: true,
      paid: responseData?.data?.status === 'PAID',
      data: responseData.data,
    };

  } catch (error) {
    console.error('Error verifying Sepay transaction:', error);
    return {
      success: false,
      paid: false,
    };
  }
}