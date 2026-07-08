'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  customerId: string
  customerEmail: string
  customerName: string
  isBanned: boolean
  isAdmin: boolean
  adminRole: string | null
  tenantId: string
}

export default function CustomerActions({ customerId, customerEmail, customerName, isBanned, isAdmin, adminRole, tenantId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [currentBanned, setCurrentBanned] = useState(isBanned)
  const [currentIsAdmin, setCurrentIsAdmin] = useState(isAdmin)
  const [currentRole, setCurrentRole] = useState(adminRole)

  const handleBanToggle = async () => {
    setLoading(true)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    // Use admin API
    await fetch('/api/admin/customers', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, is_banned: !currentBanned }),
    })
    setCurrentBanned(!currentBanned)
    setLoading(false)
  }

  const handleRoleAssign = async (role: string | null) => {
    setLoading(true)
    setShowRoleMenu(false)

    if (role === null) {
      // Remove admin
      await fetch('/api/admin/team', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail }),
      })
      setCurrentIsAdmin(false)
      setCurrentRole(null)
    } else {
      // Add or update admin role
      if (currentIsAdmin) {
        // Update existing
        const res = await fetch('/api/admin/team', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: customerEmail, role }),
        })
        // For PUT by email we need the id — use POST which handles upsert logic
      }
      // Always POST which checks for existing and errors
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail, name: customerName, role }),
      })
      const data = await res.json()
      if (!data.error || data.error.includes('already')) {
        setCurrentIsAdmin(true)
        setCurrentRole(role)
      }
    }

    setLoading(false)
    router.refresh()
  }

  const ROLE_COLORS: Record<string, string> = {
    owner: '#8b5cf6', manager: '#3b82f6', staff: '#22c55e'
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
      {/* Role button */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowRoleMenu(!showRoleMenu)}
          disabled={loading}
          style={{
            background: 'none', border: '1px solid #e5e5e5', borderRadius: '4px',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem',
            padding: '5px 10px', color: currentIsAdmin ? ROLE_COLORS[currentRole || 'staff'] : '#666',
            fontWeight: currentIsAdmin ? 600 : 400,
          }}
        >
          {currentIsAdmin ? `${currentRole || 'admin'} ▾` : 'Set Role ▾'}
        </button>

        {showRoleMenu && (
          <>
            <div onClick={() => setShowRoleMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 9 }} />
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: '4px',
              backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '6px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '160px', overflow: 'hidden',
            }}>
              {[
                { role: 'staff', label: 'Staff', desc: 'View orders only' },
                { role: 'manager', label: 'Manager', desc: 'Products & orders' },
                { role: 'owner', label: 'Owner', desc: 'Full access' },
              ].map(item => (
                <button key={item.role} onClick={() => handleRoleAssign(item.role)} style={{
                  display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                  background: currentRole === item.role ? '#f5f5f5' : 'none',
                  border: 'none', cursor: 'pointer',
                }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: ROLE_COLORS[item.role], margin: '0 0 1px' }}>{item.label}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: '#aaa', margin: 0 }}>{item.desc}</p>
                </button>
              ))}
              {currentIsAdmin && (
                <>
                  <div style={{ height: '1px', backgroundColor: '#f0f0f0' }} />
                  <button onClick={() => handleRoleAssign(null)} style={{
                    display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#ef4444',
                  }}>
                    Remove Admin Access
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Ban toggle */}
      <button
        onClick={handleBanToggle}
        disabled={loading}
        style={{
          background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif', fontSize: '0.72rem',
          color: currentBanned ? '#22c55e' : '#ef4444',
          opacity: loading ? 0.5 : 1,
        }}
      >
        {currentBanned ? 'Unban' : 'Ban'}
      </button>

      {/* View orders */}
      <a
        href={`/master-admin/orders?customer=${customerEmail}`}
        style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#3b82f6', textDecoration: 'none' }}
      >
        Orders
      </a>
    </div>
  )
}
