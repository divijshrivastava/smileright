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

export async function createServiceImage(serviceId: string, formData: FormData) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  await enforceRateLimit(user.id, 'service_image')

  const imageUrl = sanitizeString(formData.get('image_url') as string, 2000)
  const altText = sanitizeString(formData.get('alt_text') as string || '', 200)
  const caption = sanitizeString(formData.get('caption') as string || '', 500)
  const displayOrder = validateInteger(formData.get('display_order'), 0) ?? 0

  if (!imageUrl) throw new Error('Image URL is required')

  const { count } = await supabase
    .from('service_images')
    .select('*', { count: 'exact', head: true })
    .eq('service_id', serviceId)

  const isFirstImage = (count ?? 0) === 0

  if (role === 'editor') {
    const createPayload = {
      service_id: serviceId,
      image_url: imageUrl,
      alt_text: altText || null,
      caption: caption || null,
      display_order: displayOrder,
      is_primary: isFirstImage,
    }

    await insertPendingChange(supabase, {
      resource_type: 'service_image',
      resource_id: null,
      action: 'create',
      payload: createPayload,
      submitted_by: user.id,
    })

    await logAuditEvent({
      action: 'service_image.create_request',
      user_id: user.id,
      resource_type: 'service_image',
      details: { service_id: serviceId },
    })

    revalidatePath('/admin/services')
    revalidatePath('/admin/approvals')
    return { pending: true }
  }

  const { data: serviceImage, error } = await supabase.from('service_images').insert({
    service_id: serviceId,
    image_url: imageUrl,
    alt_text: altText || null,
    caption: caption || null,
    display_order: displayOrder,
    is_primary: isFirstImage,
    created_by: user.id,
    updated_by: user.id,
  }).select('id').single()

  if (error) throw new Error(error.message)

  if (isFirstImage) {
    await supabase
      .from('services')
      .update({ image_url: imageUrl, alt_text: altText || '', updated_by: user.id })
      .eq('id', serviceId)
  }

  await logAuditEvent({
    action: 'service_image.create',
    user_id: user.id,
    resource_type: 'service_image',
    resource_id: serviceImage?.id,
    details: { service_id: serviceId },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/services')
}

export async function updateServiceImage(imageId: string, formData: FormData) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  await enforceRateLimit(user.id, 'service_image')

  const imageUrl = sanitizeString(formData.get('image_url') as string, 2000)
  const altText = sanitizeString(formData.get('alt_text') as string || '', 200)
  const caption = sanitizeString(formData.get('caption') as string || '', 500)
  const displayOrder = validateInteger(formData.get('display_order'), 0) ?? 0

  if (!imageUrl) throw new Error('Image URL is required')

  if (role === 'editor') {
    const updatePayload = {
      image_url: imageUrl,
      alt_text: altText || null,
      caption: caption || null,
      display_order: displayOrder,
    }

    await insertPendingChange(supabase, {
      resource_type: 'service_image',
      resource_id: imageId,
      action: 'update',
      payload: updatePayload,
      submitted_by: user.id,
    })

    await logAuditEvent({
      action: 'service_image.update_request',
      user_id: user.id,
      resource_type: 'service_image',
      resource_id: imageId,
    })

    revalidatePath('/admin/services')
    revalidatePath('/admin/approvals')
    return { pending: true }
  }

  const { error } = await supabase.from('service_images').update({
    image_url: imageUrl,
    alt_text: altText || null,
    caption: caption || null,
    display_order: displayOrder,
    updated_by: user.id,
  }).eq('id', imageId)

  if (error) throw new Error(error.message)

  await logAuditEvent({
    action: 'service_image.update',
    user_id: user.id,
    resource_type: 'service_image',
    resource_id: imageId,
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/services')
}

export async function deleteServiceImage(imageId: string) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertAdmin(role)
  await enforceRateLimit(user.id, 'service_image')

  const { error } = await supabase.rpc('delete_service_image_atomic', {
    p_image_id: imageId,
    p_actor: user.id,
  })
  if (error) throw new Error(error.message)

  await logAuditEvent({
    action: 'service_image.delete',
    user_id: user.id,
    resource_type: 'service_image',
    resource_id: imageId,
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/services')
}

export async function setServiceImagePrimary(serviceId: string, imageId: string) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  await enforceRateLimit(user.id, 'service_image')

  if (role === 'editor') {
    await insertPendingChange(supabase, {
      resource_type: 'service_image',
      resource_id: imageId,
      action: 'set_primary',
      payload: { service_id: serviceId },
      submitted_by: user.id,
    })

    await logAuditEvent({
      action: 'service_image.set_primary_request',
      user_id: user.id,
      resource_type: 'service_image',
      resource_id: imageId,
      details: { service_id: serviceId },
    })

    revalidatePath('/admin/services')
    revalidatePath('/admin/approvals')
    return { pending: true }
  }

  const { error } = await supabase.rpc('set_service_image_primary_atomic', {
    p_service_id: serviceId,
    p_image_id: imageId,
    p_actor: user.id,
  })
  if (error) throw new Error(error.message)

  await logAuditEvent({
    action: 'service_image.set_primary',
    user_id: user.id,
    resource_type: 'service_image',
    resource_id: imageId,
    details: { service_id: serviceId },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/services')
}
