import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, rateLimitConfigs } from '@/lib/security/rate-limit'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rl = await checkRateLimit(`api:revalidate:${user.id}`, rateLimitConfigs.api)
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  revalidatePath('/', 'page')
  return NextResponse.json({ revalidated: true })
}
