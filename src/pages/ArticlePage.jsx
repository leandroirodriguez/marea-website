import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { marked } from 'marked'
import { supabase } from '../lib/supabase'
import { articleImage, fixStorageUrl } from '../lib/images'
import mareaLogo from '../assets/marealogo.svg'

marked.setOptions({ breaks: true, gfm: true })

function markdownToHtml(text) {
  if (!text) return ''
  return marked.parse(text)
}

export default function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    supabase
      .from('content')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
      .then(({ data }) => {
        setArticle(data)
        if (data) checkAccess(data)
        setLoading(false)
      })
  }, [slug])

  function checkAccess(article) {
    const reads = JSON.parse(localStorage.getItem('marea_article_reads') || '[]')
    if (reads.includes(article.slug)) { setLocked(false); return }
    if (reads.length >= 1) { setLocked(true); return }
    setLocked(false)
    localStorage.setItem('marea_article_reads', JSON.stringify([...reads, article.slug]))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-outline">Loading...</div>
  if (!article) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-outline text-lg">Article not found.</p>
      <Link to="/articles" className="text-primary font-semibold">Back to articles</Link>
    </div>
  )

  const coverUrl = fixStorageUrl(article.cover_url) || articleImage(article.slug, article.category, 1200, 600)

  return (
    <div className="min-h-screen bg-surface">
      <nav className="fixed top-0 w-full z-50 bg-surface/92 backdrop-blur-xl border-b border-outline-variant/10 px-6 md:px-8 py-4">
        <div className="max-w-[1100px] mx-auto flex justify-between items-center">
          <Link to="/"><img src={mareaLogo} alt="Marea Health" className="h-[1.4rem]" /></Link>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to="/articles" className="font-label text-[0.8rem] sm:text-[0.85rem] font-medium text-on-surface-variant hover:text-primary transition-colors">&larr; Articles</Link>
            <a href="#download" className="bg-primary text-on-primary rounded-full px-4 py-2 font-label text-[0.78rem] sm:text-[0.82rem] font-semibold hover:bg-primary-container transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span className="hidden sm:inline">Get the App</span>
              <span className="sm:hidden">App</span>
            </a>
          </div>
        </div>
      </nav>

      <article className="max-w-[720px] mx-auto px-6 md:px-8 pt-24 pb-12">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="font-label text-[0.72rem] font-semibold text-primary bg-primary/[0.08] px-2.5 py-1 rounded-full">
            {article.category}
          </span>
          <span className="font-label text-xs text-outline">{article.read_time} min read</span>
        </div>

        <h1 className="font-headline text-[clamp(2rem,5vw,2.75rem)] font-normal text-on-background mb-3" style={{ lineHeight: 1.2, letterSpacing: '-0.02em' }}>
          {article.title}
        </h1>
        <p className="text-[0.88rem] text-outline mb-6">
          By {article.author} &middot; {new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <img src={coverUrl} alt="" className="w-full rounded-2xl mb-8 max-h-[400px] object-cover" />

        {locked ? (
          /* Paywall — download app CTA */
          <div className="relative">
            <div
              className="prose font-body text-base font-light text-on-surface-variant max-h-[200px] overflow-hidden"
              style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}
              dangerouslySetInnerHTML={{ __html: markdownToHtml(article.body?.substring(0, 500)) }}
            />
            <div className="bg-primary-container rounded-2xl p-10 text-center shadow-lg mt-4">
              <span className="material-symbols-outlined text-[48px] text-primary-fixed mb-4 block">phone_iphone</span>
              <h2 className="font-headline text-2xl font-normal text-on-primary mb-3">
                Continue reading in the Marea app
              </h2>
              <p className="text-[0.9rem] text-on-primary/75 mb-6 max-w-[420px] mx-auto">
                Get unlimited access to our full education library, personalized symptom tracking, lab interpretation, and AI health assistant — all designed by practicing OB/GYNs.
              </p>
              <div className="flex flex-col items-center gap-4">
                <a href="#" className="bg-white text-primary rounded-full px-8 py-3.5 font-label text-[0.9rem] font-semibold hover:bg-primary-fixed transition-colors inline-flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-xl">download</span>
                  Download Marea — Free
                </a>
                <p className="text-[0.72rem] text-on-primary/50 font-label uppercase tracking-widest">Available on iOS</p>
              </div>
            </div>
          </div>
        ) : (
          /* Full article */
          <div
            className="prose font-body text-base font-light text-on-surface-variant"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(article.body) }}
          />
        )}

        {/* Bottom CTA — always visible */}
        <div className="mt-12 pt-8 border-t border-outline-variant/20 text-center">
          <p className="font-headline text-xl text-on-background mb-2">Get more from Marea</p>
          <p className="text-[0.88rem] text-outline mb-5">Track symptoms, interpret labs, and chat with our AI health assistant.</p>
          <a href="#" className="bg-primary text-on-primary rounded-full px-8 py-3 font-label text-[0.9rem] font-semibold hover:bg-primary-container transition-colors inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">download</span>
            Download the App
          </a>
        </div>
      </article>
    </div>
  )
}
