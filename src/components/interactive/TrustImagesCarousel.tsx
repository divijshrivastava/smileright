'use client'

import { useState, useEffect } from 'react'
import type { TrustImage } from '@/lib/types'
import Image from 'next/image'

interface TrustImagesCarouselProps {
  images: TrustImage[]
}

export default function TrustImagesCarousel({ images }: TrustImagesCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [carouselHeight, setCarouselHeight] = useState('500px')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const updateHeight = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      if (mobile) {
        setCarouselHeight('320px')
      } else if (window.innerWidth < 1024) {
        setCarouselHeight('400px')
      } else {
        setCarouselHeight('500px')
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  useEffect(() => {
    if (images.length <= 1) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [images.length])

  if (images.length === 0) return null

  const goToSlide = (index: number) => {
    setCurrent(index)
  }

  const goToPrevious = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % images.length)
  }

  return (
    <div style={styles.carouselContainer}>
      <div style={{ ...styles.carouselWrapper, height: carouselHeight }}>
        {images.map((image, index) => (
          <div
            key={image.id}
            style={{
              ...styles.slide,
              opacity: index === current ? 1 : 0,
              transform: `translateX(${(index - current) * 100}%)`,
            }}
          >
            <div style={styles.imageWrapper}>
              <Image
                src={image.image_url}
                alt={image.alt_text || 'Trust section image'}
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 100vw, 1200px"
                priority={index === 0}
              />
              {image.caption && (
                <div style={styles.caption}>
                  {image.caption}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            style={styles.arrowButton}
            aria-label="Previous image"
          >
            <span style={styles.arrow}>‹</span>
          </button>
          <button
            onClick={goToNext}
            style={{ ...styles.arrowButton, right: '10px', left: 'auto' }}
            aria-label="Next image"
          >
            <span style={styles.arrow}>›</span>
          </button>

          <div style={styles.dots}>
            {images.map((_, index) => {
              const dotSize = isMobile ? '6px' : '8px'
              const borderWidth = isMobile ? '1px' : '1.5px'

              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="carousel-dot"
                  style={{
                    width: dotSize,
                    height: dotSize,
                    minWidth: dotSize,
                    minHeight: dotSize,
                    maxWidth: dotSize,
                    maxHeight: dotSize,
                    borderRadius: '50%',
                    border: `${borderWidth} solid #fff`,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    padding: '0',
                    margin: '0',
                    backgroundColor: index === current ? '#1B73BA' : 'rgba(255,255,255,0.5)',
                    flexShrink: 0,
                  }}
                  aria-label={`Go to image ${index + 1}`}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  carouselContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    overflow: 'hidden',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    background: 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%)',
  },
  carouselWrapper: {
    position: 'relative',
    width: '100%',
  },
  slide: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transition: 'all 0.5s ease-in-out',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  caption: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    color: '#fff',
    padding: '40px 20px 20px',
    fontSize: '1.2rem',
    textAlign: 'center',
    fontFamily: 'var(--font-sans)',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    left: '10px',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  arrow: {
    fontSize: '2rem',
    color: '#1B73BA',
    fontWeight: 'bold',
    lineHeight: 1,
  },
  dots: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '6px',
    zIndex: 10,
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    border: '1.5px solid #fff',
    cursor: 'pointer',
    transition: 'all 0.3s',
    padding: 0,
  },
}
