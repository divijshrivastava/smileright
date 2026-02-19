import BlogForm from '@/components/admin/BlogForm'
import { adminPageTitleStyle } from '@/styles/admin'

export default function NewBlogPage() {
  return (
    <div className="admin-page-content">
      <h1 style={adminPageTitleStyle} className="admin-page-title">
        New Blog
      </h1>
      <BlogForm />
    </div>
  )
}
