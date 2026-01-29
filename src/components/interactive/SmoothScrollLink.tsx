'use client'

import { useEffect } from 'react'

export default function SmoothScrollLink() {
  useEffect(() => {
    const handleClick = (e: Event) => {
      const anchor = e.currentTarget as HTMLAnchorElement
      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('#')) return

      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        const offsetTop = (target as HTMLElement).offsetTop - 90
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        })
      }
    }

    const anchors = document.querySelectorAll('a[href^="#"]')
    anchors.forEach((anchor) => anchor.addEventListener('click', handleClick))

    return () => {
      anchors.forEach((anchor) => anchor.removeEventListener('click', handleClick))
    }
  }, [])

  return null
}
