import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAdminGuard } from '../hooks/useAdminGuard'
import mareaLogo from '../assets/marealogo.svg'
import {
  LAB_KEYS, LAB_GROUPS, LAB_CONFIG, UNIT_OPTIONS, convertToDefault, evaluateLevel,
  STAGE_OPTIONS, CLINICAL_QUESTIONS, RECOMMENDATION_CATEGORIES, derivedIndices,
} from '../lib/labConfig'

// Clinician-facing tool: enter a patient's hormone labs, get an AI analysis
// + curated treatment options, review/edit, then generate a private,
// Marea-branded, 30-day, zero-PII shareable link for the patient portal.

function AdminNav({ onLogout }) {
  return (
    <nav className="bg-on-background px-8 py-3 flex justify-between items-center">
      <div className="flex items-center gap-8">
        <img src={mareaLogo} alt="Marea" className="h-[1.2rem] brightness-0 invert opacity-80" />
        <div className="flex gap-6">
          <Link to="/admin/dashboard" className="text-[0.82rem] text-white/60">Dashboard</Link>
          <Link to="/admin/blog" className="text-[0.82rem] text-white/60">Blog CMS</Link>
          <Link to="/admin/articles" className="text-[0.82rem] text-white/60">Articles CMS</Link>
          <Link to="/admin/labs" className="text-[0.82rem] text-white font-semibold">Lab Reports</Link>
        </div>
      </div>
      <button onClick={onLogout} className="bg-transparent border-none text-white/50 text-[0.8rem] cursor-pointer">Sign out</button>
    </nav>
  )
}

export default function AdminLabReport() {
  const navigate = useNavigate()
  const adminVerified = useAdminGuard()

  const [view, setView] = useState('entry') // entry | review | link
  const [values, setValues] = useState({})
  const [units, setUnits] = useState(() => Object.fromEntries(LAB_KEYS.map(k => [k, UNIT_OPTIONS[k].default])))
  const [stage, setStage] = useState('unknown')
  const [clinicalQuestion, setClinicalQuestion] = useState('perimenopause')
  // Groups start collapsed unless they hold a value, so a 15-lab form still
  // opens as a short page — expand only what this panel actually covers.
  const [openGroups, setOpenGroups] = useState(() => ({ ovarian: true }))

  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const [interpretation, setInterpretation] = useState('')
  const [recs, setRecs] = useState([]) // [{ category, title, detail, include }]

  const [creating, setCreating] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareExpires, setShareExpires] = useState('')
  const [copied, setCopied] = useState(false)

  const [reports, setReports] = useState([])

  useEffect(() => { if (adminVerified) loadReports() }, [adminVerified])

  async function loadReports() {
    const { data: { session } } = await supabase.auth.getSession()
    const uid = session?.user?.id
    if (!uid) return
    const { data } = await supabase
      .from('patient_reports')
      .select('id, token, stage, created_at, expires_at, revoked')
      .eq('created_by', uid)
      .order('created_at', { ascending: false })
      .limit(50)
    setReports(data || [])
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin')
  }

  function hasValues() {
    return LAB_KEYS.some(k => values[k] !== undefined && values[k] !== '')
  }

  // Convert entered values (respecting unit toggles) into the canonical
  // default-unit payload the API and reference ranges expect.
  function buildSubmitValues() {
    const out = {}
    for (const key of LAB_KEYS) {
      const raw = values[key]
      if (raw === undefined || raw === '') continue
      const num = parseFloat(raw)
      if (isNaN(num)) continue
      out[key] = convertToDefault(key, num, units[key])
    }
    if (out.testosterone != null && values.on_trt) out.on_trt = true
    if (values.progesterone_cycle_day) out.progesterone_cycle_day = parseInt(values.progesterone_cycle_day, 10)
    return out
  }

  async function handleAnalyze() {
    if (!hasValues()) return
    setError('')
    setAnalyzing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const resp = await fetch('/api/analyze-patient-labs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ values: buildSubmitValues(), stage, clinicalQuestion }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Analysis failed')
      setInterpretation(data.interpretation || '')
      setRecs((data.recommendations || []).map(r => ({ ...r, include: true })))
      setView('review')
      window.scrollTo(0, 0)
    } catch (e) {
      setError(e.message || 'Something went wrong analyzing these labs.')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleCreateLink() {
    setError('')
    setCreating(true)
    try {
      const included = recs
        .filter(r => r.include && r.title.trim() && r.detail.trim())
        .map(({ category, title, detail }) => ({ category, title, detail }))
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const resp = await fetch('/api/create-patient-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          values: buildSubmitValues(),
          stage,
          clinicalQuestion,
          interpretation: interpretation.trim(),
          recommendations: included,
        }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Could not create link')
      setShareUrl(data.url)
      setShareExpires(data.expires_at)
      setView('link')
      window.scrollTo(0, 0)
      loadReports()
    } catch (e) {
      setError(e.message || 'Something went wrong creating the link.')
    } finally {
      setCreating(false)
    }
  }

  function resetAll() {
    setValues({})
    setUnits(Object.fromEntries(LAB_KEYS.map(k => [k, UNIT_OPTIONS[k].default])))
    setStage('unknown')
    setClinicalQuestion('perimenopause')
    setOpenGroups({ ovarian: true })
    setInterpretation('')
    setRecs([])
    setShareUrl('')
    setShareExpires('')
    setError('')
    setView('entry')
  }

  async function copyLink(url) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked — user can select manually */ }
  }

  async function revokeReport(id) {
    await supabase.from('patient_reports').update({ revoked: true }).eq('id', id)
    loadReports()
  }

  if (!adminVerified) {
    return <div className="min-h-screen bg-surface-container-low flex items-center justify-center text-outline">Verifying access…</div>
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      <AdminNav onLogout={handleLogout} />

      <div className="max-w-[720px] mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-headline text-[1.75rem] font-normal text-on-background">Patient Lab Analysis</h1>
          <p className="text-[0.85rem] text-outline mt-1">
            Enter a patient's hormone labs, review the AI analysis, and generate a private, Marea-branded link to share — no patient identifiers, expires in 30 days.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-tertiary/10 border border-tertiary/20 px-4 py-3 text-[0.82rem] text-tertiary">
            {error}
          </div>
        )}

        {/* ─── ENTRY ─────────────────────────────────────────────── */}
        {view === 'entry' && (
          <>
            {/* What is being worked up — steers the AI's lens */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
              <label className="block text-[0.85rem] font-semibold text-on-background mb-1">What are you working up?</label>
              <p className="text-[0.75rem] text-outline mb-3">The same numbers read differently depending on the question being asked.</p>
              <div className="flex flex-wrap gap-2">
                {CLINICAL_QUESTIONS.map(q => (
                  <button key={q.value} onClick={() => setClinicalQuestion(q.value)} title={q.hint}
                    className={`px-3.5 py-1.5 rounded-full text-[0.8rem] font-medium border cursor-pointer transition-colors ${
                      clinicalQuestion === q.value ? 'bg-primary text-white border-primary' : 'bg-white text-outline border-surface-variant hover:border-primary/40'
                    }`}>
                    {q.label}
                  </button>
                ))}
              </div>
              <p className="text-[0.75rem] text-outline mt-2.5 italic">
                {CLINICAL_QUESTIONS.find(q => q.value === clinicalQuestion)?.hint}
              </p>
            </div>

            {/* Stage — only meaningful for a perimenopause workup */}
            {CLINICAL_QUESTIONS.find(q => q.value === clinicalQuestion)?.needsStage && (
              <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
                <label className="block text-[0.85rem] font-semibold text-on-background mb-2">Perimenopause stage (STRAW+10)</label>
                <div className="flex flex-wrap gap-2">
                  {STAGE_OPTIONS.map(s => (
                    <button key={s.value} onClick={() => setStage(s.value)}
                      className={`px-3.5 py-1.5 rounded-full text-[0.8rem] font-medium border cursor-pointer transition-colors ${
                        stage === s.value ? 'bg-primary text-white border-primary' : 'bg-white text-outline border-surface-variant hover:border-primary/40'
                      }`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lab inputs, grouped by panel */}
            <div className="flex flex-col gap-3 mb-5">
              {LAB_GROUPS.map(group => {
                const filledCount = group.keys.filter(k => values[k] !== undefined && values[k] !== '').length
                const isOpen = openGroups[group.key] || filledCount > 0
                return (
                <div key={group.key} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => setOpenGroups(o => ({ ...o, [group.key]: !isOpen }))}
                    className="w-full flex items-center justify-between px-5 py-4 bg-transparent border-none cursor-pointer text-left">
                    <span className="flex items-center gap-2.5 font-semibold text-[0.9rem] text-on-background">
                      <span className="material-symbols-outlined text-[20px] text-primary">{group.icon}</span>
                      {group.label}
                      {filledCount > 0 && (
                        <span className="text-[0.7rem] font-semibold text-primary bg-primary/[0.08] px-2 py-0.5 rounded-full">
                          {filledCount}
                        </span>
                      )}
                    </span>
                    <span className={`material-symbols-outlined text-[20px] text-outline transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>

                  {isOpen && (
                  <div className="px-5 pb-5 flex flex-col gap-4 border-t border-surface-container pt-4">
                  {group.keys.map(key => {
                const cfg = LAB_CONFIG[key]
                const opts = UNIT_OPTIONS[key]
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="flex items-center gap-2 font-semibold text-[0.88rem] text-on-background">
                        <span className="material-symbols-outlined text-[18px] text-primary">{cfg.icon}</span>{cfg.label}
                      </span>
                      {opts.factor === 1 ? (
                        <span className="text-[0.72rem] text-outline">{opts.default}</span>
                      ) : (
                        <div className="flex rounded-md overflow-hidden border border-surface-variant">
                          {[opts.default, opts.alt].map(u => (
                            <button key={u} onClick={() => setUnits(p => ({ ...p, [key]: u }))}
                              className={`px-2.5 py-1 text-[0.68rem] border-none cursor-pointer ${
                                units[key] === u ? 'bg-primary text-white font-semibold' : 'bg-white text-outline'
                              }`}>
                              {u}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      type="number" inputMode="decimal" step="any" placeholder={cfg.placeholder}
                      value={values[key] || ''}
                      onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                      className="w-full border border-surface-variant rounded-lg px-3 py-2.5 text-[0.9rem] text-on-background outline-none focus:border-primary"
                    />
                    {cfg.hint && <p className="text-[0.72rem] text-outline mt-1.5 leading-snug">{cfg.hint}</p>}

                    {/* Progesterone cycle day */}
                    {key === 'progesterone' && values.progesterone && (
                      <div className="mt-3 p-3 bg-surface-container-low rounded-xl">
                        <label className="block text-[0.8rem] font-medium text-on-background mb-1.5">Cycle day of collection</label>
                        <input
                          type="number" inputMode="numeric" placeholder="e.g. 21"
                          value={values.progesterone_cycle_day || ''}
                          onChange={e => setValues(v => ({ ...v, progesterone_cycle_day: e.target.value }))}
                          className="w-full border border-surface-variant rounded-lg px-3 py-2 text-[0.85rem] text-on-background outline-none focus:border-primary"
                        />
                        <p className="text-[0.72rem] text-outline mt-1.5">Essential for interpreting progesterone correctly.</p>
                      </div>
                    )}

                    {/* Testosterone TRT flag */}
                    {key === 'testosterone' && values.testosterone && (
                      <label className="mt-3 p-3 bg-surface-container-low rounded-xl flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={!!values.on_trt}
                          onChange={e => setValues(v => ({ ...v, on_trt: e.target.checked }))}
                          className="w-[18px] h-[18px] mt-0.5 accent-primary cursor-pointer shrink-0" />
                        <span>
                          <span className="block text-[0.85rem] font-medium text-on-background">Patient is on testosterone replacement therapy</span>
                          <span className="block text-[0.72rem] text-outline leading-snug mt-0.5">TRT raises testosterone by design — flag it so the analysis focuses on dose monitoring rather than ruling out other causes.</span>
                        </span>
                      </label>
                    )}
                  </div>
                )
                  })}
                  </div>
                  )}
                </div>
                )
              })}
            </div>

            {/* Live indices, so the clinician sees the ratios before generating */}
            {derivedIndices(buildSubmitValues()).length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
                <p className="text-[0.68rem] tracking-widest uppercase text-outline font-semibold mb-3">Calculated</p>
                <div className="flex flex-col gap-2">
                  {derivedIndices(buildSubmitValues()).map(i => (
                    <div key={i.key} className="flex items-center justify-between gap-3">
                      <span className="text-[0.82rem] text-on-background">{i.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-[0.9rem] font-semibold text-on-background">{i.value}{i.suffix || ''}</span>
                        <span className="text-[0.7rem] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: `${i.color}15`, color: i.color }}>{i.status}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={handleAnalyze} disabled={!hasValues() || analyzing}
              className="w-full bg-primary text-white border-none py-3.5 rounded-full text-[0.9rem] font-semibold cursor-pointer disabled:opacity-40">
              {analyzing ? 'Analyzing…' : 'Generate analysis'}
            </button>
          </>
        )}

        {/* ─── REVIEW ────────────────────────────────────────────── */}
        {view === 'review' && (
          <>
            <p className="text-[0.82rem] text-outline mb-4">
              Review and edit before sharing. The patient will see exactly this text — <strong className="text-tertiary font-semibold">do not add any identifying information</strong>.
            </p>

            {/* Lab summary */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
              <p className="text-[0.68rem] tracking-widest uppercase text-outline font-semibold mb-3">Entered results</p>
              <div className="flex flex-wrap gap-2">
                {LAB_KEYS.filter(k => values[k]).map(key => {
                  const submit = buildSubmitValues()
                  const cd = key === 'progesterone' ? submit.progesterone_cycle_day : null
                  const r = evaluateLevel(key, submit[key], cd)
                  return (
                    <span key={key} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-[0.78rem]">
                      <span className="font-medium text-on-background">{LAB_CONFIG[key].label}</span>
                      <span className="text-outline">{submit[key]} {LAB_CONFIG[key].unit}</span>
                      {r && <span className="font-semibold" style={{ color: r.color }}>· {r.label}</span>}
                    </span>
                  )
                })}
              </div>
              {derivedIndices(buildSubmitValues()).length > 0 && (
                <div className="mt-4 pt-3 border-t border-surface-container flex flex-wrap gap-2">
                  {derivedIndices(buildSubmitValues()).map(i => (
                    <span key={i.key} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-[0.78rem]">
                      <span className="font-medium text-on-background">{i.label}</span>
                      <span className="text-outline">{i.value}{i.suffix || ''}</span>
                      <span className="font-semibold" style={{ color: i.color }}>· {i.status}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Interpretation editor */}
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
              <label className="block text-[0.68rem] tracking-widest uppercase text-outline font-semibold mb-2">Interpretation</label>
              <textarea value={interpretation} onChange={e => setInterpretation(e.target.value)} rows={10}
                className="w-full border border-surface-variant rounded-lg px-3 py-2.5 text-[0.85rem] leading-relaxed text-on-background outline-none focus:border-primary resize-y" />
            </div>

            {/* Recommendations editor */}
            <div className="mb-5">
              <p className="text-[0.68rem] tracking-widest uppercase text-outline font-semibold mb-3">Treatment options — check to include</p>
              {RECOMMENDATION_CATEGORIES.map(cat => {
                const items = recs.map((r, i) => ({ r, i })).filter(({ r }) => r.category === cat.key)
                return (
                  <div key={cat.key} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-wider text-secondary">
                        <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>{cat.label}
                      </span>
                      <button onClick={() => setRecs(rs => [...rs, { category: cat.key, title: '', detail: '', include: true }])}
                        className="text-[0.72rem] text-primary font-semibold bg-transparent border-none cursor-pointer">+ Add option</button>
                    </div>
                    {items.length === 0 && <p className="text-[0.75rem] text-outline-variant italic mb-1">No options in this category.</p>}
                    {items.map(({ r, i }) => (
                      <div key={i} className={`rounded-xl border p-3 mb-2 transition-colors ${r.include ? 'bg-white border-surface-variant' : 'bg-surface-container-low border-transparent opacity-60'}`}>
                        <div className="flex items-start gap-2.5">
                          <input type="checkbox" checked={r.include}
                            onChange={e => setRecs(rs => rs.map((x, xi) => xi === i ? { ...x, include: e.target.checked } : x))}
                            className="w-[18px] h-[18px] mt-1 accent-primary cursor-pointer shrink-0" />
                          <div className="flex-1">
                            <input value={r.title} placeholder="Option title"
                              onChange={e => setRecs(rs => rs.map((x, xi) => xi === i ? { ...x, title: e.target.value } : x))}
                              className="w-full border border-surface-variant rounded-md px-2.5 py-1.5 text-[0.85rem] font-medium text-on-background outline-none focus:border-primary mb-1.5" />
                            <textarea value={r.detail} placeholder="Plain-language explanation" rows={2}
                              onChange={e => setRecs(rs => rs.map((x, xi) => xi === i ? { ...x, detail: e.target.value } : x))}
                              className="w-full border border-surface-variant rounded-md px-2.5 py-1.5 text-[0.82rem] text-on-surface-variant outline-none focus:border-primary resize-y" />
                          </div>
                          <button onClick={() => setRecs(rs => rs.filter((_, xi) => xi !== i))}
                            className="text-outline hover:text-tertiary bg-transparent border-none cursor-pointer p-0.5" title="Remove">
                            <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setView('entry')}
                className="px-5 py-3 rounded-full border border-primary text-primary bg-white text-[0.85rem] font-semibold cursor-pointer">Back</button>
              <button onClick={handleCreateLink} disabled={creating}
                className="flex-1 bg-primary text-white border-none py-3 rounded-full text-[0.88rem] font-semibold cursor-pointer disabled:opacity-40">
                {creating ? 'Creating link…' : 'Create share link'}
              </button>
            </div>
          </>
        )}

        {/* ─── LINK ──────────────────────────────────────────────── */}
        {view === 'link' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center mb-6">
            <span className="material-symbols-outlined text-[40px] text-primary">check_circle</span>
            <h2 className="font-headline text-[1.4rem] font-normal text-on-background mt-2 mb-1">Share link ready</h2>
            <p className="text-[0.82rem] text-outline mb-4">
              Paste this into your patient portal. It contains no identifying information and expires{' '}
              {shareExpires ? new Date(shareExpires).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'in 30 days'}.
            </p>
            <div className="flex items-center gap-2 bg-surface-container-low rounded-lg p-2 mb-4">
              <input readOnly value={shareUrl} onFocus={e => e.target.select()}
                className="flex-1 bg-transparent border-none text-[0.82rem] text-on-background outline-none px-2" />
              <button onClick={() => copyLink(shareUrl)}
                className="bg-primary text-white border-none px-4 py-2 rounded-md text-[0.8rem] font-semibold cursor-pointer shrink-0">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="flex gap-3 justify-center">
              <a href={shareUrl} target="_blank" rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full border border-primary text-primary text-[0.82rem] font-semibold no-underline">Preview page</a>
              <button onClick={resetAll}
                className="px-5 py-2.5 rounded-full bg-primary text-white border-none text-[0.82rem] font-semibold cursor-pointer">New report</button>
            </div>
          </div>
        )}

        {/* ─── Existing reports ──────────────────────────────────── */}
        {reports.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mt-8">
            <h2 className="font-headline text-[1.15rem] font-normal text-on-background mb-4">Your shared reports</h2>
            <div className="flex flex-col divide-y divide-surface-container">
              {reports.map(r => {
                const expired = new Date(r.expires_at) < new Date()
                const url = `${window.location.origin}/r/${r.token}`
                const inactive = r.revoked || expired
                return (
                  <div key={r.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-[0.82rem] text-on-background">
                        {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {r.stage && r.stage !== 'unknown' && <span className="text-outline"> · {r.stage}</span>}
                      </p>
                      <p className={`text-[0.72rem] ${inactive ? 'text-tertiary' : 'text-outline'}`}>
                        {r.revoked ? 'Revoked' : expired ? 'Expired' : `Active · expires ${new Date(r.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!inactive && (
                        <>
                          <button onClick={() => copyLink(url)}
                            className="text-[0.75rem] text-primary font-semibold bg-primary/[0.07] px-3 py-1.5 rounded-full border-none cursor-pointer">Copy</button>
                          <button onClick={() => revokeReport(r.id)}
                            className="text-[0.75rem] text-tertiary font-semibold bg-tertiary/[0.07] px-3 py-1.5 rounded-full border-none cursor-pointer">Revoke</button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
