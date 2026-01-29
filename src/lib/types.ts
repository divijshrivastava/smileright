export interface Testimonial {
  id: string
  name: string
  description: string
  image_url: string | null
  alt_text: string | null
  is_published: boolean
  created_at: string
  updated_at: string
  rating: number
  display_order: number
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
