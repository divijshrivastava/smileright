'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { createClient } from '@/lib/supabase/client'
import { validateFile, fileValidationConfigs } from '@/lib/security/file-validation'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState<'image' | 'video' | null>(null)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const extensions = useMemo(
    () => [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Image.configure({
        inline: false,
      }),
    ],
    []
  )

  const editor = useEditor({
    extensions,
    // TipTap warns if it thinks SSR is happening; this avoids hydration mismatches in Next.js.
    immediatelyRender: false,
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'blog-editor-prose',
      },
    },
  })

  // If the form loads an existing blog, ensure the editor reflects it.
  useEffect(() => {
    if (!editor) return

    const current = editor.getHTML()
    const next = value || '<p></p>'

    if (current !== next) {
      editor.commands.setContent(next)
    }
  }, [editor, value])

  const handleSetLink = () => {
    if (!editor) return

    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter link URL', previousUrl || 'https://')

    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const uploadToBlogMedia = async (file: File) => {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop() || 'bin'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('blog-media')
      .upload(fileName, file)

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('blog-media')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !editor) return

    setError('')
    setUploading('image')

    try {
      const validation = await validateFile(file, fileValidationConfigs.image)
      if (!validation.valid) throw new Error(validation.error || 'Invalid image')

      const publicUrl = await uploadToBlogMedia(file)
      editor.chain().focus().setImage({ src: publicUrl }).run()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(null)
    }
  }

  const handleVideoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !editor) return

    setError('')
    setUploading('video')

    try {
      const validation = await validateFile(file, fileValidationConfigs.video)
      if (!validation.valid) throw new Error(validation.error || 'Invalid video')

      const publicUrl = await uploadToBlogMedia(file)

      // TipTap doesn't include a video node by default; insert plain HTML.
      editor
        .chain()
        .focus()
        .insertContent(
          `<video controls preload="metadata" src="${publicUrl}"></video>`
        )
        .run()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video')
    } finally {
      setUploading(null)
    }
  }

  if (!editor) {
    return <div style={{ fontFamily: 'var(--font-sans)', color: '#666' }}>Loading editor…</div>
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.toolbar}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={styles.toolBtn}>
          Bold
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={styles.toolBtn}>
          Italic
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={styles.toolBtn}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={styles.toolBtn}>
          Bullets
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={styles.toolBtn}>
          Numbers
        </button>
        <button type="button" onClick={handleSetLink} style={styles.toolBtn}>
          Link
        </button>

        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploading !== null}
          style={{ ...styles.primaryBtn, opacity: uploading !== null ? 0.7 : 1 }}
        >
          {uploading === 'image' ? 'Uploading image…' : 'Insert Image'}
        </button>

        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          disabled={uploading !== null}
          style={{ ...styles.primaryBtn, opacity: uploading !== null ? 0.7 : 1 }}
        >
          {uploading === 'video' ? 'Uploading video…' : 'Insert Video'}
        </button>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImagePick}
          style={{ display: 'none' }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          onChange={handleVideoPick}
          style={{ display: 'none' }}
        />
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.editorBox}>
        <EditorContent editor={editor} />
      </div>

      {/* Minimal prose styling for the editor content */}
      <style jsx global>{`
        .blog-editor-prose {
          font-family: var(--font-sans);
          font-size: 1rem;
          line-height: 1.8;
          color: #292828;
          min-height: 260px;
          outline: none;
        }
        .blog-editor-prose p {
          margin: 0 0 1em 0;
        }
        .blog-editor-prose h1,
        .blog-editor-prose h2,
        .blog-editor-prose h3,
        .blog-editor-prose h4 {
          font-family: var(--font-serif);
          margin: 1.2em 0 0.6em 0;
        }
        .blog-editor-prose ul,
        .blog-editor-prose ol {
          padding-left: 1.25rem;
          margin: 0 0 1em 0;
        }
        .blog-editor-prose img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12);
          margin: 12px 0;
        }
        .blog-editor-prose a {
          color: var(--primary-blue);
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    maxWidth: '900px',
  },
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '12px',
    alignItems: 'center',
  },
  toolBtn: {
    padding: '10px 14px',
    background: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    color: '#292828',
  },
  primaryBtn: {
    padding: '10px 14px',
    background: '#1B73BA',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9rem',
    fontWeight: 700,
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  editorBox: {
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  error: {
    background: '#fee',
    color: '#c00',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontFamily: 'var(--font-sans)',
    marginBottom: '12px',
  },
}
