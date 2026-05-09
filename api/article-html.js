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

export default async function handler(req, res) {
  const slug = (req.query.slug || '').toString()
  if (!slug) return res.status(400).send('Missing slug')

  // Pull the article fields needed for meta tags. summary and cover_url are
  // optional; we fall back to defaults if either is missing.
  const { data: article, error } = await supabase
    .from('content')
    .select('title, summary, cover_url, slug, category')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  // If the article doesn't exist, fall through to the SPA's normal 404
  // rendering by returning the unmodified shell.
  let shell
  try {
    shell = await getShell(req)
  } catch (e) {
    return res.status(500).send('Failed to load shell')
  }

  if (error || !article) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.send(shell)
  }

  const articleUrl = `https://mareahealth.com/articles/${article.slug}`
  const description = (article.summary || `A clinical guide from Marea — ${article.category || 'perimenopause, finally understood'}.`).slice(0, 200)
  // Cover image: prefer the explicit cover_url; fall back to a default
  // OG image if none is set. Strips any Supabase signed-URL query string
  // since static URLs preview better in messaging clients.
  const ogImage = article.cover_url
    ? article.cover_url.split('?')[0]
    : 'https://mareahealth.com/marealogo.svg'

  const title = `${escapeHtml(article.title)} — Marea`
  const desc  = escapeHtml(description)
  const img   = escapeHtml(ogImage)
  const aTitle = escapeHtml(article.title)

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
