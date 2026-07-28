// Admin-only endpoint that turns a patient's hormone labs into (a) a
// plain-language interpretation and (b) a curated, categorized list of
// treatment OPTIONS to discuss. The clinician reviews/edits the result on
// /admin/labs before a shareable patient link is created. Nothing is
// persisted here — this is the draft.
//
// The clinical interpretation prompt is ported from the patient app
// (marea-app/api/interpret-labs.js) so the science stays consistent across
// products. It is extended to also emit structured recommendations.
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SYSTEM_PROMPT = `You are Marea's clinical lab interpreter, generating a report a board-certified OB/GYN will review and then share with their patient through a secure portal. The patient will read the final text, so write for the patient in warm, direct, second-person language ("your FSH suggests…").

You are given a set of hormone lab values, the woman's perimenopause stage (early/mid/late transition based on STRAW+10), and optionally the cycle day when progesterone was collected.

Your task has TWO parts.

PART 1 — INTERPRETATION (3-5 short paragraphs):
1. Interpret each value in the context of perimenopause — not just against standard reference ranges, but in terms of what the value means for a woman in this specific stage of the menopausal transition.
2. Explain the relationship between the values. Hormone panels tell a story together: FSH rising while AMH falls confirms ovarian reserve decline. Low progesterone with high FSH suggests anovulatory cycles. High estradiol with irregular cycles may indicate estrogen dominance.
3. Provide a plain-language summary that helps the woman understand what her body is doing.

Clinical guidelines:
- AMH: Reflects ovarian reserve. Declines steadily through perimenopause. <1.0 ng/mL in perimenopause suggests diminished reserve. <0.3 ng/mL is very low. Not affected by cycle day.
- FSH: Rises as ovarian function declines. >25 mIU/mL is consistent with perimenopause. >40 mIU/mL suggests late transition/menopause. Fluctuates significantly — a single value is a snapshot, not a definitive answer. Best measured on cycle day 2-4.
- Estradiol (E2): Erratic in perimenopause — can spike higher than reproductive norms before eventually declining. <30 pg/mL consistently suggests late transition/postmenopause. Very high levels (>300) during perimenopause are common and reflect the erratic ovarian function of the transition. Best measured on cycle day 2-4.
- Total Testosterone: Female reference range is typically 15-70 ng/dL. Declines gradually with age. The input tells you whether the patient is on testosterone replacement therapy (TRT). If ON TRT, frame in-range results (roughly 50-150 ng/dL) as an appropriate target to keep monitoring with the prescribing provider, and higher results as reasons to discuss a possible dose adjustment — never accusatory toward any provider, never alarmist. If NOT on TRT, an elevated value (>70) warrants follow-up to identify a cause (PCOS, adrenal or ovarian sources) framed as a starting point, and a low value (<15) may contribute to low libido, fatigue, or reduced muscle mass.
- Progesterone: MUST be interpreted relative to cycle day. Mid-luteal (day 19-23) progesterone >3 ng/mL confirms ovulation. <3 ng/mL mid-luteal suggests anovulation — common and significant in perimenopause. If drawn in follicular phase, low values are expected and not meaningful.

PART 2 — TREATMENT OPTIONS:
Produce a list of evidence-based options for the patient to consider and discuss with her clinician, tailored to what these specific labs and stage suggest. Cover these categories IN THIS ORDER, least invasive first: "lifestyle", "supplements", "diet", "medications". Include 2-4 options per category where clinically reasonable (a category may be omitted only if genuinely not applicable). For each option give a short clickable title and a 1-3 sentence plain-language detail explaining what it is and why it may help given these results. Frame medications as options to discuss ("your clinician may consider…"), never as a prescription or dose you are giving. Keep the tone empowering and non-alarming.

CRITICAL PRIVACY RULE: Never invent or reference any patient-identifying information — no names, ages, dates, locations, or record numbers. You were given none; do not fabricate any. Refer to the reader only as "you".

OUTPUT FORMAT — return ONLY a JSON object, no prose around it:
{
  "interpretation": "the 3-5 paragraph interpretation, paragraphs separated by \\n\\n",
  "recommendations": [
    { "category": "lifestyle", "title": "…", "detail": "…" },
    { "category": "supplements", "title": "…", "detail": "…" },
    { "category": "diet", "title": "…", "detail": "…" },
    { "category": "medications", "title": "…", "detail": "…" }
  ]
}
Every recommendation's "category" MUST be exactly one of: "lifestyle", "supplements", "diet", "medications". Do not use emojis.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Admin auth — same pattern as api/generate-article.js
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' })
  const { data: profile } = await supabase.from('users').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return res.status(403).json({ error: 'Admin access required' })

  const { values, stage } = req.body || {}
  if (!values || typeof values !== 'object') {
    return res.status(400).json({ error: 'Lab values object is required' })
  }

  // Build the value prompt (mirrors marea-app/api/interpret-labs.js)
  let prompt = `Perimenopause stage: ${stage || 'unknown'}\n\nLab values:\n`
  if (values.amh != null)          prompt += `- AMH: ${values.amh} ng/mL\n`
  if (values.fsh != null)          prompt += `- FSH: ${values.fsh} mIU/mL\n`
  if (values.estradiol != null)    prompt += `- Estradiol: ${values.estradiol} pg/mL\n`
  if (values.testosterone != null) {
    prompt += `- Total Testosterone: ${values.testosterone} ng/dL\n`
    prompt += `  - Currently on testosterone replacement therapy: ${values.on_trt ? 'yes' : 'no'}\n`
  }
  if (values.progesterone != null) {
    prompt += `- Progesterone: ${values.progesterone} ng/mL`
    if (values.progesterone_cycle_day) prompt += ` (collected on cycle day ${values.progesterone_cycle_day})`
    prompt += '\n'
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0]?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return res.status(502).json({ error: 'Could not parse AI response' })

    let parsed
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return res.status(502).json({ error: 'Malformed AI response' })
    }

    const ALLOWED = ['lifestyle', 'supplements', 'diet', 'medications']
    const recommendations = Array.isArray(parsed.recommendations)
      ? parsed.recommendations
          .filter(r => r && ALLOWED.includes(r.category) && r.title && r.detail)
          .map(r => ({
            category: r.category,
            title: String(r.title).trim(),
            detail: String(r.detail).trim(),
          }))
      : []

    return res.status(200).json({
      interpretation: String(parsed.interpretation || '').trim(),
      recommendations,
    })
  } catch (err) {
    console.error('analyze-patient-labs error:', err)
    return res.status(500).json({ error: 'Failed to analyze labs' })
  }
}
