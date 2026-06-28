'use client'

import { useState, useEffect } from 'react'

interface Admin {
  id: string; email: string; name: string; role: 'owner' | 'manager' | 'staff'; created_at: string
}

const ROLE_LABELS = { owner: 'Owner', manager: 'Manager', staff: 'Staff' }
const ROLE_COLORS = { owner: '#8b5cf6', manager: '#3b82f6', staff: '#22c55e' }
const ROLE_DESC = {
  owner: 'Full access — can manage team, settings, billing',
  manager: 'Can manage products, orders, customers, discounts',
  staff: 'Can view orders and update order status only',
}

const INPUT: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '4px', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', backgroundColor: '#fff', color: '#111', outline: 'none' }
const LABEL: React.CSSProperties = { fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '6px' }

export default function TeamPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'owner' | 'manager' | 'staff'>('staff')

  useEffect(() => { fetchTeam() }, [])

  const fetchTeam = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/team')
    const data = await res.json()
    setAdmins(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const resetForm = () => {
    setEmail(''); setName(''); setRole('staff')
    setShowForm(false); setEditingId(null); setError(null)
  }

  const openEdit = (admin: Admin) => {
    setEditingId(admin.id)
    setName(admin.name); setEmail(admin.email); setRole(admin.role)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!email && !editingId) { setError('Email is required'); return }
    setSaving(true); setError(null)

    if (editingId) {
      const res = await fetch('/api/admin/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, role, name }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setSaving(false); return }
      setAdmins(prev => prev.map(a => a.id === editingId ? { ...a, role, name } : a))
    } else {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, role }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setSaving(false); return }
      if (data.id) setAdmins(prev => [...prev, data])
    }

    setSaving(false); resetForm()
  }

  const handleDelete = async (admin: Admin) => {
    if (!confirm(`Remove ${admin.name || admin.email} as admin?`)) return
    const res = await fetch('/api/admin/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: admin.id }),
    })
    const data = await res.json()
    if (data.error) { alert(data.error); return }
    setAdmins(prev => prev.filter(a => a.id !== admin.id))
  }

  const handleRoleChange = async (admin: Admin, newRole: 'owner' | 'manager' | 'staff') => {
    const res = await fetch('/api/admin/team', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: admin.id, role: newRole }),
    })
    const data = await res.json()
    if (data.error) { alert(data.error); return }
    setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, role: newRole } : a))
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Team</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>
            {admins.length} admin{admins.length !== 1 ? 's' : ''} · Manage who has access to this store
          </p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '11px 24px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
            + Add Admin
          </button>
        )}
      </div>

      {/* Role legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {(Object.entries(ROLE_DESC) as [keyof typeof ROLE_DESC, string][]).map(([r, desc]) => (
          <div key={r} style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ROLE_COLORS[r], flexShrink: 0 }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#111' }}>{ROLE_LABELS[r]}</span>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#aaa', margin: 0, lineHeight: 1.4 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '24px', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 600, color: '#111', margin: '0 0 20px' }}>
            {editingId ? 'Edit Admin' : 'Add New Admin'}
          </h2>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '10px 14px', marginBottom: '16px', fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: editingId ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {!editingId && (
              <div>
                <label style={LABEL}>Email Address *</label>
                <input style={INPUT} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@example.com" />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#aaa', margin: '4px 0 0' }}>
                  They must sign up at /auth/signup first
                </p>
              </div>
            )}
            <div>
              <label style={LABEL}>Display Name</label>
              <input style={INPUT} value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" />
            </div>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={LABEL}>Role *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {(['staff', 'manager', 'owner'] as const).map(r => (
                <label key={r} style={{
                  border: '1px solid',
                  borderColor: role === r ? ROLE_COLORS[r] : '#e5e5e5',
                  borderRadius: '6px', padding: '14px',
                  cursor: 'pointer', display: 'block',
                  backgroundColor: role === r ? `${ROLE_COLORS[r]}08` : '#fff',
                  transition: 'all 0.15s',
                }}>
                  <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} style={{ display: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ROLE_COLORS[r] }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: role === r ? '#111' : '#666' }}>{ROLE_LABELS[r]}</span>
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: '#aaa', margin: 0, lineHeight: 1.4 }}>{ROLE_DESC[r]}</p>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSave} disabled={saving} style={{ backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: saving ? 'not-allowed' : 'pointer', padding: '11px 24px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Admin'}
            </button>
            <button onClick={resetForm} style={{ background: 'none', border: '1px solid #eee', borderRadius: '4px', cursor: 'pointer', padding: '11px 20px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#666' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Admin list */}
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px', padding: '12px 20px', borderBottom: '1px solid #eee', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#aaa' }}>
          <span>Admin</span><span>Role</span><span>Since</span><span>Actions</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#ccc', fontFamily: 'Inter, sans-serif' }}>Loading...</div>
        ) : admins.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#ccc', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>No admins yet</div>
        ) : (
          admins.map(admin => (
            <div key={admin.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px', padding: '16px 20px', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}>
              {/* Admin info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  backgroundColor: `${ROLE_COLORS[admin.role]}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: ROLE_COLORS[admin.role] }}>
                    {(admin.name || admin.email)[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: '#111', margin: '0 0 2px' }}>{admin.name || '—'}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#aaa', margin: 0 }}>{admin.email}</p>
                </div>
              </div>

              {/* Role dropdown */}
              <select
                value={admin.role}
                onChange={e => handleRoleChange(admin, e.target.value as 'owner' | 'manager' | 'staff')}
                style={{
                  border: 'none', borderRadius: '20px', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.68rem',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  padding: '4px 10px', fontWeight: 600,
                  backgroundColor: `${ROLE_COLORS[admin.role]}18`,
                  color: ROLE_COLORS[admin.role],
                  outline: 'none', appearance: 'none',
                }}
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="owner">Owner</option>
              </select>

              {/* Date */}
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: '#bbb' }}>
                {new Date(admin.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => openEdit(admin)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#3b82f6' }}>Edit</button>
                <button onClick={() => handleDelete(admin)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#ef4444' }}>Remove</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info box */}
      <div style={{ backgroundColor: '#f0f7ff', borderRadius: '8px', border: '1px solid #bfdbfe', padding: '16px 20px', marginTop: '16px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#1d4ed8', margin: '0 0 4px', fontWeight: 600 }}>How to add an admin</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#3b82f6', margin: 0, lineHeight: 1.5 }}>
          1. Ask them to sign up at <strong>/auth/signup</strong> using their email<br />
          2. Come back here and add their email with the appropriate role<br />
          3. They can now access <strong>/master-admin</strong>
        </p>
      </div>
    </div>
  )
}
