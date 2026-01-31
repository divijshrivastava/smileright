'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { validateFile, fileValidationConfigs } from '@/lib/security/file-validation'

interface CKEditorComponentProps {
  value: string
  onChange: (value: string) => void
}

export default function CKEditorComponent({ value, onChange }: CKEditorComponentProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<any>(null)
  const [isLayoutReady, setIsLayoutReady] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    setIsLayoutReady(true)

    return () => {
      setIsLayoutReady(false)
    }
  }, [])

  useEffect(() => {
    if (!isLayoutReady) return

    let mounted = true

    const initEditor = async () => {
      try {
        // Import CKEditor modules dynamically
        const { ClassicEditor, Essentials, Bold, Italic, Underline, Strikethrough, Font, 
          Paragraph, Heading, Link, List, BlockQuote, Image, ImageCaption, ImageStyle, 
          ImageToolbar, ImageUpload, ImageResize, MediaEmbed, Table, TableToolbar, 
          Alignment, Indent, IndentBlock, HorizontalLine, RemoveFormat, SourceEditing 
        } = await import('ckeditor5')

        if (!mounted || !editorContainerRef.current) return

        // Custom upload adapter
        function uploadAdapter(loader: any) {
          return {
            upload: async () => {
              const file = await loader.file
              
              const validation = await validateFile(file, fileValidationConfigs.image)
              if (!validation.valid) {
                throw new Error(validation.error || 'Invalid file')
              }

              const supabase = createClient()
              const fileExt = file.name.split('.').pop()
              const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

              const { error: uploadError } = await supabase.storage
                .from('testimonial-images')
                .upload(fileName, file)

              if (uploadError) {
                throw new Error(`Upload failed: ${uploadError.message}`)
              }

              const { data: { publicUrl } } = supabase.storage
                .from('testimonial-images')
                .getPublicUrl(fileName)

              return { default: publicUrl }
            },
            abort: () => {}
          }
        }

        function uploadPlugin(editor: any) {
          editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
            return uploadAdapter(loader)
          }
        }

        const editor = await ClassicEditor.create(editorContainerRef.current, {
          plugins: [
            Essentials, Bold, Italic, Underline, Strikethrough, Font, Paragraph, 
            Heading, Link, List, BlockQuote, Image, ImageCaption, ImageStyle, 
            ImageToolbar, ImageUpload, ImageResize, MediaEmbed, Table, TableToolbar, 
            Alignment, Indent, IndentBlock, HorizontalLine, RemoveFormat, SourceEditing
          ],
          extraPlugins: [uploadPlugin],
          toolbar: [
            'undo', 'redo', '|',
            'heading', '|',
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
            'link', 'uploadImage', 'mediaEmbed', '|',
            'bulletedList', 'numberedList', '|',
            'alignment', '|',
            'indent', 'outdent', '|',
            'insertTable', 'blockQuote', 'horizontalLine', '|',
            'removeFormat', 'sourceEditing'
          ],
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
            ]
          },
          image: {
            toolbar: [
              'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|',
              'toggleImageCaption', 'imageTextAlternative', '|', 'linkImage'
            ],
            resizeOptions: [
              { name: 'resizeImage:original', value: null, label: 'Original' },
              { name: 'resizeImage:50', value: '50', label: '50%' },
              { name: 'resizeImage:75', value: '75', label: '75%' }
            ]
          },
          table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
          },
          link: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'https://'
          },
          mediaEmbed: {
            previewsInData: true
          },
          initialData: value || '<p></p>'
        })

        if (!mounted) {
          await editor.destroy()
          return
        }

        editorRef.current = editor

        editor.model.document.on('change:data', () => {
          const data = editor.getData()
          onChange(data)
        })

      } catch (err) {
        console.error('Error initializing editor:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize editor')
      }
    }

    initEditor()

    return () => {
      mounted = false
      if (editorRef.current) {
        editorRef.current.destroy().catch((err: any) => {
          console.error('Error destroying editor:', err)
        })
        editorRef.current = null
      }
    }
  }, [isLayoutReady])

  // Update content when value prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getData()) {
      editorRef.current.setData(value || '<p></p>')
    }
  }, [value])

  if (error) {
    return (
      <div style={{
        padding: '20px',
        background: '#fee',
        color: '#c00',
        borderRadius: '8px',
        fontFamily: 'var(--font-sans)'
      }}>
        <strong>Editor Error:</strong> {error}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div ref={editorContainerRef} style={{ minHeight: '500px' }} />
      {!isLayoutReady && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f9f9f9',
          color: '#666',
          fontFamily: 'var(--font-sans)',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          Loading editor...
        </div>
      )}
    </div>
  )
}
