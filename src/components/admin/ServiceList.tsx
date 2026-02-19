'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteService, toggleServicePublish } from '@/app/admin/actions'
import type { Service, AppRole } from '@/lib/types'
import { canEditContent, canDeleteContent, canPublishDirectly } from '@/lib/permissions'

interface ServiceListProps {
  services: Service[]
  userRole: AppRole
}

export default function ServiceList({ services, userRole }: ServiceListProps) {
  const isEditor = canEditContent(userRole)
  const isAdmin = canDeleteContent(userRole)
  const canPublish = canPublishDirectly(userRole)
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    setDeleting(id)
    try {
      await deleteService(id)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete service')
      setDeleting(null)
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const result = await toggleServicePublish(id, !currentStatus)
      if (result && 'pending' in result) {
        alert('Your publish request has been submitted for admin approval.')
      }
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update service')
    }
  }

  if (services.length === 0) {
    return (
      <div className="admin-empty-state">
        <p className="admin-empty-state__title">No services yet</p>
        <p className="admin-empty-state__description">Create your first service to get started.</p>
        <button
          onClick={() => router.push('/admin/services/new')}
          className="admin-btn admin-btn--primary admin-btn--lg"
        >
          Create Your First Service
        </button>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--admin-space-6)' }}>
        {services.map((service) => (
          <div key={service.id} className="admin-card service-card" style={{ display: 'flex', gap: 0, padding: 0, overflow: 'hidden' }}>
            <div className="service-image-container" style={{ width: '200px', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={service.image_url}
                alt={service.alt_text}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="service-content" style={{
              flex: 1,
              padding: 'var(--admin-space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--admin-space-4)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{
                  fontFamily: 'var(--admin-font-heading)',
                  fontSize: 'var(--admin-text-2xl)',
                  color: 'var(--admin-gray-900)',
                  margin: 0,
                }}>
                  {service.title}
                </h3>
                <span className={`admin-badge ${service.is_published ? 'admin-badge--published' : 'admin-badge--draft'}`}>
                  {service.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p style={{
                fontFamily: 'var(--admin-font-body)',
                fontSize: 'var(--admin-text-sm)',
                color: 'var(--admin-gray-500)',
                margin: 0,
                lineHeight: 1.6,
              }}>
                {service.description}
              </p>
              <div style={{
                fontFamily: 'var(--admin-font-body)',
                fontSize: 'var(--admin-text-xs)',
                color: 'var(--admin-gray-400)',
                display: 'flex',
                gap: 'var(--admin-space-4)',
                alignItems: 'center',
              }}>
                <span>Order: {service.display_order}</span>
                {service.service_images && service.service_images.length > 0 && (
                  <span className="admin-badge admin-badge--info">
                    📷 {service.service_images.length} {service.service_images.length === 1 ? 'image' : 'images'}
                  </span>
                )}
              </div>
              <div className="service-actions" style={{ display: 'flex', gap: 'var(--admin-space-3)', marginTop: 'auto' }}>
                {isEditor && (
                  <button
                    onClick={() => router.push(`/admin/services/${service.id}/edit`)}
                    className="admin-btn admin-btn--primary action-btn-mobile"
                  >
                    Edit
                  </button>
                )}
                {isEditor && (
                  <button
                    onClick={() => handleTogglePublish(service.id, service.is_published)}
                    className="admin-btn admin-btn--secondary action-btn-mobile"
                  >
                    {canPublish
                      ? (service.is_published ? 'Unpublish' : 'Publish')
                      : (service.is_published ? 'Request Unpublish' : 'Request Publish')}
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(service.id, service.title)}
                    disabled={deleting === service.id}
                    className="admin-btn admin-btn--danger-outline action-btn-mobile"
                  >
                    {deleting === service.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .service-card {
            flex-direction: column !important;
          }
          
          .service-image-container {
            width: 100% !important;
            height: 200px !important;
          }
          
          .service-content {
            padding: var(--admin-space-4) !important;
          }
          
          .service-actions {
            flex-direction: column !important;
          }
          
          .action-btn-mobile {
            width: 100% !important;
            min-height: 48px !important;
          }
        }
        
        @media (max-width: 480px) {
          .service-image-container {
            height: 180px !important;
          }
        }
      `}</style>
    </>
  )
}
