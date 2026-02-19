'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createTestimonial, updateTestimonial } from '@/app/admin/actions'
import type { Testimonial } from '@/lib/types'

// Lazy load uploaders (only needed when specific media type is selected)
const ImageUploader = dynamic(() => import('./ImageUploader'), {
  loading: () => <div style={{ padding: 'var(--admin-space-4)', color: 'var(--admin-gray-400)' }}>Loading uploader...</div>,
})

const VideoUploader = dynamic(() => import('./VideoUploader'), {
  loading: () => <div style={{ padding: 'var(--admin-space-4)', color: 'var(--admin-gray-400)' }}>Loading uploader...</div>,
})

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
    <form onSubmit={handleSubmit} className="admin-form-card" style={{
      maxWidth: '700px',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--admin-space-6)',
    }}>
      {error && <div className="admin-error">{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
        <label htmlFor="name" className="admin-label">Author Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={testimonial?.name ?? ''}
          placeholder="e.g. Priya M."
          className="admin-input"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
        <label htmlFor="description" className="admin-label">Testimonial Text</label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          defaultValue={testimonial?.description ?? ''}
          placeholder="Enter the patient's testimonial..."
          className="admin-input"
          style={{ resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
        <label htmlFor="media_type" className="admin-label">Media Type</label>
        <select
          id="media_type"
          name="media_type"
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value)}
          className="admin-input"
        >
          <option value="text">Text Only</option>
          <option value="image">Image Only</option>
          <option value="video">Video Only</option>
          <option value="image_text">Image + Text</option>
          <option value="video_text">Video + Text</option>
        </select>
      </div>

      {(mediaType === 'image' || mediaType === 'image_text') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
          <label className="admin-label">Photo</label>
          <ImageUploader
            currentUrl={imageUrl || null}
            onUpload={(url) => setImageUrl(url)}
          />
        </div>
      )}

      {(mediaType === 'video' || mediaType === 'video_text') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
          <label className="admin-label">Video</label>
          <VideoUploader
            currentUrl={videoUrl || null}
            onUpload={(url) => setVideoUrl(url)}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--admin-space-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
          <label htmlFor="rating" className="admin-label">Rating (1-5)</label>
          <select
            id="rating"
            name="rating"
            defaultValue={testimonial?.rating ?? 5}
            className="admin-input"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
          <label htmlFor="display_order" className="admin-label">Display Order</label>
          <input
            id="display_order"
            name="display_order"
            type="number"
            min="0"
            defaultValue={testimonial?.display_order ?? 0}
            className="admin-input"
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
        <label htmlFor="alt_text" className="admin-label">Image Alt Text (for SEO)</label>
        <input
          id="alt_text"
          name="alt_text"
          type="text"
          defaultValue={testimonial?.alt_text ?? ''}
          placeholder="e.g. Happy patient at Smile Right clinic"
          className="admin-input"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-3)' }}>
        <input
          id="is_published"
          name="is_published"
          type="checkbox"
          defaultChecked={testimonial?.is_published ?? false}
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
          {saving ? 'Saving...' : isEditing ? 'Update Testimonial' : 'Create Testimonial'}
        </button>
      </div>
    </form>
  )
}
