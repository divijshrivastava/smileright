'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createServiceImage, deleteServiceImage, setServiceImagePrimary } from '@/app/admin/actions'
import ImageUploader from './ImageUploader'
import type { ServiceImage } from '@/lib/types'

interface UnifiedServiceImageManagerProps {
  serviceId: string
  images: ServiceImage[]
}

export default function UnifiedServiceImageManager({ serviceId, images }: UnifiedServiceImageManagerProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(images.length === 0) // Auto-open if no images
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newAltText, setNewAltText] = useState('')
  const [newCaption, setNewCaption] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [settingPrimary, setSettingPrimary] = useState<string | null>(null)

  const handleAddImage = async () => {
    if (!newImageUrl) {
      alert('Please upload an image first')
      return
    }

    setSaving(true)
    const formData = new FormData()
    formData.set('image_url', newImageUrl)
    formData.set('alt_text', newAltText)
    formData.set('caption', newCaption)
    formData.set('display_order', String(images.length + 1))

    try {
      await createServiceImage(serviceId, formData)
      setNewImageUrl('')
      setNewAltText('')
      setNewCaption('')
      setIsAdding(false)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add image')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteImage = async (imageId: string, isPrimary: boolean) => {
    if (isPrimary && images.length > 1) {
      if (!confirm('This is the primary image. Another image will be automatically set as primary. Are you sure you want to delete it?')) {
        return
      }
    } else if (!confirm('Are you sure you want to delete this image?')) {
      return
    }

    setDeleting(imageId)
    try {
      await deleteServiceImage(imageId)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete image')
      setDeleting(null)
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    setSettingPrimary(imageId)
    try {
      await setServiceImagePrimary(serviceId, imageId)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to set primary image')
      setSettingPrimary(null)
    }
  }

  // Sort images: primary first, then by display_order
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.display_order - b.display_order
  })

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>Service Images ({images.length})</h3>
          {images.length === 0 && (
            <p style={styles.subtitle}>Add at least one image to get started</p>
          )}
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          style={styles.addBtn}
        >
          {isAdding ? 'Cancel' : '+ Add Image'}
        </button>
      </div>

      {isAdding && (
        <div style={styles.addForm}>
          <div style={styles.field}>
            <label style={styles.label}>Upload Image *</label>
            <ImageUploader
              currentUrl={newImageUrl || null}
              onUpload={(url) => setNewImageUrl(url)}
              bucket="testimonial-images"
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="new-alt-text" style={styles.label}>Alt Text (for SEO)</label>
            <input
              id="new-alt-text"
              type="text"
              value={newAltText}
              onChange={(e) => setNewAltText(e.target.value)}
              placeholder="Describe the image for accessibility"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label htmlFor="new-caption" style={styles.label}>Caption (optional)</label>
            <input
              id="new-caption"
              type="text"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder="Add a caption for the image"
              style={styles.input}
            />
          </div>

          <button
            onClick={handleAddImage}
            disabled={saving || !newImageUrl}
            style={{
              ...styles.saveBtn,
              opacity: saving || !newImageUrl ? 0.5 : 1,
            }}
          >
            {saving ? 'Adding...' : images.length === 0 ? 'Add Primary Image' : 'Add Image'}
          </button>
          {images.length === 0 && (
            <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '-0.5rem' }}>
              The first image will be set as the primary/thumbnail image
            </small>
          )}
        </div>
      )}

      {images.length > 0 ? (
        <div style={styles.grid}>
          {sortedImages.map((image) => (
            <div key={image.id} style={styles.imageCard}>
              {image.is_primary && (
                <div style={styles.primaryBadge}>Primary</div>
              )}
              <div style={styles.imageWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.image_url}
                  alt={image.alt_text || 'Service image'}
                  style={styles.image}
                />
              </div>
              <div style={styles.imageInfo}>
                {image.caption && (
                  <p style={styles.caption}>{image.caption}</p>
                )}
                {image.alt_text && (
                  <p style={styles.altText}>Alt: {image.alt_text}</p>
                )}
                <p style={styles.order}>Order: {image.display_order}</p>
              </div>
              <div style={styles.actions}>
                {!image.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(image.id)}
                    disabled={settingPrimary === image.id}
                    style={{
                      ...styles.primaryBtn,
                      opacity: settingPrimary === image.id ? 0.5 : 1,
                    }}
                  >
                    {settingPrimary === image.id ? 'Setting...' : 'Set as Primary'}
                  </button>
                )}
                <button
                  onClick={() => handleDeleteImage(image.id, image.is_primary)}
                  disabled={deleting === image.id}
                  style={{
                    ...styles.deleteBtn,
                    opacity: deleting === image.id ? 0.5 : 1,
                  }}
                >
                  {deleting === image.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p>No images added yet. Click "Add Image" to get started.</p>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    color: '#292828',
    margin: 0,
  },
  subtitle: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#666',
    margin: '0.25rem 0 0 0',
  },
  addBtn: {
    padding: '8px 16px',
    background: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
  },
  addForm: {
    background: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
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
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
  },
  saveBtn: {
    padding: '10px 20px',
    background: '#1B73BA',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    alignSelf: 'flex-start',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  imageCard: {
    background: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  primaryBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    background: '#1B73BA',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 700,
    fontFamily: 'var(--font-sans)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    zIndex: 1,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: '1',
    overflow: 'hidden',
    background: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imageInfo: {
    padding: '12px',
    flex: 1,
  },
  caption: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    color: '#292828',
    margin: '0 0 8px 0',
    fontWeight: 600,
  },
  altText: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: '#666',
    margin: '0 0 4px 0',
  },
  order: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.8rem',
    color: '#999',
    margin: 0,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
  },
  primaryBtn: {
    padding: '8px',
    background: '#1B73BA',
    color: '#fff',
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
  },
  deleteBtn: {
    padding: '8px',
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#999',
    fontFamily: 'var(--font-sans)',
  },
}
