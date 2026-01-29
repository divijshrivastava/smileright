'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ImageUploaderProps {
  currentUrl: string | null
  onUpload: (url: string) => void
}

export default function ImageUploader({ currentUrl, onUpload }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are allowed.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.')
      return
    }

    setError('')
    setUploading(true)

    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('testimonial-images')
      .upload(fileName, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('testimonial-images')
      .getPublicUrl(fileName)

    onUpload(publicUrl)
    setUploading(false)
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
