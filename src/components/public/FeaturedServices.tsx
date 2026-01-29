'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Service } from '@/lib/types'

interface FeaturedServicesProps {
  services: Service[]
}

export default function FeaturedServices({ services }: FeaturedServicesProps) {
  const [expandedService, setExpandedService] = useState<string | null>(null)

  const toggleService = (serviceId: string) => {
    setExpandedService(expandedService === serviceId ? null : serviceId)
  }

  return (
    <section id="services" className="featured-services">
      <div className="container">
        <h2 className="section-title">Our Featured Services</h2>
        <p className="section-subtitle">
          Comprehensive dental care tailored to your unique needs, delivered with precision and care.
        </p>

        <div className="services-grid">
          {services.map((service) => {
            const isExpanded = expandedService === service.id
            const hasImages = service.service_images && service.service_images.length > 0
            
            return (
              <div 
                key={service.id} 
                className={`service-card ${isExpanded ? 'expanded' : ''}`}
                onClick={() => hasImages && toggleService(service.id)}
                style={{ cursor: hasImages ? 'pointer' : 'default' }}
              >
                <div className="service-image">
                  <Image
                    src={service.image_url}
                    alt={service.alt_text}
                    width={400}
                    height={200}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {hasImages && (
                    <div className="image-count-badge">
                      <svg 
                        width="16" 
                        height="16" 
                        viewBox="0 0 16 16" 
                        fill="currentColor"
                      >
                        <path d="M4.5 2A1.5 1.5 0 0 0 3 3.5v9A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 11.5 2h-7zM6 5.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4.5 5.5h-7l2-3 1.5 2 2-3L11 11h.5z"/>
                      </svg>
                      <span>{service.service_images?.length || 0}</span>
                    </div>
                  )}
                  {hasImages && (
                    <div className="expand-indicator">
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        style={{ 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="service-info">
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                  {hasImages && (
                    <button 
                      className="view-images-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleService(service.id)
                      }}
                    >
                      {isExpanded ? 'Hide Images' : 'View Images'}
                    </button>
                  )}
                </div>
                
                {isExpanded && hasImages && service.service_images && (
                  <div className="service-gallery" onClick={(e) => e.stopPropagation()}>
                    <div className="gallery-grid">
                      {service.service_images.map((img) => (
                        <div key={img.id} className="gallery-item">
                          <Image
                            src={img.image_url}
                            alt={img.alt_text || service.title}
                            width={300}
                            height={300}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {img.caption && (
                            <div className="gallery-caption">{img.caption}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .service-card {
          transition: all 0.3s ease;
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .service-card.expanded {
          grid-column: 1 / -1;
        }

        .service-image {
          position: relative;
        }

        .image-count-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          z-index: 2;
        }

        .expand-indicator {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(27, 115, 186, 0.9);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .view-images-btn {
          display: inline-block;
          margin-top: 12px;
          padding: 10px 20px;
          background: #1B73BA;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease;
          font-family: var(--font-sans);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .view-images-btn:hover {
          background: #155a91;
        }

        .service-gallery {
          padding: 24px;
          background: #f8f9fa;
          border-top: 2px solid #e9ecef;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }

        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 12px;
          }
        }

        .gallery-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .gallery-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .gallery-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
          color: white;
          padding: 8px 12px;
          font-size: 0.85rem;
          line-height: 1.4;
        }
      `}</style>
    </section>
  )
}
