'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { validateFile, fileValidationConfigs } from '@/lib/security/file-validation'

interface CKEditorComponentProps {
  value: string
  onChange: (value: string) => void
}

export default function CKEditorComponent({ value, onChange }: CKEditorComponentProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let editorInstance: any = null

    const initializeEditor = async () => {
      if (!editorRef.current) return

      try {
        // Dynamically import CKEditor to avoid SSR issues
        const { ClassicEditor } = await import('ckeditor5')
        const {
          Essentials,
          Bold,
          Italic,
          Underline,
          Strikethrough,
          Font,
          Paragraph,
          Heading,
          Link,
          List,
          BlockQuote,
          Image,
          ImageCaption,
          ImageStyle,
          ImageToolbar,
          ImageUpload,
          ImageResize,
          MediaEmbed,
          Table,
          TableToolbar,
          Alignment,
          Indent,
          IndentBlock,
          HorizontalLine,
          RemoveFormat,
          SourceEditing,
        } = await import('ckeditor5')

        // Custom upload adapter for Supabase
        class SupabaseUploadAdapter {
          loader: any
          
          constructor(loader: any) {
            this.loader = loader
          }

          async upload() {
            const file = await this.loader.file
            
            // Validate file
            const validation = await validateFile(file, fileValidationConfigs.image)
            if (!validation.valid) {
              throw new Error(validation.error || 'Invalid file')
            }

            // Upload to Supabase
            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

            const { error: uploadError, data: uploadData } = await supabase.storage
              .from('testimonial-images')
              .upload(fileName, file)

            if (uploadError) {
              throw new Error(`Upload failed: ${uploadError.message}`)
            }

            const { data: { publicUrl } } = supabase.storage
              .from('testimonial-images')
              .getPublicUrl(fileName)

            return {
              default: publicUrl
            }
          }

          abort() {
            // Handle abort if needed
          }
        }

        function SupabaseUploadAdapterPlugin(editor: any) {
          editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
            return new SupabaseUploadAdapter(loader)
          }
        }

        editorInstance = await ClassicEditor.create(editorRef.current, {
          plugins: [
            Essentials,
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Font,
            Paragraph,
            Heading,
            Link,
            List,
            BlockQuote,
            Image,
            ImageCaption,
            ImageStyle,
            ImageToolbar,
            ImageUpload,
            ImageResize,
            MediaEmbed,
            Table,
            TableToolbar,
            Alignment,
            Indent,
            IndentBlock,
            HorizontalLine,
            RemoveFormat,
            SourceEditing,
          ],
          extraPlugins: [SupabaseUploadAdapterPlugin],
          toolbar: {
            items: [
              'undo', 'redo',
              '|',
              'heading',
              '|',
              'bold', 'italic', 'underline', 'strikethrough',
              '|',
              'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor',
              '|',
              'link', 'uploadImage', 'mediaEmbed',
              '|',
              'bulletedList', 'numberedList',
              '|',
              'alignment',
              '|',
              'indent', 'outdent',
              '|',
              'insertTable', 'blockQuote', 'horizontalLine',
              '|',
              'removeFormat', 'sourceEditing'
            ],
            shouldNotGroupWhenFull: true
          },
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
              { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' }
            ]
          },
          image: {
            toolbar: [
              'imageStyle:inline',
              'imageStyle:block',
              'imageStyle:side',
              '|',
              'toggleImageCaption',
              'imageTextAlternative',
              '|',
              'linkImage'
            ],
            resizeOptions: [
              {
                name: 'resizeImage:original',
                value: null,
                label: 'Original'
              },
              {
                name: 'resizeImage:50',
                value: '50',
                label: '50%'
              },
              {
                name: 'resizeImage:75',
                value: '75',
                label: '75%'
              }
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

        // Listen for changes
        editorInstance.model.document.on('change:data', () => {
          const data = editorInstance.getData()
          onChange(data)
        })

        setEditor(editorInstance)
        setIsLoaded(true)
      } catch (error) {
        console.error('CKEditor initialization error:', error)
      }
    }

    initializeEditor()

    return () => {
      if (editorInstance) {
        editorInstance.destroy().catch((error: any) => {
          console.error('CKEditor destroy error:', error)
        })
      }
    }
  }, [])

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && isLoaded && value !== editor.getData()) {
      editor.setData(value || '<p></p>')
    }
  }, [value, editor, isLoaded])

  return (
    <div style={styles.wrapper}>
      <div ref={editorRef} style={styles.editor} />
      {!isLoaded && (
        <div style={styles.loading}>Loading editor...</div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    minHeight: '500px',
  },
  editor: {
    minHeight: '500px',
  },
  loading: {
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
    fontSize: '1rem',
  },
}
