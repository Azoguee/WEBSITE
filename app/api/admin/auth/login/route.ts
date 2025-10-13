import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { nanoid } from 'nanoid';
import { randomBytes } from 'crypto';
import { z } from 'zod';
import { logAdminActivity } from '@/lib/audit-log';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-that-is-at-least-32-chars');
const ACCESS_TOKEN_EXPIRATION = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRATION_DAYS = 7;

const LoginSchema = z.object({
  email: z.string().email('Invalid email format.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

export async function POST(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1';
  try {
    const body = await req.json();
    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input.', issues: validation.error.issues }, { status: 400 });
    }

    const { email, password } = validation.data;

    const adminUser = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!adminUser || !bcrypt.compareSync(password, adminUser.password)) {
      await logAdminActivity({
        adminUserId: adminUser?.id,
        action: 'login_failed',
        details: {
          emailAttempted: email,
          ipAddress: ip,
        },
      });
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    if (!adminUser.isActive) {
      return NextResponse.json({ error: 'Your account is inactive.' }, { status: 403 });
    }

    // Create Access Token
    const accessToken = await new SignJWT({
      userId: adminUser.id,
      role: adminUser.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setJti(nanoid())
      .setIssuedAt()
      .setExpirationTime(ACCESS_TOKEN_EXPIRATION)
      .sign(JWT_SECRET);

    // Create Refresh Token
    const refreshToken = randomBytes(64).toString('hex');

    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { refreshToken: refreshToken }, // Store the plain token
    });

    const response = NextResponse.json({
      message: 'Login successful.',
      accessToken,
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/api/admin/auth', // Only send to auth routes
      maxAge: REFRESH_TOKEN_EXPIRATION_DAYS * 24 * 60 * 60,
    });

    return response;

  } catch (error: any) {
    console.error('Error in POST /api/admin/auth/login:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.', details: error.message }, { status: 500 });
  }
}
