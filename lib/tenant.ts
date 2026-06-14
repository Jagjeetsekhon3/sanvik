import { createServiceClient } from '@/lib/supabase/server'
import { Tenant } from '@/types'

export async function getTenantById(id: string): Promise<Tenant | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) console.error('[getTenantById]', error)
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
