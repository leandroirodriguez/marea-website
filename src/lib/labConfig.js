// Shared hormone-lab configuration for the clinician Lab Analysis tool.
//
// Ported from the patient app (marea-app/src/pages/LabPage.jsx) so the admin
// entry form, the review screen, and the public server-rendered report page
// (api/report.js) all evaluate reference ranges identically. Plain JS (no
// JSX / React) on purpose: api/report.js is a Vercel serverless function and
// imports these helpers directly.
//
// A range may carry `plabel` / `pnote` — patient-facing wording used ONLY by
// the shared report page (api/report.js). The clinician's admin view keeps the
// clinical `label` / `note`; the patient page drops the perimenopause framing
// so a shared report reads as a general hormone panel.

// ─── Unit conversion ─────────────────────────────────────────────────────────

export const UNIT_OPTIONS = {
  amh:          { default: 'ng/mL',   alt: 'pmol/L',  factor: 7.14   },
  fsh:          { default: 'mIU/mL',  alt: 'IU/L',    factor: 1      },
  estradiol:    { default: 'pg/mL',   alt: 'pmol/L',  factor: 3.67   },
  testosterone: { default: 'ng/dL',   alt: 'nmol/L',  factor: 0.0347 },
  progesterone: { default: 'ng/mL',   alt: 'nmol/L',  factor: 3.18   },
  lh:           { default: 'mIU/mL',  alt: 'IU/L',    factor: 1       },
  dheas:        { default: 'µg/dL',   alt: 'µmol/L',  factor: 0.02714 },
  shbg:         { default: 'nmol/L',  alt: 'nmol/L',  factor: 1       },
  ohp17:        { default: 'ng/dL',   alt: 'nmol/L',  factor: 0.0303  },
  tsh:          { default: 'mIU/L',   alt: 'µIU/mL',  factor: 1       },
  ft4:          { default: 'ng/dL',   alt: 'pmol/L',  factor: 12.87   },
  ft3:          { default: 'pg/mL',   alt: 'pmol/L',  factor: 1.536   },
  glucose:      { default: 'mg/dL',   alt: 'mmol/L',  factor: 0.0555  },
  insulin:      { default: 'µIU/mL',  alt: 'pmol/L',  factor: 6.945   },
  prolactin:    { default: 'ng/mL',   alt: 'mIU/L',   factor: 21.2    },
}

export function convertToDefault(key, value, selectedUnit) {
  const opts = UNIT_OPTIONS[key]
  if (!opts || selectedUnit === opts.default) return value
  return +(value / opts.factor).toFixed(3)
}

// ─── Reference ranges ────────────────────────────────────────────────────────

export const LAB_CONFIG = {
  amh: {
    label: 'AMH',
    unit: 'ng/mL',
    icon: 'egg',
    placeholder: 'e.g. 1.2',
    ranges: [
      { max: 0.3,      level: 'low',    color: '#842b16', label: 'Very low',            note: 'Indicates significantly diminished ovarian reserve' },
      { max: 1.0,      level: 'low',    color: '#715b33', label: 'Low',                 note: 'Consistent with diminished ovarian reserve, common in perimenopause',
        pnote: 'Consistent with a diminished ovarian reserve' },
      { max: 3.5,      level: 'normal', color: '#2d6a35', label: 'Normal',              note: 'Within expected range' },
      // Deliberately dual-context: a high AMH means good ovarian reserve in a
      // perimenopause workup but supports PCOS (many small follicles) in a PCOS
      // one. A flat "robust ovarian reserve" would contradict the AI narrative
      // on a PCOS report.
      { max: Infinity, level: 'high',   color: '#005258', label: 'High',                note: 'Large follicle pool — good ovarian reserve, and a supporting finding when PCOS is being evaluated',
        pnote: 'Reflects a large pool of small follicles — a sign of good ovarian reserve, and also one of the supporting findings when PCOS is being considered' },
    ],
  },
  fsh: {
    label: 'FSH',
    unit: 'mIU/mL',
    icon: 'trending_up',
    placeholder: 'e.g. 28',
    ranges: [
      { max: 10,       level: 'normal', color: '#2d6a35', label: 'Premenopausal range', note: 'Within reproductive-age range',
        plabel: 'Reproductive-age range' },
      { max: 25,       level: 'normal', color: '#715b33', label: 'Transitional',        note: 'Consistent with early perimenopause',
        pnote: 'Consistent with an early hormonal transition' },
      { max: 40,       level: 'high',   color: '#842b16', label: 'Elevated',            note: 'Consistent with active perimenopause transition',
        pnote: 'Consistent with an active hormonal transition' },
      { max: Infinity, level: 'high',   color: '#842b16', label: 'Menopausal range',    note: 'Consistent with late transition or postmenopause',
        plabel: 'Elevated range', pnote: 'Consistent with a late hormonal transition' },
    ],
  },
  estradiol: {
    label: 'Estradiol',
    unit: 'pg/mL',
    icon: 'show_chart',
    placeholder: 'e.g. 45',
    ranges: [
      { max: 30,       level: 'low',    color: '#842b16', label: 'Low',                 note: 'Consistent with late perimenopause or postmenopause',
        pnote: 'Consistent with a later hormonal transition' },
      { max: 200,      level: 'normal', color: '#2d6a35', label: 'Normal range',        note: 'Within expected range (varies with cycle day)' },
      { max: 400,      level: 'high',   color: '#715b33', label: 'Elevated',            note: 'Common in perimenopause — estrogen can spike before declining',
        pnote: 'Common during hormonal transition — estrogen can spike before declining' },
      { max: Infinity, level: 'high',   color: '#842b16', label: 'Very high',           note: 'Significant spike — discuss with your provider' },
    ],
  },
  testosterone: {
    label: 'Total Testosterone',
    unit: 'ng/dL',
    icon: 'fitness_center',
    placeholder: 'e.g. 25',
    ranges: [
      { max: 15,       level: 'low',    color: '#842b16', label: 'Low',                 note: 'May contribute to low libido, fatigue, or reduced muscle mass' },
      { max: 70,       level: 'normal', color: '#2d6a35', label: 'Normal',              note: 'Within expected range' },
      { max: Infinity, level: 'high',   color: '#715b33', label: 'Elevated',            note: 'Discuss with your provider' },
    ],
  },
  progesterone: {
    label: 'Progesterone',
    unit: 'ng/mL',
    icon: 'nightlight',
    placeholder: 'e.g. 8.5',
    needsCycleDay: true,
    getRanges: (cycleDay) => {
      const isLuteal = cycleDay && cycleDay >= 15 && cycleDay <= 28
      if (isLuteal) {
        return [
          { max: 1,        level: 'low',    color: '#842b16', label: 'Very low (luteal)',   note: 'Strong indicator of anovulatory cycle' },
          { max: 3,        level: 'low',    color: '#715b33', label: 'Low (luteal)',        note: 'Suggests probable anovulation — common in perimenopause',
            pnote: 'Suggests this cycle may not have been ovulatory — a common finding during hormonal transition' },
          { max: 20,       level: 'normal', color: '#2d6a35', label: 'Normal (luteal)',     note: 'Confirms ovulation occurred this cycle' },
          { max: Infinity, level: 'high',   color: '#005258', label: 'High (luteal)',       note: 'Strong ovulatory response' },
        ]
      }
      return [
        { max: 1.5,      level: 'normal', color: '#2d6a35', label: 'Expected (follicular)',  note: 'Normal for follicular phase — progesterone is low before ovulation' },
        { max: Infinity, level: 'high',   color: '#715b33', label: 'Elevated (follicular)',  note: 'Unexpectedly high for follicular phase — discuss with provider' },
      ]
    },
  },

  // ── Gonadotropin ──────────────────────────────────────────────────────────
  lh: {
    label: 'LH',
    unit: 'mIU/mL',
    icon: 'stacked_line_chart',
    placeholder: 'e.g. 14',
    hint: 'Interpreted against FSH — an LH:FSH ratio at or above 2:1 supports PCOS.',
    ranges: [
      { max: 2,        level: 'low',    color: '#715b33', label: 'Low',         note: 'Below the typical range — can point to a signal coming from the pituitary rather than the ovaries' },
      { max: 12,       level: 'normal', color: '#2d6a35', label: 'Normal',      note: 'Within the expected range for the follicular phase' },
      { max: 20,       level: 'high',   color: '#715b33', label: 'Elevated',    note: 'Above the follicular range — expected around ovulation, otherwise worth interpreting alongside FSH' },
      { max: Infinity, level: 'high',   color: '#842b16', label: 'High',        note: 'Well above the follicular range — normal during the mid-cycle surge, otherwise interpreted alongside FSH' },
    ],
  },

  // ── Androgens ─────────────────────────────────────────────────────────────
  dheas: {
    label: 'DHEA-S',
    unit: 'µg/dL',
    icon: 'bolt',
    placeholder: 'e.g. 250',
    hint: 'An adrenal androgen. Elevation points to an adrenal rather than ovarian source.',
    ranges: [
      { max: 35,       level: 'low',    color: '#715b33', label: 'Low',         note: 'Below the typical range for adult women' },
      { max: 430,      level: 'normal', color: '#2d6a35', label: 'Normal',      note: 'Within the expected range for adult women' },
      { max: 700,      level: 'high',   color: '#715b33', label: 'Elevated',    note: 'Above the typical range — a common finding when androgens come partly from the adrenal glands' },
      { max: Infinity, level: 'high',   color: '#842b16', label: 'Markedly high', note: 'Well above the typical range — warrants evaluation of the adrenal glands' },
    ],
  },
  shbg: {
    label: 'SHBG',
    unit: 'nmol/L',
    icon: 'link',
    placeholder: 'e.g. 45',
    hint: 'Binds testosterone. Low SHBG raises free (active) testosterone and often tracks with insulin resistance.',
    ranges: [
      { max: 20,       level: 'low',    color: '#842b16', label: 'Low',         note: 'Low binding protein leaves more testosterone active, and often accompanies reduced insulin sensitivity' },
      { max: 130,      level: 'normal', color: '#2d6a35', label: 'Normal',      note: 'Within the expected range for adult women' },
      { max: Infinity, level: 'high',   color: '#715b33', label: 'Elevated',    note: 'Above the typical range — leaves less testosterone in its active form' },
    ],
  },
  ohp17: {
    label: '17-OH Progesterone',
    unit: 'ng/dL',
    icon: 'science',
    placeholder: 'e.g. 80',
    hint: 'Best drawn early morning in the follicular phase. Screens for non-classic CAH.',
    ranges: [
      { max: 200,      level: 'normal', color: '#2d6a35', label: 'Normal',      note: 'Within range — makes an inherited enzyme difference in the adrenal glands unlikely' },
      { max: 1000,     level: 'high',   color: '#715b33', label: 'Elevated',    note: 'Above the screening threshold — usually followed up with a confirmatory test' },
      { max: Infinity, level: 'high',   color: '#842b16', label: 'Markedly high', note: 'Well above the screening threshold — warrants confirmatory adrenal testing' },
    ],
  },

  // ── Thyroid ───────────────────────────────────────────────────────────────
  tsh: {
    label: 'TSH',
    unit: 'mIU/L',
    icon: 'tune',
    placeholder: 'e.g. 2.1',
    hint: 'The pituitary signal to the thyroid — the most sensitive single thyroid test.',
    ranges: [
      { max: 0.4,      level: 'low',    color: '#842b16', label: 'Low',         note: 'Below range — the pattern seen when the thyroid is running fast' },
      { max: 4.0,      level: 'normal', color: '#2d6a35', label: 'Normal',      note: 'Within the standard reference range' },
      { max: 10,       level: 'high',   color: '#715b33', label: 'Mildly elevated', note: 'Modestly above range — often the earliest sign of an underactive thyroid' },
      { max: Infinity, level: 'high',   color: '#842b16', label: 'Elevated',    note: 'Clearly above range — consistent with an underactive thyroid' },
    ],
  },
  ft4: {
    label: 'Free T4',
    unit: 'ng/dL',
    icon: 'air',
    placeholder: 'e.g. 1.2',
    ranges: [
      { max: 0.8,      level: 'low',    color: '#842b16', label: 'Low',         note: 'Below range — consistent with an underactive thyroid' },
      { max: 1.8,      level: 'normal', color: '#2d6a35', label: 'Normal',      note: 'Within the standard reference range' },
      { max: Infinity, level: 'high',   color: '#842b16', label: 'Elevated',    note: 'Above range — consistent with an overactive thyroid' },
    ],
  },
  ft3: {
    label: 'Free T3',
    unit: 'pg/mL',
    icon: 'speed',
    placeholder: 'e.g. 3.1',
    ranges: [
      { max: 2.3,      level: 'low',    color: '#715b33', label: 'Low',         note: 'Below range — can accompany an underactive thyroid or illness' },
      { max: 4.2,      level: 'normal', color: '#2d6a35', label: 'Normal',      note: 'Within the standard reference range' },
      { max: Infinity, level: 'high',   color: '#842b16', label: 'Elevated',    note: 'Above range — consistent with an overactive thyroid' },
    ],
  },

  // ── Metabolic ─────────────────────────────────────────────────────────────
  glucose: {
    label: 'Fasting glucose',
    unit: 'mg/dL',
    icon: 'water_drop',
    placeholder: 'e.g. 92',
    hint: 'Requires an 8+ hour fast. Paired with insulin to calculate HOMA-IR.',
    ranges: [
      { max: 70,       level: 'low',    color: '#715b33', label: 'Low',         note: 'Below the usual fasting range' },
      { max: 99,       level: 'normal', color: '#2d6a35', label: 'Normal',      note: 'Within the normal fasting range' },
      { max: 125,      level: 'high',   color: '#715b33', label: 'Elevated',    note: 'In the range that indicates reduced blood-sugar control, before diabetes' },
      { max: Infinity, level: 'high',   color: '#842b16', label: 'High',        note: 'In the diabetes range — usually confirmed with a repeat test' },
    ],
  },
  insulin: {
    label: 'Fasting insulin',
    unit: 'µIU/mL',
    icon: 'monitor_heart',
    placeholder: 'e.g. 8',
    hint: 'Requires an 8+ hour fast. Often rises years before glucose does.',
    ranges: [
      { max: 2,        level: 'low',    color: '#715b33', label: 'Low',         note: 'Below the usual fasting range' },
      { max: 10,       level: 'normal', color: '#2d6a35', label: 'Optimal',     note: 'In the range associated with good insulin sensitivity' },
      { max: 25,       level: 'high',   color: '#715b33', label: 'Elevated',    note: 'Higher than optimal — suggests the body is working harder to keep blood sugar steady' },
      { max: Infinity, level: 'high',   color: '#842b16', label: 'High',        note: 'Well above optimal — consistent with meaningful insulin resistance' },
    ],
  },

  // ── Pituitary ─────────────────────────────────────────────────────────────
  prolactin: {
    label: 'Prolactin',
    unit: 'ng/mL',
    icon: 'psychology',
    placeholder: 'e.g. 12',
    hint: 'Checked to rule out a pituitary cause of irregular cycles.',
    ranges: [
      { max: 4,        level: 'low',    color: '#715b33', label: 'Low',         note: 'Below the typical range — rarely significant on its own' },
      { max: 23,       level: 'normal', color: '#2d6a35', label: 'Normal',      note: 'Within the expected range, which makes a pituitary cause unlikely' },
      { max: 100,      level: 'high',   color: '#715b33', label: 'Elevated',    note: 'Above range — usually rechecked, as stress and even a recent meal can raise it' },
      { max: Infinity, level: 'high',   color: '#842b16', label: 'Markedly high', note: 'Well above range — warrants further evaluation of the pituitary gland' },
    ],
  },
}

// Display order and sectioning for both the clinician form and the patient
// report. LAB_KEYS is derived from this so the two can never drift apart.
export const LAB_GROUPS = [
  { key: 'ovarian',   label: 'Ovarian & reproductive', icon: 'egg',              keys: ['amh', 'fsh', 'lh', 'estradiol', 'progesterone'] },
  { key: 'androgen',  label: 'Androgens',              icon: 'fitness_center',   keys: ['testosterone', 'dheas', 'shbg', 'ohp17'] },
  { key: 'thyroid',   label: 'Thyroid',                icon: 'tune',             keys: ['tsh', 'ft4', 'ft3'] },
  { key: 'metabolic', label: 'Metabolic',              icon: 'water_drop',       keys: ['glucose', 'insulin'] },
  { key: 'pituitary', label: 'Pituitary',              icon: 'psychology',       keys: ['prolactin'] },
]

export const LAB_KEYS = LAB_GROUPS.flatMap(g => g.keys)

export function evaluateLevel(key, value, cycleDay) {
  const config = LAB_CONFIG[key]
  if (!config) return null
  const ranges = config.getRanges ? config.getRanges(cycleDay) : config.ranges
  return ranges.find(r => value <= r.max) || null
}

// Perimenopause stages, aligned with the app's STRAW+10 staging language.
export const STAGE_OPTIONS = [
  { value: 'early transition', label: 'Early transition' },
  { value: 'mid transition',   label: 'Mid transition' },
  { value: 'late transition',  label: 'Late transition' },
  { value: 'postmenopause',    label: 'Postmenopause' },
  { value: 'unknown',          label: 'Unknown / not staged' },
]

// What the clinician is working up. Steers the AI's lens — a panel read for
// PCOS asks different questions of the same numbers than one read for the
// menopausal transition. `needsStage` controls whether the STRAW+10 stage
// selector is relevant.
export const CLINICAL_QUESTIONS = [
  { value: 'perimenopause', label: 'Perimenopause / menopausal transition', needsStage: true,
    hint: 'Ovarian reserve and where she is in the transition.' },
  { value: 'pcos',          label: 'PCOS / irregular cycles',               needsStage: false,
    hint: 'Androgen excess, LH:FSH, insulin resistance, and the rule-outs.' },
  { value: 'thyroid',       label: 'Thyroid',                               needsStage: false,
    hint: 'Thyroid function and its downstream effect on cycles.' },
  { value: 'metabolic',     label: 'Metabolic / insulin resistance',        needsStage: false,
    hint: 'Glucose, insulin, and cardiometabolic risk.' },
  { value: 'general',       label: 'General hormone panel',                 needsStage: false,
    hint: 'No specific question — interpret whatever is entered.' },
]

// ─── Derived indices ─────────────────────────────────────────────────────────
// Ratios that carry more meaning than any single value. Computed from values
// already converted to default units. Returned in a display-ready shape and
// shared by the AI prompt, the clinician review screen, and the patient report.

const TESTOSTERONE_NG_DL_TO_NMOL_L = 0.0347

function band(value, bands) {
  return bands.find(b => value <= b.max) || bands[bands.length - 1]
}

export function derivedIndices(v = {}) {
  const out = []

  // LH:FSH — a ratio at or above 2:1 supports PCOS, though it is normal in a
  // substantial minority of women who have it, and the mid-cycle LH surge can
  // push it up on its own.
  if (v.lh != null && v.fsh != null && v.fsh > 0) {
    const r = v.lh / v.fsh
    const b = band(r, [
      { max: 1,        color: '#2d6a35', status: 'Typical',  note: 'LH and FSH are in their usual balance.' },
      { max: 2,        color: '#715b33', status: 'Mid-range', note: 'LH is running somewhat ahead of FSH.' },
      { max: Infinity, color: '#842b16', status: 'Elevated', note: 'LH is running well ahead of FSH — one of the supporting patterns in PCOS, though it can also reflect the timing of the draw.' },
    ])
    out.push({ key: 'lhfsh', label: 'LH : FSH ratio', value: r.toFixed(2), suffix: ': 1', ...b })
  }

  // HOMA-IR — fasting insulin resistance estimate.
  if (v.insulin != null && v.glucose != null) {
    const h = (v.insulin * v.glucose) / 405
    const b = band(h, [
      { max: 1.0,      color: '#2d6a35', status: 'Optimal',  note: 'Suggests the body is handling blood sugar efficiently.' },
      { max: 2.5,      color: '#2d6a35', status: 'Normal',  note: 'Within the range associated with healthy insulin sensitivity.' },
      { max: 3.8,      color: '#842b16', status: 'Elevated', note: 'Suggests reduced insulin sensitivity, a frequent and very treatable driver in PCOS.' },
      { max: Infinity, color: '#842b16', status: 'High',     note: 'Suggests significant insulin resistance — often the highest-yield thing to address.' },
    ])
    out.push({ key: 'homair', label: 'HOMA-IR', value: h.toFixed(2), ...b })
  }

  // Free androgen index — how much testosterone is actually unbound and active.
  if (v.testosterone != null && v.shbg != null && v.shbg > 0) {
    const fai = ((v.testosterone * TESTOSTERONE_NG_DL_TO_NMOL_L) / v.shbg) * 100
    const b = band(fai, [
      { max: 5,        color: '#2d6a35', status: 'Normal',   note: 'The active fraction of testosterone is within the usual range for women.' },
      { max: 10,       color: '#715b33', status: 'Elevated', note: 'More testosterone is circulating in its active form than is typical.' },
      { max: Infinity, color: '#842b16', status: 'High',     note: 'A large share of testosterone is unbound and active — the biochemical picture behind symptoms like acne, hair changes, and irregular cycles.' },
    ])
    out.push({ key: 'fai', label: 'Free androgen index', value: fai.toFixed(1), ...b })
  }

  return out
}

// The four treatment-option categories, in the order the patient should see
// them (least invasive first). Shared so the AI prompt, the review screen,
// and the public report all agree on grouping and order.
export const RECOMMENDATION_CATEGORIES = [
  { key: 'lifestyle',   label: 'Lifestyle changes', icon: 'self_improvement' },
  { key: 'supplements', label: 'Supplements',       icon: 'medication' },
  { key: 'diet',        label: 'Diet',              icon: 'nutrition' },
  { key: 'medications', label: 'Medications',       icon: 'pill' },
]
