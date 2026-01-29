'use client'

import { useEffect } from 'react'

export default function HeaderScroll() {
  useEffect(() => {
    const header = document.getElementById('header')
    if (!header) return

    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled')
      } else {
        header.classList.remove('scrolled')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return null
}
