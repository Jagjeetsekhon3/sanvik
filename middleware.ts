import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const host = hostname.split(':')[0]

  // ── Skip static assets and Next internals ──
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
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
    let { data: tenant } = await supabase
      .from('tenants')
      .select('id, subdomain, active')
      .eq('custom_domain', host)
      .eq('active', true)
      .single()

    // Fall back to subdomain
    if (!tenant) {
      const parts = host.split('.')
      const subdomain = parts.length >= 3 ? parts[0] : null

      if (subdomain && subdomain !== 'www') {
        const { data } = await supabase
          .from('tenants')
          .select('id, subdomain, active')
          .eq('subdomain', subdomain)
          .eq('active', true)
          .single()
        tenant = data
      }
    }

    if (tenant) {
      tenantId = tenant.id
      tenantSubdomain = tenant.subdomain
    }
  } catch (err) {
    console.error('[Middleware] Tenant resolution error:', err)
  }

  // ── No tenant found — 404 ──
  if (!tenantId) {
    // Allow super admin panel without tenant
    if (pathname.startsWith('/superadmin')) {
      return NextResponse.next()
    }
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  // ── Inject tenant info into request headers ──
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-id', tenantId)
  requestHeaders.set('x-tenant-subdomain', tenantSubdomain || '')

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // ── Pass tenant headers to response for client access ──
  response.headers.set('x-tenant-id', tenantId)

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
