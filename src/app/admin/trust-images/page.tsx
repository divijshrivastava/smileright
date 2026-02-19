import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TrustImageList from '@/components/admin/TrustImageList'
import type { TrustImage, Profile } from '@/lib/types'
import { canEditContent } from '@/lib/permissions'
import {
  adminPageHeaderStyle,
  adminPageTitleInHeaderStyle,
  adminPrimaryActionLinkStyle,
} from '@/styles/admin'

export default async function TrustImagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile as Pick<Profile, 'role'>)?.role ?? 'viewer'

  const { data: images } = await supabase
    .from('trust_images')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(100)

  const trustImages: TrustImage[] = images ?? []

  return (
    <div className="admin-page-content">
      <div style={adminPageHeaderStyle} className="admin-page-header">
        <h1 style={adminPageTitleInHeaderStyle} className="admin-page-title">Trust Section Images</h1>
        {canEditContent(role) && (
          <Link href="/admin/trust-images/new" style={adminPrimaryActionLinkStyle} className="admin-add-btn admin-primary-btn">
            + New Image
          </Link>
        )}
      </div>

      <TrustImageList images={trustImages} userRole={role} />
    </div>
  )
}
