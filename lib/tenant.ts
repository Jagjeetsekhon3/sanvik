import { Tenant } from '@/types'

// Raw fetch — bypasses Next.js data cache and Supabase SDK caching entirely
async function supabaseFetch(path: string, params: Record<string, string>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) throw new Error('Missing Supabase env vars')

  const query = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
  const url = `${supabaseUrl}/rest/v1/${path}?${query}&limit=1`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (!res.ok) return null
  const data = await res.json()
  return data?.[0] || null
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  return supabaseFetch('tenants', { 'id': `eq.${id}` })
}

export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  return supabaseFetch('tenants', { 'subdomain': `eq.${subdomain}` })
}

export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
  return supabaseFetch('tenants', { 'custom_domain': `eq.${domain}`, 'active': 'eq.true' })
}
