import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-that-is-at-least-32-chars');

// --- RBAC Configuration ---
const ROLE_HIERARCHY: { [key: string]: number } = {
  'Staff': 1,
  'Manager': 2,
  'SuperAdmin': 3,
};
const ROUTE_PERMISSIONS: { [key: string]: string } = {
  '/api/admin/catalog/import': 'Manager',
  '/api/admin/products': 'Manager',
  '/api/admin/orders': 'Manager',
  '/api/admin/logs': 'SuperAdmin',
};
// --- End RBAC Configuration ---

// --- Security Headers ---
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};
// --- End Security Headers ---

async function handleRateLimiting(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1';
  let limit: number;
  let headers = {};
  if (req.nextUrl.pathname.startsWith('/api/admin/catalog/import')) {
    limit = 5;
    if (!rateLimit(ip, limit)) return { isRateLimited: true, headers: getRateLimitHeaders(ip, limit) };
    headers = getRateLimitHeaders(ip, limit);
  } else if (req.nextUrl.pathname.startsWith('/api/admin/auth/login')) {
    limit = 20;
    if (!rateLimit(ip, limit)) return { isRateLimited: true, headers: getRateLimitHeaders(ip, limit) };
    headers = getRateLimitHeaders(ip, limit);
  }
  return { isRateLimited: false, headers };
}

async function handleAuthAndCSRF(req: NextRequest) {
  // 1. CSRF Check for state-changing methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const csrfCookie = req.cookies.get('csrf-token')?.value;
    const csrfHeader = req.headers.get('x-csrf-token');
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return { error: 'Invalid CSRF token.', status: 403 };
    }
  }

  // 2. Auth Check from Authorization header
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return { error: 'Authentication token not provided.', status: 401 };
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET) as { payload: { userId: string; role: string } };

    // 3. RBAC Check
    const userRole = payload.role || 'Staff';
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredRole = Object.keys(ROUTE_PERMISSIONS).find(path => req.nextUrl.pathname.startsWith(path));
    if (requiredRole) {
      const requiredLevel = ROLE_HIERARCHY[ROUTE_PERMISSIONS[requiredRole]];
      if (userLevel < requiredLevel) {
        return { error: 'Forbidden: You do not have permission to access this resource.', status: 403 };
      }
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-payload', JSON.stringify(payload));

    return { headers: requestHeaders };
  } catch (err) {
    return { error: 'Invalid or expired token.', status: 401 };
  }
}

export async function middleware(req: NextRequest) {
  // Apply security headers to all responses
  const responseHeaders = new Headers();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    responseHeaders.set(key, value);
  });

  const { isRateLimited, headers: rateLimitHeaders } = await handleRateLimiting(req);
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    responseHeaders.set(key, value as string);
  });

  if (isRateLimited) {
    return new NextResponse(
      JSON.stringify({ error: 'Too many requests.' }),
      { status: 429, headers: responseHeaders }
    );
  }

  // Skip auth for auth-related routes
  if (req.nextUrl.pathname.startsWith('/api/admin/auth/')) {
    const response = NextResponse.next();
    // Clone headers
    responseHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });
    return response;
  }

  const authResult = await handleAuthAndCSRF(req);
  if (authResult.error) {
    responseHeaders.set('Content-Type', 'application/json');
    return new NextResponse(
      JSON.stringify({ error: authResult.error }),
      { status: authResult.status, headers: responseHeaders }
    );
  }

  const response = NextResponse.next({
    request: { headers: authResult.headers! },
  });

  responseHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: ['/api/admin/:path*'],
};
