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
    <div className="rich-text-editor-wrapper">
      <div className="rich-text-toolbar">
        <div className="toolbar-group toolbar-formatting">
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="tool-btn" title="Bold">
            <span className="btn-icon">B</span>
            <span className="btn-label">Bold</span>
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="tool-btn" title="Italic">
            <span className="btn-icon"><em>I</em></span>
            <span className="btn-label">Italic</span>
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="tool-btn" title="Heading 2">
            <span className="btn-icon">H</span>
            <span className="btn-label">H2</span>
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="tool-btn" title="Bullet List">
            <span className="btn-icon">•</span>
            <span className="btn-label">Bullets</span>
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="tool-btn" title="Numbered List">
            <span className="btn-icon">1.</span>
            <span className="btn-label">Numbers</span>
          </button>
          <button type="button" onClick={handleSetLink} className="tool-btn" title="Insert Link">
            <span className="btn-icon">🔗</span>
            <span className="btn-label">Link</span>
          </button>
        </div>

        <div className="toolbar-group toolbar-media">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading !== null}
            className="primary-btn"
            title="Insert Image"
          >
            <span className="btn-icon">📷</span>
            <span className="btn-label">{uploading === 'image' ? 'Uploading…' : 'Image'}</span>
          </button>

          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploading !== null}
            className="primary-btn"
            title="Insert Video"
          >
            <span className="btn-icon">🎬</span>
            <span className="btn-label">{uploading === 'video' ? 'Uploading…' : 'Video'}</span>
          </button>
        </div>

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

      {error && <div className="editor-error">{error}</div>}

      <div className="editor-box">
        <EditorContent editor={editor} />
      </div>

      {/* Editor styling including mobile responsiveness */}
      <style jsx global>{`
        .rich-text-editor-wrapper {
          max-width: 900px;
        }

        .rich-text-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
          align-items: center;
        }

        .toolbar-group {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .toolbar-formatting {
          flex: 1;
          min-width: 0;
        }

        .toolbar-media {
          flex-shrink: 0;
        }

        .tool-btn {
          padding: 10px 14px;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          color: #292828;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tool-btn .btn-icon {
          display: none;
          font-style: normal;
          font-weight: 700;
          min-width: 16px;
          text-align: center;
        }

        .primary-btn {
          padding: 10px 14px;
          background: #1B73BA;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .primary-btn:disabled {
          opacity: 0.7;
        }

        .primary-btn .btn-icon {
          display: none;
        }

        .editor-box {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .editor-error {
          background: #fee;
          color: #c00;
          padding: 12px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-family: var(--font-sans);
          margin-bottom: 12px;
        }

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

        /* Mobile responsive styles */
        @media (max-width: 640px) {
          .rich-text-toolbar {
            gap: 6px;
          }

          .toolbar-group {
            gap: 4px;
          }

          .tool-btn {
            padding: 8px 10px;
            font-size: 0.85rem;
            min-width: 40px;
            justify-content: center;
          }

          .tool-btn .btn-icon {
            display: inline;
          }

          .tool-btn .btn-label {
            display: none;
          }

          .primary-btn {
            padding: 8px 10px;
            font-size: 0.8rem;
            min-width: 44px;
            justify-content: center;
          }

          .primary-btn .btn-icon {
            display: inline;
          }

          .primary-btn .btn-label {
            display: none;
          }

          .editor-box {
            padding: 12px;
            border-radius: 8px;
          }

          .editor-error {
            padding: 10px;
            font-size: 0.85rem;
          }

          .blog-editor-prose {
            font-size: 0.95rem;
            min-height: 200px;
          }
        }

        /* Extra small screens */
        @media (max-width: 400px) {
          .tool-btn {
            padding: 6px 8px;
            min-width: 36px;
            border-radius: 6px;
          }

          .primary-btn {
            padding: 6px 8px;
            min-width: 40px;
            border-radius: 6px;
          }

          .editor-box {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  )
}
