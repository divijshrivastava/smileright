'use server'

import { revalidatePath } from 'next/cache'
import { logAuditEvent } from '@/lib/security/audit-log'
import { assertAdmin, enforceRateLimit, getAuthenticatedUser } from './_helpers'

export async function markContactMessageViewed(messageId: string) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertAdmin(role)
  await enforceRateLimit(user.id, 'contact_message')

  const viewedAt = new Date().toISOString()

  const { error } = await supabase
    .from('contact_messages')
    .update({
      status: 'read',
      viewed_at: viewedAt,
      updated_at: viewedAt,
    })
    .eq('id', messageId)

  if (error) {
    throw new Error(error.message)
  }

  await logAuditEvent({
    action: 'contact_message.viewed',
    user_id: user.id,
    resource_type: 'contact_message',
    resource_id: messageId,
  })

  revalidatePath('/admin')
  revalidatePath('/admin/contact-messages')
}
