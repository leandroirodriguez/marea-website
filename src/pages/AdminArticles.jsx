import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { articleImage } from '../lib/images'
import mareaLogo from '../assets/marealogo.svg'

const CATEGORIES = ['All', 'Sleep', 'Mood', 'Brain fog', 'Hot flashes', 'HRT', 'Lifestyle', 'Intimacy']

export default function AdminArticles() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return navigate('/admin')
    })
    loadArticles()
  }, [navigate])

  async function loadArticles() {
    const { data } = await supabase
      .from('content')
      .select('id, title, slug, category, read_time, is_premium, author, published, published_at, created_at')
      .order('created_at', { ascending: false })
    setArticles(data || [])
    setLoading(false)
  }

  async function togglePublish(article) {
    await supabase.from('content').update({
      published: !article.published,
      published_at: !article.published ? new Date().toISOString() : article.published_at,
    }).eq('id', article.id)
    loadArticles()
  }

  async function togglePremium(article) {
    await supabase.from('content').update({
      is_premium: !article.is_premium,
    }).eq('id', article.id)
    loadArticles()
  }

  async function deleteArticle(id) {
    if (!confirm('Delete this article? This cannot be undone.')) return
    await supabase.from('content').delete().eq('id', id)
    loadArticles()
  }

  const filtered = articles
    .filter(a => activeCategory === 'All' || a.category === activeCategory)
    .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.slug.includes(search.toLowerCase()))

  return (
    <div style={{ minHeight: '100vh', background: '#f5f2ed' }}>
      <nav style={{ background: '#1c1c19', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <img src={mareaLogo} alt="Marea" style={{ height: '1.2rem', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/admin/dashboard" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>Dashboard</Link>
            <Link to="/admin/blog" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>Blog CMS</Link>
            <Link to="/admin/articles" style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>Articles CMS</Link>
          </div>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => navigate('/admin'))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.75rem', fontWeight: 400, color: '#1c1c19' }}>
            Articles CMS
            <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#888780', marginLeft: '0.75rem' }}>
              {filtered.length} article{filtered.length !== 1 ? 's' : ''}
            </span>
          </h1>
          <Link to="/admin/articles/new" style={{ background: '#005258', color: '#fff', padding: '0.65rem 1.5rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600 }}>
            + New Article
          </Link>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '9999px', border: '1.5px solid #d4d1cc', fontSize: '0.82rem', width: '250px', outline: 'none', background: '#fff' }}
          />
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: '9999px', border: 'none', fontSize: '0.75rem', fontWeight: activeCategory === cat ? 600 : 400,
                  background: activeCategory === cat ? '#005258' : '#fff', color: activeCategory === cat ? '#fff' : '#3f484a', cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? <p style={{ color: '#888780' }}>Loading...</p> : (
          <div style={{ background: '#fff', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#888780' }}>
                <p>No articles found.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e2dd' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#888780', fontWeight: 500, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Article</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0.5rem', color: '#888780', fontWeight: 500, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem 0.5rem', color: '#888780', fontWeight: 500, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Access</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem 0.5rem', color: '#888780', fontWeight: 500, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#888780', fontWeight: 500, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f0ede9' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: '48px', height: '36px', borderRadius: '6px', flexShrink: 0, background: `url(${articleImage(a.slug, a.category, 96, 72)}) center/cover` }} />
                          <div>
                            <p style={{ color: '#1c1c19', fontWeight: 500, marginBottom: '0.15rem' }}>{a.title}</p>
                            <p style={{ fontSize: '0.72rem', color: '#aaa9a4' }}>{a.author} &middot; {a.read_time} min</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#005258', background: 'rgba(0,82,88,0.08)', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                          {a.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                        <button
                          onClick={() => togglePremium(a)}
                          style={{
                            padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                            background: a.is_premium ? 'rgba(132,43,22,0.1)' : 'rgba(42,138,147,0.1)',
                            color: a.is_premium ? '#842b16' : '#2A8A93',
                          }}
                        >
                          {a.is_premium ? 'Member' : 'Free'}
                        </button>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
                          background: a.published ? 'rgba(42,138,147,0.1)' : 'rgba(0,0,0,0.05)',
                          color: a.published ? '#2A8A93' : '#888780',
                        }}>
                          {a.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <Link to={`/admin/articles/edit/${a.id}`} style={{ fontSize: '0.78rem', color: '#005258', fontWeight: 500 }}>Edit</Link>
                          <button onClick={() => togglePublish(a)} style={{ background: 'none', border: 'none', fontSize: '0.78rem', color: '#715b33', fontWeight: 500, cursor: 'pointer' }}>
                            {a.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button onClick={() => deleteArticle(a.id)} style={{ background: 'none', border: 'none', fontSize: '0.78rem', color: '#842b16', fontWeight: 500, cursor: 'pointer' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
