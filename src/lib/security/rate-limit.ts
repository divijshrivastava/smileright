/**
 * Rate Limiting Utilities
 *
 * Uses Redis REST API in production (Upstash / Vercel KV compatible).
 * Falls back to in-memory store when Redis is not configured.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()
let warnedMissingRedis = false
let warnedRedisFailure = false

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

type RedisConfig = {
  url: string
  token: string
}

function getRedisConfig(): RedisConfig | null {
  const url =
    process.env.RATE_LIMIT_REDIS_REST_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL

  const token =
    process.env.RATE_LIMIT_REDIS_REST_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN

  if (!url || !token) {
    if (process.env.NODE_ENV === 'production' && !warnedMissingRedis) {
      warnedMissingRedis = true
      console.warn('Rate limiting is using in-memory fallback because Redis REST env vars are missing.')
    }
    return null
  }

  return { url, token }
}

function toResult(count: number, resetTime: number, config: RateLimitConfig): RateLimitResult {
  const remaining = Math.max(0, config.maxRequests - count)
  return {
    success: count <= config.maxRequests,
    limit: config.maxRequests,
    remaining,
    resetTime,
  }
}

function checkRateLimitMemory(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (entry && now > entry.resetTime) {
    rateLimitStore.delete(identifier)
  }

  const current = rateLimitStore.get(identifier)

  if (!current) {
    const resetTime = now + config.windowMs
    rateLimitStore.set(identifier, { count: 1, resetTime })
    return toResult(1, resetTime, config)
  }

  current.count++
  return toResult(current.count, current.resetTime, config)
}

function sanitizeIdentifier(identifier: string): string {
  return identifier.replace(/\s+/g, '_')
}

async function runRedisPipeline(redis: RedisConfig, commands: string[][]): Promise<unknown[]> {
  const response = await fetch(`${redis.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${redis.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Redis rate-limit request failed: ${body}`)
  }

  return await response.json() as unknown[]
}

function getCommandResult(value: unknown): unknown {
  if (value && typeof value === 'object') {
    const obj = value as { result?: unknown; error?: string }
    if (obj.error) throw new Error(obj.error)
    return obj.result
  }
  return value
}

async function checkRateLimitRedis(
  identifier: string,
  config: RateLimitConfig,
  redis: RedisConfig
): Promise<RateLimitResult> {
  const now = Date.now()
  const key = `ratelimit:v1:${sanitizeIdentifier(identifier)}`

  const results = await runRedisPipeline(redis, [
    ['INCR', key],
    ['PEXPIRE', key, String(config.windowMs), 'NX'],
    ['PTTL', key],
  ])

  const count = Number(getCommandResult(results[0]))
  let ttlMs = Number(getCommandResult(results[2]))

  if (!Number.isFinite(count)) {
    throw new Error('Invalid Redis INCR response')
  }

  if (!Number.isFinite(ttlMs) || ttlMs < 0) {
    ttlMs = config.windowMs
  }

  return toResult(count, now + ttlMs, config)
}

/**
 * Check rate limit for a given identifier.
 * Uses Redis when configured, otherwise falls back to in-memory storage.
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const redis = getRedisConfig()

  if (!redis) {
    return checkRateLimitMemory(identifier, config)
  }

  try {
    return await checkRateLimitRedis(identifier, config, redis)
  } catch (error) {
    if (!warnedRedisFailure) {
      warnedRedisFailure = true
      console.error('Rate limiter Redis backend failed. Falling back to memory.', error)
    }
    return checkRateLimitMemory(identifier, config)
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
