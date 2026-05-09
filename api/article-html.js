// Serverless function that intercepts /articles/<slug> requests, fetches
// the article from Supabase, and returns the SPA shell with per-article
// <title> and Open Graph meta tags injected. Without this, link-preview
// crawlers (iMessage, Slack, Twitter, etc.) only see the static index.html
// title because the SPA's per-route title is set client-side after React
// hydrates and crawlers don't run JavaScript.
//
// Real users still get the React app: the response is a complete index.html
// shell, just with crawler-visible meta tags swapped in. React reads slug
// from window.location and renders the article on hydration like normal.
//
// Wired up via vercel.json rewrite: /articles/:slug -> /api/article-html?slug=:slug
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

// Cache the post-build index.html template across cold starts so we don't
// fetch it on every request. The deployed shell only changes on each new
// deploy, and cold-starting functions get a fresh in-memory cache anyway.
let cachedShell = null

async function getShell(req) {
  if (cachedShell) return cachedShell
  // Same-origin fetch; the shell is served as a static file by Vercel.
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host  = req.headers['x-forwarded-host'] || req.headers.host
  const resp  = await fetch(`${proto}://${host}/index.html`)
  cachedShell = await resp.text()
  return cachedShell
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Convert a slug like "heart-rate-variability-perimenopause-hrv-tracking"
// into a passable title-cased fallback. Used when the Supabase query for
// the real article fails or returns no row, so the link preview still
// shows something article-shaped instead of the generic site title.
function slugToTitle(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map(w => w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

export default async function handler(req, res) {
  const slug = (req.query.slug || '').toString()
  if (!slug) return res.status(400).send('Missing slug')

  let shell
  try {
    shell = await getShell(req)
  } catch (e) {
    console.error('[article-html] failed to fetch shell:', e?.message || e)
    return res.status(500).send('Failed to load shell')
  }

  // Try to load the real article. Any failure (missing env, RLS denies,
  // unpublished, typo'd slug) flows into the slug-derived fallback below
  // so we never serve a generic "Marea Health — Perimenopause, Finally
  // Understood" preview for a real article URL.
  let article = null
  let lookupStatus = 'ok'
  try {
    const result = await supabase
      .from('content')
      .select('title, summary, cover_url, slug, category')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()
    if (result.error) {
      lookupStatus = `error:${result.error.message}`
      console.error('[article-html] supabase error:', result.error)
    } else if (!result.data) {
      lookupStatus = 'no-article'
    } else {
      article = result.data
    }
  } catch (e) {
    lookupStatus = `exception:${e?.message || 'unknown'}`
    console.error('[article-html] supabase exception:', e)
  }

  // Derive meta values: prefer the real article, fall back to slug-based
  // values so previews still look article-specific even when Supabase is
  // unreachable or the row is unpublished.
  const fallbackTitle = slugToTitle(slug)
  const articleTitle  = article?.title || fallbackTitle
  const articleUrl    = `https://mareahealth.com/articles/${slug}`
  const description   = (
    article?.summary
    || `${fallbackTitle} — a clinical guide from Marea on perimenopause.`
  ).slice(0, 200)
  const ogImage = article?.cover_url
    ? article.cover_url.split('?')[0]
    : 'https://mareahealth.com/marealogo.svg'

  // Surface the lookup status as a response header so we can debug from
  // curl without redeploying. Strip in a follow-up once stable.
  res.setHeader('X-Marea-Article-Lookup', lookupStatus)

  const title = `${escapeHtml(articleTitle)} — Marea`
  const desc  = escapeHtml(description)
  const img   = escapeHtml(ogImage)
  const aTitle = escapeHtml(articleTitle)

  // Replace the static <title> + description, and inject Open Graph +
  // Twitter card tags before </head>. Use replace() rather than full
  // template construction so we don't have to track the exact production
  // script-tag bundle URL (which changes per build).
  let html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"[^>]*>/, `<meta name="description" content="${desc}" />`)

  const ogTags = `
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${aTitle}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="${articleUrl}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:site_name" content="Marea" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${aTitle}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${img}" />`
  html = html.replace('</head>', `${ogTags}\n  </head>`)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  // Cache for an hour at the edge; iMessage etc. won't re-crawl rapidly.
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.send(html)
}
