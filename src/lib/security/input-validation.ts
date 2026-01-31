/**
 * Input Validation and Sanitization
 * Prevents XSS and injection attacks
 */

import sanitizeHtml from 'sanitize-html'

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input) return ''
  
  // Trim and limit length
  let sanitized = input.trim().substring(0, maxLength)
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  
  return sanitized
}

/**
 * Sanitize HTML input - strips all HTML tags
 */
export function sanitizeHTML(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

/**
 * Validate and sanitize URL
 */
export function sanitizeURL(url: string, allowedProtocols: string[] = ['http', 'https']): string | null {
  if (!url) return null
  
  try {
    const parsed = new URL(url)
    
    // Check if protocol is allowed
    const protocol = parsed.protocol.replace(':', '')
    if (!allowedProtocols.includes(protocol)) {
      return null
    }
    
    // Check for dangerous patterns
    if (url.includes('javascript:') || url.includes('data:') || url.includes('vbscript:')) {
      return null
    }
    
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate integer within range
 */
export function validateInteger(value: unknown, min?: number, max?: number): number | null {
  const num = typeof value === 'string' ? parseInt(value, 10) : Number(value)
  
  if (isNaN(num) || !Number.isInteger(num)) {
    return null
  }
  
  if (min !== undefined && num < min) {
    return null
  }
  
  if (max !== undefined && num > max) {
    return null
  }
  
  return num
}

/**
 * Validate boolean value
 */
export function validateBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value
  }
  
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }
  
  return false
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '')
  
  // Remove directory separators
  sanitized = sanitized.replace(/[/\\]/g, '')
  
  // Remove special characters except dots, dashes, and underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_')
  
  // Limit length
  sanitized = sanitized.substring(0, 255)
  
  return sanitized
}

/**
 * Validate file extension against allowed list
 */
export function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ext ? allowedExtensions.includes(ext) : false
}

/**
 * Check for SQL injection patterns (basic)
 */
export function containsSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * Comprehensive input validation for testimonial data
 */
export interface TestimonialInput {
  name: string
  description: string
  rating: number
  display_order: number
  image_url?: string | null
  video_url?: string | null
  alt_text?: string | null
}

export function validateTestimonialInput(data: FormData): TestimonialInput | { error: string } {
  const name = sanitizeString(data.get('name') as string, 100)
  const description = sanitizeString(data.get('description') as string, 2000)
  const rating = validateInteger(data.get('rating'), 1, 5)
  const display_order = validateInteger(data.get('display_order'), 0) ?? 0
  const image_url = sanitizeURL(data.get('image_url') as string || '')
  const video_url = sanitizeURL(data.get('video_url') as string || '')
  const alt_text = sanitizeString(data.get('alt_text') as string || '', 200)
  
  if (!name || name.length < 2) {
    return { error: 'Name must be at least 2 characters' }
  }
  
  if (!description || description.length < 10) {
    return { error: 'Description must be at least 10 characters' }
  }
  
  if (rating === null) {
    return { error: 'Invalid rating value' }
  }
  
  return {
    name,
    description,
    rating,
    display_order,
    image_url,
    video_url,
    alt_text: alt_text || null,
  }
}

/**
 * Comprehensive input validation for service data
 */
export interface ServiceInput {
  title: string
  description: string
  image_url: string
  alt_text: string
  display_order: number
}

export function validateServiceInput(data: FormData, requireImage: boolean = true): ServiceInput | { error: string } {
  const title = sanitizeString(data.get('title') as string, 200)
  const description = sanitizeString(data.get('description') as string, 5000)
  const image_url = sanitizeURL(data.get('image_url') as string || '')
  const alt_text = sanitizeString(data.get('alt_text') as string, 200)
  const display_order = validateInteger(data.get('display_order'), 0) ?? 0
  
  if (!title || title.length < 3) {
    return { error: 'Title must be at least 3 characters' }
  }
  
  if (!description || description.length < 10) {
    return { error: 'Description must be at least 10 characters' }
  }
  
  if (requireImage) {
    if (!image_url) {
      return { error: 'Invalid image URL' }
    }
    
    if (!alt_text || alt_text.length < 3) {
      return { error: 'Alt text must be at least 3 characters' }
    }
  }
  
  return {
    title,
    description,
    image_url: image_url || '',
    alt_text: alt_text || '',
    display_order,
  }
}

/**
 * Create a URL-friendly slug.
 * Note: keep this conservative (ascii + hyphens) so it works well for URLs and DB unique constraints.
 */
export function slugify(input: string): string {
  return sanitizeString(input, 300)
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200)
}

/**
 * Sanitize rich HTML content.
 * We allow a small set of tags/attributes needed for a blog post.
 */
export function sanitizeRichHtml(input: string): string {
  const html = input || ''

  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br',
      'h1', 'h2', 'h3', 'h4',
      'strong', 'b', 'em', 'i', 'u',
      'blockquote',
      'ul', 'ol', 'li',
      'a',
      'img',
      'video', 'source',
      'hr',
      'code', 'pre',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title'],
      video: ['src', 'controls', 'poster', 'preload'],
      source: ['src', 'type'],
    },
    allowedSchemes: ['http', 'https'],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || ''
        const isExternal = href.startsWith('http://') || href.startsWith('https://')

        return {
          tagName,
          attribs: {
            ...attribs,
            ...(isExternal ? { rel: 'noopener noreferrer', target: '_blank' } : {}),
          },
        }
      },
    },
  })
}

export interface BlogInput {
  title: string
  slug: string
  excerpt: string | null
  content_html: string
  main_image_url: string | null
  main_image_alt_text: string | null
  display_order: number
}

export function validateBlogInput(data: FormData): BlogInput | { error: string } {
  const title = sanitizeString(data.get('title') as string, 300)
  const rawSlug = sanitizeString(data.get('slug') as string, 200)
  const excerpt = sanitizeString((data.get('excerpt') as string) || '', 2000)
  const contentRaw = (data.get('content_html') as string) || ''
  const content_html = sanitizeRichHtml(contentRaw)
  const main_image_url = sanitizeURL(data.get('main_image_url') as string || '')
  const main_image_alt_text = sanitizeString((data.get('main_image_alt_text') as string) || '', 200)
  const display_order = validateInteger(data.get('display_order'), 0) ?? 0

  if (!title || title.length < 3) {
    return { error: 'Title must be at least 3 characters' }
  }

  const slug = slugify(rawSlug || title)
  if (!slug || slug.length < 3) {
    return { error: 'Slug must be at least 3 characters' }
  }

  if (!content_html || content_html.length < 10) {
    return { error: 'Content must be at least 10 characters' }
  }

  // Avoid obvious SQLi patterns in slug (defense-in-depth)
  if (containsSQLInjection(slug)) {
    return { error: 'Invalid slug' }
  }

  return {
    title,
    slug,
    excerpt: excerpt || null,
    content_html,
    main_image_url: main_image_url || null,
    main_image_alt_text: main_image_alt_text || null,
    display_order,
  }
}
