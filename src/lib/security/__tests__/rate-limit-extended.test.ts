import { describe, it, expect } from 'vitest'
import { getRateLimitIdentifier, rateLimitConfigs } from '../rate-limit'

describe('getRateLimitIdentifier', () => {
  it('prefers user ID over IP address', () => {
    const id = getRateLimitIdentifier('1.2.3.4', 'user-abc-123')
    expect(id).toBe('user:user-abc-123')
  })

  it('falls back to IP address when no user ID', () => {
    const id = getRateLimitIdentifier('1.2.3.4')
    expect(id).toBe('ip:1.2.3.4')
  })

  it('uses "unknown" when IP is null and no user ID', () => {
    const id = getRateLimitIdentifier(null)
    expect(id).toBe('ip:unknown')
  })

  it('uses user ID prefix for authenticated users', () => {
    const id = getRateLimitIdentifier(null, 'user-xyz')
    expect(id).toMatch(/^user:/)
  })

  it('uses ip prefix for anonymous users', () => {
    const id = getRateLimitIdentifier('192.168.1.1')
    expect(id).toMatch(/^ip:/)
  })
})

describe('rateLimitConfigs', () => {
  it('auth config allows 5 requests per 15 minutes', () => {
    expect(rateLimitConfigs.auth.maxRequests).toBe(5)
    expect(rateLimitConfigs.auth.windowMs).toBe(15 * 60 * 1000)
  })

  it('api config allows 100 requests per minute', () => {
    expect(rateLimitConfigs.api.maxRequests).toBe(100)
    expect(rateLimitConfigs.api.windowMs).toBe(60 * 1000)
  })

  it('upload config allows 10 requests per minute', () => {
    expect(rateLimitConfigs.upload.maxRequests).toBe(10)
    expect(rateLimitConfigs.upload.windowMs).toBe(60 * 1000)
  })

  it('admin config allows 30 requests per minute', () => {
    expect(rateLimitConfigs.admin.maxRequests).toBe(30)
    expect(rateLimitConfigs.admin.windowMs).toBe(60 * 1000)
  })

  it('auth config is the strictest (fewest requests per window)', () => {
    const requestsPerMs = (cfg: { maxRequests: number; windowMs: number }) =>
      cfg.maxRequests / cfg.windowMs

    expect(requestsPerMs(rateLimitConfigs.auth)).toBeLessThan(
      requestsPerMs(rateLimitConfigs.api)
    )
  })
})
