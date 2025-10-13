// Simple in-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now()
  const key = identifier
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    // First request or window expired
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false // Rate limit exceeded
  }

  record.count++
  return true
}

export function getRateLimitHeaders(identifier: string, limit: number = 10, windowMs: number = 60000) {
  const now = Date.now()
  const key = identifier
  const record = rateLimitMap.get(key)
  
  if (!record || now > record.resetTime) {
    return {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': limit.toString(),
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString(),
    }
  }

  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, limit - record.count).toString(),
    'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
  }
}
