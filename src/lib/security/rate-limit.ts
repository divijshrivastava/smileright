/**
 * Rate Limiting Utilities
 * Prevents brute force attacks and abuse
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (use Redis in production for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

/**
 * Check rate limit for a given identifier
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)
  
  // Create new entry if doesn't exist or expired
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs
    rateLimitStore.set(identifier, { count: 1, resetTime })
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      resetTime,
    }
  }
  
  // Increment counter
  entry.count++
  
  if (entry.count > config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }
  
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Rate limit configurations for different endpoints
 */
export const rateLimitConfigs = {
  // Authentication endpoints - strict limits
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  
  // API endpoints - moderate limits
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  
  // File uploads - restrictive limits
  upload: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  
  // Admin actions - moderate limits
  admin: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
}

/**
 * Get rate limit identifier from request
 */
export function getRateLimitIdentifier(
  ip: string | null,
  userId?: string
): string {
  // Prefer user ID if available, fallback to IP
  if (userId) {
    return `user:${userId}`
  }
  
  return `ip:${ip || 'unknown'}`
}
