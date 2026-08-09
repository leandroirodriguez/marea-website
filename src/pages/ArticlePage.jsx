import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { marked } from 'marked'
import { supabase } from '../lib/supabase'
import { articleImage, fixStorageUrl } from '../lib/images'
import { APP_STORE_URL, AppStorePill } from '../lib/appStore'
import mareaLogo from '../assets/marealogo.svg'
import Icon from '../components/Icon'

marked.setOptions({ breaks: true, gfm: true })

function markdownToHtml(text) {
  if (!text) return ''
  return marked.parse(text)
}

export default function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('content')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
      .then(({ data }) => {
        setArticle(data)
        setLoading(false)
      })
  }, [slug])

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
            <AppStorePill />
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

        {/* Full article — the library is free to read, no gate. The app is sold
            on what it does with *her* data, not on access to this text. */}
        <div
          className="prose font-body text-base font-light text-on-surface-variant"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(article.body) }}
        />

        {/* Bottom CTA — converts on interest in the article's subject rather
            than on hitting a wall. */}
        <div className="mt-12 pt-8 border-t border-outline-variant/20 text-center">
          <p className="font-headline text-xl text-on-background mb-2">See this in your own numbers</p>
          <p className="text-[0.88rem] text-outline mb-5">Marea tracks your symptoms, interprets your labs, and shows you your own hormonal patterns — built by practicing OB/GYNs.</p>
          <a
            href={APP_STORE_URL}
            className="bg-primary/80 text-on-primary rounded-full px-8 py-3 font-label text-[0.9rem] font-semibold inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Icon name="phone_iphone" className="text-lg" />
            Download Marea
          </a>
        </div>
      </article>
    </div>
  )
}
