import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { articleImage } from '../lib/images'
import { useAuth } from '../hooks/useAuth'
import mareaLogo from '../assets/marealogo.svg'

function markdownToHtml(text) {
  if (!text) return ''
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
}

export default function ArticlePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, isPaid } = useAuth()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    supabase
      .from('content')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
      .then(({ data }) => {
        setArticle(data)
        if (data) checkAccess(data)
        setLoading(false)
      })
  }, [slug])

  async function checkAccess(article) {
    if (isPaid) { setLocked(false); recordRead(article.slug); return }

    const maxFree = user ? 5 : 1

    if (user) {
      const { count } = await supabase
        .from('article_reads')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      const { data: existing } = await supabase
        .from('article_reads')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_slug', article.slug)
        .maybeSingle()

      if (existing) { setLocked(false); return }
      if ((count || 0) >= maxFree) { setLocked(true); return }
      setLocked(false)
      recordRead(article.slug)
    } else {
      const reads = JSON.parse(localStorage.getItem('marea_article_reads') || '[]')
      if (reads.includes(article.slug)) { setLocked(false); return }
      if (reads.length >= maxFree) { setLocked(true); return }
      setLocked(false)
      localStorage.setItem('marea_article_reads', JSON.stringify([...reads, article.slug]))
    }
  }

  async function recordRead(articleSlug) {
    if (!user) return
    await supabase
      .from('article_reads')
      .upsert({ user_id: user.id, article_slug: articleSlug }, { onConflict: 'user_id,article_slug' })
      .select()
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888780' }}>Loading...</div>
  if (!article) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <p style={{ color: '#888780', fontSize: '1.1rem' }}>Article not found.</p>
      <Link to="/articles" style={{ color: '#005258', fontWeight: 600 }}>Back to articles</Link>
    </div>
  )

  const coverUrl = article.cover_url || articleImage(article.slug, article.category, 1200, 600)

  return (
    <div style={{ minHeight: '100vh', background: '#fcf9f4' }}>
      <nav style={{ background: 'rgba(252,249,244,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.04)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/"><img src={mareaLogo} alt="Marea Health" style={{ height: '1.4rem' }} /></Link>
          <Link to="/articles" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#005258' }}>All articles</Link>
        </div>
      </nav>

      <article style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#005258', background: 'rgba(0,82,88,0.08)', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
            {article.category}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#888780' }}>{article.read_time} min read</span>
          {article.is_premium && (
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#842b16', background: 'rgba(132,43,22,0.08)', padding: '0.2rem 0.6rem', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Member
            </span>
          )}
        </div>

        <h1 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 400, color: '#1c1c19', lineHeight: 1.2, marginBottom: '0.75rem' }}>
          {article.title}
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#888780', marginBottom: '1.5rem' }}>
          By {article.author} &middot; {new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <img src={coverUrl} alt="" style={{ width: '100%', borderRadius: '1rem', marginBottom: '2rem', maxHeight: '400px', objectFit: 'cover' }} />

        {locked ? (
          /* Paywall */
          <div style={{ position: 'relative' }}>
            <div
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 300, color: '#3f484a', lineHeight: 1.85, maxHeight: '200px', overflow: 'hidden', maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}
              dangerouslySetInnerHTML={{ __html: markdownToHtml(article.body?.substring(0, 500)) }}
            />
            <div style={{ background: '#fff', borderRadius: '1rem', padding: '2.5rem', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', marginTop: '1rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#005258', marginBottom: '1rem', display: 'block' }}>lock</span>
              <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.5rem', fontWeight: 400, color: '#1c1c19', marginBottom: '0.75rem' }}>
                {!user ? 'Sign in to keep reading' : 'Upgrade to continue'}
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#6f797a', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                {!user
                  ? 'Create a free account to read up to 5 articles. Become a member for unlimited access.'
                  : 'You\'ve used all your free articles. Upgrade to a membership for unlimited access to all clinical content.'
                }
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {!user ? (
                  <>
                    <Link to="/login" style={{ background: '#005258', color: '#fff', padding: '0.75rem 2rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 600 }}>
                      Sign in free
                    </Link>
                    <Link to="/signup" style={{ background: '#fff', color: '#005258', padding: '0.75rem 2rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 600, border: '1.5px solid #005258' }}>
                      Create account
                    </Link>
                  </>
                ) : (
                  <Link to="/account" style={{ background: '#005258', color: '#fff', padding: '0.75rem 2rem', borderRadius: '9999px', fontSize: '0.9rem', fontWeight: 600 }}>
                    Upgrade membership
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Full article */
          <div
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 300, color: '#3f484a', lineHeight: 1.85 }}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(article.body) }}
          />
        )}
      </article>
    </div>
  )
}
