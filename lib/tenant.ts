import { createServiceClient } from '@/lib/supabase/server'
import { Tenant } from '@/types'

// No React cache() here — always fetch fresh from DB
export async function resolveTenant(hostname: string): Promise<Tenant | null> {
  const supabase = createServiceClient()
  const host = hostname.split(':')[0]

  let { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('custom_domain', host)
    .eq('active', true)
    .maybeSingle()

  if (tenant) return tenant as Tenant

  const parts = host.split('.')
  const subdomain = parts.length >= 3 ? parts[0] : null
  if (!subdomain) return null

  const { data: subdomainTenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('subdomain', subdomain)
    .eq('active', true)
    .maybeSingle()

  return subdomainTenant as Tenant | null
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return data as Tenant | null
}

export async function getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('tenants')
    .select('*')
    .eq('subdomain', subdomain)
    .maybeSingle()
  return data as Tenant | null
}
