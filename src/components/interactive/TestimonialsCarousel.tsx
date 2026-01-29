'use client'

import { useEffect, useRef } from 'react'
import type { Testimonial } from '@/lib/types'
import Image from 'next/image'

interface TestimonialsCarouselProps {
  testimonials: Testimonial[]
}

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const positionRef = useRef(0)

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const startAutoScroll = () => {
      intervalRef.current = setInterval(() => {
        const firstCard = carousel.querySelector('.testimonial-card') as HTMLElement
        if (!firstCard) return

        const cardWidth = firstCard.offsetWidth + 20
        const maxScroll = carousel.scrollWidth - carousel.clientWidth

        positionRef.current += cardWidth
        if (positionRef.current >= maxScroll) {
          positionRef.current = 0
        }

        carousel.scrollTo({
          left: positionRef.current,
          behavior: 'smooth',
        })
      }, 3000)
    }

    const stopAutoScroll = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const handleScroll = () => {
      positionRef.current = carousel.scrollLeft
    }

    carousel.addEventListener('mouseenter', stopAutoScroll)
    carousel.addEventListener('mouseleave', startAutoScroll)
    carousel.addEventListener('scroll', handleScroll, { passive: true })

    startAutoScroll()

    return () => {
      stopAutoScroll()
      carousel.removeEventListener('mouseenter', stopAutoScroll)
      carousel.removeEventListener('mouseleave', startAutoScroll)
      carousel.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const renderMedia = (testimonial: Testimonial) => {
    const mediaType = testimonial.media_type || 'text'

    if (mediaType === 'image' || mediaType === 'image_text') {
      if (testimonial.image_url) {
        return (
          <div style={styles.mediaContainer}>
            <Image
              src={testimonial.image_url}
              alt={testimonial.alt_text || `${testimonial.name}'s testimonial`}
              width={400}
              height={300}
              style={{ objectFit: 'cover', borderRadius: '8px', width: '100%', height: 'auto' }}
            />
          </div>
        )
      }
    }

    if (mediaType === 'video' || mediaType === 'video_text') {
      if (testimonial.video_url) {
        return (
          <div style={styles.mediaContainer}>
            <video
              src={testimonial.video_url}
              controls
              style={{ width: '100%', borderRadius: '8px', maxHeight: '400px' }}
            />
          </div>
        )
      }
    }

    return null
  }

  const shouldShowText = (testimonial: Testimonial) => {
    const mediaType = testimonial.media_type || 'text'
    return mediaType === 'text' || mediaType === 'image_text' || mediaType === 'video_text'
  }

  return (
    <div className="testimonials-carousel" ref={carouselRef}>
      {testimonials.map((testimonial) => (
        <div key={testimonial.id} className="testimonial-card">
          {renderMedia(testimonial)}
          {shouldShowText(testimonial) && (
            <>
              <div className="stars">{renderStars(testimonial.rating)}</div>
              <p className="testimonial-text">&ldquo;{testimonial.description}&rdquo;</p>
            </>
          )}
          <p className="testimonial-author">&mdash; {testimonial.name}</p>
        </div>
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  mediaContainer: {
    marginBottom: '1rem',
    width: '100%',
  },
}
