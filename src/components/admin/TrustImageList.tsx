'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTrustImage, toggleTrustImagePublish } from '@/app/admin/actions'
import type { TrustImage } from '@/lib/types'
import Image from 'next/image'

interface TrustImageListProps {
  images: TrustImage[]
}

export default function TrustImageList({ images }: TrustImageListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    setDeletingId(id)
    try {
      await deleteTrustImage(id)
      router.refresh()
    } catch (error) {
      alert('Failed to delete image')
    } finally {
      setDeletingId(null)
    }
  }

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      await toggleTrustImagePublish(id, !isPublished)
      router.refresh()
    } catch (error) {
      alert('Failed to update image')
    }
  }

  if (images.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No trust section images yet.</p>
        <button
          onClick={() => router.push('/admin/trust-images/new')}
          style={styles.createBtn}
        >
          Create Your First Image
        </button>
      </div>
    )
  }

  return (
    <div style={styles.list}>
      {images.map((image) => (
        <div key={image.id} style={styles.card}>
          <div style={styles.imageContainer}>
            <Image
              src={image.image_url}
              alt={image.alt_text || 'Trust image'}
              width={300}
              height={200}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
            />
          </div>
          
          <div style={styles.content}>
            <div style={styles.info}>
              <p style={styles.caption}>
                {image.caption || <em style={{ color: '#999' }}>No caption</em>}
              </p>
              <p style={styles.meta}>
                Order: {image.display_order} · {image.is_published ? '✓ Published' : '✗ Draft'}
              </p>
            </div>

            <div style={styles.actions}>
              <button
                onClick={() => handleTogglePublish(image.id, image.is_published)}
                style={{
                  ...styles.actionBtn,
                  background: image.is_published ? '#f5f5f5' : '#1B73BA',
                  color: image.is_published ? '#292828' : '#fff',
                }}
              >
                {image.is_published ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={() => router.push(`/admin/trust-images/${image.id}/edit`)}
                style={styles.actionBtn}
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(image.id)}
                disabled={deletingId === image.id}
                style={{ ...styles.actionBtn, ...styles.deleteBtn }}
              >
                {deletingId === image.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  card: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1.5rem',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  imageContainer: {
    flexShrink: 0,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
  },
  caption: {
    fontSize: '1rem',
    fontFamily: 'var(--font-sans)',
    margin: '0 0 0.5rem',
    color: '#292828',
  },
  meta: {
    fontSize: '0.85rem',
    color: '#666',
    fontFamily: 'var(--font-sans)',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  actionBtn: {
    padding: '8px 16px',
    background: '#f5f5f5',
    color: '#292828',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  deleteBtn: {
    background: '#fee',
    color: '#c00',
    borderColor: '#fcc',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '3rem',
    background: '#f9f9f9',
    borderRadius: '8px',
    border: '1px dashed #ddd',
  },
  createBtn: {
    padding: '12px 24px',
    background: '#1B73BA',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    marginTop: '1rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
}
