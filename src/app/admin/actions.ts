'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/security/audit-log'
import { checkRateLimit, rateLimitConfigs } from '@/lib/security/rate-limit'
import {
  validateTestimonialInput,
  validateServiceInput,
  validateBlogInput,
  sanitizeString,
  validateInteger,
} from '@/lib/security/input-validation'
import type { AppRole } from '@/lib/types'

/** Enforce rate limit for an admin action; throws on exceeded. */
function enforceRateLimit(userId: string, action: string) {
  const result = checkRateLimit(`admin:${userId}:${action}`, rateLimitConfigs.admin)
  if (!result.success) {
    throw new Error('Too many requests. Please try again later.')
  }
}

/** Get the current user + their role. Throws if not authenticated. */
async function getAuthenticatedUser() {
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
function assertNotViewer(role: AppRole) {
  if (role === 'viewer') {
    throw new Error('Viewers do not have permission to make changes')
  }
}

/** Only admins can delete */
function assertAdmin(role: AppRole) {
  if (role !== 'admin') {
    throw new Error('Only admins can perform this action')
  }
}

/** Helper: insert a pending_change record with error handling */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function insertPendingChange(supabase: any, data: {
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

// ========================================
// Approval Workflow Actions
// ========================================

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

  enforceRateLimit(user.id, 'pending_change')

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
  enforceRateLimit(user.id, 'approval')

  // Fetch the pending change
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

  // Apply the change
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: Record<string, any> = {
          is_published: isPublished,
          updated_by: user.id,
        }
        // For blogs, set published_at when publishing
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
        // For service images: unmark all, mark target, update service main image
        const serviceId = payload.service_id as string
        const imageId = change.resource_id
        if (!imageId || !serviceId) throw new Error('Image ID and Service ID required')

        const { data: image } = await supabase
          .from('service_images')
          .select('image_url, alt_text')
          .eq('id', imageId)
          .single()
        if (!image) throw new Error('Image not found')

        await supabase
          .from('service_images')
          .update({ is_primary: false })
          .eq('service_id', serviceId)

        await supabase
          .from('service_images')
          .update({ is_primary: true, updated_by: user.id })
          .eq('id', imageId)

        const { error } = await supabase
          .from('services')
          .update({
            image_url: image.image_url,
            alt_text: image.alt_text || '',
            updated_by: user.id,
          })
          .eq('id', serviceId)
        if (error) throw new Error(error.message)
        break
      }
    }
  } catch (applyError) {
    // Mark as rejected if application fails
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

  // Mark as approved
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

  // Revalidate all relevant paths
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
  enforceRateLimit(user.id, 'approval')

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

function getTableName(resourceType: string): string {
  switch (resourceType) {
    case 'testimonial': return 'testimonials'
    case 'service': return 'services'
    case 'trust_image': return 'trust_images'
    case 'blog': return 'blogs'
    case 'service_image': return 'service_images'
    default: throw new Error(`Unknown resource type: ${resourceType}`)
  }
}

// ========================================
// Revalidation
// ========================================

export async function revalidateHomePage() {
  const { user } = await getAuthenticatedUser()
  enforceRateLimit(user.id, 'revalidate')
  revalidatePath('/', 'page')
}

// ========================================
// Testimonials Actions
// ========================================

export async function createTestimonial(formData: FormData) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  enforceRateLimit(user.id, 'testimonial')

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
    is_published: role === 'admin' ? isPublished : false, // Editors always create as draft
    image_url: validatedInput.image_url || null,
    video_url: validatedInput.video_url || null,
    media_type: mediaType,
    alt_text: validatedInput.alt_text || null,
  }

  if (role === 'editor') {
    // Editor: create the testimonial as a draft, and if they wanted it published,
    // submit a pending change for the publish action
    const { data: testimonial, error } = await supabase.from('testimonials').insert({
      ...payload,
      is_published: false,
      created_by: user.id,
      updated_by: user.id,
    }).select('id').single()

    if (error) throw new Error(error.message)

    if (isPublished) {
      // Submit a pending publish request
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
    // Admin: create directly with requested publish status
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
  enforceRateLimit(user.id, 'testimonial')

  const validatedInput = validateTestimonialInput(formData)
  if ('error' in validatedInput) {
    throw new Error(validatedInput.error)
  }

  const isPublished = formData.get('is_published') === 'true'
  const mediaType = formData.get('media_type') as string || 'text'

  if (role === 'editor') {
    // Editor: ALL updates go through approval
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
    // Admin: update everything directly
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
  enforceRateLimit(user.id, 'testimonial')

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
  enforceRateLimit(user.id, 'testimonial')

  if (role === 'editor') {
    // Editor: submit pending change instead
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

  // Admin: toggle directly
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

// ========================================
// Trust Images Actions
// ========================================

export async function createTrustImage(formData: FormData) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  enforceRateLimit(user.id, 'trust_image')

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
  enforceRateLimit(user.id, 'trust_image')

  const imageUrl = sanitizeString(formData.get('image_url') as string, 2000)
  const altText = sanitizeString(formData.get('alt_text') as string || '', 200)
  const caption = sanitizeString(formData.get('caption') as string || '', 500)
  const displayOrder = validateInteger(formData.get('display_order'), 0) ?? 0
  const isPublished = formData.get('is_published') === 'true'

  if (!imageUrl) throw new Error('Image URL is required')

  if (role === 'editor') {
    // Editor: ALL updates go through approval
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
  enforceRateLimit(user.id, 'trust_image')

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
  enforceRateLimit(user.id, 'trust_image')

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

// ========================================
// Services Actions
// ========================================

export async function createService(formData: FormData) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  enforceRateLimit(user.id, 'service')

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

  // Create the initial service_image entry
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
  enforceRateLimit(user.id, 'service')

  const validatedInput = validateServiceInput(formData, false)
  if ('error' in validatedInput) throw new Error(validatedInput.error)

  const isPublished = formData.get('is_published') === 'true'

  if (role === 'editor') {
    // Editor: ALL updates go through approval
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
  enforceRateLimit(user.id, 'service')

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
  enforceRateLimit(user.id, 'service')

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

// ========================================
// Service Images Actions
// ========================================

export async function createServiceImage(serviceId: string, formData: FormData) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  enforceRateLimit(user.id, 'service_image')

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
    // Editor: create request
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
  enforceRateLimit(user.id, 'service_image')

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
  enforceRateLimit(user.id, 'service_image')

  const { data: imageToDelete } = await supabase
    .from('service_images')
    .select('is_primary, service_id')
    .eq('id', imageId)
    .single()

  const { error } = await supabase.from('service_images').delete().eq('id', imageId)
  if (error) throw new Error(error.message)

  if (imageToDelete?.is_primary) {
    const { data: nextImage } = await supabase
      .from('service_images')
      .select('id, image_url, alt_text')
      .eq('service_id', imageToDelete.service_id)
      .order('display_order', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (nextImage) {
      await supabase
        .from('service_images')
        .update({ is_primary: true })
        .eq('id', nextImage.id)

      await supabase
        .from('services')
        .update({
          image_url: nextImage.image_url,
          alt_text: nextImage.alt_text || '',
          updated_by: user.id,
        })
        .eq('id', imageToDelete.service_id)
    }
  }

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
  enforceRateLimit(user.id, 'service_image')

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

  const { data: image, error: imageError } = await supabase
    .from('service_images')
    .select('image_url, alt_text')
    .eq('id', imageId)
    .eq('service_id', serviceId)
    .single()

  if (imageError || !image) throw new Error('Image not found')

  const { error: unmarkError } = await supabase
    .from('service_images')
    .update({ is_primary: false })
    .eq('service_id', serviceId)
  if (unmarkError) throw new Error(unmarkError.message)

  const { error: markError } = await supabase
    .from('service_images')
    .update({ is_primary: true, updated_by: user.id })
    .eq('id', imageId)
  if (markError) throw new Error(markError.message)

  const { error: serviceError } = await supabase
    .from('services')
    .update({
      image_url: image.image_url,
      alt_text: image.alt_text || '',
      updated_by: user.id,
    })
    .eq('id', serviceId)
  if (serviceError) throw new Error(serviceError.message)

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

// ========================================
// Blog Actions
// ========================================

export async function createBlog(formData: FormData) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  enforceRateLimit(user.id, 'blog')

  const validatedInput = validateBlogInput(formData)
  if ('error' in validatedInput) throw new Error(validatedInput.error)

  const isPublished = formData.get('is_published') === 'true'
  const actuallyPublished = role === 'admin' ? isPublished : false
  const publishedAt = actuallyPublished ? new Date().toISOString() : null

  const { data: blog, error } = await supabase
    .from('blogs')
    .insert({
      title: validatedInput.title,
      slug: validatedInput.slug,
      excerpt: validatedInput.excerpt,
      content_html: validatedInput.content_html,
      main_image_url: validatedInput.main_image_url,
      main_image_alt_text: validatedInput.main_image_alt_text,
      is_published: actuallyPublished,
      published_at: publishedAt,
      display_order: validatedInput.display_order,
      created_by: user.id,
      updated_by: user.id,
    })
    .select('id, slug')
    .single()

  if (error) throw new Error(error.message)

  if (role === 'editor' && isPublished) {
    await insertPendingChange(supabase, {
      resource_type: 'blog',
      resource_id: blog.id,
      action: 'publish',
      payload: { is_published: true },
      submitted_by: user.id,
    })
  }

  await logAuditEvent({
    action: 'blog.create',
    user_id: user.id,
    resource_type: 'blog',
    resource_id: blog?.id,
    details: { slug: blog?.slug, is_published: actuallyPublished },
  })

  revalidatePath('/', 'page')
  revalidatePath('/blog')
  if (blog?.slug) revalidatePath(`/blog/${blog.slug}`)
  revalidatePath('/sitemap.xml')
  revalidatePath('/admin/blogs')
}

export async function updateBlog(id: string, formData: FormData) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  enforceRateLimit(user.id, 'blog')

  const validatedInput = validateBlogInput(formData)
  if ('error' in validatedInput) throw new Error(validatedInput.error)

  const { data: existing } = await supabase
    .from('blogs')
    .select('slug, is_published')
    .eq('id', id)
    .single()

  const isPublished = formData.get('is_published') === 'true'

  if (role === 'editor') {
    // Editor: ALL updates go through approval
    const updatePayload = {
      title: validatedInput.title,
      slug: validatedInput.slug,
      excerpt: validatedInput.excerpt,
      content_html: validatedInput.content_html,
      main_image_url: validatedInput.main_image_url,
      main_image_alt_text: validatedInput.main_image_alt_text,
      display_order: validatedInput.display_order,
      is_published: isPublished,
    }

    await insertPendingChange(supabase, {
      resource_type: 'blog',
      resource_id: id,
      action: 'update',
      payload: updatePayload,
      submitted_by: user.id,
    })

    await logAuditEvent({
      action: 'blog.update_request',
      user_id: user.id,
      resource_type: 'blog',
      resource_id: id,
      details: { role },
    })

    revalidatePath('/admin/blogs')
    revalidatePath('/admin/approvals')
    return { pending: true }
  } else {
    // Admin: full update
    let publishedAt: string | null | undefined = undefined
    if (isPublished && existing && !existing.is_published) {
      publishedAt = new Date().toISOString()
    }

    const { data: updated, error } = await supabase
      .from('blogs')
      .update({
        title: validatedInput.title,
        slug: validatedInput.slug,
        excerpt: validatedInput.excerpt,
        content_html: validatedInput.content_html,
        main_image_url: validatedInput.main_image_url,
        main_image_alt_text: validatedInput.main_image_alt_text,
        is_published: isPublished,
        published_at: publishedAt,
        display_order: validatedInput.display_order,
        updated_by: user.id,
      })
      .eq('id', id)
      .select('slug')
      .single()
    if (error) throw new Error(error.message)

    const oldSlug = existing?.slug
    const newSlug = updated?.slug
    revalidatePath('/', 'page')
    revalidatePath('/blog')
    if (oldSlug) revalidatePath(`/blog/${oldSlug}`)
    if (newSlug && newSlug !== oldSlug) revalidatePath(`/blog/${newSlug}`)
    revalidatePath('/sitemap.xml')
    revalidatePath('/admin/blogs')
  }

  await logAuditEvent({
    action: 'blog.update',
    user_id: user.id,
    resource_type: 'blog',
    resource_id: id,
    details: { is_published: isPublished, role },
  })
}

export async function deleteBlog(id: string) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertAdmin(role)
  enforceRateLimit(user.id, 'blog')

  const { data: existing } = await supabase
    .from('blogs')
    .select('slug')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('blogs').delete().eq('id', id)
  if (error) throw new Error(error.message)

  await logAuditEvent({
    action: 'blog.delete',
    user_id: user.id,
    resource_type: 'blog',
    resource_id: id,
    details: { slug: existing?.slug },
  })

  revalidatePath('/', 'page')
  revalidatePath('/blog')
  if (existing?.slug) revalidatePath(`/blog/${existing.slug}`)
  revalidatePath('/sitemap.xml')
  revalidatePath('/admin/blogs')
}

export async function toggleBlogPublish(id: string, isPublished: boolean) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  enforceRateLimit(user.id, 'blog')

  if (role === 'editor') {
    await insertPendingChange(supabase, {
      resource_type: 'blog',
      resource_id: id,
      action: isPublished ? 'publish' : 'unpublish',
      payload: { is_published: isPublished },
      submitted_by: user.id,
    })

    revalidatePath('/admin/blogs')
    revalidatePath('/admin/approvals')
    return { pending: true }
  }

  // Admin direct
  const { data: existing } = await supabase
    .from('blogs')
    .select('slug, published_at')
    .eq('id', id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {
    is_published: isPublished,
    updated_by: user.id,
  }
  if (isPublished && !existing?.published_at) {
    updates.published_at = new Date().toISOString()
  }

  const { error } = await supabase.from('blogs').update(updates).eq('id', id)
  if (error) throw new Error(error.message)

  await logAuditEvent({
    action: 'blog.publish',
    user_id: user.id,
    resource_type: 'blog',
    resource_id: id,
    details: { is_published: isPublished, slug: existing?.slug },
  })

  revalidatePath('/', 'page')
  revalidatePath('/blog')
  if (existing?.slug) revalidatePath(`/blog/${existing.slug}`)
  revalidatePath('/sitemap.xml')
  revalidatePath('/admin/blogs')
}

// ========================================
// Auth Audit Logging
// ========================================

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
