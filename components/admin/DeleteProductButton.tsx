'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return }
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    router.refresh()
  }

  return (
    <button onClick={handleDelete} style={{
      background: 'none', border: 'none', cursor: 'pointer',
      fontFamily: 'var(--font-body)', fontSize: '0.72rem',
      color: confirming ? '#ef4444' : '#aaa',
      fontWeight: confirming ? 600 : 400,
    }}>
      {confirming ? 'Confirm?' : 'Delete'}
    </button>
  )
}
