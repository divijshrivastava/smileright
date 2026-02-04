'use client'

import { useEffect, useState, useRef } from 'react'

export default function FloatingWhatsApp() {
  const [scrollState, setScrollState] = useState<'top' | 'transitioning' | 'floating'>('top')
  const [heroButtonRect, setHeroButtonRect] = useState<DOMRect | null>(null)
  const floatingRef = useRef<HTMLAnchorElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    // Get the hero WhatsApp button position
    const updateHeroButtonPosition = () => {
      const heroButtons = document.querySelector('.hero-buttons')
      const heroWhatsAppButton = heroButtons?.querySelector('a[href*="wa.me"]') as HTMLElement

      if (heroWhatsAppButton) {
        const rect = heroWhatsAppButton.getBoundingClientRect()
        setHeroButtonRect(rect)
      }
    }

    const handleScroll = () => {
      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Use requestAnimationFrame for smooth updates
      animationFrameRef.current = requestAnimationFrame(() => {
        // Update hero button position on every scroll for accurate tracking
        updateHeroButtonPosition()

        const heroSection = document.querySelector('.hero')
        if (heroSection) {
          const heroBottom = heroSection.getBoundingClientRect().bottom
          const scrollProgress = window.scrollY
          const windowHeight = window.innerHeight

          // Define transition zones with smoother thresholds
          if (scrollProgress < 10) {
            // At the very top
            setScrollState('top')
          } else if (heroBottom > windowHeight * 0.3) {
            // In transition zone - button is morphing
            // This gives more time for the animation to play out
            setScrollState('transitioning')
          } else {
            // Fully scrolled past hero - button is floating
            setScrollState('floating')
          }
        }
      })
    }

    // Initial setup
    updateHeroButtonPosition()
    handleScroll()

    // Add listeners
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateHeroButtonPosition, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateHeroButtonPosition)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Calculate transform origin based on hero button position
  const getTransformStyle = () => {
    if (!heroButtonRect || !floatingRef.current) return {}

    const floatingRect = floatingRef.current.getBoundingClientRect()

    // Calculate the distance from hero button to floating position
    const deltaX = heroButtonRect.left + heroButtonRect.width / 2 - (floatingRect.left + floatingRect.width / 2)
    const deltaY = heroButtonRect.top + heroButtonRect.height / 2 - (floatingRect.top + floatingRect.height / 2)

    if (scrollState === 'top') {
      // At the top - button should be at hero position
      return {
        '--morph-x': `${deltaX}px`,
        '--morph-y': `${deltaY}px`,
        '--morph-scale': '1.0',
        '--morph-width': `${heroButtonRect.width}px`,
      } as React.CSSProperties
    } else if (scrollState === 'transitioning') {
      // Transitioning - interpolate between hero and floating position
      // Calculate progress based on how far we've scrolled
      const heroSection = document.querySelector('.hero')
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom
        const windowHeight = window.innerHeight
        // Progress from 0 (at hero) to 1 (fully transitioned)
        const progress = Math.max(0, Math.min(1, (windowHeight - heroBottom) / (windowHeight - 50)))

        return {
          '--morph-x': `${deltaX * (1 - progress)}px`,
          '--morph-y': `${deltaY * (1 - progress)}px`,
          '--morph-scale': `${1.0 - (progress * 0.1)}`,
          '--morph-width': `${heroButtonRect.width - (progress * (heroButtonRect.width - 80))}px`,
        } as React.CSSProperties
      }
    }

    // Floating state - at final position
    return {
      '--morph-x': '0px',
      '--morph-y': '0px',
      '--morph-scale': '1',
      '--morph-width': '60px',
    } as React.CSSProperties
  }

  return (
    <a
      ref={floatingRef}
      href="https://wa.me/917977991130?text=Hi,%20I%20would%20like%20to%20book%20an%20appointment"
      className={`floating-whatsapp floating-whatsapp--${scrollState}`}
      style={getTransformStyle()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <span className="whatsapp-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </span>
      <span className="whatsapp-text">Chat with us</span>
    </a>
  )
}
