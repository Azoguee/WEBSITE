import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

// Simple session-based auth (use JWT in production)
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-session-secret'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateSessionToken(): string {
  return uuidv4()
}

export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('session-token')?.value
    
    if (!sessionToken) {
      return null
    }

    // In production, verify session token with database
    // For now, return mock user for admin routes
    if (sessionToken === 'admin-session') {
      return {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin',
        role: 'admin'
      }
    }

    return null
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

export function requireAuth(handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return handler(request, user)
  }
}

export function requireAdmin(handler: (request: NextRequest, user: AuthUser) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await getCurrentUser(request)
    
    if (!user || user.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return handler(request, user)
  }
}
