// Shared hormone-lab configuration for the clinician Lab Analysis tool.
//
// Ported from the patient app (marea-app/src/pages/LabPage.jsx) so the admin
// entry form, the review screen, and the public server-rendered report page
// (api/report.js) all evaluate reference ranges identically. Plain JS (no
// JSX / React) on purpose: api/report.js is a Vercel serverless function and
// imports these helpers directly.

// ─── Unit conversion ─────────────────────────────────────────────────────────

export const UNIT_OPTIONS = {
  amh:          { default: 'ng/mL',   alt: 'pmol/L',  factor: 7.14   },
  fsh:          { default: 'mIU/mL',  alt: 'IU/L',    factor: 1      },
  estradiol:    { default: 'pg/mL',   alt: 'pmol/L',  factor: 3.67   },
  testosterone: { default: 'ng/dL',   alt: 'nmol/L',  factor: 0.0347 },
  progesterone: { default: 'ng/mL',   alt: 'nmol/L',  factor: 3.18   },
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
      { max: 1.0,      level: 'low',    color: '#715b33', label: 'Low',                 note: 'Consistent with diminished ovarian reserve, common in perimenopause' },
      { max: 3.5,      level: 'normal', color: '#2d6a35', label: 'Normal',              note: 'Within expected range' },
      { max: Infinity, level: 'high',   color: '#005258', label: 'High',                note: 'Robust ovarian reserve' },
    ],
  },
  fsh: {
    label: 'FSH',
    unit: 'mIU/mL',
    icon: 'trending_up',
    placeholder: 'e.g. 28',
    ranges: [
      { max: 10,       level: 'normal', color: '#2d6a35', label: 'Premenopausal range', note: 'Within reproductive-age range' },
      { max: 25,       level: 'normal', color: '#715b33', label: 'Transitional',        note: 'Consistent with early perimenopause' },
      { max: 40,       level: 'high',   color: '#842b16', label: 'Elevated',            note: 'Consistent with active perimenopause transition' },
      { max: Infinity, level: 'high',   color: '#842b16', label: 'Menopausal range',    note: 'Consistent with late transition or postmenopause' },
    ],
  },
  estradiol: {
    label: 'Estradiol',
    unit: 'pg/mL',
    icon: 'show_chart',
    placeholder: 'e.g. 45',
    ranges: [
      { max: 30,       level: 'low',    color: '#842b16', label: 'Low',                 note: 'Consistent with late perimenopause or postmenopause' },
      { max: 200,      level: 'normal', color: '#2d6a35', label: 'Normal range',        note: 'Within expected range (varies with cycle day)' },
      { max: 400,      level: 'high',   color: '#715b33', label: 'Elevated',            note: 'Common in perimenopause — estrogen can spike before declining' },
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
          { max: 3,        level: 'low',    color: '#715b33', label: 'Low (luteal)',        note: 'Suggests probable anovulation — common in perimenopause' },
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
}

export const LAB_KEYS = ['amh', 'fsh', 'estradiol', 'testosterone', 'progesterone']

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

// The four treatment-option categories, in the order the patient should see
// them (least invasive first). Shared so the AI prompt, the review screen,
// and the public report all agree on grouping and order.
export const RECOMMENDATION_CATEGORIES = [
  { key: 'lifestyle',   label: 'Lifestyle changes', icon: 'self_improvement' },
  { key: 'supplements', label: 'Supplements',       icon: 'medication' },
  { key: 'diet',        label: 'Diet',              icon: 'nutrition' },
  { key: 'medications', label: 'Medications',       icon: 'pill' },
]
