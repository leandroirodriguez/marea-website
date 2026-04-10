import { useAdminGuard } from '../hooks/useAdminGuard'
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

  const adminVerified = useAdminGuard()

  useEffect(() => {
    if (adminVerified) loadArticles()
  }, [adminVerified])

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
    <div className="min-h-screen bg-surface-container-low">
      <nav className="bg-on-background px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <img src={mareaLogo} alt="Marea" className="h-[1.2rem] brightness-0 invert opacity-80" />
          <div className="flex gap-6">
            <Link to="/admin/dashboard" className="text-[0.82rem] text-white/60">Dashboard</Link>
            <Link to="/admin/blog" className="text-[0.82rem] text-white/60">Blog CMS</Link>
            <Link to="/admin/articles" className="text-[0.82rem] text-white font-semibold">Articles CMS</Link>
          </div>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => navigate('/admin'))} className="bg-transparent border-none text-white/50 text-[0.8rem] cursor-pointer">Sign out</button>
      </nav>

      <div className="max-w-[1200px] mx-auto p-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="font-headline text-[1.75rem] font-normal text-on-background">
            Articles CMS
            <span className="text-[0.85rem] font-normal text-outline ml-3">
              {filtered.length} article{filtered.length !== 1 ? 's' : ''}
            </span>
          </h1>
          <Link to="/admin/articles/new" className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-[0.85rem] font-semibold">
            + New Article
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center flex-wrap mb-6">
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-outline-variant text-[0.82rem] w-[250px] outline-none bg-white focus:border-primary"
          />
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full border-none text-[0.75rem] cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-white text-on-surface-variant font-normal'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? <p className="text-outline">Loading...</p> : (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-outline">
                <p>No articles found.</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-[0.82rem]">
                <thead>
                  <tr className="border-b border-surface-variant">
                    <th className="text-left px-4 py-3 text-outline font-medium text-[0.7rem] tracking-widest uppercase">Article</th>
                    <th className="text-left px-2 py-3 text-outline font-medium text-[0.7rem] tracking-widest uppercase">Category</th>
                    <th className="text-center px-2 py-3 text-outline font-medium text-[0.7rem] tracking-widest uppercase">Access</th>
                    <th className="text-center px-2 py-3 text-outline font-medium text-[0.7rem] tracking-widest uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-outline font-medium text-[0.7rem] tracking-widest uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} className="border-b border-surface-container">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-9 rounded-md shrink-0" style={{ background: `url(${articleImage(a.slug, a.category, 96, 72)}) center/cover` }} />
                          <div>
                            <p className="text-on-background font-medium mb-0.5">{a.title}</p>
                            <p className="text-[0.72rem] text-outline-variant">{a.author} &middot; {a.read_time} min</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <span className="text-[0.72rem] font-semibold text-primary bg-primary/[0.08] px-2 py-0.5 rounded-full">
                          {a.category}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <button
                          onClick={() => togglePremium(a)}
                          className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold border-none cursor-pointer ${
                            a.is_premium
                              ? 'bg-tertiary/10 text-tertiary'
                              : 'bg-primary/10 text-primary-container'
                          }`}
                        >
                          {a.is_premium ? 'Member' : 'Free'}
                        </button>
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold ${
                          a.published ? 'bg-primary/10 text-primary-container' : 'bg-on-background/5 text-outline'
                        }`}>
                          {a.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link to={`/admin/articles/edit/${a.id}`} className="text-[0.78rem] text-primary font-medium">Edit</Link>
                          <button onClick={() => togglePublish(a)} className="bg-transparent border-none text-[0.78rem] text-secondary font-medium cursor-pointer">
                            {a.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button onClick={() => deleteArticle(a.id)} className="bg-transparent border-none text-[0.78rem] text-tertiary font-medium cursor-pointer">Delete</button>
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
