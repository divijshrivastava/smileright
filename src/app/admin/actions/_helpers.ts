import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, rateLimitConfigs } from '@/lib/security/rate-limit'
import type { AppRole } from '@/lib/types'

/** Enforce rate limit for an admin action; throws on exceeded. */
export async function enforceRateLimit(userId: string, action: string) {
  const result = await checkRateLimit(`admin:${userId}:${action}`, rateLimitConfigs.admin)
  if (!result.success) {
    throw new Error('Too many requests. Please try again later.')
  }
}

/** Get the current user + their role. Throws if not authenticated. */
export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile?.role as AppRole) || 'viewer'

  return { supabase, user, role }
}

/** Viewers cannot perform any write actions */
export function assertNotViewer(role: AppRole) {
  if (role === 'viewer') {
    throw new Error('Viewers do not have permission to make changes')
  }
}

/** Only admins can delete */
export function assertAdmin(role: AppRole) {
  if (role !== 'admin') {
    throw new Error('Only admins can perform this action')
  }
}

/** Helper: insert a pending_change record with error handling */
export async function insertPendingChange(supabase: any, data: {
  resource_type: string
  resource_id: string | null
  action: string
  payload: Record<string, unknown>
  submitted_by: string
}) {
  const { error } = await supabase.from('pending_changes').insert({
    ...data,
    status: 'pending',
  })
  if (error) {
    console.error('Failed to insert pending change:', error)
    throw new Error('Failed to submit change for approval: ' + error.message)
  }
}

export function getTableName(resourceType: string): string {
  switch (resourceType) {
    case 'testimonial': return 'testimonials'
    case 'service': return 'services'
    case 'trust_image': return 'trust_images'
    case 'blog': return 'blogs'
    case 'service_image': return 'service_images'
    default: throw new Error(`Unknown resource type: ${resourceType}`)
  }
}
