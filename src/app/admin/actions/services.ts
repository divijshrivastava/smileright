'use server'

import { revalidatePath } from 'next/cache'
import { logAuditEvent } from '@/lib/security/audit-log'
import { validateServiceInput } from '@/lib/security/input-validation'
import {
  assertAdmin,
  assertNotViewer,
  enforceRateLimit,
  getAuthenticatedUser,
  insertPendingChange,
} from './_helpers'

export async function createService(formData: FormData) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  await enforceRateLimit(user.id, 'service')

  const validatedInput = validateServiceInput(formData)
  if ('error' in validatedInput) throw new Error(validatedInput.error)

  const isPublished = formData.get('is_published') === 'true'

  const { data: service, error } = await supabase.from('services').insert({
    title: validatedInput.title,
    slug: validatedInput.slug,
    description: validatedInput.description,
    image_url: validatedInput.image_url,
    alt_text: validatedInput.alt_text,
    display_order: validatedInput.display_order,
    is_published: role === 'admin' ? isPublished : false,
    created_by: user.id,
    updated_by: user.id,
  }).select('id').single()

  if (error) throw new Error(error.message)

  await supabase.from('service_images').insert({
    service_id: service.id,
    image_url: validatedInput.image_url,
    alt_text: validatedInput.alt_text,
    caption: null,
    display_order: 1,
    is_primary: true,
    created_by: user.id,
    updated_by: user.id,
  })

  if (role === 'editor' && isPublished) {
    await insertPendingChange(supabase, {
      resource_type: 'service',
      resource_id: service.id,
      action: 'publish',
      payload: { is_published: true },
      submitted_by: user.id,
    })
  }

  await logAuditEvent({
    action: 'service.create',
    user_id: user.id,
    resource_type: 'service',
    resource_id: service?.id,
    details: { title: validatedInput.title, is_published: role === 'admin' ? isPublished : false },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/services')
}

export async function updateService(id: string, formData: FormData) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  await enforceRateLimit(user.id, 'service')

  const validatedInput = validateServiceInput(formData, false)
  if ('error' in validatedInput) throw new Error(validatedInput.error)

  const isPublished = formData.get('is_published') === 'true'

  if (role === 'editor') {
    const updatePayload = {
      title: validatedInput.title,
      slug: validatedInput.slug,
      description: validatedInput.description,
      display_order: validatedInput.display_order,
      is_published: isPublished,
    }

    await insertPendingChange(supabase, {
      resource_type: 'service',
      resource_id: id,
      action: 'update',
      payload: updatePayload,
      submitted_by: user.id,
    })

    await logAuditEvent({
      action: 'service.update_request',
      user_id: user.id,
      resource_type: 'service',
      resource_id: id,
      details: { title: validatedInput.title, role },
    })

    revalidatePath('/admin/services')
    revalidatePath('/admin/approvals')
    return { pending: true }
  } else {
    const { error } = await supabase.from('services').update({
      title: validatedInput.title,
      slug: validatedInput.slug,
      description: validatedInput.description,
      display_order: validatedInput.display_order,
      is_published: isPublished,
      updated_by: user.id,
    }).eq('id', id)
    if (error) throw new Error(error.message)
  }

  await logAuditEvent({
    action: 'service.update',
    user_id: user.id,
    resource_type: 'service',
    resource_id: id,
    details: { title: validatedInput.title, is_published: isPublished, role },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/services')
}

export async function deleteService(id: string) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertAdmin(role)
  await enforceRateLimit(user.id, 'service')

  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw new Error(error.message)

  await logAuditEvent({
    action: 'service.delete',
    user_id: user.id,
    resource_type: 'service',
    resource_id: id,
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/services')
}

export async function toggleServicePublish(id: string, isPublished: boolean) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  await enforceRateLimit(user.id, 'service')

  if (role === 'editor') {
    await insertPendingChange(supabase, {
      resource_type: 'service',
      resource_id: id,
      action: isPublished ? 'publish' : 'unpublish',
      payload: { is_published: isPublished },
      submitted_by: user.id,
    })

    revalidatePath('/admin/services')
    revalidatePath('/admin/approvals')
    return { pending: true }
  }

  const { error } = await supabase.from('services').update({
    is_published: isPublished,
    updated_by: user.id,
  }).eq('id', id)
  if (error) throw new Error(error.message)

  await logAuditEvent({
    action: 'service.publish',
    user_id: user.id,
    resource_type: 'service',
    resource_id: id,
    details: { is_published: isPublished },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/services')
}
