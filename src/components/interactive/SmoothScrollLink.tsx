'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function SmoothScrollLink() {
  const pathname = usePathname()

  useEffect(() => {
    // Use event delegation on document for reliability
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a') as HTMLAnchorElement | null
      
      if (!anchor) return
      
      const href = anchor.getAttribute('href')
      if (!href) return

      // Handle both "#section" and "/#section" formats
      let hash: string | null = null
      
      if (href.startsWith('#')) {
        hash = href
      } else if (href.startsWith('/#')) {
        // If we're on the homepage, treat /#section as #section
        if (pathname === '/') {
          hash = href.substring(1) // Remove leading slash
        }
        // If not on homepage, let the browser navigate normally
      }

      if (!hash || hash === '#') return

      const targetElement = document.querySelector(hash)
      if (targetElement) {
        e.preventDefault()
        const headerOffset = 100
        const elementPosition = targetElement.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.scrollY - headerOffset
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        })

        // Update URL hash without jumping
        history.pushState(null, '', hash)
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [pathname])

  return null
}
