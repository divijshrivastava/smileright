import { describe, it, expect } from 'vitest'
import { getClientIP, getUserAgent } from '../audit-log'

describe('getClientIP', () => {
  it('returns undefined when no request is provided', () => {
    expect(getClientIP()).toBeUndefined()
  })

  it('returns the first IP from x-forwarded-for header', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    })
    expect(getClientIP(req)).toBe('1.2.3.4')
  })

  it('strips whitespace from x-forwarded-for IP', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-forwarded-for': ' 1.2.3.4 , 5.6.7.8' },
    })
    expect(getClientIP(req)).toBe('1.2.3.4')
  })

  it('returns IP from x-real-ip when x-forwarded-for is absent', () => {
    const req = new Request('https://example.com', {
      headers: { 'x-real-ip': '9.10.11.12' },
    })
    expect(getClientIP(req)).toBe('9.10.11.12')
  })

  it('returns IP from cf-connecting-ip (Cloudflare) when others are absent', () => {
    const req = new Request('https://example.com', {
      headers: { 'cf-connecting-ip': '13.14.15.16' },
    })
    expect(getClientIP(req)).toBe('13.14.15.16')
  })

  it('prioritises x-forwarded-for over x-real-ip', () => {
    const req = new Request('https://example.com', {
      headers: {
        'x-forwarded-for': '1.2.3.4',
        'x-real-ip': '9.10.11.12',
      },
    })
    expect(getClientIP(req)).toBe('1.2.3.4')
  })

  it('returns undefined when no IP headers are present', () => {
    const req = new Request('https://example.com')
    expect(getClientIP(req)).toBeUndefined()
  })
})

describe('getUserAgent', () => {
  it('returns undefined when no request is provided', () => {
    expect(getUserAgent()).toBeUndefined()
  })

  it('returns the user-agent header value', () => {
    const req = new Request('https://example.com', {
      headers: { 'user-agent': 'Mozilla/5.0 (Test Browser)' },
    })
    expect(getUserAgent(req)).toBe('Mozilla/5.0 (Test Browser)')
  })

  it('returns undefined when user-agent header is absent', () => {
    const req = new Request('https://example.com')
    expect(getUserAgent(req)).toBeUndefined()
  })
})
