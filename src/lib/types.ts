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
  slug: string
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

export type AppRole = 'admin' | 'editor' | 'viewer'

export interface Profile {
  id: string
  email: string
  role: AppRole
  full_name: string | null
  created_at: string
  updated_at: string
}

export interface PendingChange {
  id: string
  resource_type: 'testimonial' | 'service' | 'service_image' | 'trust_image' | 'blog'
  resource_id: string | null
  action: 'create' | 'update' | 'publish' | 'unpublish' | 'set_primary'
  payload: Record<string, unknown>
  status: 'pending' | 'approved' | 'rejected'
  submitted_by: string
  reviewed_by: string | null
  review_note: string | null
  created_at: string
  updated_at: string
  // Joined fields
  submitter_profile?: Pick<Profile, 'email' | 'full_name'>
}

export interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content_html: string
  main_image_url: string | null
  main_image_alt_text: string | null
  is_published: boolean
  published_at: string | null
  display_order: number
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  preferred_contact: 'email' | 'phone' | 'whatsapp'
  service_interest: string | null
  appointment_preference: string | null
  message: string
  consent: boolean
  status: 'new' | 'read' | 'resolved' | 'spam'
  source_page: string | null
  form_location: string | null
  landing_page: string | null
  page_title: string | null
  referrer: string | null
  user_agent: string | null
  ip_address: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  gclid: string | null
  fbclid: string | null
  created_at: string
  updated_at: string
  viewed_at: string | null
}
