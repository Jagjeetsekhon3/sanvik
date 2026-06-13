'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTenant } from '@/components/TenantProvider'
import { useRouter } from 'next/navigation'

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

export default function LoginPage() {
  const tenant = useTenant()
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)
  const [mode, setMode] = useState<'password' | 'magic'>('password')

  const handleLogin = async () => {
    if (!email) { setError('Email is required'); return }
    setLoading(true); setError(null)

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    router.push('/account')
    router.refresh()
  }

  const handleMagicLink = async () => {
    if (!email) { setError('Email is required'); return }
    setLoading(true); setError(null)

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    setLoading(false)
    if (err) { setError(err.message); return }
    setMagicSent(true)
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--color-accent)', margin: '0 auto 20px' }} />
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.8rem',
            fontWeight: 700, margin: '0 0 8px', letterSpacing: '0.05em',
          }}>
            Welcome back
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', opacity: 0.5, margin: 0 }}>
            Sign in to your {tenant.brand_name} account
          </p>
        </div>

        {magicSent ? (
          <div style={{
            textAlign: 'center', padding: '32px',
            border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✉️</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', margin: '0 0 8px' }}>Check your inbox</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', opacity: 0.6, margin: 0 }}>
              We sent a sign-in link to <strong>{email}</strong>
            </p>
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

            {/* Mode toggle */}
            <div style={{
              display: 'flex', marginBottom: '28px',
              border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden',
            }}>
              {(['password', 'magic'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  flex: 1, padding: '10px',
                  border: 'none', cursor: 'pointer',
                  backgroundColor: mode === m ? 'var(--color-primary)' : 'transparent',
                  color: mode === m ? 'var(--color-secondary)' : 'var(--color-text)',
                  fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  opacity: mode === m ? 1 : 0.5,
                  transition: 'all 0.2s',
                }}>
                  {m === 'password' ? 'Password' : 'Magic Link'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={LABEL_STYLE}>Email</label>
                <input
                  type="email" style={INPUT_STYLE}
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  onKeyDown={e => e.key === 'Enter' && (mode === 'password' ? handleLogin() : handleMagicLink())}
                />
              </div>

              {mode === 'password' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                    <label style={{ ...LABEL_STYLE, marginBottom: 0 }}>Password</label>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.72rem', opacity: 0.4, textDecoration: 'underline', color: 'var(--color-text)' }}>
                      Forgot?
                    </button>
                  </div>
                  <input
                    type="password" style={INPUT_STYLE}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              )}
            </div>

            <button
              onClick={mode === 'password' ? handleLogin : handleMagicLink}
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
              {loading ? 'Please wait...' : mode === 'password' ? 'Sign In' : 'Send Magic Link'}
            </button>

            <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '0.82rem', opacity: 0.5, margin: 0 }}>
              No account?{' '}
              <Link href="/auth/signup" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>
                Create one
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
