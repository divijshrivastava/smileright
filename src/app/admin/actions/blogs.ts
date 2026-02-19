'use server'

import { revalidatePath } from 'next/cache'
import { logAuditEvent } from '@/lib/security/audit-log'
import { validateBlogInput } from '@/lib/security/input-validation'
import {
  assertAdmin,
  assertNotViewer,
  enforceRateLimit,
  getAuthenticatedUser,
  insertPendingChange,
} from './_helpers'

export async function createBlog(formData: FormData) {
  const { supabase, user, role } = await getAuthenticatedUser()
  assertNotViewer(role)
  await enforceRateLimit(user.id, 'blog')

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
  await enforceRateLimit(user.id, 'blog')

  const validatedInput = validateBlogInput(formData)
  if ('error' in validatedInput) throw new Error(validatedInput.error)

  const { data: existing } = await supabase
    .from('blogs')
    .select('slug, is_published')
    .eq('id', id)
    .single()

  const isPublished = formData.get('is_published') === 'true'

  if (role === 'editor') {
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
  await enforceRateLimit(user.id, 'blog')

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
  await enforceRateLimit(user.id, 'blog')

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

  const { data: existing } = await supabase
    .from('blogs')
    .select('slug, published_at')
    .eq('id', id)
    .single()

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
