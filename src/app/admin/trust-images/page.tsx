import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TrustImageList from '@/components/admin/TrustImageList'
import type { TrustImage } from '@/lib/types'

export default async function TrustImagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: images } = await supabase
    .from('trust_images')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  const trustImages: TrustImage[] = images ?? []

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Trust Section Images</h1>
        <Link href="/admin/trust-images/new" style={styles.createBtn}>
          + New Image
        </Link>
      </div>

      <TrustImageList images={trustImages} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: '#292828',
    margin: 0,
  },
  createBtn: {
    display: 'inline-block',
    padding: '12px 24px',
    background: '#1B73BA',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
}
