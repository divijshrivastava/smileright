export interface Testimonial {
  id: string
  name: string
  description: string
  image_url: string | null
  video_url: string | null
  media_type: 'text' | 'image' | 'video' | 'image_text' | 'video_text'
  alt_text: string | null
  is_published: boolean
  created_at: string
  updated_at: string
  rating: number
  display_order: number
  created_by: string | null
  updated_by: string | null
}

export interface TrustImage {
  id: string
  image_url: string
  alt_text: string | null
  caption: string | null
  display_order: number
  is_published: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface Service {
  id: string
  title: string
  description: string
  image_url: string
  alt_text: string
  display_order: number
  is_published: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  service_images?: ServiceImage[]
}

export interface ServiceImage {
  id: string
  service_id: string
  image_url: string
  alt_text: string | null
  caption: string | null
  display_order: number
  is_primary: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface Profile {
  id: string
  email: string
  role: 'admin' | 'editor'
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content_html: string
  is_published: boolean
  published_at: string | null
  display_order: number
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}
