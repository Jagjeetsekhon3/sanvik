import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const host = hostname.split(':')[0]

  // ── Skip static assets, Next internals, and debug route ──
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/debug') ||
    pathname.startsWith('/superadmin') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // ── Check env vars are present ──
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({
      error: 'Missing Supabase environment variables',
      supabase_url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      service_role_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }, { status: 500 })
  }

  // ── Resolve tenant from hostname ──
  let tenantId: string | null = null
  let tenantSubdomain: string | null = null

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    // Try custom domain first
    const { data: byDomain } = await supabase
      .from('tenants')
      .select('id, subdomain, active')
      .eq('custom_domain', host)
      .eq('active', true)
      .maybeSingle()

    if (byDomain) {
      tenantId = byDomain.id
      tenantSubdomain = byDomain.subdomain
    } else {
      // Fall back to subdomain
      const parts = host.split('.')
      const subdomain = parts.length >= 3 ? parts[0] : null

      if (subdomain && subdomain !== 'www') {
        const { data: bySubdomain } = await supabase
          .from('tenants')
          .select('id, subdomain, active')
          .eq('subdomain', subdomain)
          .eq('active', true)
          .maybeSingle()

        if (bySubdomain) {
          tenantId = bySubdomain.id
          tenantSubdomain = bySubdomain.subdomain
        }
      }
    }
  } catch (err) {
    console.error('[Middleware] Supabase error:', err)
    return NextResponse.json({
      error: 'Database connection failed',
      detail: err instanceof Error ? err.message : String(err),
      host,
    }, { status: 500 })
  }

  // ── No tenant found ──
  if (!tenantId) {
    return NextResponse.json({
      error: 'Store not found',
      host_checked: host,
    }, { status: 404 })
  }

  // ── Inject tenant info into request headers ──
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-id', tenantId)
  requestHeaders.set('x-tenant-subdomain', tenantSubdomain || '')

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
