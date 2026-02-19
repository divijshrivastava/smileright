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
      <div className="admin-empty-state">
        <p className="admin-empty-state__title">No trust section images yet</p>
        <p className="admin-empty-state__description">Upload your first trust image to build credibility.</p>
        <button
          onClick={() => router.push('/admin/trust-images/new')}
          className="admin-btn admin-btn--primary admin-btn--lg"
        >
          Create Your First Image
        </button>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-6)' }}>
        {images.map((image) => (
          <div key={image.id} className="admin-card trust-image-card" style={{ display: 'flex', gap: 'var(--admin-space-6)', padding: 'var(--admin-space-6)' }}>
            <div className="trust-image-container" style={{ flexShrink: 0 }}>
              <Image
                src={image.image_url}
                alt={image.alt_text || 'Trust image'}
                width={300}
                height={200}
                style={{ objectFit: 'cover', borderRadius: 'var(--admin-radius-sm)' }}
              />
            </div>

            <div className="trust-image-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p style={{
                  fontSize: 'var(--admin-text-base)',
                  fontFamily: 'var(--admin-font-body)',
                  margin: '0 0 var(--admin-space-2)',
                  color: 'var(--admin-gray-900)',
                }}>
                  {image.caption || <em style={{ color: 'var(--admin-gray-400)' }}>No caption</em>}
                </p>
                <p style={{
                  fontSize: 'var(--admin-text-xs)',
                  color: 'var(--admin-gray-400)',
                  fontFamily: 'var(--admin-font-body)',
                  margin: 0,
                  display: 'flex',
                  gap: 'var(--admin-space-2)',
                  alignItems: 'center',
                }}>
                  <span>Order: {image.display_order}</span>
                  <span>·</span>
                  <span className={`admin-badge ${image.is_published ? 'admin-badge--published' : 'admin-badge--draft'}`}>
                    {image.is_published ? 'Published' : 'Draft'}
                  </span>
                </p>
              </div>

              <div className="trust-image-actions" style={{ display: 'flex', gap: 'var(--admin-space-3)', marginTop: 'var(--admin-space-4)' }}>
                {isEditor && (
                  <button
                    onClick={() => handleTogglePublish(image.id, image.is_published)}
                    className={`admin-btn trust-action-btn ${image.is_published ? 'admin-btn--secondary' : 'admin-btn--primary'}`}
                  >
                    {canPublish
                      ? (image.is_published ? 'Unpublish' : 'Publish')
                      : (image.is_published ? 'Request Unpublish' : 'Request Publish')}
                  </button>
                )}
                {isEditor && (
                  <button
                    onClick={() => router.push(`/admin/trust-images/${image.id}/edit`)}
                    className="admin-btn admin-btn--secondary trust-action-btn"
                  >
                    Edit
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(image.id)}
                    disabled={deletingId === image.id}
                    className="admin-btn admin-btn--danger-outline trust-action-btn"
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
            padding: var(--admin-space-4) 0 0 0 !important;
          }
          
          .trust-image-actions {
            flex-direction: column !important;
            gap: var(--admin-space-3) !important;
          }
          
          .trust-action-btn {
            width: 100% !important;
            min-height: 48px !important;
            text-align: center !important;
          }
        }
      `}</style>
    </>
  )
}
