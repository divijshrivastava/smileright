'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTestimonial, updateTestimonial } from '@/app/admin/actions'
import ImageUploader from './ImageUploader'
import VideoUploader from './VideoUploader'
import type { Testimonial } from '@/lib/types'

interface TestimonialFormProps {
  testimonial?: Testimonial
}

export default function TestimonialForm({ testimonial }: TestimonialFormProps) {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState(testimonial?.image_url ?? '')
  const [videoUrl, setVideoUrl] = useState(testimonial?.video_url ?? '')
  const [mediaType, setMediaType] = useState<string>(testimonial?.media_type ?? 'text')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const isEditing = !!testimonial

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('image_url', imageUrl || '')
    formData.set('video_url', videoUrl || '')
    formData.set('media_type', mediaType)
    formData.set('is_published', formData.has('is_published') ? 'true' : 'false')

    try {
      if (isEditing) {
        await updateTestimonial(testimonial.id, formData)
      } else {
        await createTestimonial(formData)
      }
      router.push('/admin/testimonials')
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
        <label htmlFor="name" style={styles.label}>Author Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={testimonial?.name ?? ''}
          placeholder="e.g. Priya M."
          style={styles.input}
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="description" style={styles.label}>Testimonial Text</label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={testimonial?.description ?? ''}
          placeholder="Enter the patient's testimonial..."
          style={{ ...styles.input, resize: 'vertical' as const }}
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="media_type" style={styles.label}>Media Type</label>
        <select
          id="media_type"
          name="media_type"
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value)}
          style={styles.input}
        >
          <option value="text">Text Only</option>
          <option value="image">Image Only</option>
          <option value="video">Video Only</option>
          <option value="image_text">Image + Text</option>
          <option value="video_text">Video + Text</option>
        </select>
      </div>

      {(mediaType === 'image' || mediaType === 'image_text') && (
        <div style={styles.field}>
          <label style={styles.label}>Photo</label>
          <ImageUploader
            currentUrl={imageUrl || null}
            onUpload={(url) => setImageUrl(url)}
          />
        </div>
      )}

      {(mediaType === 'video' || mediaType === 'video_text') && (
        <div style={styles.field}>
          <label style={styles.label}>Video</label>
          <VideoUploader
            currentUrl={videoUrl || null}
            onUpload={(url) => setVideoUrl(url)}
          />
        </div>
      )}

      <div style={styles.row}>
        <div style={styles.field}>
          <label htmlFor="rating" style={styles.label}>Rating (1-5)</label>
          <select
            id="rating"
            name="rating"
            defaultValue={testimonial?.rating ?? 5}
            style={styles.input}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label htmlFor="display_order" style={styles.label}>Display Order</label>
          <input
            id="display_order"
            name="display_order"
            type="number"
            min="0"
            defaultValue={testimonial?.display_order ?? 0}
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.field}>
        <label htmlFor="alt_text" style={styles.label}>Image Alt Text (for SEO)</label>
        <input
          id="alt_text"
          name="alt_text"
          type="text"
          defaultValue={testimonial?.alt_text ?? ''}
          placeholder="e.g. Happy patient at Smile Right clinic"
          style={styles.input}
        />
      </div>

      <div style={styles.checkboxField}>
        <input
          id="is_published"
          name="is_published"
          type="checkbox"
          defaultChecked={testimonial?.is_published ?? false}
          style={{ width: '18px', height: '18px' }}
        />
        <label htmlFor="is_published" style={{ ...styles.label, margin: 0 }}>
          Published (visible on public site)
        </label>
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          onClick={() => router.back()}
          style={styles.cancelBtn}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          style={{ ...styles.submitBtn, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : isEditing ? 'Update Testimonial' : 'Create Testimonial'}
        </button>
      </div>
    </form>
  )
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    maxWidth: '700px',
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
  checkboxField: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
