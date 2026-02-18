import { describe, it, expect } from 'vitest'
import { validateFileContent, validateFile, fileValidationConfigs } from '../file-validation'

function createFileWithBytes(bytes: number[], type: string, name: string = 'test'): File {
  const buffer = new Uint8Array(bytes)
  return new File([buffer], name, { type })
}

describe('validateFileContent', () => {
  it('returns true for valid JPEG magic numbers', async () => {
    const jpegBytes = [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]
    const file = createFileWithBytes(jpegBytes, 'image/jpeg', 'photo.jpg')
    expect(await validateFileContent(file)).toBe(true)
  })

  it('returns true for valid PNG magic numbers', async () => {
    const pngBytes = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]
    const file = createFileWithBytes(pngBytes, 'image/png', 'image.png')
    expect(await validateFileContent(file)).toBe(true)
  })

  it('returns true for valid WebP magic numbers (RIFF header)', async () => {
    const webpBytes = [0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]
    const file = createFileWithBytes(webpBytes, 'image/webp', 'image.webp')
    expect(await validateFileContent(file)).toBe(true)
  })

  it('returns true for valid WebM magic numbers', async () => {
    const webmBytes = [0x1A, 0x45, 0xDF, 0xA3, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
    const file = createFileWithBytes(webmBytes, 'video/webm', 'video.webm')
    expect(await validateFileContent(file)).toBe(true)
  })

  it('returns false when magic bytes do not match the declared MIME type', async () => {
    // PNG bytes but file declared as image/jpeg
    const pngBytes = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]
    const file = createFileWithBytes(pngBytes, 'image/jpeg', 'fake.jpg')
    expect(await validateFileContent(file)).toBe(false)
  })

  it('returns false for an unknown / unsupported MIME type', async () => {
    const file = createFileWithBytes([0x00, 0x01, 0x02], 'application/octet-stream', 'file.bin')
    expect(await validateFileContent(file)).toBe(false)
  })

  it('returns false for arbitrary text content declared as image', async () => {
    const textEncoder = new TextEncoder()
    const bytes = Array.from(textEncoder.encode('<html><body>not an image</body></html>'))
    const file = createFileWithBytes(bytes, 'image/jpeg', 'trick.jpg')
    expect(await validateFileContent(file)).toBe(false)
  })
})

describe('validateFile', () => {
  it('rejects files with a disallowed MIME type', async () => {
    const file = createFileWithBytes([0x00], 'application/pdf', 'doc.pdf')
    const result = await validateFile(file, {
      allowedTypes: ['image/jpeg', 'image/png'],
      maxSize: 5 * 1024 * 1024,
    })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('application/pdf')
  })

  it('rejects files that exceed the maximum size', async () => {
    const largeBuffer = new Uint8Array(100)
    const file = new File([largeBuffer], 'large.jpg', { type: 'image/jpeg' })
    const result = await validateFile(file, {
      allowedTypes: ['image/jpeg'],
      maxSize: 10, // 10 bytes
    })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('exceeds maximum')
  })

  it('returns valid result with correct details when content check is disabled', async () => {
    const jpegBytes = [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]
    const file = createFileWithBytes(jpegBytes, 'image/jpeg', 'photo.jpg')
    const result = await validateFile(file, {
      allowedTypes: ['image/jpeg'],
      maxSize: 5 * 1024 * 1024,
      checkContent: false,
    })
    expect(result.valid).toBe(true)
    expect(result.details?.type).toBe('image/jpeg')
    expect(result.details?.size).toBe(12)
  })

  it('rejects a file with incorrect magic bytes when content checking is enabled', async () => {
    // PNG bytes but declared as JPEG
    const pngBytes = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D]
    const file = createFileWithBytes(pngBytes, 'image/jpeg', 'fake.jpg')
    const result = await validateFile(file, {
      allowedTypes: ['image/jpeg'],
      maxSize: 5 * 1024 * 1024,
      checkContent: true,
    })
    expect(result.valid).toBe(false)
    expect(result.error).toContain('does not match')
  })

  it('accepts a valid JPEG with correct magic bytes', async () => {
    const jpegBytes = [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]
    const file = createFileWithBytes(jpegBytes, 'image/jpeg', 'photo.jpg')
    const result = await validateFile(file, {
      allowedTypes: ['image/jpeg'],
      maxSize: 5 * 1024 * 1024,
      checkContent: true,
    })
    expect(result.valid).toBe(true)
  })
})

describe('fileValidationConfigs', () => {
  it('image config includes jpeg, png, and webp', () => {
    expect(fileValidationConfigs.image.allowedTypes).toContain('image/jpeg')
    expect(fileValidationConfigs.image.allowedTypes).toContain('image/png')
    expect(fileValidationConfigs.image.allowedTypes).toContain('image/webp')
  })

  it('image config has a 5 MB max size', () => {
    expect(fileValidationConfigs.image.maxSize).toBe(5 * 1024 * 1024)
  })

  it('image config enforces content checking', () => {
    expect(fileValidationConfigs.image.checkContent).toBe(true)
  })

  it('video config includes mp4, quicktime, and webm', () => {
    expect(fileValidationConfigs.video.allowedTypes).toContain('video/mp4')
    expect(fileValidationConfigs.video.allowedTypes).toContain('video/quicktime')
    expect(fileValidationConfigs.video.allowedTypes).toContain('video/webm')
  })

  it('video config has a 50 MB max size', () => {
    expect(fileValidationConfigs.video.maxSize).toBe(50 * 1024 * 1024)
  })
})
