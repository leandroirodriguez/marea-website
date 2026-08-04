// Public, server-rendered patient lab report at /r/<token> (wired via a
// vercel.json rewrite: /r/:token -> /api/report?token=:token).
//
// Renders a complete, self-contained, Marea-branded HTML page from a
// patient_reports row read with the service-role key. The patient opens this
// from their secure portal with no login, on any device. It contains ZERO
// patient-identifiable data — only lab numbers, stage, and clinician-reviewed
// AI text. Reports expire 30 days after creation (or when revoked).
import { createClient } from '@supabase/supabase-js'
import { LAB_KEYS, LAB_CONFIG, evaluateLevel, RECOMMENDATION_CATEGORIES } from '../src/lib/labConfig.js'
import { LOGO_SPRITE, MAREA_RATIO, BEACHES_RATIO } from '../src/lib/brandLogos.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

const APP_STORE_URL = 'https://apps.apple.com/app/id6763952659'
const SITE_URL = 'https://mareahealth.com'

// ─── Brand tokens (mirror src/index.css @theme) ──────────────────────────────
const C = {
  primary: '#005258',
  primaryContainer: '#1b6b72',
  tertiary: '#842b16',
  surface: '#fcf9f4',
  surfaceLow: '#f6f3ee',
  onBg: '#1c1c19',
  onSurfaceVariant: '#3f484a',
  outline: '#6f797a',
  secondary: '#715b33',
  border: '#e5e2dd',
  // Shared co-brand ink. The Marea mark is rendered in the Beaches OBGYN
  // brand colour so the two logos read as one intentional lockup rather
  // than two near-but-not-quite teals sitting next to each other.
  cobrand: '#2f5664',
}

// Co-brand lockup sizing. The Beaches mark's box is much taller than its
// wordmark (the starfish rises above the text), so matching raw box heights
// would leave its lettering visibly smaller than Marea's. These heights were
// tuned so the two wordmarks read at the same optical size.
const LOCKUP = { mareaH: 26, beachesH: 56 }
const LOCKUP_SM = { mareaH: 22, beachesH: 48 }

// One logo pair, coloured by the `color` of its container.
function logoLockup({ mareaH, beachesH }, dividerOpacity = 0.3) {
  const mw = (mareaH * MAREA_RATIO).toFixed(1)
  const bw = (beachesH * BEACHES_RATIO).toFixed(1)
  // Both href and xlink:href are emitted: older iOS Safari (which patients may
  // well be on) only honours the xlink form for <use>.
  return `<div class="lockup">
      <svg class="lg" width="${mw}" height="${mareaH}" role="img" aria-label="Marea"><use href="#lg-marea" xlink:href="#lg-marea"/></svg>
      <span class="lockup-div" style="opacity:${dividerOpacity}"></span>
      <svg class="lg" width="${bw}" height="${beachesH}" role="img" aria-label="Beaches OBGYN"><use href="#lg-beaches" xlink:href="#lg-beaches"/></svg>
    </div>`
}

const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap'

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Standalone HTML document shell shared by the report and status pages.
function page({ title, description, bodyHtml }) {
  const t = escapeHtml(title)
  const d = escapeHtml(description)
  const ogImage = `${SITE_URL}/icon-512.png`
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>${t}</title>
<meta name="description" content="${d}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${t}" />
<meta property="og:description" content="${d}" />
<meta property="og:site_name" content="Marea" />
<meta property="og:image" content="${ogImage}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${t}" />
<meta name="twitter:description" content="${d}" />
<meta name="twitter:image" content="${ogImage}" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link href="${FONTS_HREF}" rel="stylesheet" />
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:${C.surface};color:${C.onBg};-webkit-font-smoothing:antialiased;line-height:1.6}
  .material-symbols-outlined{font-family:'Material Symbols Outlined';font-variation-settings:'FILL' 0,'wght' 300,'GRAD' 0,'opsz' 24;font-size:20px;line-height:1}
  .wrap{max-width:640px;margin:0 auto;padding:0 1.25rem 4rem}
  .brandbar{padding:2rem 1.25rem 1.5rem;color:${C.cobrand}}
  .lockup{display:flex;align-items:center;justify-content:center;gap:1.1rem;flex-wrap:wrap}
  .lg{display:block;height:auto;max-width:100%}
  .lockup-div{width:1px;height:28px;background:currentColor;flex-shrink:0}
  h1{font-family:'Newsreader',serif;font-weight:400;font-size:clamp(1.7rem,6vw,2.4rem);color:${C.onBg};line-height:1.2;margin-bottom:.6rem}
  h2{font-family:'Newsreader',serif;font-weight:400;font-size:1.4rem;color:${C.onBg};margin:2.5rem 0 1rem}
  .eyebrow{display:flex;align-items:center;gap:.4rem;font-size:.68rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${C.primary};margin-bottom:.9rem}
  .meta{font-size:.8rem;color:${C.outline};margin-bottom:.4rem}
  .card{background:#fff;border-radius:1rem;padding:1.25rem 1.35rem;box-shadow:0 12px 32px rgba(0,82,88,.05);border:1px solid ${C.border}}
  .labs{display:flex;flex-direction:column;gap:.7rem}
  .lab-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:.35rem}
  .lab-name{display:flex;align-items:center;gap:.5rem;font-weight:600;font-size:.9rem;color:${C.onBg}}
  .lab-name .material-symbols-outlined{font-size:18px;color:${C.primary}}
  .badge{padding:.2rem .6rem;border-radius:9999px;font-size:.66rem;font-weight:700;letter-spacing:.03em}
  .lab-val{font-size:1.5rem;font-weight:600;color:${C.onBg}}
  .lab-unit{font-size:.75rem;color:${C.outline};margin-left:.15rem}
  .lab-cd{font-size:.72rem;color:${C.outline};margin-left:.5rem}
  .lab-note{font-size:.82rem;color:${C.onSurfaceVariant};margin-top:.35rem}
  .interp{background:#0D3F44;border-radius:1rem;padding:1.6rem 1.5rem;color:#fff}
  .interp .eyebrow{color:rgba(255,255,255,.55)}
  .interp p{font-weight:300;color:rgba(255,255,255,.9);font-size:.95rem;line-height:1.8;margin-bottom:.85rem}
  .interp p:last-child{margin-bottom:0}
  .cat-head{display:flex;align-items:center;gap:.5rem;margin:1.9rem 0 .8rem}
  .cat-head .material-symbols-outlined{font-size:20px;color:${C.secondary}}
  .cat-head h3{font-family:'Plus Jakarta Sans',sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${C.secondary}}
  details.opt{background:#fff;border:1px solid ${C.border};border-radius:.85rem;margin-bottom:.6rem;overflow:hidden;transition:border-color .15s}
  details.opt[open]{border-color:${C.primary}55}
  details.opt summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:.75rem;padding:1rem 1.15rem;font-weight:600;font-size:.92rem;color:${C.onBg}}
  details.opt summary::-webkit-details-marker{display:none}
  details.opt summary .chev{color:${C.primary};transition:transform .2s;flex-shrink:0}
  details.opt[open] summary .chev{transform:rotate(180deg)}
  details.opt .detail{padding:0 1.15rem 1.1rem;font-size:.9rem;font-weight:300;color:${C.onSurfaceVariant};line-height:1.7}
  .hint{font-size:.75rem;color:${C.outline};margin:0 0 1rem;font-style:italic}
  .disclaimer{background:${C.surfaceLow};border-radius:.85rem;padding:1.1rem 1.25rem;font-size:.76rem;color:${C.outline};line-height:1.65;margin-top:2.5rem}
  .promo{margin-top:2.5rem;background:linear-gradient(135deg,#005258,#0D3F44);border-radius:1.15rem;padding:2rem 1.6rem;text-align:center;color:#fff}
  .promo p{font-weight:300;color:rgba(255,255,255,.82);font-size:.9rem;margin:1.1rem auto 1.4rem;max-width:26rem}
  .cta-row{display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap}
  .btn{display:inline-flex;align-items:center;gap:.45rem;text-decoration:none;font-weight:600;font-size:.85rem;padding:.75rem 1.4rem;border-radius:9999px}
  .btn-fill{background:#fff;color:${C.primary}}
  .btn-ghost{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.35)}
  .foot{text-align:center;font-size:.72rem;color:${C.outline};margin-top:2rem;line-height:1.7}
  .status{max-width:460px;margin:0 auto;padding:4rem 1.5rem;text-align:center}
  .status .material-symbols-outlined{font-size:44px;color:${C.primary};margin-bottom:1rem}
  .status h1{margin-bottom:.75rem}
  .status p{color:${C.onSurfaceVariant};font-weight:300;margin-bottom:1.75rem}
</style>
</head>
<body>
${LOGO_SPRITE}
${bodyHtml}
</body>
</html>`
}

function brandBar() {
  return `<div class="brandbar">${logoLockup(LOCKUP)}</div>`
}

function promoFooter() {
  return `
  <div class="promo">
    ${logoLockup(LOCKUP_SM, 0.45)}
    <p>This analysis was prepared using Marea — the women's health app designed by OB/GYNs. Track your symptoms, understand your labs, and get guidance backed by clinical science.</p>
    <div class="cta-row">
      <a class="btn btn-fill" href="${APP_STORE_URL}" target="_blank" rel="noopener">Download the app</a>
      <a class="btn btn-ghost" href="${SITE_URL}" target="_blank" rel="noopener">Visit mareahealth.com</a>
    </div>
  </div>
  <p class="foot">&copy; ${new Date().getFullYear()} Marea Health &middot; This link is private and expires automatically.</p>`
}

function statusPage({ icon, title, message }) {
  const body = `${brandBar()}
  <div class="status">
    <span class="material-symbols-outlined">${icon}</span>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    <a class="btn btn-fill" style="background:${C.primary};color:#fff" href="${SITE_URL}" target="_blank" rel="noopener">Discover Marea</a>
  </div>`
  return page({ title: `${title} — Marea`, description: 'A personalized lab analysis from Marea.', bodyHtml: body })
}

function renderLabs(labs) {
  const cd = labs.progesterone_cycle_day || null
  const cards = LAB_KEYS.map(key => {
    const val = labs[key]
    if (val == null) return ''
    const cfg = LAB_CONFIG[key]
    const cycleDay = key === 'progesterone' ? cd : null
    const r = evaluateLevel(key, val, cycleDay)
    // Prefer the patient-facing wording (plabel/pnote) where a range defines
    // it — the clinical copy carries perimenopause framing that doesn't belong
    // on a report shared straight with a patient.
    const badge = r
      ? `<span class="badge" style="background:${r.color}15;color:${r.color}">${escapeHtml(r.plabel || r.label)}</span>`
      : ''
    const note = r ? `<div class="lab-note">${escapeHtml(r.pnote || r.note)}</div>` : ''
    const cdTag = (key === 'progesterone' && cd) ? `<span class="lab-cd">cycle day ${cd}</span>` : ''
    return `
      <div class="card">
        <div class="lab-head">
          <span class="lab-name"><span class="material-symbols-outlined">${cfg.icon}</span>${escapeHtml(cfg.label)}</span>
          ${badge}
        </div>
        <div><span class="lab-val">${escapeHtml(val)}</span><span class="lab-unit">${escapeHtml(cfg.unit)}</span>${cdTag}</div>
        ${note}
      </div>`
  }).join('')
  return `<div class="labs">${cards}</div>`
}

function renderInterpretation(text) {
  const paras = String(text || '').split(/\n\n+/).filter(Boolean)
    .map(p => `<p>${escapeHtml(p)}</p>`).join('')
  return `
    <div class="interp">
      <div class="eyebrow"><span class="material-symbols-outlined">auto_awesome</span> What your results mean</div>
      ${paras}
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
    <p class="hint">Tap any option to learn more. These are possibilities to discuss with your clinician — not a prescription.</p>
    ${sections}`
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default async function handler(req, res) {
  const token = (req.query.token || '').toString()

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  // Patient content — never cache at the edge or in shared proxies.
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')

  if (!token) {
    return res.status(404).send(statusPage({
      icon: 'link_off', title: 'Report not found',
      message: 'This link is missing or incomplete. Please use the exact link shared by your clinician.',
    }))
  }

  let report = null
  try {
    const { data } = await supabase
      .from('patient_reports')
      .select('labs, stage, interpretation, recommendations, created_at, expires_at, revoked')
      .eq('token', token)
      .maybeSingle()
    report = data
  } catch (e) {
    console.error('[report] lookup failed:', e?.message || e)
    return res.status(500).send(statusPage({
      icon: 'error', title: 'Something went wrong',
      message: 'We couldn’t load this report right now. Please try again in a moment.',
    }))
  }

  if (!report || report.revoked) {
    return res.status(404).send(statusPage({
      icon: 'link_off', title: 'Report not available',
      message: 'This link is no longer active. If you believe this is a mistake, please contact your clinician for an updated link.',
    }))
  }

  if (report.expires_at && new Date(report.expires_at) < new Date()) {
    return res.status(410).send(statusPage({
      icon: 'schedule', title: 'This link has expired',
      message: 'For your privacy, personalized lab links stay active for 30 days. Please ask your clinician for a fresh link if you need to view this again.',
    }))
  }

  const body = `${brandBar()}
  <div class="wrap">
    <div class="eyebrow"><span class="material-symbols-outlined">labs</span> Personalized lab analysis</div>
    <h1>Your hormone results, explained</h1>
    <p class="meta">Prepared ${fmtDate(report.created_at)}</p>
    <p class="meta">This private link expires ${fmtDate(report.expires_at)}.</p>

    <h2>Your results</h2>
    ${renderLabs(report.labs || {})}

    <div style="margin-top:1.5rem">${renderInterpretation(report.interpretation)}</div>

    ${renderRecommendations(report.recommendations)}

    <div class="disclaimer">
      This analysis is for educational purposes and is not a medical diagnosis. Your results should be reviewed together with your full clinical picture by your healthcare provider. A single lab draw is a snapshot — trends over time are more meaningful than any individual result. Do not start, stop, or change any medication or supplement without speaking to your clinician.
    </div>

    ${promoFooter()}
  </div>`

  return res.status(200).send(page({
    title: 'Your Personalized Lab Analysis — Marea',
    description: 'A private, personalized hormone lab analysis prepared with Marea, the women\'s health app designed by OB/GYNs.',
    bodyHtml: body,
  }))
}
