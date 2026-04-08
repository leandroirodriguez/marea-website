import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import mareaLogo from '../assets/marealogo.svg'

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
      .then(({ data }) => { setPost(data); setLoading(false) })
  }, [slug])

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888780' }}>Loading...</div>
  if (!post) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <p style={{ color: '#888780', fontSize: '1.1rem' }}>Post not found.</p>
      <Link to="/blog" style={{ color: '#005258', fontWeight: 600 }}>← Back to blog</Link>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fcf9f4' }}>
      <nav style={{ background: 'rgba(252,249,244,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.04)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/"><img src={mareaLogo} alt="Marea Health" style={{ height: '1.4rem' }} /></Link>
          <Link to="/blog" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#005258' }}>← All posts</Link>
        </div>
      </nav>

      <article style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#888780', marginBottom: '1rem' }}>
          {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 400, color: '#1c1c19', lineHeight: 1.2, marginBottom: '1.5rem' }}>
          {post.title}
        </h1>
        {post.cover_url && (
          <img src={post.cover_url} alt="" style={{ width: '100%', borderRadius: '1rem', marginBottom: '2rem' }} />
        )}
        <div
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1rem', fontWeight: 300, color: '#3f484a', lineHeight: 1.85 }}
          dangerouslySetInnerHTML={{ __html: post.body_html }}
        />
      </article>
    </div>
  )
}
