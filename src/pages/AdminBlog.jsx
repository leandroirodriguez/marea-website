import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import mareaLogo from '../assets/marealogo.svg'

export default function AdminBlog() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return navigate('/admin')
    })
    loadPosts()
  }, [navigate])

  async function loadPosts() {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, published, published_at, created_at')
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
    <div style={{ minHeight: '100vh', background: '#f5f2ed' }}>
      <nav style={{ background: '#1c1c19', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <img src={mareaLogo} alt="Marea" style={{ height: '1.2rem', filter: 'brightness(0) invert(1)', opacity: 0.8 }} />
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to="/admin/dashboard" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>Dashboard</Link>
            <Link to="/admin/blog" style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>Blog</Link>
          </div>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => navigate('/admin'))} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', cursor: 'pointer' }}>Sign out</button>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.75rem', fontWeight: 400, color: '#1c1c19' }}>Blog Posts</h1>
          <Link to="/admin/blog/new" style={{ background: '#005258', color: '#fff', padding: '0.65rem 1.5rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600 }}>
            + New Post
          </Link>
        </div>

        {loading ? <p style={{ color: '#888780' }}>Loading...</p> : (
          <div style={{ background: '#fff', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            {posts.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#888780' }}>
                <p>No blog posts yet. Create your first one.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e2dd' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#888780', fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Title</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#888780', fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#888780', fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f0ede9' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#1c1c19', fontWeight: 500 }}>{p.title}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, background: p.published ? 'rgba(42,138,147,0.1)' : 'rgba(0,0,0,0.05)', color: p.published ? '#2A8A93' : '#888780' }}>
                          {p.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <Link to={`/admin/blog/edit/${p.id}`} style={{ fontSize: '0.8rem', color: '#005258', fontWeight: 500 }}>Edit</Link>
                          <button onClick={() => togglePublish(p)} style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: '#715b33', fontWeight: 500, cursor: 'pointer' }}>
                            {p.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button onClick={() => deletePost(p.id)} style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: '#842b16', fontWeight: 500, cursor: 'pointer' }}>Delete</button>
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
