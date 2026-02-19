'use server'

import { revalidatePath } from 'next/cache'
import { logAuditEvent } from '@/lib/security/audit-log'
import {
  assertAdmin,
  assertNotViewer,
  enforceRateLimit,
  getAuthenticatedUser,
  getTableName,
} from './_helpers'

export async function submitPendingChange(
  resourceType: string,
  resourceId: string | null,
  action: string,
  payload: Record<string, unknown>,
) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)

  if (role !== 'editor') {
    throw new Error('Only editors submit pending changes')
  }

  await enforceRateLimit(user.id, 'pending_change')

  const { error } = await supabase.from('pending_changes').insert({
    resource_type: resourceType,
    resource_id: resourceId,
    action,
    payload,
    submitted_by: user.id,
    status: 'pending',
  })

  if (error) {
    throw new Error(error.message)
  }

  await logAuditEvent({
    action: 'pending_change.submit',
    user_id: user.id,
    resource_type: resourceType,
    resource_id: resourceId || undefined,
    details: { change_action: action },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/approvals')
}

export async function approvePendingChange(changeId: string) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertAdmin(role)
  await enforceRateLimit(user.id, 'approval')

  const { data: change, error: fetchErr } = await supabase
    .from('pending_changes')
    .select('*')
    .eq('id', changeId)
    .single()

  if (fetchErr || !change) {
    throw new Error('Pending change not found')
  }

  if (change.status !== 'pending') {
    throw new Error('This change has already been reviewed')
  }

  const payload = change.payload as Record<string, unknown>

  try {
    switch (change.action) {
      case 'create': {
        const { error } = await supabase
          .from(getTableName(change.resource_type))
          .insert({ ...payload, created_by: change.submitted_by, updated_by: user.id })
        if (error) throw new Error(error.message)
        break
      }
      case 'update': {
        if (!change.resource_id) throw new Error('Resource ID required for update')
        const { error } = await supabase
          .from(getTableName(change.resource_type))
          .update({ ...payload, updated_by: user.id })
          .eq('id', change.resource_id)
        if (error) throw new Error(error.message)
        break
      }
      case 'publish':
      case 'unpublish': {
        if (!change.resource_id) throw new Error('Resource ID required')
        const isPublished = change.action === 'publish'
        const updateData: Record<string, any> = {
          is_published: isPublished,
          updated_by: user.id,
        }
        if (change.resource_type === 'blog' && isPublished) {
          updateData.published_at = new Date().toISOString()
        }
        const { error } = await supabase
          .from(getTableName(change.resource_type))
          .update(updateData)
          .eq('id', change.resource_id)
        if (error) throw new Error(error.message)
        break
      }
      case 'set_primary': {
        const serviceId = payload.service_id as string
        const imageId = change.resource_id
        if (!imageId || !serviceId) throw new Error('Image ID and Service ID required')

        const { error } = await supabase.rpc('set_service_image_primary_atomic', {
          p_service_id: serviceId,
          p_image_id: imageId,
          p_actor: user.id,
        })
        if (error) throw new Error(error.message)
        break
      }
    }
  } catch (applyError) {
    await supabase
      .from('pending_changes')
      .update({
        status: 'rejected',
        reviewed_by: user.id,
        review_note: `Auto-rejected: ${applyError instanceof Error ? applyError.message : 'Unknown error'}`,
      })
      .eq('id', changeId)
    throw applyError
  }

  const { error: updateErr } = await supabase
    .from('pending_changes')
    .update({
      status: 'approved',
      reviewed_by: user.id,
    })
    .eq('id', changeId)

  if (updateErr) {
    throw new Error(updateErr.message)
  }

  await logAuditEvent({
    action: 'pending_change.approve',
    user_id: user.id,
    resource_type: change.resource_type,
    resource_id: change.resource_id || undefined,
    details: { change_id: changeId, change_action: change.action },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin')
  revalidatePath('/admin/approvals')
  revalidatePath(`/admin/${change.resource_type === 'trust_image' ? 'trust-images' : change.resource_type + 's'}`)
  if (change.resource_type === 'blog') {
    revalidatePath('/blog')
    revalidatePath('/sitemap.xml')
  }
}

export async function rejectPendingChange(changeId: string, reviewNote?: string) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertAdmin(role)
  await enforceRateLimit(user.id, 'approval')

  const { data: change, error: fetchErr } = await supabase
    .from('pending_changes')
    .select('*')
    .eq('id', changeId)
    .single()

  if (fetchErr || !change) {
    throw new Error('Pending change not found')
  }

  if (change.status !== 'pending') {
    throw new Error('This change has already been reviewed')
  }

  const { error: updateErr } = await supabase
    .from('pending_changes')
    .update({
      status: 'rejected',
      reviewed_by: user.id,
      review_note: reviewNote || null,
    })
    .eq('id', changeId)

  if (updateErr) {
    throw new Error(updateErr.message)
  }

  await logAuditEvent({
    action: 'pending_change.reject',
    user_id: user.id,
    resource_type: change.resource_type,
    resource_id: change.resource_id || undefined,
    details: { change_id: changeId, review_note: reviewNote },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/approvals')
}
