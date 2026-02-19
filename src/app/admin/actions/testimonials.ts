'use server'

import { revalidatePath } from 'next/cache'
import { logAuditEvent } from '@/lib/security/audit-log'
import { validateTestimonialInput } from '@/lib/security/input-validation'
import {
  assertAdmin,
  assertNotViewer,
  enforceRateLimit,
  getAuthenticatedUser,
  insertPendingChange,
} from './_helpers'

export async function createTestimonial(formData: FormData) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  await enforceRateLimit(user.id, 'testimonial')

  const validatedInput = validateTestimonialInput(formData)
  if ('error' in validatedInput) {
    throw new Error(validatedInput.error)
  }

  const isPublished = formData.get('is_published') === 'true'
  const mediaType = formData.get('media_type') as string || 'text'

  const payload = {
    name: validatedInput.name,
    description: validatedInput.description,
    rating: validatedInput.rating,
    display_order: validatedInput.display_order,
    is_published: role === 'admin' ? isPublished : false,
    image_url: validatedInput.image_url || null,
    video_url: validatedInput.video_url || null,
    media_type: mediaType,
    alt_text: validatedInput.alt_text || null,
  }

  if (role === 'editor') {
    const { data: testimonial, error } = await supabase.from('testimonials').insert({
      ...payload,
      is_published: false,
      created_by: user.id,
      updated_by: user.id,
    }).select('id').single()

    if (error) throw new Error(error.message)

    if (isPublished) {
      await insertPendingChange(supabase, {
        resource_type: 'testimonial',
        resource_id: testimonial.id,
        action: 'publish',
        payload: { is_published: true },
        submitted_by: user.id,
      })
    }

    await logAuditEvent({
      action: 'testimonial.create',
      user_id: user.id,
      resource_type: 'testimonial',
      resource_id: testimonial?.id,
      details: { name: validatedInput.name, is_published: false, pending_publish: isPublished },
    })
  } else {
    const { data: testimonial, error } = await supabase.from('testimonials').insert({
      ...payload,
      created_by: user.id,
      updated_by: user.id,
    }).select('id').single()

    if (error) throw new Error(error.message)

    await logAuditEvent({
      action: 'testimonial.create',
      user_id: user.id,
      resource_type: 'testimonial',
      resource_id: testimonial?.id,
      details: { name: validatedInput.name, is_published: isPublished },
    })
  }

  revalidatePath('/', 'page')
  revalidatePath('/admin/testimonials')
}

export async function updateTestimonial(id: string, formData: FormData) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  await enforceRateLimit(user.id, 'testimonial')

  const validatedInput = validateTestimonialInput(formData)
  if ('error' in validatedInput) {
    throw new Error(validatedInput.error)
  }

  const isPublished = formData.get('is_published') === 'true'
  const mediaType = formData.get('media_type') as string || 'text'

  if (role === 'editor') {
    const updatePayload = {
      name: validatedInput.name,
      description: validatedInput.description,
      rating: validatedInput.rating,
      display_order: validatedInput.display_order,
      image_url: validatedInput.image_url || null,
      video_url: validatedInput.video_url || null,
      media_type: mediaType,
      alt_text: validatedInput.alt_text || null,
      is_published: isPublished,
    }

    await insertPendingChange(supabase, {
      resource_type: 'testimonial',
      resource_id: id,
      action: 'update',
      payload: updatePayload,
      submitted_by: user.id,
    })

    await logAuditEvent({
      action: 'testimonial.update_request',
      user_id: user.id,
      resource_type: 'testimonial',
      resource_id: id,
      details: { name: validatedInput.name, role },
    })

    revalidatePath('/admin/testimonials')
    revalidatePath('/admin/approvals')
    return { pending: true }
  } else {
    const { error } = await supabase.from('testimonials').update({
      name: validatedInput.name,
      description: validatedInput.description,
      rating: validatedInput.rating,
      display_order: validatedInput.display_order,
      is_published: isPublished,
      image_url: validatedInput.image_url || null,
      video_url: validatedInput.video_url || null,
      media_type: mediaType,
      alt_text: validatedInput.alt_text || null,
      updated_by: user.id,
    }).eq('id', id)

    if (error) throw new Error(error.message)
  }

  await logAuditEvent({
    action: 'testimonial.update',
    user_id: user.id,
    resource_type: 'testimonial',
    resource_id: id,
    details: { name: validatedInput.name, is_published: isPublished, role },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/testimonials')
}

export async function deleteTestimonial(id: string) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertAdmin(role)
  await enforceRateLimit(user.id, 'testimonial')

  const { error } = await supabase.from('testimonials').delete().eq('id', id)

  if (error) throw new Error(error.message)

  await logAuditEvent({
    action: 'testimonial.delete',
    user_id: user.id,
    resource_type: 'testimonial',
    resource_id: id,
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/testimonials')
}

export async function togglePublish(id: string, isPublished: boolean) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  await enforceRateLimit(user.id, 'testimonial')

  if (role === 'editor') {
    await insertPendingChange(supabase, {
      resource_type: 'testimonial',
      resource_id: id,
      action: isPublished ? 'publish' : 'unpublish',
      payload: { is_published: isPublished },
      submitted_by: user.id,
    })

    await logAuditEvent({
      action: 'testimonial.publish_request',
      user_id: user.id,
      resource_type: 'testimonial',
      resource_id: id,
      details: { requested_published: isPublished },
    })

    revalidatePath('/admin/testimonials')
    revalidatePath('/admin/approvals')
    return { pending: true }
  }

  const { error } = await supabase.from('testimonials').update({
    is_published: isPublished,
    updated_by: user.id,
  }).eq('id', id)

  if (error) throw new Error(error.message)

  await logAuditEvent({
    action: 'testimonial.publish',
    user_id: user.id,
    resource_type: 'testimonial',
    resource_id: id,
    details: { is_published: isPublished },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/testimonials')
}
