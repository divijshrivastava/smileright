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

    const fileSizeMB = (file.size / 1024 / 1024).toFixed(2)
    
    // Recommend compression for large files
    if (file.size > 20 * 1024 * 1024) {
      const shouldContinue = confirm(
        `Video size is ${fileSizeMB}MB. Large videos may buffer slowly for users.\n\n` +
        `Recommendation: Compress video to under 10MB for best performance.\n\n` +
        `Continue with upload anyway?`
      )
      if (!shouldContinue) {
        setError('Upload cancelled. Please compress video and try again.')
        return
      }
    }

    if (file.size > 50 * 1024 * 1024) {
      setError(`Video must be smaller than 50MB. Current size: ${fileSizeMB}MB`)
      return
    }

    setError('')
    setUploading(true)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      console.log('Uploading video:', fileName, 'Size:', fileSizeMB, 'MB')

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('testimonial-videos')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Video upload error:', uploadError)
        setError(`Upload failed: ${uploadError.message}`)
        setUploading(false)
        return
      }

      console.log('Video upload successful:', uploadData)

      const { data: { publicUrl } } = supabase.storage
        .from('testimonial-videos')
        .getPublicUrl(fileName)

      console.log('Video public URL:', publicUrl)
      onUpload(publicUrl)
      setUploading(false)
    } catch (err) {
      console.error('Unexpected video upload error:', err)
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setUploading(false)
    }
  }

  return (
    <div>
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '4px',
        padding: '12px',
        marginBottom: '12px',
        fontSize: '0.85rem',
        lineHeight: '1.6',
      }}>
        <strong>💡 Video Optimization Tips:</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
          <li>Keep videos under <strong>10MB</strong> for fast loading</li>
          <li>Use MP4 format with 720p resolution</li>
          <li>Compress videos using <a href="https://www.freeconvert.com/video-compressor" target="_blank" rel="noopener noreferrer" style={{ color: '#1B73BA', textDecoration: 'underline' }}>FreeConvert</a> or HandBrake</li>
          <li>Duration: 15-60 seconds recommended</li>
        </ul>
      </div>
      
      {currentUrl && (
        <div style={{ marginBottom: '12px' }}>
          <video
            src={currentUrl}
            controls
            preload="metadata"
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
