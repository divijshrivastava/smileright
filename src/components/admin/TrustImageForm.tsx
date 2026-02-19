'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTrustImage, updateTrustImage } from '@/app/admin/actions'
import ImageUploader from './ImageUploader'
import type { TrustImage } from '@/lib/types'

interface TrustImageFormProps {
  trustImage?: TrustImage
}

export default function TrustImageForm({ trustImage }: TrustImageFormProps) {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState(trustImage?.image_url ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const isEditing = !!trustImage

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!imageUrl) {
      setError('Please upload an image')
      return
    }

    setError('')
    setSaving(true)

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('image_url', imageUrl)
    formData.set('is_published', formData.has('is_published') ? 'true' : 'false')

    try {
      if (isEditing) {
        await updateTrustImage(trustImage.id, formData)
      } else {
        await createTrustImage(formData)
      }
      router.push('/admin/trust-images')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form} className="admin-form-card">
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.field}>
        <label style={styles.label}>Image *</label>
        <ImageUploader
          currentUrl={imageUrl || null}
          onUpload={(url) => setImageUrl(url)}
          bucket="trust-images"
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="alt_text" style={styles.label}>Image Alt Text (for SEO)</label>
        <input
          id="alt_text"
          name="alt_text"
          type="text"
          defaultValue={trustImage?.alt_text ?? ''}
          placeholder="e.g. Modern dental clinic interior"
          style={styles.input}
          className="admin-input"
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="caption" style={styles.label}>Caption (Optional)</label>
        <textarea
          id="caption"
          name="caption"
          rows={3}
          defaultValue={trustImage?.caption ?? ''}
          placeholder="Enter an optional caption to display on the image..."
          style={{ ...styles.input, resize: 'vertical' as const }}
          className="admin-input"
        />
      </div>

      <div style={styles.field}>
        <label htmlFor="display_order" style={styles.label}>Display Order</label>
        <input
          id="display_order"
          name="display_order"
          type="number"
          min="0"
          defaultValue={trustImage?.display_order ?? 0}
          style={styles.input}
          className="admin-input"
        />
      </div>

      <div style={styles.checkboxField}>
        <input
          id="is_published"
          name="is_published"
          type="checkbox"
          defaultChecked={trustImage?.is_published ?? true}
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
          className="admin-secondary-btn"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          style={{ ...styles.submitBtn, opacity: saving ? 0.7 : 1 }}
          className="admin-primary-btn"
        >
          {saving ? 'Saving...' : isEditing ? 'Update Image' : 'Create Image'}
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
