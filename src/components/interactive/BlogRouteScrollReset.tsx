'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function BlogRouteScrollReset() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname.startsWith('/blog')) return

    const raf = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })

    return () => window.cancelAnimationFrame(raf)
  }, [pathname])

  return null
}
