'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { validateFile, fileValidationConfigs } from '@/lib/security/file-validation'

interface ImageUploaderProps {
  currentUrl: string | null
  onUpload: (url: string) => void
  bucket?: 'testimonial-images' | 'trust-images' | 'blog-media'
}

export default function ImageUploader({ currentUrl, onUpload, bucket = 'testimonial-images' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Comprehensive file validation including content check
    const validationResult = await validateFile(file, fileValidationConfigs.image)
    
    if (!validationResult.valid) {
      setError(validationResult.error || 'Invalid file')
      return
    }

    setError('')
    setUploading(true)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)

      console.log('Uploading to bucket:', bucket, 'File:', fileName, 'Size:', fileSizeMB, 'MB')

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError(`Upload failed: ${uploadError.message}`)
        setUploading(false)
        return
      }

      console.log('Upload successful:', uploadData)

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      console.log('Public URL:', publicUrl)
      onUpload(publicUrl)
      setUploading(false)
    } catch (err) {
      console.error('Unexpected error during upload:', err)
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setUploading(false)
    }
  }

  return (
    <div>
      {currentUrl && (
        <div style={{ marginBottom: '12px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt="Current testimonial image"
            style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }}
          />
        </div>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        disabled={uploading}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.9rem',
        }}
      />
      {uploading && <p style={{ fontSize: '0.85rem', color: '#666', margin: '8px 0 0' }}>Uploading...</p>}
      {error && <p style={{ fontSize: '0.85rem', color: '#c00', margin: '8px 0 0' }}>{error}</p>}
    </div>
  )
}
