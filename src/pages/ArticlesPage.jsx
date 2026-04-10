import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { articleImage } from '../lib/images'
import { useAuth } from '../hooks/useAuth'
import mareaLogo from '../assets/marealogo.svg'

const CATEGORIES = ['All', 'Sleep', 'Mood', 'Brain fog', 'Hot flashes', 'HRT', 'Lifestyle', 'Intimacy']

export default function ArticlesPage() {
  const { user, isPaid } = useAuth()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [readCount, setReadCount] = useState(0)

  useEffect(() => {
    supabase
      .from('content')
      .select('id, title, slug, category, read_time, is_premium, author, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => { setArticles(data || []); setLoading(false) })
  }, [])

  useEffect(() => {
    if (user) {
      supabase
        .from('article_reads')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .then(({ count }) => setReadCount(count || 0))
    } else {
      const reads = JSON.parse(localStorage.getItem('marea_article_reads') || '[]')
      setReadCount(reads.length)
    }
  }, [user])

  const maxFreeArticles = user ? 5 : 1
  const hasReachedLimit = !isPaid && readCount >= maxFreeArticles

  const filtered = activeCategory === 'All'
    ? articles
    : articles.filter(a => a.category === activeCategory)

  return (
    <div style={{ minHeight: '100vh', background: '#fcf9f4' }}>
      {/* Nav */}
      <nav style={{ background: 'rgba(252,249,244,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.04)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/"><img src={mareaLogo} alt="Marea Health" style={{ height: '1.4rem' }} /></Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/blog" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#3f484a' }}>Blog</Link>
            {user ? (
              <Link to="/account" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#005258' }}>My Account</Link>
            ) : (
              <Link to="/login" style={{ background: '#005258', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600 }}>Sign in</Link>
            )}
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2.5rem', fontWeight: 400, color: '#1c1c19', marginBottom: '0.5rem' }}>
            Education Library
          </h1>
          <p style={{ fontSize: '0.95rem', fontWeight: 300, color: '#6f797a' }}>
            Clinical insights on perimenopause, written by practicing OB/GYNs.
          </p>
        </div>

        {/* Access banner */}
        {!isPaid && (
          <div style={{ background: hasReachedLimit ? 'linear-gradient(135deg, #842b16, #005258)' : 'rgba(0,82,88,0.06)', borderRadius: '1rem', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: hasReachedLimit ? '#fff' : '#1c1c19', marginBottom: '0.25rem' }}>
                {hasReachedLimit
                  ? 'You\'ve reached your free article limit'
                  : `${readCount} of ${maxFreeArticles} free article${maxFreeArticles > 1 ? 's' : ''} used`
                }
              </p>
              <p style={{ fontSize: '0.82rem', color: hasReachedLimit ? 'rgba(255,255,255,0.75)' : '#6f797a' }}>
                {!user
                  ? 'Sign in for 5 free articles, or become a member for unlimited access.'
                  : isPaid ? '' : 'Become a member for unlimited access to all articles.'}
              </p>
            </div>
            {!user ? (
              <Link to="/login" style={{ background: hasReachedLimit ? '#fff' : '#005258', color: hasReachedLimit ? '#005258' : '#fff', padding: '0.6rem 1.5rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                Sign in free
              </Link>
            ) : (
              <Link to="/account" style={{ background: hasReachedLimit ? '#fff' : '#005258', color: hasReachedLimit ? '#005258' : '#fff', padding: '0.6rem 1.5rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                Upgrade
              </Link>
            )}
          </div>
        )}

        {/* Category filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '0.82rem',
                fontWeight: activeCategory === cat ? 600 : 400,
                background: activeCategory === cat ? '#005258' : '#fff',
                color: activeCategory === cat ? '#fff' : '#3f484a',
                cursor: 'pointer',
                boxShadow: activeCategory === cat ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && <p style={{ color: '#888780' }}>Loading articles...</p>}

        {!loading && filtered.length === 0 && (
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '3rem', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#d4d1cc', marginBottom: '1rem', display: 'block' }}>article</span>
            <p style={{ color: '#888780', fontWeight: 300 }}>No articles found in this category.</p>
          </div>
        )}

        {/* Article grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(article => (
            <Link key={article.id} to={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
              <article style={{ background: '#fff', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)' }}
              >
                <div style={{
                  height: '180px',
                  background: `url(${article.cover_url || articleImage(article.slug, article.category)}) center/cover`,
                  position: 'relative',
                }}>
                  {article.is_premium && (
                    <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(132,43,22,0.9)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '0.25rem 0.6rem', borderRadius: '9999px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Member
                    </span>
                  )}
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#005258', background: 'rgba(0,82,88,0.08)', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                      {article.category}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#888780' }}>{article.read_time} min read</span>
                  </div>
                  <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.15rem', fontWeight: 400, color: '#1c1c19', lineHeight: 1.3, marginBottom: '0.5rem' }}>
                    {article.title}
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: '#888780' }}>
                    {article.author}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
