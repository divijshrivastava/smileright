import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import TrustImageForm from '@/components/admin/TrustImageForm'
import type { TrustImage } from '@/lib/types'

interface EditTrustImagePageProps {
  params: Promise<{ id: string }>
}

export default async function EditTrustImagePage({ params }: EditTrustImagePageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: image } = await supabase
    .from('trust_images')
    .select('*')
    .eq('id', id)
    .single()

  if (!image) {
    notFound()
  }

  const trustImage: TrustImage = image

  return (
    <div className="admin-page-content">
      <h1 style={styles.title} className="admin-page-title">Edit Trust Image</h1>
      <TrustImageForm trustImage={trustImage} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontFamily: 'var(--font-serif)',
    fontSize: '2rem',
    color: '#292828',
    marginBottom: '2rem',
  },
}
