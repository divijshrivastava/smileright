import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Auth callback handler
 * Includes protection against open redirect vulnerabilities
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  // Validate redirect URL to prevent open redirect attacks
  const isValidRedirect = next === '/admin' || next.startsWith('/admin/')
  const redirectPath = isValidRedirect ? next : '/admin'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Ensure redirect is to same origin only
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth`)
}
