'use client'

import { useMemo, useState } from 'react'
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
      minHeight: '300px',
      background: '#f5f5f5',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#666',
      fontFamily: 'var(--font-sans)',
    }}>
      Loading editor...
    </div>
  ),
})

interface BlogFormProps {
  blog?: Blog
}

function slugifyLocal(input: string): string {
  return (input || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200)
}

export default function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter()
  const isEditing = !!blog

  const [title, setTitle] = useState(blog?.title ?? '')
  const [slug, setSlug] = useState(blog?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(false)
  const [excerpt, setExcerpt] = useState(blog?.excerpt ?? '')
  const [displayOrder, setDisplayOrder] = useState<number>(blog?.display_order ?? 0)
  const [isPublished, setIsPublished] = useState<boolean>(blog?.is_published ?? false)
  const [mainImageUrl, setMainImageUrl] = useState<string>(blog?.main_image_url ?? '')
  const [mainImageAltText, setMainImageAltText] = useState<string>(blog?.main_image_alt_text ?? '')

  const [contentHtml, setContentHtml] = useState(blog?.content_html ?? '<p></p>')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')


  const submitLabel = useMemo(() => {
    if (saving) return 'Saving...'
    return isEditing ? 'Update Blog' : 'Create Blog'
  }, [saving, isEditing])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const formData = new FormData()
    formData.set('title', title)
    formData.set('slug', slug)
    formData.set('excerpt', excerpt)
    formData.set('content_html', contentHtml)
    formData.set('main_image_url', mainImageUrl)
    formData.set('main_image_alt_text', mainImageAltText)
    formData.set('display_order', String(displayOrder))
    formData.set('is_published', isPublished ? 'true' : 'false')

    try {
      if (isEditing && blog) {
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
    <form onSubmit={handleSubmit} style={styles.form}>
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.field}>
        <label htmlFor="title" style={styles.label}>Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => {
            const nextTitle = e.target.value
            setTitle(nextTitle)
            if (!slugTouched) {
              setSlug(slugifyLocal(nextTitle))
            }
          }}
          placeholder="e.g. 5 Signs You Might Need a Root Canal"
          required
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="slug" style={styles.label}>Slug (URL) *</label>
        <input
          id="slug"
          type="text"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true)
            setSlug(slugifyLocal(e.target.value))
          }}
          placeholder="e.g. 5-signs-root-canal"
          required
          style={styles.input}
        />
        <small style={styles.help}>Public URL will be: /blog/{slug || 'your-slug'}</small>
      </div>

      <div style={styles.field}>
        <label htmlFor="excerpt" style={styles.label}>Excerpt (optional)</label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short summary shown on the blog listing"
          rows={3}
          style={{ ...styles.input, resize: 'vertical' as const }}
        />
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Main Image (optional)</label>
        <ImageUploader
          currentUrl={mainImageUrl || null}
          onUpload={(url) => setMainImageUrl(url)}
          bucket="blog-media"
        />
        <small style={styles.help}>This image will be displayed as the featured image for the blog post</small>
      </div>

      <div style={styles.field}>
        <label htmlFor="main_image_alt_text" style={styles.label}>Main Image Alt Text (optional)</label>
        <input
          id="main_image_alt_text"
          type="text"
          value={mainImageAltText}
          onChange={(e) => setMainImageAltText(e.target.value)}
          placeholder="e.g. Dentist examining patient's teeth"
          style={styles.input}
        />
        <small style={styles.help}>Describe the image for accessibility and SEO</small>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label htmlFor="display_order" style={styles.label}>Display Order</label>
          <input
            id="display_order"
            type="number"
            min={0}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            style={styles.input}
          />
          <small style={styles.help}>Lower numbers appear first</small>
        </div>

        <div style={{ ...styles.field, justifyContent: 'flex-end' }}>
          <label style={styles.label}>Status</label>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              Published (visible on public site)
            </span>
          </label>
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Content *</label>
        <CKEditorComponent value={contentHtml} onChange={setContentHtml} />
        <input type="hidden" name="content_html" value={contentHtml} />
      </div>

      <div style={styles.actions}>
        <button type="button" onClick={() => router.back()} style={styles.cancelBtn}>
          Cancel
        </button>
        <button type="submit" disabled={saving} style={{ ...styles.submitBtn, opacity: saving ? 0.7 : 1 }}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    maxWidth: '900px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  label: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#292828',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    width: '100%',
  },
  help: {
    color: '#666',
    fontSize: '0.85rem',
    fontFamily: 'var(--font-sans)',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '1rem',
  },
  cancelBtn: {
    padding: '12px 24px',
    background: '#f5f5f5',
    color: '#292828',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '12px 24px',
    background: '#1B73BA',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  error: {
    background: '#fee',
    color: '#c00',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-sans)',
  },
}
