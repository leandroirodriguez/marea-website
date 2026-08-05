// Public, server-rendered patient lab summary at /r/<token> (wired via a
// vercel.json rewrite: /r/:token -> /api/report?token=:token).
//
// This is a CLINICAL document delivered by the practice, not a product page.
// It carries no Marea branding or promotion: the patient receives it from
// their clinician through the patient portal, so advertising a commercial
// product on it would make a treatment communication into a marketing one.
//
// It is also written to hold no Safe Harbor identifier: no name, no record
// number, and no dates (a treatment-related date down to the day is itself an
// identifier under 45 CFR 164.514(b)(2)). The share token is random and not
// derived from anything about the patient, which is what 164.514(c) requires
// of a re-identification code.
//
// Every hit is written to report_access_log for HIPAA audit controls, and
// automated fetchers (link-preview crawlers, mail-security scanners) are
// served a contentless interstitial instead of the summary.
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { LAB_GROUPS, LAB_CONFIG, evaluateLevel, derivedIndices, RECOMMENDATION_CATEGORIES } from '../src/lib/labConfig.js'
import { logoSprite, BEACHES_RATIO } from '../src/lib/brandLogos.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

// ─── Brand tokens ────────────────────────────────────────────────────────────
// Accents follow the Beaches OBGYN mark, since the practice is the author.
const C = {
  brand: '#2f5664',
  brandDeep: '#1f3a44',
  surface: '#fcf9f4',
  surfaceLow: '#f6f3ee',
  onBg: '#1c1c19',
  onSurfaceVariant: '#3f484a',
  outline: '#6f797a',
  secondary: '#715b33',
  border: '#e5e2dd',
}

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// ─── Automated-fetcher detection ─────────────────────────────────────────────
// Chat apps, social platforms, and — most relevant in healthcare — mail
// security gateways (Proofpoint, Mimecast, Defender SafeLinks) follow links
// automatically to build previews or detonate them in a sandbox. Any of those
// hitting the URL is an access to the summary that no patient asked for. They
// get an interstitial with no clinical content instead.
const AUTOMATED_UA = /bot\b|crawler|spider|crawling|preview|scanner|curl|wget|python-requests|axios|node-fetch|go-http-client|okhttp|java\/|headless|phantomjs|slurp|facebookexternalhit|facebot|slackbot|slack-imgproxy|twitterbot|whatsapp|discord|telegram|linkedin|skypeuripreview|applebot|redditbot|embedly|iframely|quora|pinterest|outbrain|bitlybot|vkshare|w3c_validator|googlebot|bingbot|duckduckbot|baiduspider|yandex|ahrefs|semrush|petalbot|safelinks|proofpoint|mimecast|barracuda|symantec|forcepoint|zscaler|netskope|microsoft office|msoffice|ms-office|microsoft-webdav|office protocol discovery/i

function isAutomated(req) {
  // An explicit human click carries the bypass param — see the interstitial.
  if (req.query?.open === '1') return false

  const h = req.headers || {}
  const ua = String(h['user-agent'] || '')
  if (!ua.trim()) return true                       // no UA at all is not a browser
  if (AUTOMATED_UA.test(ua)) return true

  // Browser prefetch/prerender hints — the page is being fetched before
  // (or without) anyone choosing to read it.
  const sec = String(h['sec-purpose'] || '').toLowerCase()
  if (sec.includes('prefetch') || sec.includes('prerender')) return true
  const purpose = String(h['purpose'] || h['x-purpose'] || '').toLowerCase()
  if (purpose === 'prefetch' || purpose === 'preview') return true
  if (String(h['x-moz'] || '').toLowerCase() === 'prefetch') return true

  return false
}

// ─── Audit log ───────────────────────────────────────────────────────────────
// Never records a raw IP: an address is a Safe Harbor identifier, and writing
// one here would reintroduce an identifier into the same database that holds
// the summaries. A salted hash still distinguishes repeat visits.
function hashIp(req) {
  const raw = String(req.headers?.['x-forwarded-for'] || '').split(',')[0].trim()
  if (!raw) return null
  const salt = process.env.REPORT_LOG_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return crypto.createHash('sha256').update(`${salt}:${raw}`).digest('hex')
}

async function logAccess(req, { token, reportId = null, outcome, automated = false }) {
  try {
    // supabase-js resolves with { error } rather than throwing, so check both.
    const { error } = await supabase.from('report_access_log').insert({
      report_id: reportId,
      token,
      outcome,
      automated,
      ip_hash: hashIp(req),
      user_agent: String(req.headers?.['user-agent'] || '').slice(0, 200) || null,
    })
    if (error) console.error('[report] access log rejected:', error.message)
  } catch (e) {
    // Logging must never take the page down for a patient.
    console.error('[report] access log failed:', e?.message || e)
  }
}

// ─── Page shell ──────────────────────────────────────────────────────────────
// No Open Graph or Twitter card tags: those exist to make a URL render as a
// rich preview, which is the opposite of what a private clinical document
// should do when the link is pasted anywhere.
function page({ title, description, bodyHtml }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
<meta name="referrer" content="no-referrer" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}" />
<link href="${FONTS_HREF}" rel="stylesheet" />
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:${C.surface};color:${C.onBg};-webkit-font-smoothing:antialiased;line-height:1.6}
  .material-symbols-outlined{font-family:'Material Symbols Outlined';font-variation-settings:'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 24;font-size:20px;line-height:1}
  .wrap{max-width:640px;margin:0 auto;padding:0 1.25rem 4rem}
  .brandbar{padding:2rem 1.25rem 1.5rem;color:${C.brand};display:flex;justify-content:center}
  .lg{display:block;height:auto;max-width:100%}
  h1{font-family:'Newsreader',serif;font-weight:400;font-size:clamp(1.7rem,6vw,2.4rem);color:${C.onBg};line-height:1.2;margin-bottom:.6rem}
  h2{font-family:'Newsreader',serif;font-weight:400;font-size:1.4rem;color:${C.onBg};margin:2.5rem 0 1rem}
  .eyebrow{display:flex;align-items:center;gap:.4rem;font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.brand};margin-bottom:.9rem}
  .meta{font-size:.8rem;color:${C.outline};margin-bottom:.4rem}
  .card{background:#fff;border-radius:1rem;padding:1.25rem 1.35rem;box-shadow:0 12px 32px rgba(47,86,100,.05);border:1px solid ${C.border}}
  .labs{display:flex;flex-direction:column;gap:.7rem}
  .lab-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:.35rem}
  .lab-name{display:flex;align-items:center;gap:.5rem;font-weight:600;font-size:.9rem;color:${C.onBg}}
  .lab-name .material-symbols-outlined{font-size:18px;color:${C.brand}}
  .badge{padding:.2rem .6rem;border-radius:9999px;font-size:.66rem;font-weight:700;letter-spacing:.03em}
  .lab-val{font-size:1.5rem;font-weight:600;color:${C.onBg}}
  .lab-unit{font-size:.75rem;color:${C.outline};margin-left:.15rem}
  .lab-cd{font-size:.72rem;color:${C.outline};margin-left:.5rem}
  .lab-note{font-size:.82rem;color:${C.onSurfaceVariant};margin-top:.35rem}
  .interp{background:${C.brandDeep};border-radius:1rem;padding:1.6rem 1.5rem;color:#fff}
  .interp .eyebrow{color:rgba(255,255,255,.55)}
  .interp p{font-weight:300;color:rgba(255,255,255,.9);font-size:.95rem;line-height:1.8;margin-bottom:.85rem}
  .interp p:last-child{margin-bottom:0}
  .provenance{margin-top:1.1rem;padding-top:.9rem;border-top:1px solid rgba(255,255,255,.18);font-size:.76rem;line-height:1.6;color:rgba(255,255,255,.65)}
  .cat-head{display:flex;align-items:center;gap:.5rem;margin:1.9rem 0 .8rem}
  .cat-head .material-symbols-outlined{font-size:20px;color:${C.secondary}}
  .cat-head h3{font-family:'Plus Jakarta Sans',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${C.secondary}}
  details.opt{background:#fff;border:1px solid ${C.border};border-radius:.85rem;margin-bottom:.6rem;overflow:hidden;transition:border-color .15s}
  details.opt[open]{border-color:${C.brand}55}
  details.opt summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:1rem 1.15rem;font-weight:600;font-size:.92rem;color:${C.onBg}}
  details.opt summary::-webkit-details-marker{display:none}
  details.opt summary .chev{color:${C.brand};transition:transform .2s;flex-shrink:0}
  details.opt[open] summary .chev{transform:rotate(180deg)}
  details.opt .detail{padding:0 1.15rem 1.1rem;font-size:.9rem;font-weight:300;color:${C.onSurfaceVariant};line-height:1.7}
  .hint{font-size:.78rem;color:${C.outline};margin:0 0 1rem;line-height:1.6}
  .disclaimer{background:${C.surfaceLow};border-radius:.85rem;padding:1.1rem 1.25rem;font-size:.76rem;color:${C.outline};line-height:1.65;margin-top:2.5rem}
  .foot{text-align:center;font-size:.72rem;color:${C.outline};margin-top:2rem;line-height:1.7}
  .status{max-width:460px;margin:0 auto;padding:3rem 1.5rem;text-align:center}
  .status .material-symbols-outlined{font-size:44px;color:${C.brand};margin-bottom:1rem}
  .status h1{margin-bottom:.75rem}
  .status p{color:${C.onSurfaceVariant};font-weight:300;margin-bottom:1.75rem}
  .btn{display:inline-flex;align-items:center;gap:.45rem;text-decoration:none;font-weight:600;font-size:.88rem;padding:.8rem 1.6rem;border-radius:9999px;background:${C.brand};color:#fff}
</style>
</head>
<body>
${logoSprite('beaches')}
${bodyHtml}
</body>
</html>`
}

function brandBar() {
  const h = 52
  const w = (h * BEACHES_RATIO).toFixed(1)
  // Both href and xlink:href: older iOS Safari only honours the xlink form.
  return `<div class="brandbar">
      <svg class="lg" width="${w}" height="${h}" role="img" aria-label="Beaches OBGYN"><use href="#lg-beaches" xlink:href="#lg-beaches"/></svg>
    </div>`
}

function statusPage({ icon, title, message, action = '' }) {
  const body = `${brandBar()}
  <div class="status">
    <span class="material-symbols-outlined">${icon}</span>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    ${action}
  </div>`
  return page({ title, description: 'A private summary prepared by your clinician.', bodyHtml: body })
}

// Shown to link-preview crawlers and mail-security scanners. Carries no
// clinical content, so an automated fetch reveals nothing; a human who lands
// here by mistake is one tap from the real thing.
function interstitialPage(token) {
  return statusPage({
    icon: 'lock',
    title: 'A private summary is waiting for you',
    message: 'This link opens a private health summary prepared for one person. Tap below to open it in your browser.',
    action: `<a class="btn" href="/r/${encodeURIComponent(token)}?open=1">Open my summary</a>`,
  })
}

function renderLabs(labs) {
  const cd = labs.progesterone_cycle_day || null
  const filled = LAB_GROUPS.map(g => ({ g, keys: g.keys.filter(k => labs[k] != null) }))
                           .filter(x => x.keys.length)
  const showHeadings = filled.length > 1

  return filled.map(({ g, keys }) => {
    const cards = keys.map(key => renderLabCard(key, labs[key], key === 'progesterone' ? cd : null)).join('')
    const heading = showHeadings
      ? `<div class="cat-head"><span class="material-symbols-outlined">${g.icon}</span><h3>${escapeHtml(g.label)}</h3></div>`
      : ''
    return `${heading}<div class="labs">${cards}</div>`
  }).join('')
}

function renderLabCard(key, val, cycleDay) {
  const cfg = LAB_CONFIG[key]
  const r = evaluateLevel(key, val, cycleDay)
  // Prefer the patient-facing wording (plabel/pnote) where a range defines it.
  const badge = r
    ? `<span class="badge" style="background:${r.color}15;color:${r.color}">${escapeHtml(r.plabel || r.label)}</span>`
    : ''
  const note = r ? `<div class="lab-note">${escapeHtml(r.pnote || r.note)}</div>` : ''
  const cdTag = cycleDay ? `<span class="lab-cd">cycle day ${cycleDay}</span>` : ''
  return `
      <div class="card">
        <div class="lab-head">
          <span class="lab-name"><span class="material-symbols-outlined">${cfg.icon}</span>${escapeHtml(cfg.label)}</span>
          ${badge}
        </div>
        <div><span class="lab-val">${escapeHtml(val)}</span><span class="lab-unit">${escapeHtml(cfg.unit)}</span>${cdTag}</div>
        ${note}
      </div>`
}

function renderIndices(labs) {
  const indices = derivedIndices(labs)
  if (!indices.length) return ''
  const rows = indices.map(i => `
      <div class="card">
        <div class="lab-head">
          <span class="lab-name"><span class="material-symbols-outlined">calculate</span>${escapeHtml(i.label)}</span>
          <span class="badge" style="background:${i.color}15;color:${i.color}">${escapeHtml(i.status)}</span>
        </div>
        <div><span class="lab-val">${escapeHtml(i.value)}</span><span class="lab-unit">${escapeHtml(i.suffix || '')}</span></div>
        <div class="lab-note">${escapeHtml(i.note)}</div>
      </div>`).join('')
  return `
    <h2>Calculated from your results</h2>
    <p class="hint">These combine two or more of the values above into a single measure.</p>
    <div class="labs">${rows}</div>`
}

function renderInterpretation(text) {
  const paras = String(text || '').split(/\n\n+/).filter(Boolean)
    .map(p => `<p>${escapeHtml(p)}</p>`).join('')
  return `
    <div class="interp">
      <div class="eyebrow"><span class="material-symbols-outlined">auto_awesome</span> What your results mean</div>
      ${paras}
      <p class="provenance">This explanation was written automatically from the lab values your clinician entered, and was read and approved by your clinician before it was shared with you.</p>
    </div>`
}

function renderRecommendations(recs) {
  if (!Array.isArray(recs) || recs.length === 0) return ''
  const sections = RECOMMENDATION_CATEGORIES.map(cat => {
    const items = recs.filter(r => r.category === cat.key)
    if (items.length === 0) return ''
    const opts = items.map(r => `
      <details class="opt">
        <summary>${escapeHtml(r.title)}<span class="material-symbols-outlined chev">expand_more</span></summary>
        <div class="detail">${escapeHtml(r.detail)}</div>
      </details>`).join('')
    return `
      <div class="cat-head"><span class="material-symbols-outlined">${cat.icon}</span><h3>${escapeHtml(cat.label)}</h3></div>
      ${opts}`
  }).join('')
  if (!sections.trim()) return ''
  return `
    <h2>Options to consider</h2>
    <p class="hint">Your clinician chose these options for you. Tap any one to read more — they are possibilities to discuss at your next visit, not a prescription.</p>
    ${sections}`
}

export default async function handler(req, res) {
  const token = (req.query.token || '').toString()

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  // Patient content — never cache at the edge or in shared proxies.
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
  res.setHeader('Referrer-Policy', 'no-referrer')

  if (!token) {
    return res.status(404).send(statusPage({
      icon: 'link_off', title: 'Summary not found',
      message: 'This link is missing or incomplete. Please use the exact link shared by your clinician.',
    }))
  }

  // Serve automated fetchers a contentless page before touching the database.
  if (isAutomated(req)) {
    await logAccess(req, { token, outcome: 'automated', automated: true })
    return res.status(200).send(interstitialPage(token))
  }

  let report = null
  try {
    const { data } = await supabase
      .from('patient_reports')
      .select('id, labs, interpretation, recommendations, expires_at, revoked')
      .eq('token', token)
      .maybeSingle()
    report = data
  } catch (e) {
    console.error('[report] lookup failed:', e?.message || e)
    return res.status(500).send(statusPage({
      icon: 'error', title: 'Something went wrong',
      message: 'We couldn’t load this summary right now. Please try again in a moment.',
    }))
  }

  if (!report || report.revoked) {
    await logAccess(req, { token, reportId: report?.id ?? null, outcome: report ? 'revoked' : 'not_found' })
    return res.status(404).send(statusPage({
      icon: 'link_off', title: 'Summary not available',
      message: 'This link is no longer active. If you believe this is a mistake, please contact your clinician for an updated link.',
    }))
  }

  if (report.expires_at && new Date(report.expires_at) < new Date()) {
    await logAccess(req, { token, reportId: report.id, outcome: 'expired' })
    return res.status(410).send(statusPage({
      icon: 'schedule', title: 'This link has expired',
      message: 'For your privacy, these private links stay active for a limited time. Please ask your clinician for a fresh link if you need to view this again.',
    }))
  }

  await logAccess(req, { token, reportId: report.id, outcome: 'served' })

  const body = `${brandBar()}
  <div class="wrap">
    <div class="eyebrow"><span class="material-symbols-outlined">labs</span> Your lab summary</div>
    <h1>Your hormone results, explained</h1>
    <p class="meta">Prepared for you by your clinician.</p>

    <h2>Your results</h2>
    ${renderLabs(report.labs || {})}

    ${renderIndices(report.labs || {})}

    <div style="margin-top:1.5rem">${renderInterpretation(report.interpretation)}</div>

    ${renderRecommendations(report.recommendations)}

    <div class="disclaimer">
      This summary is for your information and is not a medical diagnosis. Your results should be reviewed together with your full clinical picture by your healthcare provider. A single lab draw is a snapshot — trends over time are more meaningful than any individual result. Do not start, stop, or change any medication or supplement without speaking to your clinician.
    </div>

    <p class="foot">This summary is private to you, and the link expires automatically 30 days after it was created.</p>
  </div>`

  return res.status(200).send(page({
    title: 'Your Lab Summary',
    description: 'A private summary of your recent lab results, prepared by your clinician.',
    bodyHtml: body,
  }))
}
