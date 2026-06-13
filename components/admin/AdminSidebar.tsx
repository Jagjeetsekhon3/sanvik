'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tenant } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV = [
  { label: 'Dashboard', href: '/master-admin', icon: '▦' },
  { label: 'Products', href: '/master-admin/products', icon: '◈' },
  { label: 'Orders', href: '/master-admin/orders', icon: '◉' },
  { label: 'Customers', href: '/master-admin/customers', icon: '◎' },
  { label: 'Discounts', href: '/master-admin/discounts', icon: '◇' },
  { label: 'Settings', href: '/master-admin/settings', icon: '◌' },
]

export default function AdminSidebar({ tenant, adminName }: { tenant: Tenant; adminName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: '240px',
      backgroundColor: '#111', color: '#fff',
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
    }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.35, margin: '0 0 4px' }}>
          Admin Panel
        </p>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, color: '#fff' }}>
          {tenant.brand_name}
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
        {NAV.map(item => {
          const active = item.href === '/master-admin'
            ? pathname === '/master-admin'
            : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '11px 20px',
              backgroundColor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderLeft: active ? '2px solid var(--color-accent, #c8a96e)' : '2px solid transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.45)',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)', fontSize: '0.8rem',
              letterSpacing: '0.05em',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', margin: '0 0 2px', color: 'rgba(255,255,255,0.6)' }}>
          {adminName}
        </p>
        <button onClick={handleSignOut} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: '0.68rem',
          color: 'rgba(255,255,255,0.3)', padding: 0,
          textDecoration: 'underline',
        }}>
          Sign out
        </button>
      </div>
    </aside>
  )
}
