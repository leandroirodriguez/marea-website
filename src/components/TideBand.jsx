import { useEffect, useRef, useState } from 'react'

/* ============================================================
   Marea tide band — the app's signature pattern, on the web.

   STYLE_GUIDE §7.1: "Hero wave orb in a full-bleed tide band — the
   animated orb sits in a band that escapes the column and fades
   cream → tone tint → cream, so the page appears to rise around the
   score. Never put the orb in a card."

   This is a port of the app's WaveCanvas (components/TideScoreSection.jsx),
   not a lookalike: same water level (fill height = score), same three
   summed sine harmonics per layer, same turbulence-driven amplitude,
   speed and frequency, same two-layer fill, same easing constant. What
   differs is only what drives the score — the app reads a real composite,
   this cycles a scripted loop so a visitor sees what the Index does.

   The loop walks the four bands from lib/tidescore.js tideLabel():
   High tide (>=80) -> Steady current (>=60) -> Shifting waters (>=40) ->
   Low tide (<40), and back up. Water drops, waves get choppier, and the
   whole band turns from teal to warm as it goes — which is the product
   demo, not decoration.

   Nothing here runs under prefers-reduced-motion: the canvas holds a
   single calm frame and the copy stops cycling.
   ============================================================ */

/* Ported verbatim from lib/tidescore.js tideLabel(). Keep in sync. */
const BANDS = [
  { score: 88, label: 'High tide',       sub: 'Your rhythm is flowing strong today.',    turbulence: 0.08, tone: 'calm' },
  { score: 68, label: 'Steady current',  sub: 'A balanced day. Some waves, manageable.', turbulence: 0.3,  tone: 'calm' },
  { score: 48, label: 'Shifting waters', sub: 'Choppy conditions. Be gentle with yourself.', turbulence: 0.6, tone: 'warm' },
  { score: 27, label: 'Low tide',        sub: 'Rest and restore. The tide always turns.', turbulence: 1.0,  tone: 'warm' },
]

/* Up the scale and back down, so the loop never hard-cuts from 27 to 88. */
const CYCLE = [0, 1, 2, 3, 2, 1]
const HOLD_MS = 3400

const ORB_BG = { warm: '#e8c8c0', calm: '#d6e8ea' }

/* Same stops the app uses for the band behind the orb (§1 Clear / Rough). */
const BAND_BG = {
  warm: 'linear-gradient(180deg, rgba(240,228,218,0) 0%, rgba(240,228,218,0.85) 26%, rgba(236,224,216,0.62) 66%, rgba(252,249,244,0) 100%)',
  calm: 'linear-gradient(180deg, rgba(216,238,240,0) 0%, rgba(216,238,240,0.85) 26%, rgba(221,238,232,0.6) 66%, rgba(252,249,244,0) 100%)',
}

const RING = { warm: 'rgba(132,43,22,', calm: 'rgba(0,82,88,' }

const SHADOW = {
  warm: '0 20px 60px rgba(132,43,22,0.25), 0 4px 12px rgba(132,43,22,0.15)',
  calm: '0 20px 60px rgba(0,82,88,0.22), 0 4px 12px rgba(0,82,88,0.12)',
}

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/* Frame-rate-independent easing.
   The app eases per frame (`x += (target - x) * 0.04`), which converges twice
   as fast on a 120Hz phone as on a 60Hz one and crawls in a throttled tab. On
   the web that matters: the label switches on a wall-clock timer, so if the
   water eases on a frame clock the two visibly disagree — the copy reads "Low
   tide" while the orb still shows 86.

   Same curve, expressed against elapsed time: these k values reproduce the
   app's 60Hz feel exactly (k = -60 * ln(1 - perFrame)). */
const K_WATER = 2.45   // was 0.04/frame
const K_COUNT = 3.71   // was 0.06/frame

/* dt must be clamped at BOTH ends. Above, so a backgrounded tab doesn't resume
   with one enormous step; below, because a negative dt flips (1 - e^-k·dt)
   negative and the "easing" diverges instead of converging — rAF timestamps
   are not guaranteed to be later than a performance.now() read taken outside
   the callback, and that overshoot renders as an 11-digit score. */
function stepTime(now, last) {
  return Math.min(Math.max((now - last) / 1000, 0), 0.05)
}

function approach(current, target, k, dt) {
  return current + (target - current) * (1 - Math.exp(-k * dt))
}

/* The app's WaveCanvas. Target score/turbulence/tone are read through refs so
   the animation loop is never torn down and restarted mid-transition — the
   water has to glide between levels, not jump. */
function WaveCanvas({ score, turbulence, tone, size = 210 }) {
  const ref = useRef(null)
  const animRef = useRef(null)
  const t = useRef(0)
  const scoreRef = useRef(score)
  const turbRef = useRef(turbulence)
  const toneRef = useRef(tone)
  const displayRef = useRef(score)
  const turbDisplayRef = useRef(turbulence)

  useEffect(() => { scoreRef.current = score }, [score])
  useEffect(() => { turbRef.current = turbulence }, [turbulence])
  useEffect(() => { toneRef.current = tone }, [tone])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)
    const w = size, h = size
    const still = prefersReducedMotion()

    let last = performance.now()

    function draw(now = performance.now()) {
      const dt = stepTime(now, last)
      last = now

      displayRef.current = approach(displayRef.current, scoreRef.current, K_WATER, dt)
      turbDisplayRef.current = approach(turbDisplayRef.current, turbRef.current, K_WATER, dt)
      const s = displayRef.current
      const turb = turbDisplayRef.current
      const activeTone = toneRef.current
      t.current += dt

      ctx.clearRect(0, 0, w, h)

      const fillH = h * (s / 100)
      const baseY = h - fillH
      const amp = 5 + turb * 22
      const speed = 0.35 + turb * 1.4
      const freq = 0.011 + turb * 0.01

      const g = ctx.createLinearGradient(0, baseY - amp * 2, 0, h)
      if (activeTone === 'warm') {
        g.addColorStop(0, 'rgba(132,43,22,0.78)')
        g.addColorStop(1, 'rgba(90,26,12,1)')
      } else {
        g.addColorStop(0, 'rgba(0,82,88,0.82)')
        g.addColorStop(1, 'rgba(26,122,130,1)')
      }
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 2) {
        const w1 = Math.sin(x * freq + t.current * speed) * amp
        const w2 = Math.sin(x * freq * 1.8 + t.current * speed * 0.75) * amp * 0.45
        const w3 = Math.sin(x * freq * 2.9 + t.current * speed * 1.2) * amp * 0.2
        ctx.lineTo(x, baseY + w1 + w2 + w3)
      }
      ctx.lineTo(w, h)
      ctx.closePath()
      ctx.fill()

      const g2 = ctx.createLinearGradient(0, baseY, 0, h)
      g2.addColorStop(0, activeTone === 'warm' ? 'rgba(132,43,22,0.13)' : 'rgba(0,82,88,0.13)')
      g2.addColorStop(1, activeTone === 'warm' ? 'rgba(132,43,22,0.27)' : 'rgba(0,82,88,0.27)')
      ctx.fillStyle = g2
      ctx.beginPath()
      ctx.moveTo(0, h)
      for (let x = 0; x <= w; x += 2) {
        const w1 = Math.sin(x * freq * 0.85 + t.current * speed * 1.35 + 2.1) * amp * 0.75
        const w2 = Math.sin(x * freq * 2.2 + t.current * speed * 0.55) * amp * 0.3
        ctx.lineTo(x, baseY + amp * 0.6 + w1 + w2)
      }
      ctx.lineTo(w, h)
      ctx.closePath()
      ctx.fill()

      if (!still) animRef.current = requestAnimationFrame(draw)
    }

    if (still) {
      // Settle straight onto the target instead of easing toward it.
      displayRef.current = scoreRef.current
      turbDisplayRef.current = turbRef.current
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [size])

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size, borderRadius: '50%', display: 'block' }}
    />
  )
}

export default function TideBand({ className = '' }) {
  const [step, setStep] = useState(0)
  const band = BANDS[CYCLE[step]]

  // The number counts rather than snapping, matching the water's easing.
  const [shown, setShown] = useState(band.score)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = setInterval(() => setStep(s => (s + 1) % CYCLE.length), HOLD_MS)
    return () => clearInterval(id)
  }, [])

  // The value lives in a ref and the raf loop owns it; setShown only mirrors it
  // into render. Scheduling the next frame from inside a setState updater would
  // double-schedule under StrictMode, which double-invokes updaters.
  const shownRef = useRef(band.score)

  useEffect(() => {
    const target = band.score
    // Under reduced motion the cycle never advances, so `shown` still holds its
    // initial value — which is this target. Nothing to animate or correct.
    if (prefersReducedMotion()) return
    let raf
    let last = performance.now()
    const tick = (now = performance.now()) => {
      const dt = stepTime(now, last)
      last = now
      const next = approach(shownRef.current, target, K_COUNT, dt)
      const done = Math.abs(target - next) < 0.5
      shownRef.current = done ? target : next
      setShown(shownRef.current)
      if (!done) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [band.score])

  const tone = band.tone

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ background: BAND_BG[tone], transition: 'background .9s ease' }}
    >
      <div className="flex flex-col items-center px-6 py-14 md:py-20">
        <div
          className="relative mb-6"
          style={{
            width: 210, height: 210, borderRadius: '50%',
            background: ORB_BG[tone],
            boxShadow: SHADOW[tone],
            transition: 'background .9s, box-shadow .9s',
          }}
        >
          <WaveCanvas score={band.score} turbulence={band.turbulence} tone={tone} />

          {/* The two rings the app draws around the orb. */}
          <div className="absolute rounded-full pointer-events-none"
            style={{ inset: -5, border: `1.5px solid ${RING[tone]}0.2)`, transition: 'border-color .9s' }} />
          <div className="absolute rounded-full pointer-events-none"
            style={{ inset: -11, border: `1px solid ${RING[tone]}0.08)`, transition: 'border-color .9s' }} />

          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full pointer-events-none">
            <div
              className="font-headline text-white"
              style={{ fontSize: 54, fontWeight: 400, lineHeight: 1, textShadow: '0 2px 14px rgba(0,0,0,0.25)' }}
            >
              {Math.round(shown)}
            </div>
            <div
              className="font-label uppercase"
              style={{ fontSize: 9, letterSpacing: '.2em', color: 'rgba(255,255,255,0.85)', marginTop: 3 }}
            >
              Marea Index
            </div>
          </div>
        </div>

        {/* Label and phrasing come straight from tideLabel(). Fixed height so
            the section below doesn't shift as the copy changes length. */}
        <div className="text-center min-h-[4.5rem]" aria-live="polite">
          <p
            className="font-headline text-on-background mb-1"
            style={{ fontSize: '1.35rem', fontWeight: 400, transition: 'color .9s' }}
          >
            {band.label}
          </p>
          <p className="text-on-surface-variant text-[0.88rem] font-light max-w-[22rem] mx-auto leading-relaxed">
            {band.sub}
          </p>
        </div>
      </div>
    </div>
  )
}
