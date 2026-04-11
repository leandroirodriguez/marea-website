import { useAdminGuard } from '../hooks/useAdminGuard'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fixStorageUrl } from '../lib/images'
import mareaLogo from '../assets/marealogo.svg'

export default function AdminBlog() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showGenerate, setShowGenerate] = useState(false)
  const [genTopic, setGenTopic] = useState('')
  const [genStyle, setGenStyle] = useState('')
  const [generating, setGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  async function loadSuggestions() {
    setLoadingSuggestions(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/suggest-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ type: 'blog' }),
      })
      const result = await res.json()
      setSuggestions(result.suggestions || [])
    } catch { setSuggestions([]) }
    setLoadingSuggestions(false)
  }

  const adminVerified = useAdminGuard()

  useEffect(() => {
    if (adminVerified) loadPosts()
  }, [adminVerified])

  async function loadPosts() {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_url, published, published_at, updated_at')
      .order('published_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function togglePublish(post) {
    await supabase.from('blog_posts').update({
      published: !post.published,
      published_at: !post.published ? new Date().toISOString() : post.published_at,
    }).eq('id', post.id)
    loadPosts()
  }

  async function deletePost(id) {
    if (!confirm('Delete this post?')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    loadPosts()
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <nav className="bg-on-background px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <img src={mareaLogo} alt="Marea" className="h-[1.2rem] brightness-0 invert opacity-80" />
          <div className="flex gap-6">
            <Link to="/admin/dashboard" className="text-[0.82rem] text-white/60">Dashboard</Link>
            <Link to="/admin/blog" className="text-[0.82rem] text-white font-semibold">Blog CMS</Link>
            <Link to="/admin/articles" className="text-[0.82rem] text-white/60">Articles CMS</Link>
          </div>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => navigate('/admin'))} className="bg-transparent border-none text-white/50 text-[0.8rem] cursor-pointer">Sign out</button>
      </nav>

      <div className="max-w-[1000px] mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-headline text-[1.75rem] font-normal text-on-background">
            Blog Posts
            <span className="text-[0.85rem] font-normal text-outline ml-3">{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowGenerate(true)}
              className="bg-tertiary text-on-tertiary px-5 py-2.5 rounded-full text-[0.85rem] font-semibold cursor-pointer flex items-center gap-2 hover:bg-tertiary-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              Generate with AI
            </button>
            <Link to="/admin/blog/new" className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-[0.85rem] font-semibold">
              + New Post
            </Link>
          </div>
        </div>

        {loading ? <p className="text-outline">Loading...</p> : (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {posts.length === 0 ? (
              <div className="p-12 text-center text-outline">
                <span className="material-symbols-outlined text-[48px] text-outline-variant block mb-4">edit_note</span>
                <p>No blog posts yet. Create your first one.</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-[0.85rem]">
                <thead>
                  <tr className="border-b border-surface-variant">
                    <th className="text-left px-4 py-3 text-outline font-medium text-[0.72rem] tracking-widest uppercase">Post</th>
                    <th className="text-left px-4 py-3 text-outline font-medium text-[0.72rem] tracking-widest uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-outline font-medium text-[0.72rem] tracking-widest uppercase">Date</th>
                    <th className="text-right px-4 py-3 text-outline font-medium text-[0.72rem] tracking-widest uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(p => (
                    <tr key={p.id} className="border-b border-surface-container">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.cover_url && (
                            <div className="w-12 h-9 rounded-md shrink-0" style={{ background: `url(${fixStorageUrl(p.cover_url)}) center/cover` }} />
                          )}
                          <div>
                            <p className="text-on-background font-medium">{p.title}</p>
                            {p.excerpt && <p className="text-xs text-outline-variant mt-0.5">{p.excerpt.substring(0, 80)}...</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[0.72rem] font-semibold ${p.published ? 'bg-primary/10 text-primary-container' : 'bg-on-background/5 text-outline'}`}>
                          {p.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-outline text-[0.82rem]">
                        {p.published_at ? new Date(p.published_at).toLocaleDateString() : new Date(p.updated_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Link to={`/admin/blog/edit/${p.id}`} className="text-[0.8rem] text-primary font-medium">Edit</Link>
                          <button onClick={() => togglePublish(p)} className="bg-transparent border-none text-[0.8rem] text-secondary font-medium cursor-pointer">
                            {p.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button onClick={() => deletePost(p.id)} className="bg-transparent border-none text-[0.8rem] text-tertiary font-medium cursor-pointer">Delete</button>
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

      {/* AI Generate Modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-on-background/50 z-50 flex items-center justify-center p-6" onClick={() => !generating && setShowGenerate(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-[600px] w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary">auto_awesome</span>
              </div>
              <div>
                <h2 className="font-headline text-xl font-normal text-on-background">Generate Blog Post with AI</h2>
                <p className="text-[0.78rem] text-outline">Choose a suggested topic or enter your own</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Suggested topics */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[0.72rem] font-semibold tracking-widest uppercase text-outline">Suggested topics</label>
                  <button
                    onClick={loadSuggestions}
                    disabled={loadingSuggestions}
                    className="text-[0.75rem] text-primary font-semibold cursor-pointer bg-transparent border-none hover:text-primary-container transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">{loadingSuggestions ? 'progress_activity' : 'refresh'}</span>
                    {loadingSuggestions ? 'Loading...' : suggestions.length ? 'Refresh ideas' : 'Get ideas from Claude'}
                  </button>
                </div>
                {suggestions.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setGenTopic(s.title)}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                          genTopic === s.title
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/50'
                        }`}
                      >
                        <p className="text-[0.85rem] font-medium text-on-background">{s.title}</p>
                        <p className="text-[0.72rem] text-outline mt-0.5">{s.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-outline-variant/20 pt-4">
                <label className="text-[0.72rem] font-semibold tracking-widest uppercase text-outline mb-1 block">Or enter your own topic</label>
                <input
                  value={genTopic}
                  onChange={e => setGenTopic(e.target.value)}
                  placeholder="e.g. 5 signs you might be in perimenopause and don't know it"
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm bg-white"
                />
              </div>

              <div>
                <label className="text-[0.72rem] font-semibold tracking-widest uppercase text-outline mb-1 block">Style notes (optional)</label>
                <textarea
                  value={genStyle}
                  onChange={e => setGenStyle(e.target.value)}
                  placeholder="e.g. Conversational tone, include a CTA to download the app, target women 40-50"
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant focus:border-primary outline-none text-sm bg-white resize-y"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={async () => {
                    if (!genTopic) return
                    setGenerating(true)
                    try {
                      const { data: { session } } = await supabase.auth.getSession()
                      const res = await fetch('/api/generate-blog', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${session.access_token}`,
                        },
                        body: JSON.stringify({ topic: genTopic, style: genStyle }),
                      })
                      const result = await res.json()
                      if (result.success) {
                        setShowGenerate(false)
                        setGenTopic('')
                        setGenStyle('')
                        navigate(`/admin/blog/edit/${result.post.id}`)
                      } else {
                        alert('Error: ' + (result.error || 'Failed to generate'))
                      }
                    } catch (err) {
                      alert('Error: ' + err.message)
                    }
                    setGenerating(false)
                  }}
                  disabled={generating || !genTopic}
                  className={`flex-1 bg-tertiary text-on-tertiary border-none py-3 rounded-full text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 ${generating || !genTopic ? 'opacity-50' : 'hover:bg-tertiary-container'} transition-colors`}
                >
                  {generating ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                      Generate Draft
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowGenerate(false)}
                  disabled={generating}
                  className="px-6 py-3 rounded-full text-sm font-medium text-on-surface-variant border border-outline-variant cursor-pointer bg-transparent hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
