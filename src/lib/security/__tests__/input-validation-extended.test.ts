import { describe, it, expect } from 'vitest'
import {
  sanitizeHTML,
  validateEmail,
  validateBoolean,
  sanitizeFilename,
  validateFileExtension,
  validateServiceInput,
  validateContactInput,
} from '../input-validation'

describe('sanitizeHTML', () => {
  it('strips script tags', () => {
    expect(sanitizeHTML('<script>alert(1)</script>Hello')).toBe('Hello')
  })

  it('strips all HTML tags', () => {
    expect(sanitizeHTML('<p>Hello <strong>World</strong></p>')).toBe('Hello World')
  })

  it('removes javascript: protocol', () => {
    expect(sanitizeHTML('javascript:alert(1)')).toBe('alert(1)')
  })

  it('removes event handler attributes', () => {
    const result = sanitizeHTML('<p onclick="evil()">text</p>')
    expect(result).not.toContain('onclick')
    expect(result).toContain('text')
  })

  it('returns empty string for empty input', () => {
    expect(sanitizeHTML('')).toBe('')
  })

  it('handles nested tags', () => {
    const result = sanitizeHTML('<div><span>content</span></div>')
    expect(result).toBe('content')
    expect(result).not.toContain('<')
  })
})

describe('validateEmail', () => {
  it('accepts standard email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })

  it('accepts emails with subdomains', () => {
    expect(validateEmail('user@mail.example.co.uk')).toBe(true)
  })

  it('accepts emails with plus tags', () => {
    expect(validateEmail('user+tag@example.com')).toBe(true)
  })

  it('rejects email without @ symbol', () => {
    expect(validateEmail('notanemail')).toBe(false)
  })

  it('rejects email without domain', () => {
    expect(validateEmail('user@')).toBe(false)
  })

  it('rejects email with spaces', () => {
    expect(validateEmail('user @example.com')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(validateEmail('')).toBe(false)
  })

  it('rejects email with missing TLD', () => {
    expect(validateEmail('user@domain')).toBe(false)
  })
})

describe('validateBoolean', () => {
  it('returns true for boolean true', () => {
    expect(validateBoolean(true)).toBe(true)
  })

  it('returns false for boolean false', () => {
    expect(validateBoolean(false)).toBe(false)
  })

  it('parses string "true" as true', () => {
    expect(validateBoolean('true')).toBe(true)
  })

  it('parses string "TRUE" as true (case insensitive)', () => {
    expect(validateBoolean('TRUE')).toBe(true)
  })

  it('returns false for string "false"', () => {
    expect(validateBoolean('false')).toBe(false)
  })

  it('returns false for arbitrary string', () => {
    expect(validateBoolean('yes')).toBe(false)
  })

  it('returns false for number 1', () => {
    expect(validateBoolean(1)).toBe(false)
  })

  it('returns false for number 0', () => {
    expect(validateBoolean(0)).toBe(false)
  })

  it('returns false for null', () => {
    expect(validateBoolean(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(validateBoolean(undefined)).toBe(false)
  })
})

describe('sanitizeFilename', () => {
  it('removes path traversal sequences', () => {
    const result = sanitizeFilename('../../../etc/passwd')
    expect(result).not.toContain('..')
  })

  it('removes forward slashes', () => {
    const result = sanitizeFilename('path/to/file.jpg')
    expect(result).not.toContain('/')
  })

  it('removes backslashes', () => {
    const result = sanitizeFilename('path\\to\\file.jpg')
    expect(result).not.toContain('\\')
  })

  it('replaces special characters with underscores', () => {
    expect(sanitizeFilename('my file@name!.jpg')).toBe('my_file_name_.jpg')
  })

  it('preserves dots, dashes, and underscores', () => {
    expect(sanitizeFilename('my-file_name.jpg')).toBe('my-file_name.jpg')
  })

  it('preserves alphanumeric characters', () => {
    expect(sanitizeFilename('photo123.jpg')).toBe('photo123.jpg')
  })

  it('limits filename to 255 characters', () => {
    const long = 'a'.repeat(300) + '.jpg'
    expect(sanitizeFilename(long).length).toBeLessThanOrEqual(255)
  })
})

describe('validateFileExtension', () => {
  it('accepts an allowed extension', () => {
    expect(validateFileExtension('photo.jpg', ['jpg', 'png', 'webp'])).toBe(true)
  })

  it('rejects a disallowed extension', () => {
    expect(validateFileExtension('script.exe', ['jpg', 'png'])).toBe(false)
  })

  it('is case insensitive', () => {
    expect(validateFileExtension('photo.JPG', ['jpg'])).toBe(true)
  })

  it('returns false for file with no extension', () => {
    expect(validateFileExtension('noextension', ['jpg'])).toBe(false)
  })

  it('returns false when allowed list is empty', () => {
    expect(validateFileExtension('file.jpg', [])).toBe(false)
  })

  it('handles multiple dots in filename correctly', () => {
    expect(validateFileExtension('archive.tar.gz', ['gz'])).toBe(true)
  })
})

describe('validateServiceInput', () => {
  function makeFormData(overrides: Record<string, string> = {}): FormData {
    const fd = new FormData()
    fd.set('title', overrides.title ?? 'Teeth Whitening')
    fd.set('slug', overrides.slug ?? 'teeth-whitening')
    fd.set('description', overrides.description ?? 'Professional teeth whitening treatment for a brighter smile.')
    fd.set('image_url', overrides.image_url ?? 'https://example.com/image.jpg')
    fd.set('alt_text', overrides.alt_text ?? 'Teeth whitening treatment')
    fd.set('display_order', overrides.display_order ?? '0')
    return fd
  }

  it('validates valid service input', () => {
    const result = validateServiceInput(makeFormData())
    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.title).toBe('Teeth Whitening')
      expect(result.slug).toBe('teeth-whitening')
      expect(result.display_order).toBe(0)
    }
  })

  it('rejects title shorter than 3 characters', () => {
    const result = validateServiceInput(makeFormData({ title: 'Hi' }))
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('Title')
    }
  })

  it('rejects description shorter than 10 characters', () => {
    const result = validateServiceInput(makeFormData({ description: 'Short' }))
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('Description')
    }
  })

  it('requires a valid image URL when requireImage is true (default)', () => {
    const result = validateServiceInput(makeFormData({ image_url: '' }))
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('image URL')
    }
  })

  it('does not require image URL when requireImage is false', () => {
    const fd = makeFormData({ image_url: '', alt_text: '' })
    const result = validateServiceInput(fd, false)
    expect('error' in result).toBe(false)
  })

  it('generates slug from title when slug is empty', () => {
    const fd = makeFormData({ slug: '', title: 'Root Canal Treatment' })
    const result = validateServiceInput(fd, false)
    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.slug).toBe('root-canal-treatment')
    }
  })

  it('rejects alt text shorter than 3 characters when image is required', () => {
    const result = validateServiceInput(makeFormData({ alt_text: 'X' }), true)
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('Alt text')
    }
  })

  it('rejects invalid image URL (non-http)', () => {
    const result = validateServiceInput(makeFormData({ image_url: 'ftp://files.example.com/img.jpg' }), true)
    expect('error' in result).toBe(true)
  })
})

describe('validateContactInput', () => {
  function makeInput(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+61 400 123 456',
      preferred_contact: 'email',
      service_interest: 'Teeth Whitening',
      appointment_preference: 'Morning',
      message: 'I would like to book an appointment for a routine cleaning.',
      consent: true,
      source_page: '/contact',
      form_location: 'footer',
      ...overrides,
    }
  }

  it('validates valid contact input', () => {
    const result = validateContactInput(makeInput())
    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.name).toBe('Jane Smith')
      expect(result.email).toBe('jane@example.com')
      expect(result.preferred_contact).toBe('email')
    }
  })

  it('rejects name shorter than 2 characters', () => {
    const result = validateContactInput(makeInput({ name: 'J' }))
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('Name')
    }
  })

  it('rejects invalid email address', () => {
    const result = validateContactInput(makeInput({ email: 'notanemail' }))
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('email')
    }
  })

  it('rejects message shorter than 10 characters', () => {
    const result = validateContactInput(makeInput({ message: 'Hi' }))
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('Message')
    }
  })

  it('rejects when consent is false', () => {
    const result = validateContactInput(makeInput({ consent: false }))
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('consent')
    }
  })

  it('rejects invalid phone number format', () => {
    const result = validateContactInput(makeInput({ phone: 'not-a-phone!!!!' }))
    expect('error' in result).toBe(true)
    if ('error' in result) {
      expect(result.error).toContain('phone')
    }
  })

  it('accepts valid phone number formats', () => {
    const result = validateContactInput(makeInput({ phone: '+61 (02) 9000-1234' }))
    expect('error' in result).toBe(false)
  })

  it('defaults preferred_contact to email for unknown values', () => {
    const result = validateContactInput(makeInput({ preferred_contact: 'fax' }))
    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.preferred_contact).toBe('email')
    }
  })

  it('accepts phone as preferred_contact', () => {
    const result = validateContactInput(makeInput({ preferred_contact: 'phone' }))
    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.preferred_contact).toBe('phone')
    }
  })

  it('accepts whatsapp as preferred_contact', () => {
    const result = validateContactInput(makeInput({ preferred_contact: 'whatsapp' }))
    expect('error' in result).toBe(false)
    if (!('error' in result)) {
      expect(result.preferred_contact).toBe('whatsapp')
    }
  })

  it('rejects SQL injection in name field', () => {
    const result = validateContactInput(makeInput({ name: 'user; DROP TABLE contacts--' }))
    expect('error' in result).toBe(true)
  })

  it('returns null for empty optional fields', () => {
    const result = validateContactInput(makeInput({
      phone: '',
      service_interest: '',
      appointment_preference: '',
    }))
    if (!('error' in result)) {
      expect(result.phone).toBeNull()
      expect(result.service_interest).toBeNull()
      expect(result.appointment_preference).toBeNull()
    }
  })

  it('normalises email to lowercase', () => {
    const result = validateContactInput(makeInput({ email: 'JANE@EXAMPLE.COM' }))
    if (!('error' in result)) {
      expect(result.email).toBe('jane@example.com')
    }
  })
})
