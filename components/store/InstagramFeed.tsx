import { Tenant } from '@/types'

interface InstagramPost {
  id: string
  media_url: string
  permalink: string
  media_type: string
  thumbnail_url?: string
}

async function fetchInstagramFeed(accessToken: string): Promise<InstagramPost[]> {
  try {
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_url,permalink,media_type,thumbnail_url&limit=6&access_token=${accessToken}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch {
    return []
  }
}

export default async function InstagramFeed({ tenant }: { tenant: Tenant }) {
  if (!tenant.instagram_show_feed) return null
  if (!tenant.instagram_access_token && !tenant.instagram_username) return null

  const username = (tenant.instagram_username || '').replace('@', '').trim()
  let posts: InstagramPost[] = []

  if (tenant.instagram_access_token) {
    posts = await fetchInstagramFeed(tenant.instagram_access_token)
  }

  return (
    <section style={{ padding: '80px 32px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.68rem',
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: 'var(--color-accent)', margin: '0 0 10px',
          }}>Instagram</p>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.8rem',
            fontWeight: 600, margin: '0 0 10px', letterSpacing: '0.03em',
          }}>
            {tenant.instagram_feed_title || 'Follow Us on Instagram'}
          </h2>
          {username && (
            <a
              href={`https://instagram.com/${username}`}
              target="_blank" rel="noopener"
              style={{
                fontFamily: 'var(--font-body)', fontSize: '0.82rem',
                color: 'var(--color-text)', opacity: 0.45,
                textDecoration: 'none', letterSpacing: '0.05em',
              }}
            >
              @{username}
            </a>
          )}
        </div>

        {posts.length > 0 ? (
          /* Live Instagram grid from API */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
            {posts.map(post => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank" rel="noopener"
                style={{ display: 'block', aspectRatio: '1', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.04)' }}
              >
                <img
                  src={post.media_type === 'VIDEO' ? (post.thumbnail_url || '') : post.media_url}
                  alt="Instagram post"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', display: 'block' }}
                />
              </a>
            ))}
          </div>
        ) : username ? (
          /* No API token — show placeholder grid + follow CTA */
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginBottom: '32px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <a
                  key={i}
                  href={`https://instagram.com/${username}`}
                  target="_blank" rel="noopener"
                  style={{
                    display: 'flex', aspectRatio: '1',
                    backgroundColor: `rgba(0,0,0,${0.03 + i * 0.01})`,
                    alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                >
                  {i === 2 && (
                    <div style={{ textAlign: 'center', padding: '16px' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                    </div>
                  )}
                </a>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', opacity: 0.45, margin: '0 0 20px' }}>
                To show live posts, add your Instagram Access Token in Settings
              </p>
            </div>
          </div>
        ) : null}

        {/* Follow button */}
        {username && (
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <a
              href={`https://instagram.com/${username}`}
              target="_blank" rel="noopener"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '13px 36px',
                border: '1px solid rgba(0,0,0,0.15)',
                fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--color-text)', textDecoration: 'none', opacity: 0.65,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              Follow @{username}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
