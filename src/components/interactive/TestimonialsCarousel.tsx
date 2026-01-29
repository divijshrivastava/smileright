'use client'

import { useEffect, useRef } from 'react'
import type { Testimonial } from '@/lib/types'

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

  return (
    <div className="testimonials-carousel" ref={carouselRef}>
      {testimonials.map((testimonial) => (
        <div key={testimonial.id} className="testimonial-card">
          <div className="stars">{renderStars(testimonial.rating)}</div>
          <p className="testimonial-text">&ldquo;{testimonial.description}&rdquo;</p>
          <p className="testimonial-author">&mdash; {testimonial.name}</p>
        </div>
      ))}
    </div>
  )
}
