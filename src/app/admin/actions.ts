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
  const altText = formData.get('alt_text') as string | null

  const { error } = await supabase.from('testimonials').insert({
    name,
    description,
    rating,
    display_order: displayOrder,
    is_published: isPublished,
    image_url: imageUrl || null,
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
  const altText = formData.get('alt_text') as string | null

  const { error } = await supabase.from('testimonials').update({
    name,
    description,
    rating,
    display_order: displayOrder,
    is_published: isPublished,
    image_url: imageUrl || null,
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
