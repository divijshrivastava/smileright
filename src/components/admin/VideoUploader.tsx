'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface VideoUploaderProps {
  currentUrl: string | null
  onUpload: (url: string) => void
}

export default function VideoUploader({ currentUrl, onUpload }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      setError('Only MP4, MOV, and WebM videos are allowed.')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Video must be smaller than 50MB.')
      return
    }

    setError('')
    setUploading(true)

    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('testimonial-videos')
      .upload(fileName, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('testimonial-videos')
      .getPublicUrl(fileName)

    onUpload(publicUrl)
    setUploading(false)
  }

  return (
    <div>
      {currentUrl && (
        <div style={{ marginBottom: '12px' }}>
          <video
            src={currentUrl}
            controls
            style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '4px' }}
          />
        </div>
      )}
      <input
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        onChange={handleUpload}
        disabled={uploading}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.9rem',
        }}
      />
      {uploading && <p style={{ fontSize: '0.85rem', color: '#666', margin: '8px 0 0' }}>Uploading video...</p>}
      {error && <p style={{ fontSize: '0.85rem', color: '#c00', margin: '8px 0 0' }}>{error}</p>}
    </div>
  )
}
