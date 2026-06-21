import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { page: string }
}

async function getPage(tenantId: string, slug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const res = await fetch(
    `${supabaseUrl}/rest/v1/pages?tenant_id=eq.${tenantId}&slug=eq.${slug}&is_active=eq.true&limit=1`,
    { headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }, cache: 'no-store' }
  )
  const data = await res.json()
  return data?.[0] || null
}

// Simple markdown to HTML renderer (no dependency needed)
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:var(--color-accent);text-decoration:underline">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(0,0,0,0.08);margin:32px 0">')
    .split('\n\n')
    .map(para => {
      if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<hr')) return para
      if (para.trim() === '') return ''
      return `<p>${para.replace(/\n/g, '<br/>')}</p>`
    })
    .filter(Boolean)
    .join('\n')
}

export default async function DynamicPage({ params }: PageProps) {
  const headersList = headers()
  const tenantId = headersList.get('x-tenant-id')
  if (!tenantId) notFound()

  const page = await getPage(tenantId, params.page)
  if (!page) notFound()

  const html = page.content ? renderMarkdown(page.content) : ''

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 32px 100px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '48px', paddingBottom: '32px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent)', margin: '0 0 12px' }}>
          Pages
        </p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 600, margin: 0, letterSpacing: '0.02em' }}>
          {page.title}
        </h1>
      </div>

      {/* Content */}
      <div
        style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--color-text)', opacity: 0.8 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Style overrides for rendered content */}
      <style>{`
        .page-content h1 { font-family: var(--font-heading); font-size: 2rem; margin: 2rem 0 1rem; }
        .page-content h2 { font-family: var(--font-heading); font-size: 1.4rem; margin: 2rem 0 0.75rem; }
        .page-content h3 { font-family: var(--font-heading); font-size: 1.1rem; margin: 1.5rem 0 0.5rem; }
        .page-content p { margin: 0 0 1.2rem; }
        .page-content ul { padding-left: 1.5rem; margin: 0 0 1.2rem; }
        .page-content li { margin-bottom: 0.5rem; }
      `}</style>
    </div>
  )
}
