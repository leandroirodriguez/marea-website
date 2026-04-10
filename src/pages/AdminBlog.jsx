import { useAdminGuard } from '../hooks/useAdminGuard'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import mareaLogo from '../assets/marealogo.svg'

export default function AdminBlog() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const adminVerified = useAdminGuard()

  useEffect(() => {
    loadPosts()
  }, [navigate])

  async function loadPosts() {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_url, published, published_at, created_at')
      .order('created_at', { ascending: false })
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
          <Link to="/admin/blog/new" className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-[0.85rem] font-semibold">
            + New Post
          </Link>
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
                            <div className="w-12 h-9 rounded-md shrink-0" style={{ background: `url(${p.cover_url}) center/cover` }} />
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
                        {p.published_at ? new Date(p.published_at).toLocaleDateString() : new Date(p.created_at).toLocaleDateString()}
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
    </div>
  )
}
