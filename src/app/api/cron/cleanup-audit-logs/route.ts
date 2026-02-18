import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (!cronSecret) {
    console.error('[CRON] Missing CRON_SECRET. Rejecting cron request.')
    return NextResponse.json(
      { success: false, error: 'Cron secret is not configured' },
      { status: 500 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase.rpc('cleanup_old_audit_logs')

    if (error) {
      console.error('[CRON] Audit log cleanup failed:', error.message)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[CRON] Audit log cleanup error:', err)
    return NextResponse.json(
      { success: false, error: 'Unexpected error' },
      { status: 500 }
    )
  }
}
