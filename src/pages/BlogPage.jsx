import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import mareaLogo from '../assets/marealogo.svg'

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_url, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false) })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#fcf9f4' }}>
      {/* Nav */}
      <nav style={{ background: 'rgba(252,249,244,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.04)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/"><img src={mareaLogo} alt="Marea Health" style={{ height: '1.4rem' }} /></Link>
          <Link to="/" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#005258' }}>← Back to home</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
        <h1 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2.5rem', fontWeight: 400, color: '#1c1c19', marginBottom: '0.5rem' }}>Blog</h1>
        <p style={{ fontSize: '0.95rem', fontWeight: 300, color: '#6f797a', marginBottom: '3rem' }}>Clinical insights on perimenopause, hormones, and women's health.</p>

        {loading && <p style={{ color: '#888780' }}>Loading posts...</p>}

        {!loading && posts.length === 0 && (
          <div style={{ background: '#fff', borderRadius: '1rem', padding: '3rem', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#d4d1cc', marginBottom: '1rem', display: 'block' }}>article</span>
            <p style={{ color: '#888780', fontWeight: 300 }}>No posts published yet. Check back soon.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {posts.map(post => (
            <Link key={post.id} to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <article style={{ background: '#fff', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', display: 'flex', gap: '0' }}>
                {post.cover_url && (
                  <div style={{ width: '200px', minHeight: '160px', flexShrink: 0, background: `url(${post.cover_url}) center/cover` }} />
                )}
                <div style={{ padding: '1.5rem', flex: 1 }}>
                  <p style={{ fontSize: '0.72rem', color: '#888780', marginBottom: '0.5rem' }}>
                    {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.25rem', fontWeight: 400, color: '#1c1c19', marginBottom: '0.5rem' }}>{post.title}</h2>
                  {post.excerpt && <p style={{ fontSize: '0.85rem', fontWeight: 300, color: '#6f797a', lineHeight: 1.6 }}>{post.excerpt}</p>}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
