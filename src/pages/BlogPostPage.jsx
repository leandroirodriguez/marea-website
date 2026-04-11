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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-outline">Loading...</div>
  if (!post) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-outline text-lg">Post not found.</p>
      <Link to="/blog" className="text-primary font-semibold">&larr; Back to blog</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface">
      <nav className="fixed top-0 w-full z-50 bg-surface/92 backdrop-blur-xl border-b border-outline-variant/10 px-6 md:px-8 py-4">
        <div className="max-w-[1100px] mx-auto flex justify-between items-center">
          <Link to="/"><img src={mareaLogo} alt="Marea Health" className="h-[1.4rem]" /></Link>
          <div className="flex items-center gap-6">
            <Link to="/articles" className="font-label text-[0.85rem] font-medium text-on-surface-variant hover:text-primary transition-colors">Articles</Link>
            <Link to="/blog" className="font-label text-[0.85rem] font-medium text-primary hover:text-primary-container transition-colors">&larr; All posts</Link>
          </div>
        </div>
      </nav>

      <article className="max-w-[720px] mx-auto px-6 md:px-8 pt-28 pb-16">
        <p className="font-label text-xs text-outline mb-4">
          {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="font-headline text-[clamp(2rem,5vw,2.75rem)] font-normal text-on-background mb-6" style={{ lineHeight: 1.2, letterSpacing: '-0.02em' }}>
          {post.title}
        </h1>
        {post.cover_url && (
          <img src={post.cover_url} alt="" className="w-full rounded-2xl mb-8" />
        )}
        <div
          className="prose font-body text-base font-light text-on-surface-variant"
          dangerouslySetInnerHTML={{ __html: post.body_html }}
        />
      </article>
    </div>
  )
}
