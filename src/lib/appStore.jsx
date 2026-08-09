/* ─── App Store launch state ──────────────────────────────────────────────────
   Single source of truth for whether the website surfaces "Download" CTAs or
   pre-launch "Coming Soon" pills. Marea shipped on the App Store, so APP_LIVE
   is true.

   This used to live as a local const in LandingPage.jsx, which meant flipping
   it at launch only updated the landing page — /articles, /blog and the article
   and post detail pages kept advertising "Coming Soon" long after the app was
   downloadable. Keep it here so there is exactly one switch.

   Note: Marea is iPhone-only. The web app exists for internal / production work
   but is NOT offered to end users. Android is referenced only in the landing
   footer as "coming soon" — don't add Android CTAs elsewhere without approval. */
import Icon from '../components/Icon'

export const APP_LIVE = true
export const APP_STORE_ID = '6763952659'
export const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`

/* The compact nav pill shared by /articles, /blog, and both detail pages.
   Renders a real App Store link post-launch and the old inert pill before it,
   so the pre-launch state stays one boolean away. */
export function AppStorePill({ className = '' }) {
  const base = 'bg-primary/80 text-on-primary rounded-full px-4 py-2 font-label text-[0.78rem] sm:text-[0.82rem] font-semibold flex items-center gap-1.5'

  if (!APP_LIVE) {
    return (
      <span className={`${base} ${className}`}>
        <Icon name="schedule" className="text-[16px]" />
        <span>Coming Soon</span>
      </span>
    )
  }

  return (
    <a
      href={APP_STORE_URL}
      className={`${base} ${className} hover:opacity-90 transition-opacity`}
    >
      <Icon name="phone_iphone" className="text-[16px]" />
      <span>Get the App</span>
    </a>
  )
}
