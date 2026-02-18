import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkRateLimit } from '../rate-limit'
import type { RateLimitConfig } from '../rate-limit'

const testConfig: RateLimitConfig = {
  maxRequests: 3,
  windowMs: 10_000,
}

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Use unique identifiers per test to avoid cross-test contamination
  })

  it('allows requests within limit', async () => {
    const id = `test-within-${Date.now()}`
    const r1 = await checkRateLimit(id, testConfig)
    expect(r1.success).toBe(true)
    expect(r1.remaining).toBe(2)

    const r2 = await checkRateLimit(id, testConfig)
    expect(r2.success).toBe(true)
    expect(r2.remaining).toBe(1)

    const r3 = await checkRateLimit(id, testConfig)
    expect(r3.success).toBe(true)
    expect(r3.remaining).toBe(0)
  })

  it('blocks requests over limit', async () => {
    const id = `test-over-${Date.now()}`

    await checkRateLimit(id, testConfig)
    await checkRateLimit(id, testConfig)
    await checkRateLimit(id, testConfig)

    const r4 = await checkRateLimit(id, testConfig)
    expect(r4.success).toBe(false)
    expect(r4.remaining).toBe(0)
  })

  it('resets after window expires', async () => {
    const id = `test-expire-${Date.now()}`
    const shortConfig: RateLimitConfig = { maxRequests: 1, windowMs: 50 }

    const r1 = await checkRateLimit(id, shortConfig)
    expect(r1.success).toBe(true)

    const r2 = await checkRateLimit(id, shortConfig)
    expect(r2.success).toBe(false)

    // Simulate time passing by manipulating the entry
    vi.useFakeTimers()
    vi.advanceTimersByTime(100)

    const r3 = await checkRateLimit(id, shortConfig)
    expect(r3.success).toBe(true)
    expect(r3.remaining).toBe(0) // maxRequests is 1, so remaining = 1-1=0

    vi.useRealTimers()
  })

  it('tracks different identifiers separately', async () => {
    const id1 = `test-sep-a-${Date.now()}`
    const id2 = `test-sep-b-${Date.now()}`

    await checkRateLimit(id1, testConfig)
    await checkRateLimit(id1, testConfig)
    await checkRateLimit(id1, testConfig)

    // id1 is now at limit
    const r1 = await checkRateLimit(id1, testConfig)
    expect(r1.success).toBe(false)

    // id2 should still be allowed
    const r2 = await checkRateLimit(id2, testConfig)
    expect(r2.success).toBe(true)
    expect(r2.remaining).toBe(2)
  })

  it('returns correct limit metadata', async () => {
    const id = `test-meta-${Date.now()}`
    const result = await checkRateLimit(id, testConfig)

    expect(result.limit).toBe(3)
    expect(result.resetTime).toBeGreaterThan(Date.now())
  })
})
