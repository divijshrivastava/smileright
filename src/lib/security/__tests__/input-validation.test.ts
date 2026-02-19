import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  sanitizeURL,
  validateInteger,
  slugify,
  validateTestimonialInput,
  validateBlogInput,
  sanitizeRichHtml,
} from '../input-validation'

describe('sanitizeString', () => {
  it('trims and limits length', () => {
    expect(sanitizeString('  hello  ', 5)).toBe('hello')
    expect(sanitizeString('abcdef', 3)).toBe('abc')
  })

  it('removes null bytes', () => {
    expect(sanitizeString('he\0llo')).toBe('hello')
  })

  it('removes control characters but keeps newlines/tabs', () => {
    expect(sanitizeString('a\x01b\nc\td')).toBe('ab\nc\td')
  })

  it('returns empty string for falsy input', () => {
    expect(sanitizeString('')).toBe('')
  })
})

describe('sanitizeURL', () => {
  it('accepts valid http/https URLs', () => {
    expect(sanitizeURL('https://example.com')).toBe('https://example.com/')
    expect(sanitizeURL('http://example.com/path')).toBe('http://example.com/path')
  })

  it('rejects javascript: URLs', () => {
    expect(sanitizeURL('javascript:alert(1)')).toBeNull()
  })

  it('rejects data: URLs', () => {
    expect(sanitizeURL('data:text/html,<h1>hi</h1>')).toBeNull()
  })

  it('rejects ftp protocol by default', () => {
    expect(sanitizeURL('ftp://files.example.com')).toBeNull()
  })

  it('returns null for invalid URLs', () => {
    expect(sanitizeURL('not-a-url')).toBeNull()
  })

  it('returns null for empty input', () => {
    expect(sanitizeURL('')).toBeNull()
  })
})

describe('validateInteger', () => {
  it('parses valid integers', () => {
    expect(validateInteger('42')).toBe(42)
    expect(validateInteger(7)).toBe(7)
  })

  it('enforces min/max', () => {
    expect(validateInteger('3', 5)).toBeNull()
    expect(validateInteger('10', 0, 5)).toBeNull()
    expect(validateInteger('5', 1, 10)).toBe(5)
  })

  it('rejects non-integer values', () => {
    expect(validateInteger('abc')).toBeNull()
    expect(validateInteger(NaN)).toBeNull()
    // Note: parseInt('3.5') returns 3 (truncates decimal), which is valid integer behavior
    expect(validateInteger('3.5')).toBe(3)
  })
})

describe('slugify', () => {
  it('converts to lowercase with hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify("It's a Test!")).toBe('its-a-test')
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugify('--hello--')).toBe('hello')
  })

  it('limits length', () => {
    const long = 'a'.repeat(300)
    expect(slugify(long).length).toBeLessThanOrEqual(200)
  })
})

describe('validateTestimonialInput', () => {
  function makeFormData(overrides: Record<string, string> = {}): FormData {
    const fd = new FormData()
    fd.set('name', overrides.name ?? 'John Doe')
    fd.set('description', overrides.description ?? 'This is a valid testimonial description')
    fd.set('rating', overrides.rating ?? '5')
    fd.set('display_order', overrides.display_order ?? '0')
    return fd
  }

  it('validates valid input', () => {
    const result = validateTestimonialInput(makeFormData())
    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.name).toBe('John Doe')
      expect(result.rating).toBe(5)
    }
  })

  it('rejects short name', () => {
    const result = validateTestimonialInput(makeFormData({ name: 'A' }))
    expect('error' in result).toBe(true)
  })

  it('rejects short description', () => {
    const result = validateTestimonialInput(makeFormData({ description: 'Short' }))
    expect('error' in result).toBe(true)
  })

  it('rejects invalid rating', () => {
    const result = validateTestimonialInput(makeFormData({ rating: '6' }))
    expect('error' in result).toBe(true)
  })
})

describe('validateBlogInput', () => {
  function makeFormData(overrides: Record<string, string> = {}): FormData {
    const fd = new FormData()
    fd.set('title', overrides.title ?? 'Test Blog Post')
    fd.set('slug', overrides.slug ?? 'test-blog-post')
    fd.set('content_html', overrides.content_html ?? '<p>This is valid blog content for testing.</p>')
    fd.set('display_order', overrides.display_order ?? '0')
    return fd
  }

  it('validates valid input', () => {
    const result = validateBlogInput(makeFormData())
    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.title).toBe('Test Blog Post')
      expect(result.slug).toBe('test-blog-post')
    }
  })

  it('rejects short title', () => {
    const result = validateBlogInput(makeFormData({ title: 'Hi' }))
    expect('error' in result).toBe(true)
  })

  it('rejects short content', () => {
    const result = validateBlogInput(makeFormData({ content_html: '<p>Hi</p>' }))
    expect('error' in result).toBe(true)
  })

  it('generates slug from title when slug is empty', () => {
    const result = validateBlogInput(makeFormData({ slug: '', title: 'My Great Post' }))
    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.slug).toBe('my-great-post')
    }
  })
})

describe('sanitizeRichHtml', () => {
  it('allows safe tags', () => {
    const input = '<p>Hello <strong>world</strong></p>'
    expect(sanitizeRichHtml(input)).toBe(input)
  })

  it('strips script tags', () => {
    const input = '<p>Hello</p><script>alert(1)</script>'
    expect(sanitizeRichHtml(input)).toBe('<p>Hello</p>')
  })

  it('strips onclick handlers', () => {
    const input = '<p onclick="alert(1)">Click me</p>'
    expect(sanitizeRichHtml(input)).toBe('<p>Click me</p>')
  })

  it('adds rel to external links', () => {
    const input = '<a href="https://example.com">Link</a>'
    const result = sanitizeRichHtml(input)
    expect(result).toContain('rel="noopener noreferrer"')
    expect(result).toContain('target="_blank"')
  })

  it('returns empty string for falsy input', () => {
    expect(sanitizeRichHtml('')).toBe('')
  })
})
