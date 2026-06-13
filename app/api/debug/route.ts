import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const host = hostname.split(':')[0]

  // Test Supabase connection
  let supabaseStatus = 'not tested'
  let tenants: unknown[] = []
  let error = null

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )

    const { data, error: dbError } = await supabase
      .from('tenants')
      .select('id, subdomain, custom_domain, active')

    if (dbError) {
      error = dbError.message
      supabaseStatus = 'connected but query failed'
    } else {
      supabaseStatus = 'connected'
      tenants = data || []
    }
  } catch (e: unknown) {
    supabaseStatus = 'connection failed'
    error = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json({
    hostname_raw: hostname,
    host_parsed: host,
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    supabase_anon_set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    service_role_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabase_status: supabaseStatus,
    tenants,
    error,
  })
}
