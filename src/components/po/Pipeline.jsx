import { useEffect, useRef, useState } from 'react'

/* How a month's paperwork becomes something the practice can read. Drawn as
   a schematic rather than described in prose — it is the clearest way to say
   "documents in, isolated data per practice, two views out" without showing
   a single screen. A packet travels the path on a loop. */

const SOURCES = ['Payroll register', 'EMR productivity', 'Bank statement', 'Vendor invoices']
const OUTPUTS = [
  ['Practice app', 'the people who do the work'],
  ['Group console', 'read-only, across practices'],
]

export function Pipeline() {
  const [on, setOn] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const mono = { fontFamily: 'var(--font-mono)' }
  const box = 'rounded-lg px-3 py-2.5 text-[11px] leading-snug'
  const boxStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(139,210,218,0.16)', color: 'rgba(255,255,255,0.8)' }

  return (
    <div ref={ref} className="grid lg:grid-cols-[1fr_auto_1.1fr_auto_1fr] gap-4 lg:gap-3 items-center">
      {/* in */}
      <div className="space-y-2">
        <p className="text-[9px] uppercase tracking-[0.18em] mb-2" style={{ ...mono, color: 'rgba(167,233,241,0.5)' }}>what arrives</p>
        {SOURCES.map((s, i) => (
          <div key={s} className={box} style={{ ...boxStyle, animationDelay: `${i * 90}ms` }}>{s}</div>
        ))}
      </div>

      <Arrow on={on} />

      {/* middle */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(139,210,218,0.08)', border: '1px solid rgba(139,210,218,0.26)' }}>
        <p className="text-[9px] uppercase tracking-[0.18em] mb-2.5" style={{ ...mono, color: '#8bd2da' }}>what we do with it</p>
        <div className="space-y-2">
          {[
            ['Parsers', 'known vendor formats, read exactly'],
            ['Document AI', 'anything we have not seen before'],
            ['Rules', 'settle-up, ratios, expirations, anomalies'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-lg px-3 py-2" style={{ background: 'rgba(0,0,0,0.22)' }}>
              <p className="text-[11px] text-white/90" style={mono}>{t}</p>
              <p className="text-[10px] text-white/45 leading-snug">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[9px] leading-snug" style={{ ...mono, color: 'rgba(167,233,241,0.55)' }}>
          one isolated dataset per practice · enforced in the database
        </p>
      </div>

      <Arrow on={on} delay="1.1s" />

      {/* out */}
      <div className="space-y-2">
        <p className="text-[9px] uppercase tracking-[0.18em] mb-2" style={{ ...mono, color: 'rgba(167,233,241,0.5)' }}>who reads it</p>
        {OUTPUTS.map(([t, d]) => (
          <div key={t} className="rounded-lg px-3 py-2.5" style={boxStyle}>
            <p className="text-[12px] text-white/90">{t}</p>
            <p className="text-[10px] text-white/45 leading-snug">{d}</p>
          </div>
        ))}
        <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(139,210,218,0.22)' }}>
          <p className="text-[12px] text-white/70">Your accountant&apos;s ledger</p>
          <p className="text-[10px] text-white/40 leading-snug">journal entries, posted — next on the roadmap</p>
        </div>
      </div>
    </div>
  )
}

/* A hairline with a packet that runs along it. Vertical on narrow screens. */
function Arrow({ on, delay = '0s' }) {
  return (
    <div className="relative h-8 lg:h-24 lg:w-10 flex items-center justify-center" aria-hidden="true">
      <span className="absolute lg:hidden h-full w-px" style={{ background: 'linear-gradient(180deg, transparent, rgba(139,210,218,0.4), transparent)' }} />
      <span className="absolute hidden lg:block w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,210,218,0.4), transparent)' }} />
      {on && (
        <span
          className="po-packet absolute h-1.5 w-1.5 rounded-full"
          style={{ background: '#8bd2da', boxShadow: '0 0 10px 2px rgba(139,210,218,0.6)', animationDelay: delay }}
        />
      )}
    </div>
  )
}
