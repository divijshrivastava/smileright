'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createService, updateService } from '@/app/admin/actions'
import ImageUploader from './ImageUploader'
import type { Service } from '@/lib/types'

// Lazy load the image manager (only needed when editing)
const UnifiedServiceImageManager = dynamic(() => import('./UnifiedServiceImageManager'), {
  loading: () => (
    <div style={{
      padding: 'var(--admin-space-8)',
      background: 'var(--admin-gray-50)',
      borderRadius: 'var(--admin-radius-md)',
      textAlign: 'center',
      color: 'var(--admin-gray-400)',
      fontFamily: 'var(--admin-font-body)',
    }}>
      Loading image manager...
    </div>
  ),
})

interface ServiceFormProps {
  service?: Service
}

export default function ServiceForm({ service }: ServiceFormProps) {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState(service?.image_url ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const isEditing = !!service

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // For new services, require an initial image
    // For existing services, images are managed separately
    if (!isEditing && !imageUrl) {
      setError('Please upload an initial image')
      return
    }

    setError('')
    setSaving(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    // Only include image_url for new services
    if (!isEditing) {
      formData.set('image_url', imageUrl)
    }

    formData.set('is_published', formData.has('is_published') ? 'true' : 'false')

    try {
      if (isEditing) {
        await updateService(service.id, formData)
      } else {
        await createService(formData)
      }
      router.push('/admin/services')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <>
      <form id="service-form" onSubmit={handleSubmit} className="admin-form-card" style={{
        maxWidth: '700px',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--admin-space-6)',
      }}>
        {error && <div className="admin-error">{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
          <label htmlFor="title" className="admin-label">Service Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={service?.title ?? ''}
            placeholder="e.g. Root Canal Treatment"
            className="admin-input"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
          <label htmlFor="slug" className="admin-label">URL Slug *</label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            defaultValue={service?.slug ?? ''}
            placeholder="e.g. root-canal-treatment"
            pattern="[a-z0-9-]+"
            className="admin-input"
          />
          <small className="admin-help-text">
            URL-friendly identifier (lowercase letters, numbers, and hyphens only). Example: dental-implants
          </small>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
          <label htmlFor="description" className="admin-label">Description *</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            defaultValue={service?.description ?? ''}
            placeholder="Describe the service in detail..."
            className="admin-input"
            style={{ resize: 'vertical' }}
          />
        </div>

        {!isEditing && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
              <label className="admin-label">Initial Service Image *</label>
              <ImageUploader
                currentUrl={imageUrl || null}
                onUpload={(url) => setImageUrl(url)}
                bucket="testimonial-images"
              />
              <small className="admin-help-text">
                Upload an initial image. You can add more images and manage them after creating the service.
              </small>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
              <label htmlFor="alt_text" className="admin-label">Image Alt Text (for SEO) *</label>
              <input
                id="alt_text"
                name="alt_text"
                type="text"
                required
                placeholder="e.g. Root Canal Treatment"
                className="admin-input"
              />
            </div>
          </>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-2)' }}>
          <label htmlFor="display_order" className="admin-label">Display Order</label>
          <input
            id="display_order"
            name="display_order"
            type="number"
            min="0"
            defaultValue={service?.display_order ?? 0}
            className="admin-input"
          />
          <small className="admin-help-text">Lower numbers appear first</small>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--admin-space-3)' }}>
          <input
            id="is_published"
            name="is_published"
            type="checkbox"
            defaultChecked={service?.is_published ?? true}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="is_published" className="admin-label" style={{ margin: 0 }}>
            Published (visible on public site)
          </label>
        </div>
      </form>

      {isEditing && service && (
        <UnifiedServiceImageManager
          serviceId={service.id}
          images={service.service_images || []}
        />
      )}

      <div style={{
        display: 'flex',
        gap: 'var(--admin-space-3)',
        justifyContent: 'flex-end',
        paddingTop: 'var(--admin-space-4)',
        marginTop: 'var(--admin-space-8)',
        maxWidth: '700px',
      }}>
        <button
          type="button"
          onClick={() => router.back()}
          className="admin-btn admin-btn--secondary admin-btn--lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="service-form"
          disabled={saving}
          className="admin-btn admin-btn--primary admin-btn--lg"
          style={{ opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : isEditing ? 'Update Service' : 'Create Service'}
        </button>
      </div>
    </>
  )
}
