'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button onClick={handleSignOut} style={{
      background: 'none',
      border: '1px solid rgba(0,0,0,0.12)',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: '0.72rem',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--color-text)',
      opacity: 0.5,
      padding: '10px 20px',
    }}>
      Sign Out
    </button>
  )
}
