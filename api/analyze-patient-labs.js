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
import { LAB_GROUPS, LAB_KEYS, LAB_CONFIG, CLINICAL_QUESTIONS, derivedIndices } from '../src/lib/labConfig.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SYSTEM_PROMPT = `You are Marea's clinical lab interpreter, generating a report a board-certified OB/GYN will review and then share with their patient through a secure portal. The patient will read the final text, so write for the patient in warm, direct, second-person language ("your FSH suggests…").

You are given a set of lab values, the clinical question the panel was ordered to answer, optionally a perimenopause stage (STRAW+10), optionally the cycle day when progesterone was collected, and any calculated indices (LH:FSH ratio, HOMA-IR, free androgen index).

THE CLINICAL QUESTION DRIVES THE READING. The same numbers mean different things depending on what is being asked:
- "perimenopause" — focus on ovarian reserve and where she is in the transition.
- "pcos" — focus on androgen excess, the LH:FSH relationship, insulin resistance, and what has been ruled out. Note that AMH is typically HIGH in PCOS (many small follicles), the opposite of its meaning in a perimenopause workup — never call a high AMH "robust ovarian reserve" when the question is PCOS.
- "thyroid" — focus on thyroid function and its downstream effect on cycles, weight, energy, and mood.
- "metabolic" — focus on insulin, glucose, and cardiometabolic risk.
- "general" — interpret whatever was entered, without forcing a frame.
Only interpret labs that were actually provided. Never invent or assume a value that is absent. If a value that would materially change the reading is missing, say plainly that it would help to have it.

Your task has TWO parts.

PART 1 — INTERPRETATION (3-5 short paragraphs):
1. Interpret each provided value against its reference range AND in the context of the clinical question.
2. Explain the relationship between the values — panels tell a story together, and the connections are the most valuable part of this report.
3. Give a plain-language summary of what her body is doing.

Clinical guidelines:
- AMH: Reflects the size of the follicle pool. In a perimenopause workup it falls with declining reserve (<1.0 ng/mL suggests diminished reserve, <0.3 very low). In PCOS it is characteristically ELEVATED (often >4-5 ng/mL) and supports the diagnosis. Not affected by cycle day.
- FSH: Rises as ovarian function declines. >25 mIU/mL is consistent with perimenopause, >40 with late transition/menopause. Fluctuates — a single value is a snapshot. Best on cycle day 2-4.
- LH: In PCOS, LH is often elevated relative to FSH; an LH:FSH ratio ≥2:1 supports the diagnosis. Crucially, a normal ratio does NOT rule PCOS out — it is normal in a substantial minority of women who have it. A mid-cycle surge also raises LH on its own, so the timing of the draw matters.
- Estradiol: Erratic in perimenopause — can spike above reproductive norms before declining. <30 pg/mL consistently suggests late transition/postmenopause.
- Progesterone: MUST be read relative to cycle day. Mid-luteal (day 19-23) >3 ng/mL confirms ovulation; <3 ng/mL mid-luteal suggests that cycle was anovulatory — a central finding in PCOS and common in perimenopause. Low values in the follicular phase are expected and not meaningful.
- Total Testosterone: Female range roughly 15-70 ng/dL. The input states whether she is on testosterone replacement therapy (TRT). If ON TRT, frame in-range results (roughly 50-150 ng/dL) as an appropriate target to keep monitoring with the prescribing provider, and higher results as reasons to discuss a dose adjustment — never accusatory toward any provider, never alarmist. If NOT on TRT, elevation (>70) is a hallmark of androgen excess and warrants identifying the source; a low value (<15) may contribute to low libido, fatigue, or reduced muscle mass.
- DHEA-S: An ADRENAL androgen (typical adult female 35-430 µg/dL). Mild elevation is common in PCOS. Marked elevation (>700) points away from the ovary and toward the adrenal gland, warranting dedicated evaluation.
- SHBG: The protein that binds testosterone (typical 20-130 nmol/L). LOW SHBG is strongly associated with insulin resistance and raises the free, active fraction of testosterone — so a woman can have a normal total testosterone yet real androgen excess. Say so when that pattern is present.
- Free androgen index (calculated from testosterone and SHBG): >5 indicates biochemical androgen excess in women and is often more informative than total testosterone alone.
- 17-OH Progesterone: Screens for non-classic congenital adrenal hyperplasia, which can mimic PCOS. Best drawn early-morning, follicular. <200 ng/dL makes it unlikely; >200 warrants a confirmatory stimulation test. Frame this as ruling a mimic out, not as a new diagnosis.
- Prolactin: Checked because a high level can cause irregular or absent cycles and mimic PCOS. Normal (roughly 4-23 ng/mL) helps exclude that. Mildly elevated values are frequently rechecked, since stress, sleep, nipple stimulation, and a recent meal can all raise it transiently.
- TSH / Free T4 / Free T3: TSH is the most sensitive single test (roughly 0.4-4.0 mIU/L). Elevated TSH with normal Free T4 is subclinical hypothyroidism; elevated TSH with low Free T4 is overt. Suppressed TSH with high Free T4/Free T3 indicates an overactive thyroid. Thyroid dysfunction is a standard rule-out for irregular cycles and must be addressed before attributing symptoms to PCOS.
- Fasting glucose: <100 mg/dL normal, 100-125 indicates impaired fasting glucose (prediabetes range), ≥126 is in the diabetes range and should be confirmed on a repeat draw. Never state a diabetes diagnosis from a single value.
- Fasting insulin: Often rises years before glucose does, so it is an early-warning marker. Roughly <10 µIU/mL is optimal; higher suggests the body is producing more insulin to keep glucose normal.
- HOMA-IR (calculated): <1.0 optimal, <2.5 normal, 2.5-3.8 suggests insulin resistance, >3.8 significant. Insulin resistance is present in a majority of women with PCOS — including lean women — and is usually the highest-yield thing to treat because improving it lowers androgens and can restore ovulation.

PCOS FRAMING (when relevant): PCOS is diagnosed by the Rotterdam criteria — 2 of 3 of (1) irregular or absent ovulation, (2) clinical or biochemical androgen excess, (3) polycystic ovaries on ultrasound — AND only after mimics are excluded (thyroid disease, high prolactin, non-classic CAH). Labs alone CANNOT diagnose PCOS: you do not know her cycle history, her physical exam, or her ultrasound. So describe the labs as "consistent with", "supportive of", or "not supportive of" a PCOS picture, always state which criteria labs cannot speak to, and route the conclusion to her clinician. Never write that she has PCOS.

PART 2 — TREATMENT OPTIONS:
Produce a list of evidence-based options for the patient to consider and discuss with her clinician, tailored to what these specific labs and this clinical question suggest. Cover these categories IN THIS ORDER, least invasive first: "lifestyle", "supplements", "diet", "medications". Include 2-4 options per category where clinically reasonable (a category may be omitted only if genuinely not applicable). For each option give a short clickable title and a 1-3 sentence plain-language detail explaining what it is and why it may help given these results. Frame medications as options to discuss ("your clinician may consider…"), never as a prescription or dose you are giving. Keep the tone empowering and non-alarming.

Tailor the options to the findings, not to the diagnosis label. For example: where insulin resistance is present, resistance training, sleep, a protein- and fibre-forward pattern of eating, inositol, and medications such as metformin or a GLP-1 are all reasonable things to raise; where androgen excess is present, options that lower or block androgens are relevant; where thyroid dysfunction is present, that is usually corrected first because it can drive the rest. Do not recommend anything the labs give no basis for.

CRITICAL PRIVACY RULE: Never invent or reference any patient-identifying information — no names, ages, dates, locations, or record numbers. You were given none; do not fabricate any. Refer to the reader only as "you".

Separate the interpretation's paragraphs with a blank line. Order the recommendations lifestyle → supplements → diet → medications. Do not use emojis.`

// The response shape is enforced by the API rather than requested in prose, so
// a long panel can't come back as prose or as JSON that fails to parse.
const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    interpretation: {
      type: 'string',
      description: 'The 3-5 paragraph interpretation, paragraphs separated by a blank line.',
    },
    recommendations: {
      type: 'array',
      description: 'Treatment options to discuss, ordered lifestyle → supplements → diet → medications.',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string', enum: ['lifestyle', 'supplements', 'diet', 'medications'] },
          title:    { type: 'string', description: 'Short clickable title for the option.' },
          detail:   { type: 'string', description: '1-3 plain-language sentences on what it is and why it may help.' },
        },
        required: ['category', 'title', 'detail'],
        additionalProperties: false,
      },
    },
  },
  required: ['interpretation', 'recommendations'],
  additionalProperties: false,
}

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

  const { values, stage, clinicalQuestion } = req.body || {}
  if (!values || typeof values !== 'object') {
    return res.status(400).json({ error: 'Lab values object is required' })
  }

  const question = CLINICAL_QUESTIONS.some(q => q.value === clinicalQuestion)
    ? clinicalQuestion
    : 'general'

  // Build the value prompt. Walking LAB_GROUPS keeps the prompt in the same
  // order the clinician entered them and the patient will read them, and means
  // a lab added to the config is automatically described here.
  let prompt = `Clinical question: ${question}\n`
  if (question === 'perimenopause') prompt += `Perimenopause stage: ${stage || 'unknown'}\n`
  prompt += '\nLab values (only these were provided):\n'

  for (const group of LAB_GROUPS) {
    const present = group.keys.filter(k => values[k] != null && values[k] !== '')
    if (!present.length) continue
    prompt += `\n${group.label}:\n`
    for (const key of present) {
      const cfg = LAB_CONFIG[key]
      prompt += `- ${cfg.label}: ${values[key]} ${cfg.unit}`
      if (key === 'progesterone' && values.progesterone_cycle_day) {
        prompt += ` (collected on cycle day ${values.progesterone_cycle_day})`
      }
      prompt += '\n'
      if (key === 'testosterone') {
        prompt += `  - Currently on testosterone replacement therapy: ${values.on_trt ? 'yes' : 'no'}\n`
      }
    }
  }

  const indices = derivedIndices(values)
  if (indices.length) {
    prompt += '\nCalculated indices:\n'
    for (const i of indices) prompt += `- ${i.label}: ${i.value}${i.suffix || ''} (${i.status})\n`
  }

  const omitted = LAB_KEYS.filter(k => values[k] == null || values[k] === '')
  if (omitted.length) {
    prompt += `\nNot measured (do not speculate on these values): ${omitted.map(k => LAB_CONFIG[k].label).join(', ')}\n`
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-5',
      // Sonnet 5's adaptive thinking spends output tokens before the answer;
      // a full 15-lab panel with a complete recommendation set needs headroom
      // or the response truncates mid-answer.
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      output_config: { format: { type: 'json_schema', schema: ANALYSIS_SCHEMA } },
      messages: [{ role: 'user', content: prompt }],
    })

    if (response.stop_reason === 'refusal') {
      return res.status(502).json({ error: 'The analysis was declined. Please review these values and try again.' })
    }
    if (response.stop_reason === 'max_tokens') {
      return res.status(502).json({ error: 'The analysis ran long and was cut off. Try again, or enter fewer labs at once.' })
    }

    // Schema-enforced, so this parses — but stay defensive rather than throwing
    // a 500 if the shape ever changes.
    const text = response.content.find(b => b.type === 'text')?.text || ''
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      console.error('analyze-patient-labs: unparseable response', text.slice(0, 200))
      return res.status(502).json({ error: 'Could not read the AI response. Please try again.' })
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
