'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTenant } from '@/components/TenantProvider'

const INPUT_STYLE = {
  width: '100%',
  padding: '13px 16px',
  border: '1px solid rgba(0,0,0,0.15)',
  borderRadius: '2px',
  fontFamily: 'var(--font-body)',
  fontSize: '0.88rem',
  backgroundColor: 'transparent',
  color: 'var(--color-text)',
  outline: 'none',
}

const LABEL_STYLE = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.7rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  opacity: 0.5,
  display: 'block',
  marginBottom: '7px',
}

export default function SignupPage() {
  const tenant = useTenant()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const handleSignup = async () => {
    if (!name || !email || !password) { setError('All fields are required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError(null)

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (err) { setError(err.message); return }
    setDone(true)
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--color-accent)', margin: '0 auto 20px' }} />
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.8rem',
            fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.05em',
          }}>
            Create account
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', opacity: 0.5, margin: 0 }}>
            Join {tenant.brand_name}
          </p>
        </div>

        {done ? (
          <div style={{
            textAlign: 'center', padding: '32px',
            border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✉️</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: '0 0 8px' }}>Verify your email</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', opacity: 0.6, margin: '0 0 20px' }}>
              We sent a confirmation link to <strong>{email}</strong>
            </p>
            <Link href="/auth/login" style={{
              fontFamily: 'var(--font-body)', fontSize: '0.78rem',
              color: 'var(--color-accent)', textDecoration: 'none',
            }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <div>
            {error && (
              <div style={{
                backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: '4px', padding: '12px 16px', marginBottom: '20px',
                fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#dc2626',
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={LABEL_STYLE}>Full Name</label>
                <input type="text" style={INPUT_STYLE} value={name}
                  onChange={e => setName(e.target.value)} placeholder="Jagjeet Singh" />
              </div>
              <div>
                <label style={LABEL_STYLE}>Email</label>
                <input type="email" style={INPUT_STYLE} value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label style={LABEL_STYLE}>Password</label>
                <input type="password" style={INPUT_STYLE} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                  onKeyDown={e => e.key === 'Enter' && handleSignup()} />
              </div>
            </div>

            <button
              onClick={handleSignup}
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                backgroundColor: loading ? 'rgba(0,0,0,0.2)' : 'var(--color-primary)',
                color: 'var(--color-secondary)',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600,
                marginBottom: '20px',
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.82rem', opacity: 0.5, margin: 0 }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
