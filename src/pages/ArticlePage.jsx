import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { articleImage } from '../lib/images'
import { useAuth } from '../hooks/useAuth'
import mareaLogo from '../assets/marealogo.svg'

function markdownToHtml(text) {
  if (!text) return ''
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '')
}

export default function ArticlePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, isPaid } = useAuth()
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

  async function checkAccess(article) {
    if (isPaid) { setLocked(false); recordRead(article.slug); return }

    const maxFree = user ? 5 : 1

    if (user) {
      const { count } = await supabase
        .from('article_reads')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      const { data: existing } = await supabase
        .from('article_reads')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_slug', article.slug)
        .maybeSingle()

      if (existing) { setLocked(false); return }
      if ((count || 0) >= maxFree) { setLocked(true); return }
      setLocked(false)
      recordRead(article.slug)
    } else {
      const reads = JSON.parse(localStorage.getItem('marea_article_reads') || '[]')
      if (reads.includes(article.slug)) { setLocked(false); return }
      if (reads.length >= maxFree) { setLocked(true); return }
      setLocked(false)
      localStorage.setItem('marea_article_reads', JSON.stringify([...reads, article.slug]))
    }
  }

  async function recordRead(articleSlug) {
    if (!user) return
    await supabase
      .from('article_reads')
      .upsert({ user_id: user.id, article_slug: articleSlug }, { onConflict: 'user_id,article_slug' })
      .select()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-outline">Loading...</div>
  if (!article) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-outline text-lg">Article not found.</p>
      <Link to="/articles" className="text-primary font-semibold">Back to articles</Link>
    </div>
  )

  const coverUrl = article.cover_url || articleImage(article.slug, article.category, 1200, 600)

  return (
    <div className="min-h-screen bg-surface">
      <nav className="fixed top-0 w-full z-50 bg-surface/92 backdrop-blur-xl border-b border-outline-variant/10 px-6 md:px-8 py-4">
        <div className="max-w-[1100px] mx-auto flex justify-between items-center">
          <Link to="/"><img src={mareaLogo} alt="Marea Health" className="h-[1.4rem]" /></Link>
          <div className="flex items-center gap-6">
            <Link to="/blog" className="font-label text-[0.85rem] font-medium text-on-surface-variant hover:text-primary transition-colors">Blog</Link>
            <Link to="/articles" className="font-label text-[0.85rem] font-medium text-primary hover:text-primary-container transition-colors">All articles</Link>
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
          {article.is_premium && (
            <span className="font-label text-[0.65rem] font-bold text-tertiary bg-tertiary/[0.08] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Member
            </span>
          )}
        </div>

        <h1 className="font-headline text-[clamp(2rem,5vw,2.75rem)] font-normal text-on-background mb-3" style={{ lineHeight: 1.2, letterSpacing: '-0.02em' }}>
          {article.title}
        </h1>
        <p className="text-[0.88rem] text-outline mb-6">
          By {article.author} &middot; {new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <img src={coverUrl} alt="" className="w-full rounded-2xl mb-8 max-h-[400px] object-cover" />

        {locked ? (
          /* Paywall */
          <div className="relative">
            <div
              className="font-body text-base font-light text-on-surface-variant max-h-[200px] overflow-hidden"
              style={{ lineHeight: 1.85, maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}
              dangerouslySetInnerHTML={{ __html: markdownToHtml(article.body?.substring(0, 500)) }}
            />
            <div className="bg-primary-container rounded-2xl p-10 text-center shadow-lg mt-4">
              <span className="material-symbols-outlined text-[48px] text-primary-fixed mb-4 block">lock</span>
              <h2 className="font-headline text-2xl font-normal text-on-primary mb-3">
                {!user ? 'Sign in to keep reading' : 'Upgrade to continue'}
              </h2>
              <p className="text-[0.9rem] text-on-primary/75 mb-6 max-w-[400px] mx-auto">
                {!user
                  ? 'Create a free account to read up to 5 articles. Become a member for unlimited access.'
                  : 'You\'ve used all your free articles. Upgrade to a membership for unlimited access to all clinical content.'
                }
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                {!user ? (
                  <>
                    <Link to="/login" className="bg-white text-primary rounded-full px-8 py-3 font-label text-[0.9rem] font-semibold hover:bg-primary-fixed transition-colors">
                      Sign in free
                    </Link>
                    <Link to="/signup" className="bg-transparent text-on-primary rounded-full px-8 py-3 font-label text-[0.9rem] font-semibold border-[1.5px] border-on-primary/50 hover:border-on-primary transition-colors">
                      Create account
                    </Link>
                  </>
                ) : (
                  <Link to="/account" className="bg-white text-primary rounded-full px-8 py-3 font-label text-[0.9rem] font-semibold hover:bg-primary-fixed transition-colors">
                    Upgrade membership
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Full article */
          <div
            className="font-body text-base font-light text-on-surface-variant"
            style={{ lineHeight: 1.85 }}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(article.body) }}
          />
        )}
      </article>
    </div>
  )
}
