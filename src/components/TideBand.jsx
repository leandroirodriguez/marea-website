/* ============================================================
   Marea tide band — the app's signature pattern, on the web.

   STYLE_GUIDE §7.1: "Hero wave orb in a full-bleed tide band — the
   animated orb sits in a band that escapes the column and fades
   cream → tone tint → cream, so the page appears to rise around the
   score. Never put the orb in a card."

   public/marea-orb.svg and marea-orb-motion.svg are the static
   artwork. The waves are inlined here instead of <img>-ed so they can
   actually drift — a flat orb reads as a logo, and the movement is the
   whole point of the pattern.

   Each wave path tiles at a 70-unit period and is drawn from x=-70 to
   x=350, so translating it exactly one period loops seamlessly. Two
   layers at different depths and speeds give the parallax. Motion is
   dropped entirely under prefers-reduced-motion (see index.css).
   ============================================================ */

/* One period = 70. Start far enough left that a -70 shift never
   exposes an edge inside the 280-wide viewBox. */
function wavePath(y) {
  const seg = []
  for (let x = 0; x <= 350; x += 35) seg.push(`T ${x} ${y}`)
  return `M-70 ${y} Q-52.5 ${y - 14} -35 ${y} ${seg.join(' ')} L350 280 L-70 280 Z`
}

export default function TideBand({ className = '' }) {
  return (
    <div
      className={`tide-band relative w-full overflow-hidden ${className}`}
      style={{
        background:
          'linear-gradient(to bottom, var(--color-surface) 0%, #e8f3f4 45%, var(--color-surface) 100%)',
      }}
    >
      <div className="flex justify-center py-14 md:py-20">
        <svg
          viewBox="0 0 280 280"
          className="w-[200px] h-[200px] md:w-[260px] md:h-[260px]"
          role="img"
          aria-label="The Marea Index orb, waves rising and falling"
        >
          <defs>
            <radialGradient id="tideOrbShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#005258" stopOpacity="0.28" />
              <stop offset="55%" stopColor="#005258" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#005258" stopOpacity="0" />
            </radialGradient>
            <clipPath id="tideOrbClip">
              <circle cx="140" cy="140" r="105" />
            </clipPath>
          </defs>

          {/* Ground shadow, so the orb sits in the band rather than on it. */}
          <ellipse cx="140" cy="180" rx="115" ry="60" fill="url(#tideOrbShadow)" />
          <circle cx="140" cy="140" r="105" fill="#d6e8ea" />

          <g clipPath="url(#tideOrbClip)">
            {/* Back wave: lighter, slower. */}
            <path className="tide-wave tide-wave--back" d={wavePath(96)} fill="#2A8A93" />
            {/* Front wave: brand teal, faster — the parallax read. */}
            <path className="tide-wave tide-wave--front" d={wavePath(116)} fill="#005258" />
          </g>

          {/* The two rings the app draws around the orb. */}
          <circle cx="140" cy="140" r="110" fill="none" stroke="#005258" strokeOpacity="0.2" strokeWidth="1.5" />
          <circle cx="140" cy="140" r="116" fill="none" stroke="#005258" strokeOpacity="0.08" strokeWidth="1" />
        </svg>
      </div>
    </div>
  )
}
