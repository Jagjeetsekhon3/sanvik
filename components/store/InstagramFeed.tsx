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

  let posts: InstagramPost[] = []

  if (tenant.instagram_access_token) {
    posts = await fetchInstagramFeed(tenant.instagram_access_token)
  }

  const username = tenant.instagram_username || ''

  return (
    <section style={{ padding: '80px 32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-accent)', margin: '0 0 10px' }}>
            Instagram
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 600, margin: '0 0 8px', letterSpacing: '0.03em' }}>
            {tenant.instagram_feed_title || 'Follow Us on Instagram'}
          </h2>
          {username && (
            <a href={`https://instagram.com/${username.replace('@', '')}`} target="_blank" rel="noopener" style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--color-text)', opacity: 0.45, textDecoration: 'none', letterSpacing: '0.05em' }}>
              @{username.replace('@', '')}
            </a>
          )}
        </div>

        {posts.length > 0 ? (
          /* Live Instagram grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
            {posts.map(post => (
              <a key={post.id} href={post.permalink} target="_blank" rel="noopener" style={{ display: 'block', aspectRatio: '1', overflow: 'hidden', position: 'relative', backgroundColor: 'rgba(0,0,0,0.04)' }}>
                <img
                  src={post.media_type === 'VIDEO' ? (post.thumbnail_url || '') : post.media_url}
                  alt="Instagram post"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
                {post.media_type === 'VIDEO' && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                )}
              </a>
            ))}
          </div>
        ) : (
          /* Placeholder grid when no token — shows decorative placeholder */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ aspectRatio: '1', backgroundColor: `rgba(0,0,0,${0.03 + i * 0.01})` }} />
            ))}
          </div>
        )}

        {username && (
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <a href={`https://instagram.com/${username.replace('@', '')}`} target="_blank" rel="noopener" style={{ display: 'inline-block', padding: '13px 36px', border: '1px solid rgba(0,0,0,0.15)', fontFamily: 'var(--font-body)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text)', textDecoration: 'none', opacity: 0.65 }}>
              Follow on Instagram
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
