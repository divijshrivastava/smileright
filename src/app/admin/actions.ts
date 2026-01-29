'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const rating = parseInt(formData.get('rating') as string) || 5
  const displayOrder = parseInt(formData.get('display_order') as string) || 0
  const isPublished = formData.get('is_published') === 'true'
  const imageUrl = formData.get('image_url') as string | null
  const videoUrl = formData.get('video_url') as string | null
  const mediaType = formData.get('media_type') as string || 'text'
  const altText = formData.get('alt_text') as string | null

  const { error } = await supabase.from('testimonials').insert({
    name,
    description,
    rating,
    display_order: displayOrder,
    is_published: isPublished,
    image_url: imageUrl || null,
    video_url: videoUrl || null,
    media_type: mediaType,
    alt_text: altText || null,
    created_by: user.id,
    updated_by: user.id,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/', 'page')
  revalidatePath('/admin/testimonials')
}

export async function updateTestimonial(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const rating = parseInt(formData.get('rating') as string) || 5
  const displayOrder = parseInt(formData.get('display_order') as string) || 0
  const isPublished = formData.get('is_published') === 'true'
  const imageUrl = formData.get('image_url') as string | null
  const videoUrl = formData.get('video_url') as string | null
  const mediaType = formData.get('media_type') as string || 'text'
  const altText = formData.get('alt_text') as string | null

  const { error } = await supabase.from('testimonials').update({
    name,
    description,
    rating,
    display_order: displayOrder,
    is_published: isPublished,
    image_url: imageUrl || null,
    video_url: videoUrl || null,
    media_type: mediaType,
    alt_text: altText || null,
    updated_by: user.id,
  }).eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

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

  const imageUrl = formData.get('image_url') as string
  const altText = formData.get('alt_text') as string | null
  const caption = formData.get('caption') as string | null
  const displayOrder = parseInt(formData.get('display_order') as string) || 0
  const isPublished = formData.get('is_published') === 'true'

  const { error } = await supabase.from('trust_images').insert({
    image_url: imageUrl,
    alt_text: altText || null,
    caption: caption || null,
    display_order: displayOrder,
    is_published: isPublished,
    created_by: user.id,
    updated_by: user.id,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/', 'page')
  revalidatePath('/admin/trust-images')
}

export async function updateTrustImage(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const imageUrl = formData.get('image_url') as string
  const altText = formData.get('alt_text') as string | null
  const caption = formData.get('caption') as string | null
  const displayOrder = parseInt(formData.get('display_order') as string) || 0
  const isPublished = formData.get('is_published') === 'true'

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

  revalidatePath('/', 'page')
  revalidatePath('/admin/trust-images')
}
