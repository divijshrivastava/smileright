'use server'

import { revalidatePath } from 'next/cache'
import { logAuditEvent } from '@/lib/security/audit-log'
import { sanitizeString, validateInteger } from '@/lib/security/input-validation'
import {
  assertAdmin,
  assertNotViewer,
  enforceRateLimit,
  getAuthenticatedUser,
  insertPendingChange,
} from './_helpers'

export async function createTrustImage(formData: FormData) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  await enforceRateLimit(user.id, 'trust_image')

  const imageUrl = sanitizeString(formData.get('image_url') as string, 2000)
  const altText = sanitizeString(formData.get('alt_text') as string || '', 200)
  const caption = sanitizeString(formData.get('caption') as string || '', 500)
  const displayOrder = validateInteger(formData.get('display_order'), 0) ?? 0
  const isPublished = formData.get('is_published') === 'true'

  if (!imageUrl) throw new Error('Image URL is required')

  const { data: trustImage, error } = await supabase.from('trust_images').insert({
    image_url: imageUrl,
    alt_text: altText || null,
    caption: caption || null,
    display_order: displayOrder,
    is_published: role === 'admin' ? isPublished : false,
    created_by: user.id,
    updated_by: user.id,
  }).select('id').single()

  if (error) throw new Error(error.message)

  if (role === 'editor' && isPublished) {
    await insertPendingChange(supabase, {
      resource_type: 'trust_image',
      resource_id: trustImage.id,
      action: 'publish',
      payload: { is_published: true },
      submitted_by: user.id,
    })
  }

  await logAuditEvent({
    action: 'trust_image.create',
    user_id: user.id,
    resource_type: 'trust_image',
    resource_id: trustImage?.id,
    details: { is_published: role === 'admin' ? isPublished : false },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/trust-images')
}

export async function updateTrustImage(id: string, formData: FormData) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  await enforceRateLimit(user.id, 'trust_image')

  const imageUrl = sanitizeString(formData.get('image_url') as string, 2000)
  const altText = sanitizeString(formData.get('alt_text') as string || '', 200)
  const caption = sanitizeString(formData.get('caption') as string || '', 500)
  const displayOrder = validateInteger(formData.get('display_order'), 0) ?? 0
  const isPublished = formData.get('is_published') === 'true'

  if (!imageUrl) throw new Error('Image URL is required')

  if (role === 'editor') {
    const updatePayload = {
      image_url: imageUrl,
      alt_text: altText || null,
      caption: caption || null,
      display_order: displayOrder,
      is_published: isPublished,
    }

    await insertPendingChange(supabase, {
      resource_type: 'trust_image',
      resource_id: id,
      action: 'update',
      payload: updatePayload,
      submitted_by: user.id,
    })

    await logAuditEvent({
      action: 'trust_image.update_request',
      user_id: user.id,
      resource_type: 'trust_image',
      resource_id: id,
      details: { role },
    })

    revalidatePath('/admin/trust-images')
    revalidatePath('/admin/approvals')
    return { pending: true }
  } else {
    const { error } = await supabase.from('trust_images').update({
      image_url: imageUrl,
      alt_text: altText || null,
      caption: caption || null,
      display_order: displayOrder,
      is_published: isPublished,
      updated_by: user.id,
    }).eq('id', id)
    if (error) throw new Error(error.message)
  }

  await logAuditEvent({
    action: 'trust_image.update',
    user_id: user.id,
    resource_type: 'trust_image',
    resource_id: id,
    details: { is_published: isPublished, role },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/trust-images')
}

export async function deleteTrustImage(id: string) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertAdmin(role)
  await enforceRateLimit(user.id, 'trust_image')

  const { error } = await supabase.from('trust_images').delete().eq('id', id)
  if (error) throw new Error(error.message)

  await logAuditEvent({
    action: 'trust_image.delete',
    user_id: user.id,
    resource_type: 'trust_image',
    resource_id: id,
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/trust-images')
}

export async function toggleTrustImagePublish(id: string, isPublished: boolean) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  await enforceRateLimit(user.id, 'trust_image')

  if (role === 'editor') {
    await insertPendingChange(supabase, {
      resource_type: 'trust_image',
      resource_id: id,
      action: isPublished ? 'publish' : 'unpublish',
      payload: { is_published: isPublished },
      submitted_by: user.id,
    })

    revalidatePath('/admin/trust-images')
    revalidatePath('/admin/approvals')
    return { pending: true }
  }

  const { error } = await supabase.from('trust_images').update({
    is_published: isPublished,
    updated_by: user.id,
  }).eq('id', id)
  if (error) throw new Error(error.message)

  await logAuditEvent({
    action: 'trust_image.publish',
    user_id: user.id,
    resource_type: 'trust_image',
    resource_id: id,
    details: { is_published: isPublished },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/trust-images')
}
