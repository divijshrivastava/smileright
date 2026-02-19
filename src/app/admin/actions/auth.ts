'use server'

import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/security/audit-log'

export async function logLoginEvent(success: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (success && user) {
    await logAuditEvent({
      action: 'auth.login',
      user_id: user.id,
      resource_type: 'auth',
      details: { email: user.email },
    })
  }
}

export async function logFailedLoginEvent(email: string) {
  await logAuditEvent({
    action: 'auth.failed_login',
    user_id: 'anonymous',
    resource_type: 'auth',
    details: { email },
  })
}

export async function logLogoutEvent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    await logAuditEvent({
      action: 'auth.logout',
      user_id: user.id,
      resource_type: 'auth',
    })
  }
}
