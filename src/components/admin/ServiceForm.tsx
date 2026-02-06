'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createService, updateService } from '@/app/admin/actions'
import ImageUploader from './ImageUploader'
import UnifiedServiceImageManager from './UnifiedServiceImageManager'
import type { Service } from '@/lib/types'

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
      <form id="service-form" onSubmit={handleSubmit} style={styles.form}>
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <label htmlFor="title" style={styles.label}>Service Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={service?.title ?? ''}
            placeholder="e.g. Root Canal Treatment"
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label htmlFor="slug" style={styles.label}>URL Slug *</label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            defaultValue={service?.slug ?? ''}
            placeholder="e.g. root-canal-treatment"
            pattern="[a-z0-9-]+"
            style={styles.input}
          />
          <small style={{ color: '#666', fontSize: '0.85rem' }}>
            URL-friendly identifier (lowercase letters, numbers, and hyphens only). Example: dental-implants
          </small>
        </div>

        <div style={styles.field}>
          <label htmlFor="description" style={styles.label}>Description *</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            defaultValue={service?.description ?? ''}
            placeholder="Describe the service in detail..."
            style={{ ...styles.input, resize: 'vertical' as const }}
          />
        </div>

        {!isEditing && (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Initial Service Image *</label>
              <ImageUploader
                currentUrl={imageUrl || null}
                onUpload={(url) => setImageUrl(url)}
                bucket="testimonial-images"
              />
              <small style={{ color: '#666', fontSize: '0.85rem' }}>
                Upload an initial image. You can add more images and manage them after creating the service.
              </small>
            </div>

            <div style={styles.field}>
              <label htmlFor="alt_text" style={styles.label}>Image Alt Text (for SEO) *</label>
              <input
                id="alt_text"
                name="alt_text"
                type="text"
                required
                placeholder="e.g. Root Canal Treatment"
                style={styles.input}
              />
            </div>
          </>
        )}

        <div style={styles.field}>
          <label htmlFor="display_order" style={styles.label}>Display Order</label>
          <input
            id="display_order"
            name="display_order"
            type="number"
            min="0"
            defaultValue={service?.display_order ?? 0}
            style={styles.input}
          />
          <small style={{ color: '#666', fontSize: '0.85rem' }}>
            Lower numbers appear first
          </small>
        </div>

        <div style={styles.checkboxField}>
          <input
            id="is_published"
            name="is_published"
            type="checkbox"
            defaultChecked={service?.is_published ?? true}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="is_published" style={{ ...styles.label, margin: 0 }}>
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
          form="service-form"
          disabled={saving}
          style={{ ...styles.submitBtn, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving...' : isEditing ? 'Update Service' : 'Create Service'}
        </button>
      </div>
    </>
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
    marginTop: '2rem',
    maxWidth: '700px',
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
