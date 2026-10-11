/* An abstract rendering of the PhysicianOS group console — drawn, not
   screenshotted, so the page carries no practice's data and stays light.
   The four divisions and their colors match the product's palette; the
   figures are invented and the page says so. Lines draw themselves in once
   on mount, which is the only motion here. */

const DIVISIONS = [
  { name: 'Atlantic Coast', color: '#0891b2', bar: 0.92, pct: '21%', w: 62 },
  { name: 'Riverside', color: '#b45309', bar: 0.68, pct: '31%', w: 88 },
  { name: 'Palm Coast', color: '#6d28d9', bar: 0.34, pct: '—', w: 0, onboarding: true },
  { name: 'St. Augustine', color: '#15803d', bar: 0.12, pct: '—', w: 0, invited: true },
]

/* Twelve months of two series, as path data on a 300×90 grid. */
const line = (pts) => pts.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i * 300) / (pts.length - 1)},${90 - y * 90}`).join(' ')
const SERIES_A = [0.62, 0.78, 0.55, 0.7, 0.74, 0.66, 0.82, 0.71, 0.9, 0.68, 0.84, 0.95]
const SERIES_B = [0.4, 0.46, 0.38, 0.5, 0.44, 0.52, 0.47, 0.58, 0.5, 0.56, 0.6, 0.64]

export default function ConsoleMock({ className = '' }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-[0_24px_60px_-20px_rgba(0,45,50,0.35)] ${className}`}
      style={{ background: '#fdfcfa', border: '1px solid rgba(0,82,88,0.14)' }}
      aria-label="An illustration of the PhysicianOS group console: a portfolio of four practices with monthly collections and payroll ratios."
      role="img"
    >
      {/* window chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: '#00383d' }}>
        <span className="h-2 w-2 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
        <span className="h-2 w-2 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
        <span className="h-2 w-2 rounded-full" style={{ background: 'rgba(255,255,255,0.18)' }} />
        <p className="ml-2 text-[10px] font-label uppercase tracking-[0.18em]" style={{ color: 'rgba(167,233,241,0.85)' }}>
          PhysicianOS · group console
        </p>
      </div>

      <div className="p-4 sm:p-5">
        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
          {[
            ['Practices', '4'],
            ['Physicians', '23'],
            ['Collections · 3 mo', '$5.2M'],
            ['Payroll share', '24%'],
          ].map(([label, value], i) => (
            <div
              key={label}
              className="po-fade rounded-lg px-2.5 py-2"
              style={{ background: '#f4f1ec', animationDelay: `${i * 90}ms` }}
            >
              <p className="text-[8px] sm:text-[9px] font-label uppercase tracking-[0.12em] text-on-background/45 leading-tight">{label}</p>
              <p className="font-headline text-base sm:text-xl text-on-background leading-tight mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* chart */}
        <div className="rounded-lg p-3 mb-4" style={{ background: '#f4f1ec' }}>
          <p className="text-[9px] font-label uppercase tracking-[0.12em] text-on-background/45 mb-2">Monthly collections by practice</p>
          <svg viewBox="0 0 300 96" className="w-full" style={{ height: 'auto' }} aria-hidden="true">
            {[0, 30, 60, 90].map((y) => (
              <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="#e2ddd5" strokeWidth="1" />
            ))}
            <path className="po-draw" d={line(SERIES_A)} fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path className="po-draw po-draw-2" d={line(SERIES_B)} fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* division rows */}
        <div className="space-y-1.5">
          {DIVISIONS.map((d, i) => (
            <div
              key={d.name}
              className="po-fade flex items-center gap-2 sm:gap-3 rounded-lg px-2.5 py-2"
              style={{ background: i % 2 ? 'transparent' : '#faf8f5', animationDelay: `${300 + i * 90}ms` }}
            >
              <span className="h-5 w-5 shrink-0 rounded" style={{ background: d.color, opacity: d.invited ? 0.35 : 1 }} />
              <span className="flex-1 min-w-0 truncate text-[11px] sm:text-xs text-on-background/80">{d.name}</span>
              <span className="hidden sm:block w-20 h-1.5 rounded-full" style={{ background: '#e8e3da' }}>
                <span
                  className="po-grow block h-full rounded-full"
                  style={{ width: `${d.w}%`, background: d.color, opacity: 0.8, animationDelay: `${400 + i * 90}ms` }}
                />
              </span>
              <span className="w-8 text-right text-[11px] sm:text-xs tabular-nums text-on-background/60">{d.pct}</span>
              <span
                className="hidden sm:inline rounded-full px-1.5 py-0.5 text-[8px] font-label uppercase tracking-wider"
                style={
                  d.invited
                    ? { background: '#eceae6', color: '#8a8378' }
                    : d.onboarding
                      ? { background: '#fdefd3', color: '#8a5a12' }
                      : { background: '#dcefe4', color: '#1d6b45' }
                }
              >
                {d.invited ? 'invited' : d.onboarding ? 'onboarding' : 'live'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
