/**
 * Audit Logging for Security-Sensitive Operations
 * Logs all admin actions for compliance and security monitoring
 */

import { createClient } from '@/lib/supabase/server'

export type AuditAction =
  | 'testimonial.create'
  | 'testimonial.update'
  | 'testimonial.update_request'
  | 'testimonial.delete'
  | 'testimonial.publish'
  | 'testimonial.publish_request'
  | 'service.create'
  | 'service.update'
  | 'service.update_request'
  | 'service.delete'
  | 'service.publish'
  | 'trust_image.create'
  | 'trust_image.update'
  | 'trust_image.update_request'
  | 'trust_image.delete'
  | 'trust_image.publish'
  | 'service_image.create'
  | 'service_image.create_request'
  | 'service_image.update'
  | 'service_image.update_request'
  | 'service_image.delete'
  | 'service_image.set_primary'
  | 'service_image.set_primary_request'
  | 'blog.create'
  | 'blog.update'
  | 'blog.update_request'
  | 'blog.delete'
  | 'blog.publish'
  | 'pending_change.submit'
  | 'pending_change.approve'
  | 'pending_change.reject'
  | 'contact_message.viewed'
  | 'user.invite'
  | 'user.role_change'
  | 'auth.login'
  | 'auth.logout'
  | 'auth.failed_login'

export interface AuditLogEntry {
  action: AuditAction
  user_id: string
  resource_type: string
  resource_id?: string
  details?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  timestamp: Date
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  try {
    const supabase = await createClient()

    // Insert audit log entry
    await supabase.from('audit_logs').insert({
      action: entry.action,
      user_id: entry.user_id,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      details: entry.details,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      created_at: new Date().toISOString(),
    })

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUDIT]', {
        ...entry,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    // Don't throw - logging failures shouldn't break the application
    console.error('[AUDIT ERROR]', error)
  }
}

/**
 * Helper to extract IP address from request
 */
export function getClientIP(request?: Request): string | undefined {
  if (!request) return undefined

  // Check various headers for IP address
  const headers = request.headers

  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') || // Cloudflare
    undefined
  )
}

/**
 * Helper to get user agent
 */
export function getUserAgent(request?: Request): string | undefined {
  return request?.headers.get('user-agent') || undefined
}
