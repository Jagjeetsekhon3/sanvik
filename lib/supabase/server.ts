import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getClientOptions(cookieStore: ReturnType<typeof cookies>) {
  return {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
    global: {
      fetch: (url: RequestInfo | URL, options?: RequestInit) =>
        fetch(url, {
          ...options,
          cache: 'no-store',
          headers: {
            ...((options?.headers as Record<string, string>) || {}),
          },
        }),
    },
  }
}

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    getClientOptions(cookieStore)
  )
}

export function createServiceClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    getClientOptions(cookieStore)
  )
}
