'use client'

import { useState, useEffect, useRef } from 'react'

interface CloudinaryImage {
  public_id: string
  secure_url: string
  width: number
  height: number
  bytes: number
  created_at: string
  format: string
}

export default function MediaGalleryPage() {
  const [images, setImages] = useState<CloudinaryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [selected, setSelected] = useState<CloudinaryImage | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchImages = async (cursor?: string) => {
    setLoading(true)
    setError(null)
    try {
      const url = cursor ? `/api/admin/cloudinary?next_cursor=${cursor}` : '/api/admin/cloudinary'
      const res = await fetch(url)
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setImages(prev => cursor ? [...prev, ...(data.resources || [])] : (data.resources || []))
      setNextCursor(data.next_cursor || null)
    } catch {
      setError('Failed to load images')
    }
    setLoading(false)
  }

  useEffect(() => { fetchImages() }, [])

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setError(null)

    try {
      // Get upload signature
      const sigRes = await fetch('/api/admin/cloudinary', { method: 'POST' })
      const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json()

      // Upload each file directly to Cloudinary
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', apiKey)
        formData.append('timestamp', String(timestamp))
        formData.append('signature', signature)
        formData.append('folder', folder)

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData }
        )
        const uploadData = await uploadRes.json()
        if (uploadData.secure_url) {
          setImages(prev => [uploadData, ...prev])
        }
      }
    } catch {
      setError('Upload failed')
    }
    setUploading(false)
  }

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDelete = async (publicId: string) => {
    if (!confirm('Delete this image? This cannot be undone.')) return
    setDeleting(publicId)
    await fetch('/api/admin/cloudinary', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    })
    setImages(prev => prev.filter(i => i.public_id !== publicId))
    if (selected?.public_id === publicId) setSelected(null)
    setDeleting(null)
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px', color: '#111' }}>Media Gallery</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#888', margin: 0 }}>
            {images.length} images synced from Cloudinary
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => fetchImages()} style={{ background: 'none', border: '1px solid #e5e5e5', borderRadius: '4px', cursor: 'pointer', padding: '10px 16px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#666' }}>
            ↻ Refresh
          </button>
          <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{ backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '10px 20px', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em' }}>
            {uploading ? 'Uploading...' : '+ Upload Images'}
          </button>
          <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
            onChange={e => handleUpload(e.target.files)} />
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '16px', marginBottom: '20px', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#dc2626' }}>
          {error}
          {error.includes('not configured') && (
            <span> → <a href="/master-admin/settings" style={{ color: '#dc2626', fontWeight: 600 }}>Go to Settings to add Cloudinary keys</a></span>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 300px' : '1fr', gap: '20px' }}>
        {/* Grid */}
        <div>
          {loading && images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#ccc', fontFamily: 'Inter, sans-serif' }}>Loading...</div>
          ) : images.length === 0 ? (
            <div style={{
              border: '2px dashed #e5e5e5', borderRadius: '8px', padding: '80px',
              textAlign: 'center', cursor: 'pointer',
            }} onClick={() => fileRef.current?.click()}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#aaa', margin: '0 0 8px' }}>No images yet</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#ccc', margin: 0 }}>Click to upload your first image</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                {/* Upload drop zone */}
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: '2px dashed #e5e5e5', borderRadius: '8px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', aspectRatio: '1',
                    gap: '8px', color: '#ccc',
                  }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem' }}>Upload</span>
                </div>

                {images.map(img => (
                  <div
                    key={img.public_id}
                    onClick={() => setSelected(selected?.public_id === img.public_id ? null : img)}
                    style={{
                      position: 'relative', aspectRatio: '1', cursor: 'pointer',
                      borderRadius: '6px', overflow: 'hidden',
                      border: selected?.public_id === img.public_id ? '3px solid #111' : '3px solid transparent',
                      backgroundColor: '#f5f5f5',
                    }}>
                    <img src={img.secure_url} alt={img.public_id}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    {/* Hover overlay */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      gap: '8px', opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                    >
                      <button
                        onClick={e => { e.stopPropagation(); handleCopy(img.secure_url) }}
                        style={{ backgroundColor: copied === img.secure_url ? '#22c55e' : '#fff', color: '#111', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600 }}>
                        {copied === img.secure_url ? '✓ Copied!' : 'Copy URL'}
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(img.public_id) }}
                        disabled={deleting === img.public_id}
                        style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600 }}>
                        {deleting === img.public_id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {nextCursor && (
                <button onClick={() => fetchImages(nextCursor)} style={{ display: 'block', margin: '24px auto 0', backgroundColor: '#f5f5f5', border: 'none', borderRadius: '4px', padding: '12px 32px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#666' }}>
                  Load more
                </button>
              )}
            </>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', padding: '20px', position: 'sticky', top: '20px', height: 'fit-content' }}>
            <img src={selected.secure_url} alt={selected.public_id}
              style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', backgroundColor: '#f8f8f8', borderRadius: '4px', marginBottom: '16px' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bbb', margin: '0 0 4px' }}>File</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#444', margin: 0, wordBreak: 'break-all' }}>{selected.public_id}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', textTransform: 'uppercase', color: '#bbb', margin: '0 0 2px' }}>Size</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#444', margin: 0 }}>{formatBytes(selected.bytes)}</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', textTransform: 'uppercase', color: '#bbb', margin: '0 0 2px' }}>Format</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#444', margin: 0 }}>{selected.format.toUpperCase()}</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', textTransform: 'uppercase', color: '#bbb', margin: '0 0 2px' }}>Dimensions</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#444', margin: 0 }}>{selected.width} × {selected.height}</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', textTransform: 'uppercase', color: '#bbb', margin: '0 0 2px' }}>Date</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#444', margin: 0 }}>{new Date(selected.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <button onClick={() => handleCopy(selected.secure_url)} style={{ width: '100%', padding: '10px', backgroundColor: copied === selected.secure_url ? '#22c55e' : '#111', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em' }}>
                {copied === selected.secure_url ? '✓ URL Copied!' : 'Copy URL'}
              </button>

              <div style={{ backgroundColor: '#f8f8f8', borderRadius: '4px', padding: '10px', wordBreak: 'break-all' }}>
                <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#666', margin: 0 }}>{selected.secure_url}</p>
              </div>

              <button onClick={() => handleDelete(selected.public_id)} style={{ width: '100%', padding: '10px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
                Delete Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
