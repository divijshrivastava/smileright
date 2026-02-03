/**
 * CSRF Protection
 *
 * NOTE: This module is intentionally NOT integrated into any server actions.
 * Next.js 14+ server actions include built-in CSRF protection via Origin header
 * validation. Custom CSRF tokens are unnecessary for server actions and would
 * add complexity without security benefit.
 *
 * This file is retained for reference only. If the application adds non-server-action
 * mutation endpoints (e.g. raw API routes accepting form posts from browsers),
 * this module can be imported to protect those routes.
 *
 * @see https://nextjs.org/blog/security-nextjs-server-components-actions
 */

import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

const CSRF_TOKEN_NAME = 'csrf_token'

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Set CSRF token in cookies
 */
export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken()
  const cookieStore = await cookies()

  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })

  return token
}

/**
 * Get CSRF token from cookies
 */
export async function getCSRFToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(CSRF_TOKEN_NAME)?.value
}

/**
 * Verify CSRF token from request
 */
export async function verifyCSRFToken(token: string | null | undefined): Promise<boolean> {
  if (!token) {
    return false
  }

  const storedToken = await getCSRFToken()

  if (!storedToken) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(Buffer.from(token), Buffer.from(storedToken))
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i]
  }

  return result === 0
}
