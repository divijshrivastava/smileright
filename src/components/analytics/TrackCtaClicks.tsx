'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

type CtaType = 'book_appointment' | 'whatsapp' | 'instagram'

function classifyCta(element: HTMLAnchorElement): CtaType | null {
  const href = (element.getAttribute('href') || '').toLowerCase()

  if (href.startsWith('tel:')) return 'book_appointment'
  if (href.includes('wa.me/') || href.includes('whatsapp.com/')) return 'whatsapp'
  if (href.includes('instagram.com/')) return 'instagram'

  return null
}

function isSameOrigin(url: URL) {
  return url.origin === window.location.origin
}

function getSectionHint(element: HTMLElement): string {
  const section = element.closest('[id]')
  if (section?.id) return section.id
  return 'unknown'
}

export default function TrackCtaClicks() {
  useEffect(() => {
    const trackedSectionViews = new Set<string>()
    const firedScrollMilestones = new Set<number>()
    const firedBlogReadMilestones = new Set<number>()
    let engagementTimer: number | null = null

    if (!window.dataLayer) {
      window.dataLayer = []
    }
    if (!window.gtag) {
      window.gtag = (...args: unknown[]) => {
        window.dataLayer?.push(args)
      }
    }

    const trackEvent = (eventName: string, payload: Record<string, unknown>) => {
      window.dataLayer?.push({
        event: eventName,
        ...payload,
      })

      window.gtag?.('event', eventName, {
        ...payload,
        transport_type: 'beacon',
      })
    }

    const normalizeHref = (anchor: HTMLAnchorElement) => {
      const href = anchor.getAttribute('href') || ''
      return href.trim()
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return

      const anchor = target.closest('a') as HTMLAnchorElement | null
      if (!anchor) return

      const href = normalizeHref(anchor)
      const ctaType = classifyCta(anchor)
      const payloadBase = {
        link_text: (anchor.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100),
        href: anchor.href,
        section: getSectionHint(anchor),
        page_path: window.location.pathname,
      }

      if (ctaType) {
        trackEvent('cta_click', {
          ...payloadBase,
          cta_type: ctaType,
          cta_text: payloadBase.link_text,
        })
        trackEvent(`${ctaType}_click`, {
          ...payloadBase,
          cta_text: payloadBase.link_text,
        })
        return
      }

      if (href.toLowerCase().includes('maps.app.goo.gl') || href.toLowerCase().includes('google.com/maps')) {
        trackEvent('location_directions_click', payloadBase)
        return
      }

      const hrefLower = href.toLowerCase()
      if (hrefLower.startsWith('/blog') || hrefLower.startsWith('https://www.smilerightdental.org/blog')) {
        trackEvent('blog_click', payloadBase)
        return
      }

      if (hrefLower.startsWith('/treatments-and-services') || hrefLower.startsWith('https://www.smilerightdental.org/treatments-and-services')) {
        trackEvent('treatment_click', payloadBase)
        return
      }

      if (hrefLower.startsWith('#') || hrefLower.startsWith('/#')) {
        const targetSection = hrefLower.replace('/#', '').replace('#', '')
        trackEvent('section_nav_click', {
          ...payloadBase,
          target_section: targetSection,
        })
        return
      }

      try {
        const parsedUrl = new URL(anchor.href)
        if (isSameOrigin(parsedUrl) && parsedUrl.pathname !== window.location.pathname) {
          trackEvent('internal_link_click', {
            ...payloadBase,
            target_path: parsedUrl.pathname,
          })
        }
      } catch {
        // Ignore invalid URLs
      }
    }

    const onFaqClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      const button = target.closest('.faq-question') as HTMLButtonElement | null
      if (!button) return

      const question = (button.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120)
      trackEvent('faq_interaction', {
        question,
        page_path: window.location.pathname,
      })
    }

    const onScrollDepth = () => {
      const doc = document.documentElement
      const maxScrollable = doc.scrollHeight - window.innerHeight
      if (maxScrollable <= 0) return

      const percentage = Math.round((window.scrollY / maxScrollable) * 100)
      const milestones = [25, 50, 75, 90]
      for (const milestone of milestones) {
        if (percentage >= milestone && !firedScrollMilestones.has(milestone)) {
          firedScrollMilestones.add(milestone)
          trackEvent('scroll_depth', {
            depth_percent: milestone,
            page_path: window.location.pathname,
          })
        }
      }
    }

    const onBlogReadProgress = () => {
      if (!window.location.pathname.startsWith('/blog/')) return
      const article = document.querySelector('.blog-post-content') as HTMLElement | null
      if (!article) return

      const rect = article.getBoundingClientRect()
      const articleTop = rect.top + window.scrollY
      const articleHeight = Math.max(1, rect.height)
      const viewed = Math.max(0, Math.min(articleHeight, window.scrollY + window.innerHeight - articleTop))
      const percentage = Math.round((viewed / articleHeight) * 100)
      const milestones = [25, 50, 75, 100]

      for (const milestone of milestones) {
        if (percentage >= milestone && !firedBlogReadMilestones.has(milestone)) {
          firedBlogReadMilestones.add(milestone)
          trackEvent('blog_read_progress', {
            progress_percent: milestone,
            page_path: window.location.pathname,
          })
        }
      }
    }

    const onScroll = () => {
      onScrollDepth()
      onBlogReadProgress()
    }

    const maybeObserveHomeSections = () => {
      if (window.location.pathname !== '/') return () => {}

      const sectionIds = ['home', 'about', 'services', 'gallery', 'testimonials', 'contact']
      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean) as HTMLElement[]

      if (sections.length === 0) return () => {}

      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const element = entry.target as HTMLElement
          const sectionId = element.id
          if (!sectionId || trackedSectionViews.has(sectionId)) continue
          trackedSectionViews.add(sectionId)

          trackEvent('section_view', {
            section: sectionId,
            page_path: window.location.pathname,
          })
        }
      }, {
        threshold: 0.45,
      })

      sections.forEach((section) => observer.observe(section))
      return () => observer.disconnect()
    }

    document.addEventListener('click', onClick)
    document.addEventListener('click', onFaqClick)
    window.addEventListener('scroll', onScroll, { passive: true })
    const cleanupObserver = maybeObserveHomeSections()
    onScroll()
    engagementTimer = window.setTimeout(() => {
      trackEvent('engaged_30s', { page_path: window.location.pathname })
    }, 30000)

    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('click', onFaqClick)
      window.removeEventListener('scroll', onScroll)
      cleanupObserver()
      if (engagementTimer) window.clearTimeout(engagementTimer)
    }
  }, [])

  return null
}
