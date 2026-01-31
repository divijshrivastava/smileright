'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from '@/lib/security/audit-log'
import { validateTestimonialInput, validateServiceInput, sanitizeString, validateInteger } from '@/lib/security/input-validation'

export async function revalidateHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  revalidatePath('/', 'page')
}

export async function createTestimonial(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Validate and sanitize input
  const validatedInput = validateTestimonialInput(formData)
  if ('error' in validatedInput) {
    throw new Error(validatedInput.error)
  }

  const isPublished = formData.get('is_published') === 'true'
  const mediaType = formData.get('media_type') as string || 'text'

  const { data: testimonial, error } = await supabase.from('testimonials').insert({
    name: validatedInput.name,
    description: validatedInput.description,
    rating: validatedInput.rating,
    display_order: validatedInput.display_order,
    is_published: isPublished,
    image_url: validatedInput.image_url || null,
    video_url: validatedInput.video_url || null,
    media_type: mediaType,
    alt_text: validatedInput.alt_text || null,
    created_by: user.id,
    updated_by: user.id,
  }).select('id').single()

  if (error) {
    throw new Error(error.message)
  }

  // Log audit event
  await logAuditEvent({
    action: 'testimonial.create',
    user_id: user.id,
    resource_type: 'testimonial',
    resource_id: testimonial?.id,
    details: { name: validatedInput.name, is_published: isPublished },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/testimonials')
}

export async function updateTestimonial(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Validate and sanitize input
  const validatedInput = validateTestimonialInput(formData)
  if ('error' in validatedInput) {
    throw new Error(validatedInput.error)
  }

  const isPublished = formData.get('is_published') === 'true'
  const mediaType = formData.get('media_type') as string || 'text'

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

  if (error) {
    throw new Error(error.message)
  }

  // Log audit event
  await logAuditEvent({
    action: 'testimonial.update',
    user_id: user.id,
    resource_type: 'testimonial',
    resource_id: id,
    details: { name: validatedInput.name, is_published: isPublished },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/testimonials')
}

export async function deleteTestimonial(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('testimonials').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  // Log audit event
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('testimonials').update({
    is_published: isPublished,
    updated_by: user.id,
  }).eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  // Log audit event
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const imageUrl = sanitizeString(formData.get('image_url') as string, 2000)
  const altText = sanitizeString(formData.get('alt_text') as string || '', 200)
  const caption = sanitizeString(formData.get('caption') as string || '', 500)
  const displayOrder = validateInteger(formData.get('display_order'), 0) ?? 0
  const isPublished = formData.get('is_published') === 'true'

  if (!imageUrl) {
    throw new Error('Image URL is required')
  }

  const { data: trustImage, error } = await supabase.from('trust_images').insert({
    image_url: imageUrl,
    alt_text: altText || null,
    caption: caption || null,
    display_order: displayOrder,
    is_published: isPublished,
    created_by: user.id,
    updated_by: user.id,
  }).select('id').single()

  if (error) {
    throw new Error(error.message)
  }

  // Log audit event
  await logAuditEvent({
    action: 'trust_image.create',
    user_id: user.id,
    resource_type: 'trust_image',
    resource_id: trustImage?.id,
    details: { is_published: isPublished },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/trust-images')
}

export async function updateTrustImage(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const imageUrl = sanitizeString(formData.get('image_url') as string, 2000)
  const altText = sanitizeString(formData.get('alt_text') as string || '', 200)
  const caption = sanitizeString(formData.get('caption') as string || '', 500)
  const displayOrder = validateInteger(formData.get('display_order'), 0) ?? 0
  const isPublished = formData.get('is_published') === 'true'

  if (!imageUrl) {
    throw new Error('Image URL is required')
  }

  const { error } = await supabase.from('trust_images').update({
    image_url: imageUrl,
    alt_text: altText || null,
    caption: caption || null,
    display_order: displayOrder,
    is_published: isPublished,
    updated_by: user.id,
  }).eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  // Log audit event
  await logAuditEvent({
    action: 'trust_image.update',
    user_id: user.id,
    resource_type: 'trust_image',
    resource_id: id,
    details: { is_published: isPublished },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/trust-images')
}

export async function deleteTrustImage(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('trust_images').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  // Log audit event
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('trust_images').update({
    is_published: isPublished,
    updated_by: user.id,
  }).eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  // Log audit event
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Validate and sanitize input
  const validatedInput = validateServiceInput(formData)
  if ('error' in validatedInput) {
    throw new Error(validatedInput.error)
  }

  const isPublished = formData.get('is_published') === 'true'

  const { data: service, error } = await supabase.from('services').insert({
    title: validatedInput.title,
    description: validatedInput.description,
    image_url: validatedInput.image_url,
    alt_text: validatedInput.alt_text,
    display_order: validatedInput.display_order,
    is_published: isPublished,
    created_by: user.id,
    updated_by: user.id,
  }).select('id').single()

  if (error) {
    throw new Error(error.message)
  }

  // Create the initial service_image entry marked as primary
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

  // Log audit event
  await logAuditEvent({
    action: 'service.create',
    user_id: user.id,
    resource_type: 'service',
    resource_id: service?.id,
    details: { title: validatedInput.title, is_published: isPublished },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/services')
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Validate and sanitize input (don't require image for updates - managed separately)
  const validatedInput = validateServiceInput(formData, false)
  if ('error' in validatedInput) {
    throw new Error(validatedInput.error)
  }

  const isPublished = formData.get('is_published') === 'true'

  // Note: image_url and alt_text are managed through the unified image manager
  // and should not be updated here
  const { error } = await supabase.from('services').update({
    title: validatedInput.title,
    description: validatedInput.description,
    display_order: validatedInput.display_order,
    is_published: isPublished,
    updated_by: user.id,
  }).eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  // Log audit event
  await logAuditEvent({
    action: 'service.update',
    user_id: user.id,
    resource_type: 'service',
    resource_id: id,
    details: { title: validatedInput.title, is_published: isPublished },
  })

  revalidatePath('/', 'page')
  revalidatePath('/admin/services')
}

export async function deleteService(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('services').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  // Log audit event
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('services').update({
    is_published: isPublished,
    updated_by: user.id,
  }).eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  // Log audit event
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const imageUrl = sanitizeString(formData.get('image_url') as string, 2000)
  const altText = sanitizeString(formData.get('alt_text') as string || '', 200)
  const caption = sanitizeString(formData.get('caption') as string || '', 500)
  const displayOrder = validateInteger(formData.get('display_order'), 0) ?? 0

  if (!imageUrl) {
    throw new Error('Image URL is required')
  }

  // Check if this will be the first image for this service
  const { count } = await supabase
    .from('service_images')
    .select('*', { count: 'exact', head: true })
    .eq('service_id', serviceId)

  const isFirstImage = (count ?? 0) === 0

  const { data: serviceImage, error } = await supabase.from('service_images').insert({
    service_id: serviceId,
    image_url: imageUrl,
    alt_text: altText || null,
    caption: caption || null,
    display_order: displayOrder,
    is_primary: isFirstImage, // First image is automatically primary
    created_by: user.id,
    updated_by: user.id,
  }).select('id').single()

  if (error) {
    throw new Error(error.message)
  }

  // If this is the first image, update the service's primary image
  if (isFirstImage) {
    await supabase
      .from('services')
      .update({
        image_url: imageUrl,
        alt_text: altText || '',
        updated_by: user.id,
      })
      .eq('id', serviceId)
  }

  // Log audit event
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const imageUrl = sanitizeString(formData.get('image_url') as string, 2000)
  const altText = sanitizeString(formData.get('alt_text') as string || '', 200)
  const caption = sanitizeString(formData.get('caption') as string || '', 500)
  const displayOrder = validateInteger(formData.get('display_order'), 0) ?? 0

  if (!imageUrl) {
    throw new Error('Image URL is required')
  }

  const { error } = await supabase.from('service_images').update({
    image_url: imageUrl,
    alt_text: altText || null,
    caption: caption || null,
    display_order: displayOrder,
    updated_by: user.id,
  }).eq('id', imageId)

  if (error) {
    throw new Error(error.message)
  }

  // Log audit event
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Check if this is the primary image
  const { data: imageToDelete } = await supabase
    .from('service_images')
    .select('is_primary, service_id')
    .eq('id', imageId)
    .single()

  const { error } = await supabase.from('service_images').delete().eq('id', imageId)

  if (error) {
    throw new Error(error.message)
  }

  // If we deleted the primary image, mark another image as primary
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

      // Update the service's primary image
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

  // Log audit event
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get the image details
  const { data: image, error: imageError } = await supabase
    .from('service_images')
    .select('image_url, alt_text')
    .eq('id', imageId)
    .eq('service_id', serviceId)
    .single()

  if (imageError || !image) {
    throw new Error('Image not found')
  }

  // Start a transaction-like operation
  // 1. Unmark all other images for this service as primary
  const { error: unmarkError } = await supabase
    .from('service_images')
    .update({ is_primary: false })
    .eq('service_id', serviceId)

  if (unmarkError) {
    throw new Error(unmarkError.message)
  }

  // 2. Mark the selected image as primary
  const { error: markError } = await supabase
    .from('service_images')
    .update({ is_primary: true, updated_by: user.id })
    .eq('id', imageId)

  if (markError) {
    throw new Error(markError.message)
  }

  // 3. Update the service's primary image_url and alt_text
  const { error: serviceError } = await supabase
    .from('services')
    .update({
      image_url: image.image_url,
      alt_text: image.alt_text || '',
      updated_by: user.id,
    })
    .eq('id', serviceId)

  if (serviceError) {
    throw new Error(serviceError.message)
  }

  // Log audit event
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
