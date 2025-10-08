import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { decryptFromVault } from '@/lib/crypto';
import { isAuthorized } from '@/lib/admin-auth';

// GET handler to securely fetch and decrypt credentials for an order
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: orderId } = params;
  const adminEmail = 'admin@example.com'; // Replace with actual admin user from session

  try {
    const vaultEntry = await prisma.credentialVault.findUnique({
      where: { orderId },
    });

    if (!vaultEntry) {
      return NextResponse.json({ error: 'No credentials found for this order.' }, { status: 404 });
    }

    // --- Decrypt the credentials ---
    const decryptedCredentials = decryptFromVault(
      vaultEntry.encryptedCredentials,
      vaultEntry.iv
    );

    // --- Log the access event ---
    const currentLog = Array.isArray(vaultEntry.accessLog) ? vaultEntry.accessLog : [];
    const newAccessEntry = {
      user: adminEmail,
      timestamp: new Date().toISOString(),
      ip: request.ip || 'unknown',
    };

    await prisma.credentialVault.update({
      where: { id: vaultEntry.id },
      data: {
        accessLog: [...currentLog, newAccessEntry],
      },
    });

    // --- Return the decrypted credentials ---
    return NextResponse.json({ credentials: decryptedCredentials });

  } catch (error) {
    console.error(`Failed to retrieve credentials for order ${orderId}:`, error);
    if (error instanceof Error && error.message.includes('bad decrypt')) {
        return NextResponse.json({ error: 'Decryption failed. Key may have changed or data is corrupt.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to retrieve credentials.' }, { status: 500 });
  }
}