'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createBlog, updateBlog } from '@/app/admin/actions'
import ImageUploader from './ImageUploader'
import type { Blog } from '@/lib/types'

// Lazy load the heavy CKEditor component
const CKEditorComponent = dynamic(() => import('./CKEditorComponent'), {
  ssr: false,
  loading: () => (
    <div style={{
      padding: 'var(--admin-space-8)',
      background: 'var(--admin-gray-50)',
      borderRadius: 'var(--admin-radius-md)',
      textAlign: 'center',
      color: 'var(--admin-gray-400)',
      fontFamily: 'var(--admin-font-body)',
      minHeight: '300px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      Loading editor...
    </div>
  ),
})

interface BlogFormProps {
  blog?: Blog
}

export default function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter()
  const [contentHtml, setContentHtml] = useState(blog?.content_html ?? '<p></p>')
  const [mainImageUrl, setMainImageUrl] = useState(blog?.main_image_url ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [slug, setSlug] = useState(blog?.slug ?? '')
  const isEditing = !!blog

  // Auto-generate slug from title for new blogs
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing && !slug) {
      const autoSlug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setSlug(autoSlug)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('content_html', contentHtml)
    formData.set('main_image_url', mainImageUrl || '')
    formData.set('slug', slug)
    formData.set('is_published', formData.has('is_published') ? 'true' : 'false')

    try {
      if (isEditing) {
        await updateBlog(blog.id, formData)
      } else {
        await createBlog(formData)
      }
      router.push('/admin/blogs')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form-card" style={{
      maxWidth: '800px',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--admin-space-6)',
    }}>
      {error && <div className="admin-error">{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
        <label htmlFor="title" className="admin-label">Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={blog?.title ?? ''}
          placeholder="e.g. 10 Tips for Healthy Gums"
          className="admin-input"
          onChange={handleTitleChange}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
        <label htmlFor="slug" className="admin-label">URL Slug *</label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. 10-tips-for-healthy-gums"
          pattern="[a-z0-9-]+"
          className="admin-input"
        />
        <small className="admin-help-text">
          URL-friendly identifier (lowercase letters, numbers, and hyphens only)
        </small>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
        <label htmlFor="excerpt" className="admin-label">Excerpt</label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          defaultValue={blog?.excerpt ?? ''}
          placeholder="Short summary shown in blog listings..."
          className="admin-input"
          style={{ resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
        <label className="admin-label">Featured Image</label>
        <ImageUploader
          currentUrl={mainImageUrl || null}
          onUpload={(url) => setMainImageUrl(url)}
          bucket="blog-media"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
        <label className="admin-label">Content *</label>
        <CKEditorComponent value={contentHtml} onChange={setContentHtml} />
        <input type="hidden" name="content_html" value={contentHtml} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
        <label htmlFor="main_image_alt_text" className="admin-label">
          Image Alt Text <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', color: 'var(--admin-gray-400)' }}>(SEO)</span>
        </label>
        <input
          id="main_image_alt_text"
          name="main_image_alt_text"
          type="text"
          defaultValue={blog?.main_image_alt_text ?? ''}
          placeholder="Descriptive alt text for the featured image"
          className="admin-input"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-3)' }}>
        <input
          id="is_published"
          name="is_published"
          type="checkbox"
          defaultChecked={blog?.is_published ?? false}
          style={{ width: '18px', height: '18px' }}
        />
        <label htmlFor="is_published" className="admin-label" style={{ margin: 0 }}>
          Published (visible on public site)
        </label>
      </div>

      <div style={{ display: 'flex', gap: 'var(--admin-space-3)', justifyContent: 'flex-end', paddingTop: 'var(--admin-space-4)' }}>
        <button
          type="button"
          onClick={() => router.back()}
          className="admin-btn admin-btn--secondary admin-btn--lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="admin-btn admin-btn--primary admin-btn--lg"
          style={{ opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : isEditing ? 'Update Blog' : 'Create Blog'}
        </button>
      </div>
    </form>
  )
}
