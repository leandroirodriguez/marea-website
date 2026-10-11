import { useEffect, useRef, useState } from 'react'

/* Three small, looping illustrations of what the software actually does —
   drawn, not screenshotted, so the page shows the mechanism without showing
   a customer's data or giving away a whole screen.

   Each runs a short step sequence, pauses at the end, and replays. They only
   run while on screen, and stop entirely under prefers-reduced-motion (where
   the final state is shown instead, so the point still lands). */

const REDUCED = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Advances 0 → steps-1 on `ms`, holds, restarts. Paused until visible. */
function useSequence(steps, ms = 1100, hold = 2600) {
  const [i, setI] = useState(0)
  const [on, setOn] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!on) return
    if (REDUCED()) { setI(steps - 1); return }
    const last = i >= steps - 1
    const t = setTimeout(() => setI(last ? 0 : i + 1), last ? hold : ms)
    return () => clearTimeout(t)
  }, [i, on, steps, ms, hold])

  return [i, ref]
}

const panel = {
  background: '#06282c',
  border: '1px solid rgba(139,210,218,0.16)',
  boxShadow: '0 20px 50px -24px rgba(0,30,34,0.6)',
}
/* Side by side the three stand at one height so the captions beneath them
   line up; stacked on a phone each takes the height it needs. */
const PANEL_CLASS = 'rounded-2xl overflow-hidden flex flex-col lg:h-[39rem]'

const mono = { fontFamily: 'var(--font-mono)' }

function Chrome({ label }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: 'rgba(139,210,218,0.14)' }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(139,210,218,0.5)' }} />
      <p className="text-[10px] uppercase tracking-[0.18em]" style={{ ...mono, color: 'rgba(167,233,241,0.6)' }}>{label}</p>
    </div>
  )
}

/* ── 1. The invoice that costs more than it used to ───────────────── */

const HISTORY = [38, 41, 39, 42, 40, 43, 41, 44, 42, 43, 45, 53]

export function VendorWatch() {
  const [step, ref] = useSequence(4, 1200)
  const extracted = step >= 1
  const compared = step >= 2
  const flagged = step >= 3

  return (
    <div ref={ref} className={PANEL_CLASS} style={panel}>
      <Chrome label="vendors · inbound" />
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* the document */}
        <div
          className="rounded-lg p-3.5 transition-all duration-500"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,210,218,0.12)' }}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.16em] mb-1" style={{ ...mono, color: 'rgba(167,233,241,0.5)' }}>invoice.pdf</p>
              <p className="text-sm text-white/90">Clinical supply vendor</p>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider transition-opacity duration-500"
              style={{ ...mono, background: 'rgba(139,210,218,0.14)', color: '#8bd2da', opacity: step === 0 ? 1 : 0.35 }}
            >
              {step === 0 ? 'reading' : 'read'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[['vendor', 'matched'], ['date', '09 / 2026'], ['total', '$5,312.00']].map(([k, v], i) => (
              <div
                key={k}
                className="rounded px-2 py-1.5 transition-all duration-500"
                style={{
                  background: extracted ? 'rgba(139,210,218,0.10)' : 'rgba(255,255,255,0.03)',
                  transform: extracted ? 'none' : 'translateY(4px)',
                  opacity: extracted ? 1 : 0.4,
                  transitionDelay: `${i * 120}ms`,
                }}
              >
                <p className="text-[8px] uppercase tracking-[0.14em]" style={{ ...mono, color: 'rgba(167,233,241,0.5)' }}>{k}</p>
                <p className="text-[11px] text-white/85 truncate" style={mono}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* twelve months of what this vendor has charged */}
        <div className="mt-3 rounded-lg p-3.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(139,210,218,0.12)' }}>
          <div className="flex items-baseline justify-between mb-2.5">
            <p className="text-[9px] uppercase tracking-[0.16em]" style={{ ...mono, color: 'rgba(167,233,241,0.5)' }}>same vendor · 12 months</p>
            <p className="text-[9px] transition-opacity duration-500" style={{ ...mono, color: 'rgba(167,233,241,0.4)', opacity: compared ? 1 : 0 }}>avg $4,490</p>
          </div>
          <div className="flex items-end gap-[3px] h-14">
            {HISTORY.map((h, i) => {
              const isLast = i === HISTORY.length - 1
              return (
                <span
                  key={i}
                  className="flex-1 rounded-sm transition-all duration-500"
                  style={{
                    height: compared ? `${(h / 53) * 100}%` : '6%',
                    background: isLast ? (flagged ? '#e0922f' : '#8bd2da') : 'rgba(139,210,218,0.32)',
                    transitionDelay: `${i * 35}ms`,
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* the finding */}
        <div
          className="mt-auto pt-3 flex items-center gap-3 rounded-lg px-3.5 py-3 transition-all duration-500"
          style={{
            background: flagged ? 'rgba(224,146,47,0.14)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${flagged ? 'rgba(224,146,47,0.4)' : 'rgba(139,210,218,0.08)'}`,
            opacity: flagged ? 1 : 0.25,
            transform: flagged ? 'none' : 'translateY(6px)',
          }}
        >
          <span className="text-lg leading-none" style={{ color: '#e0922f' }}>↑</span>
          <div className="min-w-0">
            <p className="text-[12px] sm:text-[13px] text-white/90 leading-snug">
              <b className="font-semibold">18% above</b> this vendor&apos;s twelve-month average.
            </p>
            <p className="text-[10px] mt-0.5" style={{ ...mono, color: 'rgba(167,233,241,0.55)' }}>
              → operations inbox · office manager
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── 2. The license nobody was watching ───────────────────────────── */

const CREDS = [
  ['Florida license', 412, 'ok'],
  ['DEA registration', 61, 'soon'],
  ['Malpractice COI', 203, 'ok'],
  ['BLS certification', 18, 'urgent'],
]

export function ComplianceWatch() {
  const [step, ref] = useSequence(3, 1300)
  return (
    <div ref={ref} className={PANEL_CLASS} style={panel}>
      <Chrome label="compliance · watch" />
      <div className="p-4 sm:p-5 space-y-1.5 flex-1 flex flex-col">
        {CREDS.map(([name, days, state], i) => {
          const lit = step >= 1 && state !== 'ok'
          const colour = state === 'urgent' ? '#e05a4a' : state === 'soon' ? '#e0922f' : '#8bd2da'
          return (
            <div
              key={name}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-500"
              style={{
                background: lit ? `${colour}1f` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${lit ? `${colour}55` : 'rgba(139,210,218,0.10)'}`,
                transitionDelay: `${i * 90}ms`,
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: colour }} />
              <span className="flex-1 min-w-0 truncate text-[12px] text-white/80">{name}</span>
              <span className="text-[11px] tabular-nums" style={{ ...mono, color: lit ? colour : 'rgba(167,233,241,0.45)' }}>
                {days}d
              </span>
            </div>
          )
        })}
        <div
          className="flex items-center gap-2 pt-3 mt-auto transition-opacity duration-500"
          style={{ opacity: step >= 2 ? 1 : 0 }}
        >
          <span className="text-[10px]" style={{ ...mono, color: 'rgba(167,233,241,0.55)' }}>
            → 2 renewals raised · 90 days out · nobody had to remember
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── 3. The task only one person can do ───────────────────────────── */

const GRID = [
  [2, 2, 1, 2, 0],
  [2, 1, 0, 2, 2],
  [1, 2, 2, 0, 1],
  [2, 0, 0, 1, 2],
]
const SOLE_ROW = 3

export function CoverageWatch() {
  const [step, ref] = useSequence(3, 1250)
  const tint = (v) => (v === 2 ? '#0d7f8c' : v === 1 ? 'rgba(139,210,218,0.35)' : 'rgba(255,255,255,0.07)')
  return (
    <div ref={ref} className={PANEL_CLASS} style={panel}>
      <Chrome label="staffing · coverage" />
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <div className="flex gap-3">
          <div className="flex flex-col justify-around pr-1 text-right">
            {['Prior auths', 'Colposcopy', 'Referrals', 'Sterile proc.'].map((t, r) => (
              <p
                key={t}
                className="text-[10px] leading-tight transition-colors duration-500"
                style={{ ...mono, color: step >= 2 && r === SOLE_ROW ? '#e0922f' : 'rgba(167,233,241,0.5)' }}
              >
                {t}
              </p>
            ))}
          </div>
          <div className="flex-1 grid grid-rows-4 gap-2">
            {GRID.map((row, r) => (
              <div key={r} className="grid grid-cols-5 gap-1.5">
                {row.map((v, c) => {
                  const hidden = step >= 1 && c === 1
                  const sole = step >= 2 && r === SOLE_ROW
                  return (
                    <span
                      key={c}
                      className="rounded h-9 transition-all duration-500"
                      style={{
                        background: hidden ? 'rgba(255,255,255,0.05)' : tint(v),
                        outline: sole && v > 0 && !hidden ? '1.5px solid #e0922f' : 'none',
                        opacity: hidden ? 0.3 : 1,
                        transitionDelay: `${c * 50}ms`,
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <p
          className="mt-auto pt-4 text-[10px] leading-snug transition-opacity duration-500"
          style={{ ...mono, color: step >= 1 ? 'rgba(167,233,241,0.6)' : 'rgba(167,233,241,0)' }}
        >
          {step >= 2
            ? '→ one person left who can run sterile processing. cross-train, or carry the risk.'
            : '→ simulating: one medical assistant leaves'}
        </p>
      </div>
    </div>
  )
}
