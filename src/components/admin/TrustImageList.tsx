'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTrustImage, toggleTrustImagePublish } from '@/app/admin/actions'
import type { TrustImage, AppRole } from '@/lib/types'
import Image from 'next/image'
import { canEditContent, canDeleteContent, canPublishDirectly } from '@/lib/permissions'

interface TrustImageListProps {
  images: TrustImage[]
  userRole: AppRole
}

export default function TrustImageList({ images, userRole }: TrustImageListProps) {
  const isEditor = canEditContent(userRole)
  const isAdmin = canDeleteContent(userRole)
  const canPublish = canPublishDirectly(userRole)
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
      const result = await toggleTrustImagePublish(id, !isPublished)
      if (result && 'pending' in result) {
        alert('Your publish request has been submitted for admin approval.')
      }
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
    <>
      <div style={styles.list}>
        {images.map((image) => (
          <div key={image.id} style={styles.card} className="trust-image-card">
            <div style={styles.imageContainer} className="trust-image-container">
              <Image
                src={image.image_url}
                alt={image.alt_text || 'Trust image'}
                width={300}
                height={200}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
              />
            </div>

            <div style={styles.content} className="trust-image-content">
              <div style={styles.info}>
                <p style={styles.caption}>
                  {image.caption || <em style={{ color: '#999' }}>No caption</em>}
                </p>
                <p style={styles.meta}>
                  Order: {image.display_order} · {image.is_published ? 'Published' : 'Draft'}
                </p>
              </div>

              <div style={styles.actions} className="trust-image-actions">
                {isEditor && (
                  <button
                    onClick={() => handleTogglePublish(image.id, image.is_published)}
                    style={{
                      ...styles.actionBtn,
                      background: image.is_published ? '#f5f5f5' : '#1B73BA',
                      color: image.is_published ? '#292828' : '#fff',
                    }}
                    className="trust-action-btn"
                  >
                    {canPublish
                      ? (image.is_published ? 'Unpublish' : 'Publish')
                      : (image.is_published ? 'Request Unpublish' : 'Request Publish')}
                  </button>
                )}
                {isEditor && (
                  <button
                    onClick={() => router.push(`/admin/trust-images/${image.id}/edit`)}
                    style={styles.actionBtn}
                    className="trust-action-btn"
                  >
                    Edit
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(image.id)}
                    disabled={deletingId === image.id}
                    style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                    className="trust-action-btn"
                  >
                    {deletingId === image.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .trust-image-card {
            flex-direction: column !important;
          }
          
          .trust-image-container {
            width: 100% !important;
            flex-shrink: 1 !important;
          }
          
          .trust-image-container img {
            width: 100% !important;
            height: auto !important;
            max-height: 240px !important;
          }
          
          .trust-image-content {
            padding: 1rem 0 0 0 !important;
          }
          
          .trust-image-actions {
            flex-direction: column !important;
            gap: 10px !important;
          }
          
          .trust-action-btn {
            width: 100% !important;
            padding: 12px 16px !important;
            font-size: 0.95rem !important;
            min-height: 48px !important;
            text-align: center !important;
          }
        }
      `}</style>
    </>
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
