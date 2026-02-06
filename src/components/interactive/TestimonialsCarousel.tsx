'use client'

import type { Testimonial } from '@/lib/types'
import Image from 'next/image'

interface TestimonialsCarouselProps {
  testimonials: Testimonial[]
}

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  const renderMedia = (testimonial: Testimonial) => {
    const mediaType = testimonial.media_type || 'text'

    if (mediaType === 'image' || mediaType === 'image_text') {
      if (testimonial.image_url) {
        return (
          <Image
            src={testimonial.image_url}
            alt={testimonial.alt_text || `${testimonial.name}'s testimonial`}
            width={420}
            height={300}
            style={{ objectFit: 'contain', width: '100%', height: 'auto', display: 'block' }}
          />
        )
      }
    }

    if (mediaType === 'video' || mediaType === 'video_text') {
      if (testimonial.video_url) {
        return (
          <video
            src={testimonial.video_url}
            controls
            preload="metadata"
            playsInline
          >
            Your browser does not support the video tag.
          </video>
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
    <div className="testimonials-carousel">
      {testimonials.map((testimonial) => (
        <div key={testimonial.id} className="testimonial-card">
          {renderMedia(testimonial)}
          <div className="stars">{renderStars(testimonial.rating)}</div>
          {shouldShowText(testimonial) && (
            <p className="testimonial-text">&ldquo;{testimonial.description}&rdquo;</p>
          )}
          <p className="testimonial-author">&mdash; {testimonial.name}</p>
        </div>
      ))}
    </div>
  )
}
