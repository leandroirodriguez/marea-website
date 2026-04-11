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
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-surface/92 backdrop-blur-xl border-b border-outline-variant/10 px-6 md:px-8 py-4">
        <div className="max-w-[1100px] mx-auto flex justify-between items-center">
          <Link to="/"><img src={mareaLogo} alt="Marea Health" className="h-[1.4rem]" /></Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/articles" className="hidden sm:inline font-label text-[0.85rem] font-medium text-on-surface-variant hover:text-primary transition-colors">Articles</Link>
            <Link to="/" className="font-label text-[0.8rem] sm:text-[0.85rem] font-medium text-on-surface-variant hover:text-primary transition-colors">&larr; Home</Link>
            <a href="#download" className="bg-primary text-on-primary rounded-full px-4 py-2 font-label text-[0.78rem] sm:text-[0.82rem] font-semibold hover:bg-primary-container transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span className="hidden sm:inline">Get the App</span>
              <span className="sm:hidden">App</span>
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-[800px] mx-auto px-6 md:px-8 pt-28 pb-16">
        <h1 className="font-headline text-[2.5rem] font-normal text-on-background mb-2" style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}>Blog</h1>
        <p className="text-on-surface-variant font-light text-[0.95rem] leading-relaxed mb-12">Clinical insights on perimenopause, hormones, and women's health.</p>

        {loading && <p className="text-outline">Loading posts...</p>}

        {!loading && posts.length === 0 && (
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm border border-outline-variant/10">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4 block">article</span>
            <p className="text-outline font-light">No posts published yet. Check back soon.</p>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {posts.map(post => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="no-underline group">
              <article className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 flex transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
                {post.cover_url && (
                  <div className="w-[200px] min-h-[160px] shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${post.cover_url})` }} />
                )}
                <div className="p-6 flex-1">
                  <p className="font-label text-[0.72rem] text-outline mb-2">
                    {new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <h2 className="font-headline text-[1.25rem] font-normal text-on-background mb-2">{post.title}</h2>
                  {post.excerpt && <p className="text-on-surface-variant font-light text-sm leading-relaxed">{post.excerpt}</p>}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
