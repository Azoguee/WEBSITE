import { prisma } from './db';
import { Resend } from 'resend';

// --- Environment Variable Checks ---
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM_ADDRESS;
const OWNER_EMAIL = process.env.OWNER_EMAIL_ADDRESS;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// --- Low-Level Senders ---

async function sendTelegramMessage(message: string): Promise<{ success: boolean; response: string }> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    const errorMsg = 'Telegram bot token or chat ID is not configured.';
    console.error(errorMsg);
    return { success: false, response: errorMsg };
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
    const responseData = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(responseData));
    return { success: true, response: JSON.stringify(responseData) };
  } catch (error) {
    console.error("Telegram notification failed:", error);
    return { success: false, response: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; response: string }> {
  if (!resend || !EMAIL_FROM) {
    const errorMsg = 'Resend API key or From address is not configured.';
    console.error(errorMsg);
    return { success: false, response: errorMsg };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: `Your Store <${EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    if (error) throw error;
    return { success: true, response: JSON.stringify(data) };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return { success: false, response: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// --- High-Level Notification Functions ---

/**
 * Notifies the owner about a new paid order awaiting fulfillment.
 * Sends a Telegram message and falls back to email on failure.
 */
export async function notifyOwnerOfPaidOrder(orderId: string, amount: number, customerName: string) {
  const subject = `✅ [Paid] New Order #${orderId}`;
  const message = `*${subject}*\n\n*Amount:* ${amount.toLocaleString('vi-VN')} VND\n*Customer:* ${customerName}\n\n[View Order to Fulfill](${APP_URL}/admin/orders/${orderId})`;

  const telegramResult = await sendTelegramMessage(message);
  await prisma.notificationLog.create({
    data: { channel: 'TELEGRAM', recipient: TELEGRAM_CHAT_ID!, subject, content: message, success: telegramResult.success, response: telegramResult.response },
  });

  if (!telegramResult.success && OWNER_EMAIL) {
    console.log('Telegram failed, sending backup email to owner...');
    const emailHtml = `<p><b>${subject}</b></p><p>Amount: ${amount.toLocaleString('vi-VN')} VND</p><p>Customer: ${customerName}</p><p><a href="${APP_URL}/admin/orders/${orderId}">View Order to Fulfill</a></p>`;
    const emailResult = await sendEmail(OWNER_EMAIL, subject, emailHtml);
    await prisma.notificationLog.create({
      data: { channel: 'EMAIL', recipient: OWNER_EMAIL, subject, content: emailHtml, success: emailResult.success, response: emailResult.response },
    });
  }
}

/**
 * Sends an email to the customer confirming their order has been placed.
 */
export async function sendOrderPlacedEmail(to: string, orderId: string, amount: number, bankDetails: string) {
  const subject = `[Action Required] Your Order #${orderId} is Pending Payment`;
  const html = `<p>Hi there,</p><p>Thank you for your order! To complete your purchase, please transfer <b>${amount.toLocaleString('vi-VN')} VND</b> with the following details:</p><p>${bankDetails.replace(/\n/g, '<br>')}</p><p><b>Important:</b> Please use <b>${orderId}</b> as the transaction content/memo.</p><p>You can check your order status here: <a href="${APP_URL}/orders/${orderId}">Order Status</a></p>`;

  const result = await sendEmail(to, subject, html);
  await prisma.notificationLog.create({
    data: { channel: 'EMAIL', recipient: to, subject, content: html, success: result.success, response: result.response },
  });
}

/**
 * Sends an email to the customer confirming their payment has been received.
 */
export async function sendPaymentConfirmedEmail(to: string, orderId: string) {
  const subject = `Payment Confirmed for Order #${orderId}`;
  const html = `<p>Hi there,</p><p>We have successfully received your payment for order #${orderId}. We are now preparing your order for fulfillment and will notify you again once it is complete.</p><p>You can check your order status here: <a href="${APP_URL}/orders/${orderId}">Order Status</a></p>`;

  const result = await sendEmail(to, subject, html);
  await prisma.notificationLog.create({
    data: { channel: 'EMAIL', recipient: to, subject, content: html, success: result.success, response: result.response },
  });
}