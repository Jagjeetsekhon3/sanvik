import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  const host = hostname.split(':')[0]

  // Skip static assets and special routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api/debug') ||
    pathname.startsWith('/superadmin') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({
      error: 'Missing env vars',
      hasUrl: !!supabaseUrl,
      hasKey: !!serviceKey,
    }, { status: 500 })
  }

  let tenantId: string | null = null
  let tenantSubdomain: string | null = null

  try {
    // Try custom domain first
    const domainRes = await fetch(
      `${supabaseUrl}/rest/v1/tenants?custom_domain=eq.${host}&active=eq.true&limit=1`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
        },
        cache: 'no-store',
      }
    )

    const domainData = await domainRes.json()
    if (domainData?.[0]) {
      tenantId = domainData[0].id
      tenantSubdomain = domainData[0].subdomain
    }

    // Fall back to subdomain
    if (!tenantId) {
      const parts = host.split('.')
      const subdomain = parts.length >= 3 ? parts[0] : null

      if (subdomain && subdomain !== 'www') {
        const subRes = await fetch(
          `${supabaseUrl}/rest/v1/tenants?subdomain=eq.${subdomain}&active=eq.true&limit=1`,
          {
            headers: {
              'apikey': serviceKey,
              'Authorization': `Bearer ${serviceKey}`,
            },
            cache: 'no-store',
          }
        )
        const subData = await subRes.json()
        if (subData?.[0]) {
          tenantId = subData[0].id
          tenantSubdomain = subData[0].subdomain
        }
      }
    }
  } catch (err) {
    return NextResponse.json({
      error: 'DB connection failed',
      detail: err instanceof Error ? err.message : String(err),
    }, { status: 500 })
  }

  if (!tenantId) {
    return NextResponse.json({
      error: 'Store not found',
      host_checked: host,
    }, { status: 404 })
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-id', tenantId)
  requestHeaders.set('x-tenant-subdomain', tenantSubdomain || '')

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
