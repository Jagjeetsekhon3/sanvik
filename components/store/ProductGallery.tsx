'use client'

import { useState } from 'react'

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div style={{
        aspectRatio: '3/4', backgroundColor: 'rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2,
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: '64px', height: '80px',
                padding: 0, cursor: 'pointer',
                border: '2px solid',
                borderColor: i === active ? 'var(--color-primary)' : 'transparent',
                backgroundColor: 'rgba(0,0,0,0.04)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <img src={img} alt={`${name} ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div style={{
        flex: 1, aspectRatio: '3/4',
        backgroundColor: 'rgba(0,0,0,0.04)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <img
          src={images[active]}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    </div>
  )
}
