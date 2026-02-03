import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Lightweight query to verify DB connectivity
    const { error } = await supabase
      .from('services')
      .select('id', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json(
        { status: 'unhealthy', error: 'Database connection failed' },
        { status: 503 }
      )
    }

    return NextResponse.json({ status: 'healthy' })
  } catch {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Unexpected error' },
      { status: 503 }
    )
  }
}
