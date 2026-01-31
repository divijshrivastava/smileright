import BlogForm from '@/components/admin/BlogForm'

export default function NewBlogPage() {
  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '2rem',
        color: '#292828',
        marginBottom: '1.5rem',
      }}>
        New Blog
      </h1>
      <BlogForm />
    </div>
  )
}
