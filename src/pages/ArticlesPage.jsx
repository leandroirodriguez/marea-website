import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { articleImage } from '../lib/images'
import mareaLogo from '../assets/marealogo.svg'

const CATEGORIES = ['All', 'Sleep', 'Mood', 'Brain fog', 'Hot flashes', 'HRT', 'Lifestyle', 'Intimacy']

export default function ArticlesPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  const reads = JSON.parse(localStorage.getItem('marea_article_reads') || '[]')
  const readCount = reads.length
  const hasReachedLimit = readCount >= 1

  useEffect(() => {
    supabase
      .from('content')
      .select('id, title, slug, category, read_time, is_premium, author, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => { setArticles(data || []); setLoading(false) })
  }, [])

  const filtered = activeCategory === 'All'
    ? articles
    : articles.filter(a => a.category === activeCategory)

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-surface/92 backdrop-blur-xl border-b border-outline-variant/10 px-6 md:px-8 py-4">
        <div className="max-w-[1100px] mx-auto flex justify-between items-center">
          <Link to="/"><img src={mareaLogo} alt="Marea Health" className="h-[1.4rem]" /></Link>
          <div className="flex items-center gap-6">
            <Link to="/blog" className="font-label text-[0.85rem] font-medium text-on-surface-variant hover:text-primary transition-colors">Blog</Link>
            <a href="#download" className="bg-primary text-on-primary rounded-full px-5 py-2 font-label text-[0.82rem] font-semibold hover:bg-primary-container transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">download</span>
              Get the App
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-6 md:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline text-[2.5rem] font-normal text-on-background mb-2" style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Education Library
          </h1>
          <p className="text-on-surface-variant font-light text-[0.95rem] leading-relaxed">
            Clinical insights on perimenopause, written by practicing OB/GYNs. Download the Marea app for full access.
          </p>
        </div>

        {/* Access banner */}
        {hasReachedLimit && (
          <div className="bg-gradient-to-br from-tertiary to-primary rounded-2xl px-6 py-5 mb-8 flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-[0.9rem] font-semibold mb-1 text-on-primary">
                Want to keep reading?
              </p>
              <p className="text-[0.82rem] text-on-primary/75">
                Download the Marea app for unlimited access to our full education library, symptom tracking, and more.
              </p>
            </div>
            <a href="#download" className="bg-white text-primary rounded-full px-6 py-2.5 font-label text-[0.82rem] font-semibold whitespace-nowrap hover:bg-primary-fixed transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">download</span>
              Download App
            </a>
          </div>
        )}

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full border-none font-label text-[0.82rem] cursor-pointer transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary font-semibold shadow-none'
                  : 'bg-surface-container-lowest text-on-surface-variant font-normal shadow-sm hover:shadow-md'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && <p className="text-outline">Loading articles...</p>}

        {!loading && filtered.length === 0 && (
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm border border-outline-variant/10">
            <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4 block">article</span>
            <p className="text-outline font-light">No articles found in this category.</p>
          </div>
        )}

        {/* Article grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
          {filtered.map(article => (
            <Link key={article.id} to={`/articles/${article.slug}`} className="no-underline group">
              <article className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
                <div
                  className="h-[180px] bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${article.cover_url || articleImage(article.slug, article.category)})` }}
                >
                  {article.is_premium && (
                    <span className="absolute top-3 right-3 bg-tertiary/90 text-on-tertiary font-label text-[0.65rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Member
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-label text-[0.7rem] font-semibold text-primary bg-primary/[0.08] px-2 py-0.5 rounded-full">
                      {article.category}
                    </span>
                    <span className="font-label text-[0.72rem] text-outline">{article.read_time} min read</span>
                  </div>
                  <h2 className="font-headline text-[1.15rem] font-normal text-on-background mb-2" style={{ lineHeight: 1.3 }}>
                    {article.title}
                  </h2>
                  <p className="font-label text-[0.78rem] text-outline">
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
