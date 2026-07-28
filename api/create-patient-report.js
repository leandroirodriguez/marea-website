// Admin-only endpoint that persists a clinician-reviewed lab report and
// returns its shareable URL. The clinician has already generated a draft via
// /api/analyze-patient-labs and edited it on /admin/labs; this stores the
// final version keyed by an unguessable token, expiring in 30 days.
//
// Privacy: only lab numbers, stage, and the (edited) AI text are stored —
// no patient identifiers. `created_by` is the CLINICIAN's id, for the admin
// management list only; it is never sent to the public page.
import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ALLOWED_CATEGORIES = ['lifestyle', 'supplements', 'diet', 'medications']
const LAB_FIELDS = ['amh', 'fsh', 'estradiol', 'testosterone', 'progesterone']

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Admin auth
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })
  const authToken = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(authToken)
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' })
  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return res.status(403).json({ error: 'Admin access required' })

  const { values, stage, interpretation, recommendations } = req.body || {}

  if (!interpretation || typeof interpretation !== 'string') {
    return res.status(400).json({ error: 'Interpretation is required' })
  }
  if (!values || typeof values !== 'object') {
    return res.status(400).json({ error: 'Lab values are required' })
  }

  // Whitelist labs — never persist stray fields that could carry identifiers.
  const labs = {}
  for (const key of LAB_FIELDS) {
    if (values[key] != null && values[key] !== '') {
      const num = Number(values[key])
      if (!Number.isNaN(num)) labs[key] = num
    }
  }
  if (values.on_trt) labs.on_trt = true
  if (values.progesterone_cycle_day != null && values.progesterone_cycle_day !== '') {
    const cd = parseInt(values.progesterone_cycle_day, 10)
    if (!Number.isNaN(cd)) labs.progesterone_cycle_day = cd
  }
  if (Object.keys(labs).length === 0) {
    return res.status(400).json({ error: 'At least one lab value is required' })
  }

  // Sanitize recommendations to the known shape.
  const cleanRecs = Array.isArray(recommendations)
    ? recommendations
        .filter(r => r && ALLOWED_CATEGORIES.includes(r.category) && r.title && r.detail)
        .map(r => ({
          category: r.category,
          title: String(r.title).slice(0, 200).trim(),
          detail: String(r.detail).slice(0, 1200).trim(),
        }))
    : []

  // Unguessable, URL-safe token (~24 chars of base64url ≈ 144 bits).
  const token = crypto.randomBytes(18).toString('base64url')

  const { data, error } = await supabase
    .from('patient_reports')
    .insert({
      token,
      stage: stage || null,
      labs,
      interpretation: interpretation.trim(),
      recommendations: cleanRecs,
      created_by: user.id,
    })
    .select('token, expires_at')
    .single()

  if (error) {
    console.error('create-patient-report error:', error)
    return res.status(500).json({ error: error.message })
  }

  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host  = req.headers['x-forwarded-host'] || req.headers.host
  const url = `${proto}://${host}/r/${data.token}`

  return res.status(200).json({ token: data.token, url, expires_at: data.expires_at })
}
