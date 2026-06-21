'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Tenant } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const NAV = [
  { label: 'Dashboard', href: '/master-admin', icon: '▦' },
  { label: 'Products', href: '/master-admin/products', icon: '◈' },
  { label: 'Categories', href: '/master-admin/categories', icon: '◫' },
  { label: 'Inventory', href: '/master-admin/inventory', icon: '◱' },
  { label: 'Orders', href: '/master-admin/orders', icon: '◉' },
  { label: 'Media', href: '/master-admin/media', icon: '◧' },
  { label: 'Discounts', href: '/master-admin/discounts', icon: '◇' },
  { label: 'Homepage', href: '/master-admin/homepage', icon: '⌂' },
  { label: 'Pages', href: '/master-admin/pages', icon: '◻' },
  { label: 'Banner', href: '/master-admin/banner', icon: '◰' },
  { label: 'Menu', href: '/master-admin/menu', icon: '≡' },
  { label: 'Header', href: '/master-admin/header', icon: '▬' },
  { label: 'Footer', href: '/master-admin/footer', icon: '▭' },
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
      position: 'fixed', top: 0, left: 0, bottom: 0, width: '220px',
      backgroundColor: '#111', color: '#fff',
      display: 'flex', flexDirection: 'column', zIndex: 50,
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.35, margin: '0 0 4px' }}>Admin</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0, color: '#fff' }}>
          {tenant.brand_name}
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV.map(item => {
          const active = item.href === '/master-admin'
            ? pathname === '/master-admin'
            : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 18px',
              backgroundColor: active ? 'rgba(255,255,255,0.08)' : 'transparent',
              borderLeft: active ? '2px solid #c8a96e' : '2px solid transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.4)',
              textDecoration: 'none',
              fontFamily: 'Inter, sans-serif', fontSize: '0.78rem',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* View store */}
      <Link href="/" style={{
        display: 'block', padding: '12px 18px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontFamily: 'Inter, sans-serif', fontSize: '0.72rem',
        color: 'rgba(255,255,255,0.3)', textDecoration: 'none',
      }}>
        ← View Store
      </Link>

      {/* Footer */}
      <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', margin: '0 0 4px', color: 'rgba(255,255,255,0.5)' }}>
          {adminName}
        </p>
        <button onClick={handleSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', padding: 0, textDecoration: 'underline' }}>
          Sign out
        </button>
      </div>
    </aside>
  )
}
