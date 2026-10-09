/* Typographic cover for an article that has no uploaded cover photo.

   Replaces the old Unsplash-by-category fallback. A library written by two
   practicing OB/GYNs lost credibility under random stock photos of women
   stretching on beaches; a category word set in the house serif over the
   category's tone reads as ours, matches the app, and never repeats a photo
   another site is using. The article's title is NOT repeated here — it sits
   beneath the art in every card, and showing it twice looked redundant. */

const TONES = {
  Sleep:         ['#0D3F44', '#8bd2da'],
  Mood:          ['#715b33', '#fddfac'],
  'Brain fog':   ['#005258', '#a7eef6'],
  'Hot flashes': ['#842b16', '#f3c9b8'],
  HRT:           ['#1b6b72', '#a1e9f1'],
  Lifestyle:     ['#2A8A93', '#d8eef0'],
  Intimacy:      ['#a4422b', '#fde0d4'],
}

export default function ArticleArt({ category, className = '', compact = false }) {
  const [bg, fg] = TONES[category] || TONES.Lifestyle
  return (
    <div
      className={`relative overflow-hidden flex items-end ${compact ? 'p-1.5' : 'p-5'} ${className}`}
      style={{ background: bg }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
        className="absolute left-0 right-0 bottom-0 w-full"
        style={{ height: compact ? '40%' : '46%', opacity: 0.16 }}
      >
        <path
          d="M0 28 C 50 8, 90 48, 140 30 S 230 6, 280 30 S 360 50, 400 24 L400 60 L0 60 Z"
          fill={fg}
        />
        <path
          d="M0 42 C 60 24, 110 56, 170 40 S 260 20, 320 42 S 380 56, 400 40 L400 60 L0 60 Z"
          fill={fg}
          opacity="0.7"
        />
      </svg>
      {!compact && (
        <span
          className="relative font-headline italic"
          style={{
            color: fg,
            fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)',
            lineHeight: 1,
            letterSpacing: '-0.015em',
            fontWeight: 300,
          }}
        >
          {category || 'Marea'}
        </span>
      )}
    </div>
  )
}
