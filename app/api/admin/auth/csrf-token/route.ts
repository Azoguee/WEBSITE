import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const csrfToken = randomBytes(32).toString('hex');

    const response = NextResponse.json({ csrfToken });

    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error in GET /api/admin/auth/csrf-token:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
