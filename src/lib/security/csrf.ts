/**
 * CSRF Token Management
 * Provides CSRF protection for server actions
 */

import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

const CSRF_TOKEN_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

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
