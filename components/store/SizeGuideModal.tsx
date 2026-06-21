'use client'

import { useState, useEffect } from 'react'
import { SizeGuide } from '@/types'

export default function SizeGuideModal({ sizeGuideId }: { sizeGuideId: string }) {
  const [open, setOpen] = useState(false)
  const [guide, setGuide] = useState<SizeGuide | null>(null)

  useEffect(() => {
    if (open && !guide) {
      fetch(`/api/size-guide/${sizeGuideId}`).then(r => r.json()).then(setGuide)
    }
  }, [open, sizeGuideId, guide])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: '0.72rem',
          opacity: 0.45, textDecoration: 'underline',
          color: 'var(--color-text)', padding: 0,
        }}
      >
        Size guide
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 299, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 300, backgroundColor: 'var(--color-bg)',
            width: '90vw', maxWidth: '680px', maxHeight: '80vh',
            overflow: 'auto', borderRadius: '8px', padding: '32px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 600, margin: 0 }}>
                {guide?.name || 'Size Guide'}
              </h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, padding: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {guide?.description && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', opacity: 0.6, margin: '0 0 20px', lineHeight: 1.6 }}>
                {guide.description}
              </p>
            )}

            {!guide ? (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', opacity: 0.4, textAlign: 'center', padding: '32px' }}>Loading...</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-primary)' }}>
                      {guide.headers.map((h, i) => (
                        <th key={i} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {guide.rows.map((row, ri) => (
                      <tr key={ri} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', backgroundColor: ri % 2 === 0 ? 'rgba(0,0,0,0.015)' : 'transparent' }}>
                        {row.map((cell, ci) => (
                          <td key={ci} style={{ padding: '12px', fontWeight: ci === 0 ? 600 : 400, color: ci === 0 ? 'var(--color-text)' : 'var(--color-text)', opacity: ci === 0 ? 1 : 0.65 }}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
