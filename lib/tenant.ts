import { createServiceClient } from '@/lib/supabase/server'
import { Tenant } from '@/types'
import { cache } from 'react'

// Resolve tenant from a hostname string
// Called by middleware and layout — cached per request via React cache()
export const resolveTenant = cache(async (hostname: string): Promise<Tenant | null> => {
  const supabase = createServiceClient()

  // Strip port (for local dev)
  const host = hostname.split(':')[0]

  // Check custom domain first (e.g. "zara.com")
  let { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('custom_domain', host)
    .eq('active', true)
    .single()

  if (tenant) return tenant as Tenant

  // Fall back to subdomain (e.g. "zara.fashn.com" → "zara")
  const parts = host.split('.')
  const subdomain = parts.length >= 3 ? parts[0] : null

  if (!subdomain) return null

  const { data: subdomainTenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('subdomain', subdomain)
    .eq('active', true)
    .single()

  return subdomainTenant as Tenant | null
})

// Get tenant by subdomain directly (used in super admin / API)
export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('tenants')
    .select('*')
    .eq('subdomain', subdomain)
    .single()
  return data as Tenant | null
}

// Get tenant by ID (used in admin panel)
export async function getTenantById(id: string): Promise<Tenant | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single()
  return data as Tenant | null
}
