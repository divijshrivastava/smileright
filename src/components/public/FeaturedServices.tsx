'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Service } from '@/lib/types'

interface FeaturedServicesProps {
  services: Service[]
}

export default function FeaturedServices({ services }: FeaturedServicesProps) {
  const [carouselIndices, setCarouselIndices] = useState<Record<string, number>>({})

  const getIndex = (serviceId: string) => carouselIndices[serviceId] || 0

  const goTo = (serviceId: string, index: number, totalImages: number) => {
    const clamped = Math.max(0, Math.min(index, totalImages - 1))
    setCarouselIndices(prev => ({ ...prev, [serviceId]: clamped }))
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
            const hasImages = service.service_images && service.service_images.length > 0
            const allImages = [
              { id: 'main', image_url: service.image_url, alt_text: service.alt_text, caption: '' },
              ...(service.service_images || [])
            ]
            const currentIndex = getIndex(service.id)
            const currentImage = allImages[currentIndex]

            return (
              <div key={service.id} className="service-card">
                <div className="service-image">
                  {hasImages ? (
                    <div className="carousel">
                      <div className="carousel-image-wrapper">
                        <Image
                          src={currentImage.image_url}
                          alt={currentImage.alt_text || service.title}
                          width={400}
                          height={300}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                        {currentImage.caption && (
                          <div className="carousel-caption">{currentImage.caption}</div>
                        )}
                      </div>
                      <button
                        className="carousel-btn carousel-btn-prev"
                        onClick={() => goTo(service.id, currentIndex - 1, allImages.length)}
                        disabled={currentIndex === 0}
                        aria-label="Previous image"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button
                        className="carousel-btn carousel-btn-next"
                        onClick={() => goTo(service.id, currentIndex + 1, allImages.length)}
                        disabled={currentIndex === allImages.length - 1}
                        aria-label="Next image"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                      <div className="carousel-dots">
                        {allImages.map((_, i) => (
                          <button
                            key={i}
                            className={`carousel-dot ${i === currentIndex ? 'active' : ''}`}
                            onClick={() => goTo(service.id, i, allImages.length)}
                            aria-label={`Go to image ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={service.image_url}
                      alt={service.alt_text}
                      width={400}
                      height={300}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  )}
                </div>
                <div className="service-info">
                  <h3 className="service-title">{service.title}</h3>
                  <p className="service-description">{service.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .service-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .service-image {
          position: relative;
          background: #f8f9fa;
          aspect-ratio: 4/3;
        }

        .carousel {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .carousel-image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .carousel-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
          color: white;
          padding: 24px 12px 8px;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          transition: opacity 0.2s ease, background 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .carousel-btn:hover:not(:disabled) {
          background: #fff;
        }

        .carousel-btn:disabled {
          opacity: 0.3;
          cursor: default;
        }

        .carousel-btn-prev {
          left: 8px;
        }

        .carousel-btn-next {
          right: 8px;
        }

        .carousel-dots {
          position: absolute;
          bottom: 8px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 4px;
          z-index: 2;
        }

        .carousel-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 0;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .carousel-dot.active {
          background: #fff;
          transform: scale(1.25);
        }

        .carousel-dot:hover:not(.active) {
          background: rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </section>
  )
}
