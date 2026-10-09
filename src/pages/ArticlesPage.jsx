import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fixStorageUrl } from '../lib/images'
import ArticleArt from '../components/ArticleArt'
import { AppStorePill } from '../lib/appStore'
import mareaLogo from '../assets/marealogo.svg'
import Icon from '../components/Icon'

const CATEGORIES = ['All', 'Sleep', 'Mood', 'Brain fog', 'Hot flashes', 'HRT', 'Lifestyle', 'Intimacy']

export default function ArticlesPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    supabase
      .from('content')
      .select('id, title, slug, category, read_time, author, cover_url, published_at')
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
          <div className="flex items-center gap-4">
            <Link to="/blog" className="hidden sm:inline font-label text-[0.85rem] font-medium text-on-surface-variant hover:text-primary transition-colors">Blog</Link>
            <AppStorePill />
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
            Clinical insights on perimenopause, written by practicing OB/GYNs. Free to read, all of it.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full border-none font-label text-[0.82rem] cursor-pointer transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'bg-surface-container text-on-surface-variant font-normal hover:bg-surface-container-high'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && <p className="text-outline">Loading articles...</p>}

        {!loading && filtered.length === 0 && (
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center border border-outline-variant/10">
            <Icon name="article" className="text-[48px] text-outline-variant mb-4 block" />
            <p className="text-outline font-light">No articles found in this category.</p>
          </div>
        )}

        {/* Article grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
          {filtered.map(article => (
            <Link key={article.id} to={`/articles/${article.slug}`} className="no-underline group">
              <article className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
                {article.cover_url ? (
                  <div
                    className="h-[180px] bg-cover bg-center"
                    style={{ backgroundImage: `url(${fixStorageUrl(article.cover_url)})` }}
                  />
                ) : (
                  <ArticleArt category={article.category} className="h-[180px]" />
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-label text-[10px] uppercase tracking-[0.16em] text-primary">
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
