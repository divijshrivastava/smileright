'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteService, toggleServicePublish } from '@/app/admin/actions'
import type { Service } from '@/lib/types'

interface ServiceListProps {
  services: Service[]
}

export default function ServiceList({ services }: ServiceListProps) {
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
      await toggleServicePublish(id, !currentStatus)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update service')
    }
  }

  if (services.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p>No services yet. Create your first service!</p>
      </div>
    )
  }

  return (
    <>
      <div style={styles.list}>
        {services.map((service) => (
          <div key={service.id} style={styles.card} className="service-card">
            <div style={styles.imageContainer} className="service-image-container">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={service.image_url}
                alt={service.alt_text}
                style={styles.image}
              />
            </div>
            <div style={styles.content} className="service-content">
              <div style={styles.header}>
                <h3 style={styles.title}>{service.title}</h3>
                <span style={{
                  ...styles.badge,
                  background: service.is_published ? '#d4edda' : '#f8d7da',
                  color: service.is_published ? '#155724' : '#721c24',
                }}>
                  {service.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p style={styles.description}>{service.description}</p>
              <div style={styles.meta}>
                <span>Order: {service.display_order}</span>
                {service.service_images && service.service_images.length > 0 && (
                  <span style={styles.imageBadge}>
                    📷 {service.service_images.length} {service.service_images.length === 1 ? 'image' : 'images'}
                  </span>
                )}
              </div>
              <div style={styles.actions} className="service-actions">
                <button
                  onClick={() => router.push(`/admin/services/${service.id}/edit`)}
                  style={styles.editBtn}
                  className="action-btn-mobile"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleTogglePublish(service.id, service.is_published)}
                  style={styles.toggleBtn}
                  className="action-btn-mobile"
                >
                  {service.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleDelete(service.id, service.title)}
                  disabled={deleting === service.id}
                  style={{
                    ...styles.deleteBtn,
                    opacity: deleting === service.id ? 0.5 : 1,
                  }}
                  className="action-btn-mobile"
                >
                  {deleting === service.id ? 'Deleting...' : 'Delete'}
                </button>
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
            padding: 1rem !important;
          }
          
          .service-actions {
            flex-direction: column !important;
          }
          
          .action-btn-mobile {
            width: 100% !important;
            padding: 12px 16px !important;
            font-size: 0.95rem !important;
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

const styles: Record<string, React.CSSProperties> = {
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  card: {
    display: 'flex',
    gap: '1.5rem',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  imageContainer: {
    width: '200px',
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  content: {
    flex: 1,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    color: '#292828',
    margin: 0,
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  description: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.95rem',
    color: '#666',
    margin: 0,
    lineHeight: 1.6,
  },
  meta: {
    fontFamily: 'var(--font-sans)',
    fontSize: '0.85rem',
    color: '#999',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  imageBadge: {
    background: '#e3f2fd',
    color: '#1976d2',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: 'auto',
  },
  editBtn: {
    padding: '8px 16px',
    background: '#1B73BA',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
  },
  toggleBtn: {
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
  deleteBtn: {
    padding: '8px 16px',
    background: '#dc3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#999',
    fontFamily: 'var(--font-sans)',
  },
}
