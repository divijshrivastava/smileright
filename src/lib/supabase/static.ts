import { createClient } from '@supabase/supabase-js'

/**
 * Use in server-only static contexts where request cookies are unavailable
 * (e.g. generateMetadata, generateStaticParams).
 */
export function createStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
