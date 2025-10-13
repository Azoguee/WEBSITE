import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-that-is-at-least-32-chars');
const ACCESS_TOKEN_EXPIRATION = '15m';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token not found.' }, { status: 401 });
    }

    const user = await prisma.adminUser.findUnique({
      where: { refreshToken },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid refresh token.' }, { status: 401 });
    }

    // Create a new Access Token
    const accessToken = await new SignJWT({
      userId: user.id,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRATION)
      .sign(JWT_SECRET);

    return NextResponse.json({
      message: 'Access token refreshed successfully.',
      accessToken,
    });

  } catch (error: any) {
    console.error('Error in POST /api/admin/auth/refresh:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}
