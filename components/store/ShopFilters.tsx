'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface ShopFiltersProps {
  categories: string[]
  currentCategory?: string
}

export default function ShopFilters({ categories, currentCategory }: ShopFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/shop?${params.toString()}`)
  }

  const allCategories = ['new-arrivals', 'sale', ...categories]

  return (
    <aside style={{ width: '200px', flexShrink: 0, position: 'sticky', top: '96px' }}>
      {/* Categories */}
      <div style={{ marginBottom: '36px' }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.68rem',
          letterSpacing: '0.15em', textTransform: 'uppercase',
          opacity: 0.4, margin: '0 0 14px',
        }}>Category</p>

        <button
          onClick={() => setFilter('category', undefined)}
          style={{
            display: 'block', background: 'none', border: 'none',
            cursor: 'pointer', padding: '0 0 10px',
            fontFamily: 'var(--font-body)', fontSize: '0.82rem',
            color: 'var(--color-text)',
            opacity: !currentCategory ? 1 : 0.45,
            fontWeight: !currentCategory ? 600 : 400,
            textAlign: 'left',
          }}>
          All
        </button>

        {allCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter('category', cat)}
            style={{
              display: 'block', background: 'none', border: 'none',
              cursor: 'pointer', padding: '0 0 10px',
              fontFamily: 'var(--font-body)', fontSize: '0.82rem',
              color: cat === 'sale' ? 'var(--color-accent)' : 'var(--color-text)',
              opacity: currentCategory === cat ? 1 : 0.45,
              fontWeight: currentCategory === cat ? 600 : 400,
              textAlign: 'left',
              textTransform: 'capitalize',
            }}>
            {cat.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'rgba(0,0,0,0.08)', marginBottom: '28px' }} />

      {/* Clear */}
      {(currentCategory || searchParams.get('search')) && (
        <button
          onClick={() => router.push('/shop')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: '0.72rem',
            color: 'var(--color-text)', opacity: 0.4,
            textDecoration: 'underline', padding: 0,
          }}>
          Clear filters
        </button>
      )}
    </aside>
  )
}
