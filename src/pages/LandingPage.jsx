import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { articleImage } from '../lib/images'
import mareaLogo from '../assets/marealogo.svg'

/* ─── Data constants ─── */

const QUESTION_DATA = {
  domain: 'Menstrual cycles',
  number: 2,
  total: 15,
  text: 'How would you describe your menstrual cycle pattern in the last 12 months?',
  options: [
    'Regular and predictable — consistent cycle length',
    'Mostly regular but cycle length varies by 7+ days from my normal',
    'Irregular — I\'ve skipped one or more periods (gaps of 60+ days)',
    'I haven\'t had a period in 3–11 months',
    'I haven\'t had a period in 12+ months',
  ],
  selectedIndex: 2,
}

const STAGE_RESULT = { label: 'Late Menopausal Transition', straw: '-1', color: '#715b33' }

const SYMPTOM_SCORES = [
  { key: 'sleep', label: 'Sleep', pct: 71, color: '#842b16' },
  { key: 'mood', label: 'Mood', pct: 57, color: '#715b33' },
  { key: 'cog', label: 'Brain fog', pct: 50, color: '#005258' },
  { key: 'vaso', label: 'Hot flashes', pct: 40, color: '#a4422b' },
  { key: 'cyc', label: 'Cycles', pct: 64, color: '#1b6b72' },
]

const DAILY_INSIGHT_TEXT =
  'Estrogen and serotonin are deeply linked. When estrogen drops sharply, serotonin drops with it. The emotional volatility is neurochemistry, not weakness.'

const SYMPTOM_DOMAINS = [
  { icon: 'thermostat',     label: 'Hot flashes',  target: 3, desc: 'Noticeable flash' },
  { icon: 'water_drop',     label: 'Night sweats', target: 2, desc: 'Mild' },
  { icon: 'bedtime',        label: 'Sleep',        target: 2, desc: 'Mostly ok' },
  { icon: 'sentiment_calm', label: 'Mood',         target: 3, desc: 'Irritable/low' },
  { icon: 'bolt',           label: 'Energy',       target: 3, desc: 'Moderate' },
  { icon: 'neurology',      label: 'Focus',        target: 3, desc: 'Some fog' },
]

const SYMPTOM_SAVED_INDEX = 6

const INSIGHT_CATEGORIES = ['All', 'Sleep', 'Mood', 'Brain fog', 'Hot flashes', 'HRT']

const INSIGHT_ARTICLES = [
  { title: 'Why Sleep Falls Apart in Perimenopause', category: 'Sleep', time: '6 min', icon: 'bedtime' },
  { title: 'The Estrogen-Serotonin Connection', category: 'Mood', time: '5 min', icon: 'sentiment_calm' },
  { title: 'Brain Fog Is Not Early Dementia', category: 'Brain fog', time: '4 min', icon: 'neurology' },
  { title: 'HRT: What the Evidence Actually Says', category: 'HRT', time: '8 min', icon: 'medication' },
]

const SLEEP_PARAGRAPHS = [
  'Progesterone is a natural sedative — it binds the same brain receptors as sleep medication. When it declines, the sedative effect disappears.',
  'Estrogen fluctuation then narrows your thermoneutral zone, triggering night sweats. Two separate mechanisms, one broken night\'s sleep.',
  'The 2–4am waking pattern is particularly common. Cortisol, which normally stays low until morning, begins spiking earlier as estrogen loses its regulatory hold on the HPA axis.',
  'Deep sleep (stages 3 and 4) decreases measurably during perimenopause. You may sleep the same number of hours but wake feeling unrestored — this is not imagined.',
  'Melatonin production also shifts. Estrogen supports melatonin synthesis in the pineal gland. As estrogen fluctuates, your circadian rhythm becomes less precise.',
  'What helps: Evidence supports magnesium glycinate (300–400mg before bed), keeping the bedroom below 65°F, and discussing progesterone with your provider if sleep remains disrupted.',
]

const SLEEP_STAT = {
  value: '80%',
  text: 'of women in perimenopause report sleep disruption as their most impactful symptom.',
}

/* ─── Sub-components ─── */

function AssessmentDemo() {
  const [step, setStep] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    const sequence = [
      [1, 1400], [2, 700], [3, 1100], [4, 700],
      [5, 350], [6, 350], [7, 350], [8, 350],
      [9, 600], [10, 5000], [0, 100],
    ]

    function run() {
      setStep(0)
      let acc = 0
      sequence.forEach(([s, delay]) => {
        acc += delay
        setTimeout(() => setStep(s), acc)
      })
    }

    run()
    const total = sequence.reduce((a, [, d]) => a + d, 0)
    timerRef.current = setInterval(run, total)
    return () => clearInterval(timerRef.current)
  }, [])

  const showResults = step >= 3
  const barIndex = step >= 4 ? step - 4 : -1
  const showInsight = step >= 9

  return (
    <div
      className="w-full max-w-sm mx-auto rounded-2xl shadow-lg border border-outline-variant/10 overflow-hidden relative"
      style={{ background: '#fcf9f4', height: '560px' }}
    >
      {/* Question view */}
      <div
        className="absolute inset-0 flex flex-col"
        style={{
          opacity: +!showResults,
          transform: showResults ? 'scale(0.97) translateY(-12px)' : 'scale(1) translateY(0)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          pointerEvents: showResults ? 'none' : 'auto',
          zIndex: +!showResults,
        }}
      >
        <div className="px-5 pt-5 pb-1">
          <div className="h-[3px] w-full bg-surface-variant rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: '13%', background: '#005258', transition: 'width 0.5s ease' }}
            />
          </div>
          <p className="text-[10px] font-label uppercase tracking-wider text-outline mt-1">
            Question {QUESTION_DATA.number} of {QUESTION_DATA.total}
          </p>
        </div>
        <div className="px-5 pt-2 pb-2 flex-1 flex flex-col min-h-0">
          <p className="text-[9px] font-label uppercase tracking-[0.12em] text-primary-container mb-1">
            {QUESTION_DATA.domain}
          </p>
          <h3
            className="font-headline text-[1.05rem] text-on-background mb-3"
            style={{ lineHeight: 1.3, fontWeight: 400 }}
          >
            {QUESTION_DATA.text}
          </h3>
          <div className="flex flex-col gap-1.5 flex-1 overflow-hidden">
            {QUESTION_DATA.options.map((opt, n) => {
              const selected = step >= 1 && n === QUESTION_DATA.selectedIndex
              return (
                <div
                  key={n}
                  className="flex items-start gap-2 rounded-lg px-2.5 py-2"
                  style={{
                    border: `1.5px solid ${selected ? '#005258' : 'rgba(190,200,201,0.25)'}`,
                    background: selected ? 'rgba(0,82,88,0.05)' : '#fff',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
                    style={{
                      border: `2px solid ${selected ? '#005258' : '#bec8c9'}`,
                      background: selected ? '#005258' : 'transparent',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {selected && (
                      <span className="material-symbols-outlined text-white" style={{ fontSize: '8px' }}>
                        check
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[11px] leading-snug text-on-background"
                    style={{ fontWeight: selected ? 500 : 300, transition: 'font-weight 0.3s' }}
                  >
                    {opt}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="px-5 pb-4">
          <div
            className="w-full rounded-full py-2.5 text-center text-xs font-medium text-white"
            style={{ background: '#842b16', opacity: step >= 2 ? 1 : 0.3, transition: 'opacity 0.3s ease' }}
          >
            Continue
          </div>
        </div>
      </div>

      {/* Results view */}
      <div
        className="absolute inset-0 flex flex-col"
        style={{
          opacity: +!!showResults,
          transform: showResults ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(12px)',
          transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
          pointerEvents: showResults ? 'auto' : 'none',
          zIndex: +!!showResults,
        }}
      >
        <div className="px-5 pt-6 pb-4" style={{ background: '#0D3F44' }}>
          <p
            className="text-[9px] font-label uppercase tracking-[0.12em] mb-2"
            style={{ color: '#e8755a' }}
          >
            Your profile is ready
          </p>
          <h3
            className="font-headline text-lg text-white mb-1"
            style={{ lineHeight: 1.25, fontWeight: 400 }}
          >
            Your body isn&apos;t betraying you. It&apos;s changing.
          </h3>
          <p
            className="text-[11px] font-light"
            style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}
          >
            Here&apos;s a preview of what we found.
          </p>
        </div>
        <div className="flex-1 px-4 py-3 pb-5 flex flex-col gap-3 overflow-hidden">
          <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
            <p className="text-[9px] font-label uppercase tracking-[0.12em] text-primary-container mb-1">
              Your stage
            </p>
            <h4 className="font-headline text-base text-on-background" style={{ fontWeight: 400 }}>
              {STAGE_RESULT.label}
            </h4>
            <p className="text-[10px] text-outline mt-0.5">
              STRAW+10 stage: <strong className="text-primary">{STAGE_RESULT.straw}</strong>
            </p>
          </div>
          <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
            <p className="text-[9px] font-label uppercase tracking-[0.12em] text-primary-container mb-2.5">
              Symptom domain scores
            </p>
            <div className="flex flex-col gap-2.5">
              {SYMPTOM_SCORES.map((s, t) => {
                const visible = barIndex >= t
                const severity = s.pct > 66 ? 'High' : s.pct > 33 ? 'Moderate' : 'Low'
                return (
                  <div key={s.key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] font-medium text-on-background">{s.label}</span>
                      <span
                        className="text-[10px] text-outline"
                        style={{ opacity: +!!visible, transition: 'opacity 0.3s' }}
                      >
                        {severity}
                      </span>
                    </div>
                    <div className="h-[4px] bg-surface-variant rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: visible ? `${s.pct}%` : '0%',
                          background: s.color,
                          transition: 'width 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: '#005258',
              opacity: +!!showInsight,
              transform: showInsight ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}
          >
            <div className="flex items-start gap-2.5">
              <span
                className="material-symbols-outlined shrink-0 mt-0.5"
                style={{ fontSize: '14px', color: '#8bd2da' }}
              >
                lightbulb
              </span>
              <div>
                <p
                  className="text-[8px] font-label uppercase tracking-[0.15em] mb-1"
                  style={{ color: '#8bd2da' }}
                >
                  Daily Insight
                </p>
                <p
                  className="text-[11px] leading-relaxed font-light"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  {DAILY_INSIGHT_TEXT}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InsightsDemo() {
  const [step, setStep] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    const sequence = [
      [1, 1600], [2, 500], [3, 1000], [4, 900],
      [5, 1400], [6, 1400], [7, 1000], [8, 4000], [0, 100],
    ]

    function run() {
      setStep(0)
      setScrollY(0)
      let acc = 0
      sequence.forEach(([s, delay]) => {
        acc += delay
        setTimeout(() => {
          setStep(s)
          if (s === 5) setScrollY(80)
          if (s === 6) setScrollY(160)
          if (s === 7) setScrollY(210)
          if (s === 0) setScrollY(0)
        }, acc)
      })
    }

    run()
    const total = sequence.reduce((a, [, d]) => a + d, 0)
    timerRef.current = setInterval(run, total)
    return () => clearInterval(timerRef.current)
  }, [])

  const activeCategory = step >= 1 ? 'Sleep' : 'All'
  const filteredArticles = step >= 2 ? INSIGHT_ARTICLES.filter((a) => a.category === 'Sleep') : INSIGHT_ARTICLES
  const isSelected = step >= 3
  const showArticle = step >= 4
  const showStat = step >= 7

  return (
    <div
      className="w-full rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.08)', minHeight: '380px' }}
    >
      <div
        className="flex gap-1.5 px-4 pt-4 pb-3 overflow-hidden"
        style={{
          opacity: +!showArticle,
          height: showArticle ? 0 : 'auto',
          paddingTop: showArticle ? 0 : undefined,
          paddingBottom: showArticle ? 0 : undefined,
          transition: 'all 0.4s ease',
        }}
      >
        {INSIGHT_CATEGORIES.map((cat) => {
          const active = cat === activeCategory
          return (
            <div
              key={cat}
              className="shrink-0 rounded-full px-3 py-1 text-[10px] font-label whitespace-nowrap"
              style={{
                background: active ? '#fff' : 'rgba(255,255,255,0.1)',
                color: active ? '#005258' : 'rgba(255,255,255,0.5)',
                fontWeight: active ? 600 : 400,
                transition: 'all 0.3s ease',
              }}
            >
              {cat}
            </div>
          )
        })}
      </div>
      <div className="px-4 pb-4">
        {showArticle ? (
          <div className="overflow-hidden" style={{ maxHeight: '280px' }}>
            <div
              style={{
                transform: `translateY(-${scrollY}px)`,
                transition: 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            >
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '14px', color: '#8bd2da' }}
                  >
                    bedtime
                  </span>
                  <span
                    className="text-[9px] font-label uppercase tracking-wider"
                    style={{ color: '#8bd2da' }}
                  >
                    Sleep · 6 min read
                  </span>
                </div>
                <h4
                  className="font-headline text-[15px] text-white mb-1"
                  style={{ lineHeight: 1.3 }}
                >
                  Why Sleep Falls Apart in Perimenopause
                </h4>
                <div className="flex items-center gap-1.5 mb-3">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '11px', color: '#8bd2da' }}
                  >
                    verified
                  </span>
                  <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Dr. Rodriguez, MD, FACOG
                  </span>
                </div>
                <div className="h-px mb-3" style={{ background: 'rgba(255,255,255,0.1)' }} />
              </div>
              <div className="flex flex-col gap-3">
                {SLEEP_PARAGRAPHS.map((p, i) => (
                  <p
                    key={i}
                    className="text-[11px] font-light leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                  >
                    {p}
                  </p>
                ))}
              </div>
              <div
                className="mt-4 rounded-lg px-4 py-3 flex items-start gap-3"
                style={{
                  background: 'rgba(253,223,172,0.1)',
                  border: '1px solid rgba(253,223,172,0.15)',
                  opacity: +!!showStat,
                  transition: 'opacity 0.4s ease',
                }}
              >
                <span
                  className="font-headline text-lg shrink-0"
                  style={{ color: '#dfc392', lineHeight: 1 }}
                >
                  {SLEEP_STAT.value}
                </span>
                <p
                  className="text-[10px] font-light leading-snug"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {SLEEP_STAT.text}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredArticles.map((article, t) => {
              const highlighted = isSelected && t === 0
              return (
                <div
                  key={article.title}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                  style={{
                    background: highlighted ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                    border: highlighted
                      ? '1px solid rgba(255,255,255,0.2)'
                      : '1px solid transparent',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <span
                    className="material-symbols-outlined shrink-0"
                    style={{
                      fontSize: '18px',
                      color: highlighted ? '#8bd2da' : 'rgba(255,255,255,0.3)',
                      transition: 'color 0.3s',
                    }}
                  >
                    {article.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[11px] leading-snug truncate"
                      style={{
                        color: highlighted ? '#fff' : 'rgba(255,255,255,0.7)',
                        fontWeight: highlighted ? 500 : 300,
                        transition: 'all 0.3s',
                      }}
                    >
                      {article.title}
                    </p>
                    <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {article.category} · {article.time} read
                    </p>
                  </div>
                  {highlighted && (
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '14px', color: '#8bd2da' }}
                    >
                      arrow_forward
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function SymptomTrackerDemo() {
  const [activeIndex, setActiveIndex] = useState(-1)
  const [saved, setSaved] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    function run() {
      setActiveIndex(-1)
      setSaved(false)
      SYMPTOM_DOMAINS.forEach((_, n) => {
        setTimeout(() => setActiveIndex(n), 800 + n * 700)
      })
      setTimeout(() => {
        setActiveIndex(SYMPTOM_SAVED_INDEX)
        setSaved(true)
      }, 800 + SYMPTOM_DOMAINS.length * 700 + 400)
      setTimeout(() => {
        setActiveIndex(-1)
        setSaved(false)
      }, 800 + SYMPTOM_DOMAINS.length * 700 + 2800)
    }

    run()
    timerRef.current = setInterval(run, 800 + SYMPTOM_DOMAINS.length * 700 + 3600)
    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <div className="w-full max-w-sm mx-auto bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-lg border border-outline-variant/10">
      <p className="text-[10px] font-label uppercase tracking-[0.2em] text-primary mb-1">
        Daily Check-in
      </p>
      <h4 className="font-headline text-xl md:text-2xl text-on-background mb-6 italic">
        How are you feeling today?
      </h4>
      <div className="flex flex-col gap-5">
        {SYMPTOM_DOMAINS.map((item, n) => {
          const active = activeIndex >= n
          const value = active ? item.target : 0
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-primary text-lg"
                    style={{ transition: 'opacity 0.3s', opacity: active ? 1 : 0.4 }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium text-on-background">{item.label}</span>
                </div>
                <span
                  className="text-sm font-headline italic text-primary"
                  style={{ transition: 'opacity 0.4s ease', opacity: +!!active }}
                >
                  {item.desc}
                </span>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((v) => (
                  <div
                    key={v}
                    className="h-[6px] flex-1 rounded-full"
                    style={{
                      backgroundColor: v <= value ? '#005258' : '#e5e2dd',
                      transition: `background-color 0.3s ease ${v * 0.06}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <button
        className="w-full mt-8 rounded-full py-3.5 font-semibold text-sm transition-all duration-300"
        style={{
          backgroundColor: saved ? '#005258' : '#842b16',
          color: '#ffffff',
          transform: saved ? 'scale(0.97)' : 'scale(1)',
          boxShadow: saved ? 'none' : '0 4px 16px rgba(132, 43, 22, 0.2)',
        }}
      >
        {saved ? (
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Saved!
          </span>
        ) : (
          'Save today\'s log'
        )}
      </button>
    </div>
  )
}

/* ─── Marea Index orb + demo ─── */

function ScoreOrbCanvas({ score = 78, size = 180, color = '#005258' }) {
  const ref = useRef(null)
  const anim = useRef(null)
  const t = useRef(0)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr; canvas.height = size * dpr
    ctx.scale(dpr, dpr)
    const cx = size / 2, cy = size / 2, r = size / 2 - 3
    function draw() {
      t.current += 0.014
      ctx.clearRect(0, 0, size, size)
      ctx.fillStyle = '#e8f3f4'
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
      const waterY = cy + r - (score / 100) * (r * 2)
      ctx.save()
      ctx.beginPath(); ctx.arc(cx, cy, r - 1, 0, Math.PI * 2); ctx.clip()
      const grad = ctx.createLinearGradient(0, waterY, 0, size)
      grad.addColorStop(0, color + 'aa'); grad.addColorStop(1, color)
      ctx.fillStyle = grad
      ctx.beginPath(); ctx.moveTo(0, size)
      for (let x = 0; x <= size; x += 2) {
        const y = waterY + Math.sin(x * 0.06 + t.current) * 4 + Math.sin(x * 0.12 + t.current * 1.3) * 2
        ctx.lineTo(x, y)
      }
      ctx.lineTo(size, size); ctx.closePath(); ctx.fill()
      ctx.globalAlpha = 0.35
      ctx.beginPath(); ctx.moveTo(0, size)
      for (let x = 0; x <= size; x += 2) {
        const y = waterY + 6 + Math.sin(x * 0.08 + t.current * 0.8 + 1.5) * 3
        ctx.lineTo(x, y)
      }
      ctx.lineTo(size, size); ctx.closePath(); ctx.fill()
      ctx.globalAlpha = 1
      ctx.restore()
      ctx.strokeStyle = '#c8e0e2'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
      anim.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(anim.current)
  }, [score, size, color])
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas ref={ref} style={{ width: size, height: size }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="font-headline text-[2.6rem] text-white font-light leading-none" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.12)' }}>{score}</div>
      </div>
    </div>
  )
}

function MareaIndexDemo() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const seq = [[1, 600], [2, 900], [3, 1300], [4, 4500], [0, 200]]
    function run() {
      setStep(0)
      let acc = 0
      seq.forEach(([s, d]) => { acc += d; setTimeout(() => setStep(s), acc) })
    }
    run()
    const total = seq.reduce((a, [, d]) => a + d, 0)
    const iv = setInterval(run, total)
    return () => clearInterval(iv)
  }, [])

  const PILLARS = [
    { label: 'Sleep',    score: 72, color: '#005258' },
    { label: 'Body',     score: 84, color: '#2A8A93' },
    { label: 'Mind',     score: 68, color: '#715b33' },
    { label: 'Symptoms', score: 70, color: '#c0522a' },
  ]
  const TREND = [62, 65, 70, 68, 75, 74, 78]

  return (
    <div className="w-full max-w-sm mx-auto" style={{ minHeight: 470 }}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <p className="text-[9px] font-label uppercase tracking-[0.15em]" style={{ color: '#715b33' }}>Today · Apr 19</p>
      </div>

      <div className="flex justify-center mb-5" style={{ opacity: step >= 1 ? 1 : 0.3, transition: 'opacity .6s ease' }}>
        <ScoreOrbCanvas score={78} size={200} color="#005258" />
      </div>

      <p
        className="text-center text-[0.8rem] italic font-light mb-4 px-2"
        style={{ fontFamily: 'Newsreader, Georgia, serif', color: '#3f484a', opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? 'translateY(0)' : 'translateY(6px)', transition: 'all .5s ease' }}
      >
        Steady current — a balanced day.
      </p>

      <div className="flex flex-col gap-2 mb-4">
        {PILLARS.map((p, i) => (
          <div key={p.label}>
            <div className="flex justify-between mb-0.5">
              <span className="text-[10px] font-medium" style={{ color: '#1c1c19' }}>{p.label}</span>
              <span className="text-[9px]" style={{ color: '#6f797a', opacity: step >= 2 ? 1 : 0, transition: `opacity .3s ${i * 0.1 + 0.1}s` }}>{p.score}</span>
            </div>
            <div className="h-[4px] rounded-full overflow-hidden" style={{ background: '#f0ede9' }}>
              <div style={{
                width: step >= 2 ? `${p.score}%` : '0%',
                height: '100%', background: p.color, borderRadius: '2px',
                transition: `width .7s cubic-bezier(.25,.46,.45,.94) ${i * 0.12}s`,
              }}/>
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex items-end gap-2 px-1"
        style={{ opacity: step >= 3 ? 1 : 0, transition: 'opacity .5s ease' }}
      >
        <span className="text-[9px] font-label uppercase tracking-[0.12em] self-center" style={{ color: '#888780' }}>7 days</span>
        <div className="flex gap-1 flex-1 items-end h-[28px]">
          {TREND.map((v, i) => (
            <div key={i} style={{
              flex: 1, height: `${v * 0.3}px`,
              background: i === TREND.length - 1 ? '#005258' : '#c8e0e2',
              borderRadius: '2px',
              transition: `height .4s ${i * 0.07}s`,
            }}/>
          ))}
        </div>
        <span className="text-[10px] font-semibold self-center" style={{ color: '#2d6a35' }}>+16</span>
      </div>
    </div>
  )
}

/* ─── Daily Forecast demo ─── */

const FORECAST_TONES = [
  { label: 'Clear skies',       tide: 'High tide',       sublabel: 'Follicular · day 8',   grad: ['#d8eef0', '#ddeee8', '#e8f0e4'], orb: '#7aaab0', wave: '#005258', accent: '#005258', conf: 78, icon: 'sunny',            blurb: 'Your pattern data is optimistic. Rising estrogen, strong HRV, and solid sleep point to one of your better days ahead.' },
  { label: 'Shifting currents', tide: 'Steady current',  sublabel: 'Early luteal · day 18', grad: ['#deeef0', '#e8eeea', '#f0ede6'], orb: '#9abcc0', wave: '#2A8A93', accent: '#2A8A93', conf: 71, icon: 'partly_cloudy_day', blurb: 'A mixed day likely. Progesterone rising in early luteal — some fatigue is normal, but your HRV held steady overnight.' },
  { label: 'Rough seas ahead',  tide: 'Low tide',        sublabel: 'Late luteal · day 26',  grad: ['#dce8ea', '#e8d8d2', '#f0e0d8'], orb: '#c47a50', wave: '#842b16', accent: '#842b16', conf: 82, icon: 'thunderstorm',      blurb: 'Your data pattern suggests a difficult day. Late luteal plus declining HRV points to elevated symptom burden — be gentle.' },
]

function DemoWaveCanvas({ color }) {
  const ref = useRef(null)
  const anim = useRef(null)
  const t = useRef(0)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    function draw() {
      t.current += 0.012
      ctx.clearRect(0, 0, W, H)
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, color + 'aa'); g.addColorStop(1, color + '44')
      ctx.fillStyle = g; ctx.globalAlpha = 0.5
      ctx.beginPath(); ctx.moveTo(0, H)
      for (let x = 0; x <= W; x += 3) {
        const y = Math.sin(x * 0.018 + t.current) * 8 +
                  Math.sin(x * 0.031 + t.current * 1.4) * 4 + 22
        ctx.lineTo(x, y)
      }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill()
      ctx.globalAlpha = 0.18
      ctx.beginPath(); ctx.moveTo(0, H)
      for (let x = 0; x <= W; x += 3) {
        const y = Math.sin(x * 0.022 + t.current * 0.8 + 1.5) * 6 +
                  Math.sin(x * 0.04 + t.current * 1.1) * 3 + 14
        ctx.lineTo(x, y)
      }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill()
      anim.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(anim.current)
  }, [color])
  return <canvas ref={ref} width={400} height={56} className="absolute bottom-0 left-0 w-full h-14" />
}

function ForecastDemo() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => setIdx(i => (i + 1) % FORECAST_TONES.length), 4500)
    return () => clearInterval(iv)
  }, [])
  const f = FORECAST_TONES[idx]

  return (
    <div className="w-full max-w-sm mx-auto" style={{ minHeight: 470 }}>
      <div
        className="relative overflow-hidden rounded-2xl shadow-md"
        style={{
          height: '240px',
          background: `linear-gradient(180deg, ${f.grad[0]} 0%, ${f.grad[1]} 55%, ${f.grad[2]} 100%)`,
          transition: 'background 1.2s ease',
        }}
      >
        <div
          className="absolute top-5 right-6 w-11 h-11 rounded-full"
          style={{
            background: `radial-gradient(circle at 40% 38%, ${f.orb}cc, ${f.orb}66)`,
            boxShadow: `0 0 24px ${f.orb}44`,
            transition: 'all 1.2s ease',
          }}
        />
        <DemoWaveCanvas color={f.wave} />
        <div className="absolute top-4 left-5 right-20">
          <p className="text-[9px] font-label uppercase tracking-[0.16em] mb-1" style={{ color: '#6f797a' }}>Tomorrow's Forecast</p>
          <h3 className="text-[1.35rem]" style={{ fontFamily: 'Newsreader, Georgia, serif', color: '#1c1c19', fontWeight: 400, lineHeight: 1.15 }}>
            {f.label}
          </h3>
          <p className="text-[0.72rem] mt-1" style={{ color: '#6f797a' }}>{f.sublabel}</p>
        </div>
        <div
          className="absolute left-4 bottom-[56px] px-3 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(6px)', color: f.accent, fontSize: '0.7rem', fontWeight: 600, transition: 'color 1.2s ease' }}
        >
          {f.tide}
        </div>
        <div
          className="absolute right-4 bottom-[56px] px-3 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(6px)', color: '#3f484a', fontSize: '0.68rem' }}
        >
          {f.conf}% confidence
        </div>
      </div>

      <div className="p-5">
        <div className="pl-3 mb-4" style={{ borderLeft: `3px solid ${f.accent}`, transition: 'border-color 1.2s', minHeight: '108px' }}>
          <p className="text-[9px] font-label uppercase tracking-[0.14em] mb-1" style={{ color: f.accent, transition: 'color 1.2s' }}>Pattern note</p>
          <p className="text-[0.8rem] italic leading-relaxed" style={{ fontFamily: 'Newsreader, Georgia, serif', color: '#3f484a' }}>
            {f.blurb}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="py-2">
            <p className="text-[8px] font-label uppercase tracking-[0.1em]" style={{ color: '#888780' }}>Today</p>
            <span className="material-symbols-outlined text-[18px] mt-1 block" style={{ color: '#6f797a' }}>partly_cloudy_day</span>
            <p className="text-[0.78rem] mt-0.5" style={{ fontFamily: 'Newsreader, Georgia, serif', color: '#3f484a' }}>Mixed</p>
          </div>
          <div className="py-2 rounded-lg" style={{ background: '#e8f3f4' }}>
            <p className="text-[8px] font-label uppercase tracking-[0.1em]" style={{ color: f.accent, transition: 'color 1.2s' }}>Tomorrow</p>
            <span className="material-symbols-outlined text-[18px] mt-1 block" style={{ color: f.accent, transition: 'color 1.2s' }}>{f.icon}</span>
            <p className="text-[0.78rem] mt-0.5 font-semibold" style={{ fontFamily: 'Newsreader, Georgia, serif', color: f.accent, transition: 'color 1.2s' }}>{f.tide.split(' ')[0]}</p>
          </div>
          <div className="py-2">
            <p className="text-[8px] font-label uppercase tracking-[0.1em]" style={{ color: '#888780' }}>Day after</p>
            <span className="material-symbols-outlined text-[18px] mt-1 block" style={{ color: '#6f797a' }}>cloud</span>
            <p className="text-[0.78rem] mt-0.5" style={{ fontFamily: 'Newsreader, Georgia, serif', color: '#3f484a' }}>—</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Landing Page ─── */

export default function LandingPage() {
  const [recentArticles, setRecentArticles] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    supabase
      .from('content')
      .select('id, title, slug, category, read_time, is_premium, author')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setRecentArticles(data || []))
  }, [])

  return (
    <div className="bg-surface text-on-background font-body selection:bg-secondary-container/30 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-6 md:px-16 lg:px-20 py-5 max-w-[1400px] mx-auto">
          <Link to="/" className="shrink-0">
            <img src={mareaLogo} alt="Marea" style={{ height: '30px', width: 'auto' }} />
          </Link>
          <div className="hidden md:flex gap-10 items-center">
            <a
              className="text-on-surface-variant hover:text-primary font-headline text-base tracking-tight transition-colors"
              href="#vision"
            >
              Our Vision
            </a>
            <a
              className="text-on-surface-variant hover:text-primary font-headline text-base tracking-tight transition-colors"
              href="#features"
            >
              The Science
            </a>
            <Link
              className="text-on-surface-variant hover:text-primary font-headline text-base tracking-tight transition-colors"
              to="/blog"
            >
              Journal
            </Link>
            <Link
              className="text-on-surface-variant hover:text-primary font-headline text-base tracking-tight transition-colors"
              to="/articles"
            >
              Articles
            </Link>
            <a
              className="text-on-surface-variant hover:text-primary font-headline text-base tracking-tight transition-colors"
              href="#download"
            >
              Membership
            </a>
          </div>
          <button className="md:hidden text-on-surface-variant" aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span className="material-symbols-outlined text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
          <a
            href="#download"
            className="hidden md:inline-flex bg-tertiary text-on-tertiary px-6 py-2.5 rounded-full text-[11px] font-label uppercase tracking-widest hover:bg-tertiary-container transition-all shadow-lg shadow-tertiary/10"
          >
            Get Started
          </a>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-outline-variant/10 bg-white/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-3">
            <a className="text-on-surface-variant hover:text-primary font-headline text-base py-2 transition-colors" href="#vision" onClick={() => setMobileMenuOpen(false)}>Our Vision</a>
            <a className="text-on-surface-variant hover:text-primary font-headline text-base py-2 transition-colors" href="#features" onClick={() => setMobileMenuOpen(false)}>The Science</a>
            <Link className="text-on-surface-variant hover:text-primary font-headline text-base py-2 transition-colors" to="/blog" onClick={() => setMobileMenuOpen(false)}>Journal</Link>
            <Link className="text-on-surface-variant hover:text-primary font-headline text-base py-2 transition-colors" to="/articles" onClick={() => setMobileMenuOpen(false)}>Articles</Link>
            <a className="text-on-surface-variant hover:text-primary font-headline text-base py-2 transition-colors" href="#download" onClick={() => setMobileMenuOpen(false)}>Membership</a>
            <a href="#download" className="bg-tertiary text-on-tertiary px-6 py-3 rounded-full text-[11px] font-label uppercase tracking-widest text-center mt-2" onClick={() => setMobileMenuOpen(false)}>Get Started</a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 md:pt-40 md:pb-24">
        <div className="max-w-[1400px] mx-auto px-6 md:px-16 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <span className="font-label uppercase tracking-[0.2em] text-primary text-[11px] font-semibold mb-4 block">
              Hormonal Intelligence
            </span>
            <h1
              className="font-headline text-[2.5rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl text-on-background tracking-tight mb-6"
              style={{ letterSpacing: '-0.02em' }}
            >
              Find your rhythm through perimenopause.
            </h1>
            <p className="font-body font-light text-base md:text-lg text-on-surface-variant max-w-md mb-8 leading-relaxed">
              A personalized sanctuary designed to help you navigate hormonal shifts with clinical
              precision and soulful intuition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div
                className="inline-flex items-center gap-3 bg-on-background text-surface rounded-full px-6 py-3 opacity-90"
              >
                <span className="material-symbols-outlined text-xl">phone_iphone</span>
                <div className="text-left">
                  <p className="text-[9px] font-label uppercase tracking-wider leading-none opacity-70">
                    Coming Soon
                  </p>
                  <p className="text-sm font-semibold leading-none mt-0.5">iOS · Android</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-on-primary shrink-0">
                  <span className="material-symbols-outlined text-lg">verified</span>
                </div>
                <p className="text-sm text-on-surface-variant">
                  Built by board-certified{' '}
                  <span className="font-semibold text-primary">OB/GYNs</span>
                </p>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative">
            <div className="absolute -top-8 -right-8 w-48 h-48 bg-secondary-container rounded-full blur-[60px] opacity-40 -z-10" />
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-primary-fixed-dim rounded-full blur-[50px] opacity-30 -z-10" />
            <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/10 border border-outline-variant/10">
              <img
                src="/hero.png"
                alt="Woman navigating perimenopause with confidence"
                className="w-full aspect-[3/4] object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Marea Philosophy */}
      <section id="vision" className="py-16 md:py-24 bg-surface-container-low">
        <div className="max-w-3xl mx-auto px-6 md:px-16 lg:px-20 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/5 text-primary font-label text-[10px] uppercase tracking-[0.25em] mb-6">
            The Marea Philosophy
          </div>
          <h2
            className="font-headline text-3xl md:text-4xl lg:text-5xl mb-6"
            style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}
          >
            Intelligence meets Empathy.
          </h2>
          <p className="text-on-surface-variant text-base md:text-lg font-light leading-relaxed mb-10">
            We believe hormonal health shouldn&apos;t be a black box. Our proprietary
            &ldquo;Pulse&rdquo; visualization transforms complex cycle data into a serene, intuitive
            experience that adapts as you do.
          </p>
          <div className="relative h-3 w-full max-w-sm mx-auto bg-outline-variant/20 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary-container to-tertiary-container animate-pulse opacity-60" />
          </div>
        </div>
      </section>

      {/* Marea Index & Daily Forecast */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-[1400px] mx-auto px-6 md:px-16 lg:px-20">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/5 text-primary font-label text-[10px] uppercase tracking-[0.25em] mb-6">
              Your rhythm, in real time
            </div>
            <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl mb-4" style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              One number for today.<br className="hidden sm:inline" /> A forecast for tomorrow.
            </h2>
            <p className="text-on-surface-variant text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
              Marea reads the signals your body is already giving — cycle, sleep, HRV, symptoms — and translates them into something you can actually use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Marea Index — soft teal tile */}
            <div
              className="rounded-3xl p-8 md:p-12 lg:p-14 shadow-sm border border-outline-variant/10 overflow-hidden relative"
              style={{ background: 'linear-gradient(165deg, #e8f3f4 0%, #d8eaec 100%)' }}
            >
              <div className="flex flex-col gap-8 md:gap-10">
                <div>
                  <span className="material-symbols-outlined text-primary mb-4 text-3xl block">waves</span>
                  <h3 className="font-headline text-3xl md:text-4xl mb-3" style={{ letterSpacing: '-0.01em', lineHeight: 1.15, color: '#0D3F44' }}>
                    Marea Index
                  </h3>
                  <p className="font-light text-sm md:text-base leading-relaxed mb-6" style={{ color: '#3f484a' }}>
                    A daily 0–100 reading of how your body is moving — weighted across sleep, body, mind, and symptoms. Tap the orb anytime for a plain-language explanation.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm font-label" style={{ color: '#3f484a' }}>
                      <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                      Four weighted pillars
                    </li>
                    <li className="flex items-center gap-2 text-sm font-label" style={{ color: '#3f484a' }}>
                      <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                      Personalized AI explanation
                    </li>
                    <li className="flex items-center gap-2 text-sm font-label" style={{ color: '#3f484a' }}>
                      <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                      7-day pattern trend
                    </li>
                  </ul>
                </div>
                <div><MareaIndexDemo /></div>
              </div>
            </div>

            {/* Daily Forecast — warm sand tile */}
            <div
              className="rounded-3xl p-8 md:p-12 lg:p-14 shadow-sm border border-outline-variant/10 overflow-hidden relative"
              style={{ background: 'linear-gradient(165deg, #faefd8 0%, #f0e4d2 100%)' }}
            >
              <div className="flex flex-col gap-8 md:gap-10">
                <div>
                  <span className="material-symbols-outlined mb-4 text-3xl block" style={{ color: '#842b16' }}>partly_cloudy_day</span>
                  <h3 className="font-headline text-3xl md:text-4xl mb-3" style={{ letterSpacing: '-0.01em', lineHeight: 1.15, color: '#1c1c19' }}>
                    Daily Forecast
                  </h3>
                  <p className="font-light text-sm md:text-base leading-relaxed mb-6" style={{ color: '#3f484a' }}>
                    A weather-style read of tomorrow based on your cycle phase, HRV, momentum, and recent symptoms. Clear language, explicit confidence — never false certainty.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm font-label" style={{ color: '#3f484a' }}>
                      <span className="material-symbols-outlined text-base" style={{ color: '#842b16' }}>check_circle</span>
                      Five weighted signals
                    </li>
                    <li className="flex items-center gap-2 text-sm font-label" style={{ color: '#3f484a' }}>
                      <span className="material-symbols-outlined text-base" style={{ color: '#842b16' }}>check_circle</span>
                      Confidence shown, capped at 85%
                    </li>
                    <li className="flex items-center gap-2 text-sm font-label" style={{ color: '#3f484a' }}>
                      <span className="material-symbols-outlined text-base" style={{ color: '#842b16' }}>check_circle</span>
                      Preparation plan, not a prescription
                    </li>
                  </ul>
                </div>
                <div><ForecastDemo /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Medical Team */}
      <section className="pt-16 pb-8 md:pt-20 md:pb-12 bg-surface">
        <div className="max-w-[1400px] mx-auto px-6 md:px-16 lg:px-20">
          <div className="text-center mb-10">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/5 text-primary font-label text-[10px] uppercase tracking-[0.25em] mb-6">
              Our Medical Team
            </div>
            <h2
              className="font-headline text-3xl md:text-4xl lg:text-5xl mb-4"
              style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}
            >
              Built by practicing OB/GYNs.
            </h2>
            <p className="text-on-surface-variant text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto">
              Marea was born from a clinical practice — not a tech startup. Every assessment, every
              lab range, every recommendation comes from the same evidence base we use with our own
              patients.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-10 md:gap-20">
            <div className="flex flex-col items-center max-w-[260px]">
              <div
                className="w-52 h-52 md:w-60 md:h-60 rounded-full overflow-hidden mb-5"
                style={{ boxShadow: '0 20px 40px -12px rgba(0, 82, 88, 0.18)' }}
              >
                <img
                  src="/richmond.png"
                  alt="Dr. Richmond, MD, FACOG"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <p className="text-lg font-medium text-on-background text-center">Dr. Richmond</p>
              <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mt-1">
                MD, FACOG
              </p>
              <p className="text-xs text-on-surface-variant font-light mt-2 text-center">
                Co-Founder &amp; Medical Director
              </p>
            </div>
            <div className="flex flex-col items-center max-w-[260px]">
              <div
                className="w-52 h-52 md:w-60 md:h-60 rounded-full overflow-hidden mb-5"
                style={{ boxShadow: '0 20px 40px -12px rgba(0, 82, 88, 0.18)' }}
              >
                <img
                  src="/rodriguez.png"
                  alt="Dr. Rodriguez, MD, FACOG"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <p className="text-lg font-medium text-on-background text-center">Dr. Rodriguez</p>
              <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest mt-1">
                MD, FACOG
              </p>
              <p className="text-xs text-on-surface-variant font-light mt-2 text-center">
                Co-Founder &amp; Medical Director
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Capabilities */}
      <section id="features" className="pt-8 pb-16 md:pt-12 md:pb-28 bg-surface">
        <div className="max-w-[1400px] mx-auto px-6 md:px-16 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6">
            {/* Personalized Profile */}
            <div className="md:col-span-12 bg-surface-container-lowest rounded-2xl p-6 md:p-10 shadow-sm border border-outline-variant/10 overflow-hidden relative group">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-primary mb-4 text-3xl block">
                    query_stats
                  </span>
                  <h3
                    className="font-headline text-2xl md:text-3xl text-on-background mb-3"
                    style={{ letterSpacing: '-0.01em', lineHeight: 1.2 }}
                  >
                    Personalized Perimenopause Profile
                  </h3>
                  <p className="text-on-surface-variant font-light text-sm leading-relaxed mb-5">
                    A dynamic health identity that evolves with your symptoms, labs, and goals. No
                    more generic advice — just yours.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm font-label text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-base">
                        check_circle
                      </span>
                      Hormone Baseline Assessment
                    </li>
                    <li className="flex items-center gap-2 text-sm font-label text-on-surface-variant">
                      <span className="material-symbols-outlined text-primary text-base">
                        check_circle
                      </span>
                      Life-stage Adaptive UI
                    </li>
                  </ul>
                </div>
                <div className="relative z-10">
                  <AssessmentDemo />
                </div>
              </div>
            </div>

            {/* Empathetic Symptom Tracking */}
            <div className="md:col-span-12 bg-secondary-container/30 rounded-2xl p-6 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1 flex justify-center">
                <SymptomTrackerDemo />
              </div>
              <div className="order-1 lg:order-2">
                <span className="material-symbols-outlined text-secondary mb-4 text-3xl block">
                  favorite
                </span>
                <h3
                  className="font-headline text-2xl md:text-3xl lg:text-4xl mb-4"
                  style={{ letterSpacing: '-0.01em', lineHeight: 1.2 }}
                >
                  Empathetic Symptom Tracking
                </h3>
                <p className="text-on-surface-variant font-light text-base leading-relaxed mb-6">
                  Track the symptoms that matter most — hot flashes, sleep, mood, energy, focus, and
                  cycle patterns. Our system identifies trends before you do, offering proactive
                  relief strategies.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/40 backdrop-blur rounded-xl">
                    <p className="text-xl font-headline text-primary">6</p>
                    <p className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant mt-1">
                      Daily Domains
                    </p>
                  </div>
                  <div className="p-4 bg-white/40 backdrop-blur rounded-xl">
                    <p className="text-xl font-headline text-primary">Daily</p>
                    <p className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant mt-1">
                      Pattern Recognition
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-16 md:py-24 bg-surface-container">
        <div className="max-w-3xl mx-auto px-6 md:px-16 lg:px-20 text-center">
          <span className="material-symbols-outlined text-secondary text-4xl mb-6 block">
            format_quote
          </span>
          <blockquote className="font-headline text-xl sm:text-2xl md:text-3xl lg:text-4xl text-on-background italic leading-snug mb-8">
            &ldquo;Marea is the first tool that didn&apos;t make me feel like I was malfunctioning.
            It&apos;s like having a kind, extremely smart doctor in my pocket every morning.&rdquo;
          </blockquote>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden mb-3 border-2 border-white bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">person</span>
            </div>
            <cite className="not-italic font-label uppercase tracking-widest text-primary text-xs font-bold">
              Sarah Jenkins, 48
            </cite>
            <p className="text-[11px] text-on-surface-variant mt-1">Beta Member since 2023</p>
          </div>
        </div>
      </section>

      {/* Clinical insights / Blog preview */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-[1400px] mx-auto px-6 md:px-16 lg:px-20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-primary/5 text-primary font-label text-[10px] uppercase tracking-[0.2em] mb-3">
                From the Journal
              </div>
              <h2
                className="font-headline text-2xl md:text-3xl"
                style={{ letterSpacing: '-0.01em', lineHeight: 1.2 }}
              >
                Clinical insights, made clear
              </h2>
            </div>
            <Link
              to="/articles"
              className="text-xs font-label font-semibold text-primary hover:text-tertiary transition-colors uppercase tracking-widest whitespace-nowrap"
            >
              View all articles →
            </Link>
          </div>
          {recentArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentArticles.map(article => (
                <Link key={article.id} to={`/articles/${article.slug}`} className="no-underline group">
                  <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
                    <div
                      className="h-[160px] bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${articleImage(article.slug, article.category)})` }}
                    >
                      {article.is_premium && (
                        <span className="absolute top-3 right-3 bg-tertiary/90 text-on-tertiary font-label text-[0.65rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Member
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-label text-[0.7rem] font-semibold text-primary bg-primary/[0.08] px-2 py-0.5 rounded-full">{article.category}</span>
                        <span className="font-label text-[0.72rem] text-outline">{article.read_time} min</span>
                      </div>
                      <h3 className="font-headline text-[1.1rem] font-normal text-on-background" style={{ lineHeight: 1.3 }}>{article.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl p-8 md:p-10 shadow-sm border border-outline-variant/10 text-center">
              <span className="material-symbols-outlined text-outline-variant text-4xl mb-3 block">article</span>
              <p className="text-on-surface-variant font-light text-sm">Articles will appear here once published.</p>
            </div>
          )}
        </div>
      </section>

      {/* Download CTA */}
      <section id="download" className="py-16 md:py-24 bg-surface">
        <div className="max-w-5xl mx-auto px-6 md:px-16 lg:px-20">
          <div className="bg-primary-container rounded-2xl md:rounded-3xl p-8 sm:p-12 md:p-20 text-center text-on-primary relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-72 h-72 bg-secondary-container rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
            </div>
            <h2
              className="font-headline text-2xl sm:text-3xl md:text-5xl mb-5 relative z-10"
              style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}
            >
              Ready to redefine your journey?
            </h2>
            <p className="text-on-primary-container text-sm sm:text-base md:text-lg font-light mb-8 md:mb-10 max-w-xl mx-auto relative z-10">
              Join thousands of women who are reclaiming their clarity and confidence. Start your
              free 14-day trial today.
            </p>
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="inline-flex items-center gap-3 bg-tertiary text-on-tertiary rounded-full px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base font-semibold shadow-xl shadow-tertiary/20">
                <span className="material-symbols-outlined text-xl">schedule</span>
                Coming Soon
              </div>
              <p className="text-[10px] font-label uppercase tracking-[0.2em] opacity-60">
                Coming soon to iOS &amp; Android
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant/15 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6 md:px-16 lg:px-20 py-12 max-w-[1400px] mx-auto">
          <div>
            <img
              src={mareaLogo}
              alt="Marea"
              style={{ height: '28px', width: 'auto' }}
              className="mb-4"
            />
            <p className="font-light text-sm text-on-background/50 max-w-xs leading-relaxed">
              Dedicated to closing the gender data gap in midlife health through intelligence and
              empathy.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">
                Company
              </p>
              <a
                className="text-sm font-light text-on-background/50 hover:text-tertiary transition-colors"
                href="#vision"
              >
                Our Vision
              </a>
              <a
                className="text-sm font-light text-on-background/50 hover:text-tertiary transition-colors"
                href="#features"
              >
                The Science
              </a>
              <Link
                className="text-sm font-light text-on-background/50 hover:text-tertiary transition-colors"
                to="/blog"
              >
                Journal
              </Link>
              <Link
                className="text-sm font-light text-on-background/50 hover:text-tertiary transition-colors"
                to="/articles"
              >
                Articles
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">
                Legal
              </p>
              <Link
                className="text-sm font-light text-on-background/50 hover:text-tertiary transition-colors"
                to="/privacy"
              >
                Privacy
              </Link>
              <Link
                className="text-sm font-light text-on-background/50 hover:text-tertiary transition-colors"
                to="/terms"
              >
                Terms
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-label uppercase tracking-widest text-primary font-bold">
                App
              </p>
              <p className="text-sm font-light text-on-background/50">iOS — coming soon</p>
              <p className="text-sm font-light text-on-background/30">Android — coming soon</p>
            </div>
          </div>
        </div>
        <div className="px-6 md:px-16 lg:px-20 py-6 border-t border-outline-variant/15 flex flex-col sm:flex-row justify-between items-center gap-3 max-w-[1400px] mx-auto">
          <p className="font-light text-xs text-on-background/40">
            &copy; {new Date().getFullYear()} Marea Health, LLC. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              className="text-on-background/40 hover:text-primary transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-xl">brand_awareness</span>
            </a>
            <a
              className="text-on-background/40 hover:text-primary transition-colors"
              href="#"
            >
              <span className="material-symbols-outlined text-xl">group</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
