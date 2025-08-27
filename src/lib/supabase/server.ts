import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: { path?: string; domain?: string; maxAge?: number; secure?: boolean; httpOnly?: boolean; sameSite?: 'strict' | 'lax' | 'none' | boolean }) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Handle server component cookie setting
          }
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Handle server component cookie removal
          }
        },
      },
    }
  )
}