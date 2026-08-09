/* ============================================================
   Marea icon set — website

   Ported verbatim from the app's src/components/Icon.jsx so the two
   surfaces draw the same glyphs. Hand-drawn strokes on a 24x24 grid,
   1.4px, round caps and joins, always currentColor. Replaces Material
   Symbols Outlined, whose geometric-rounded style read as generic and
   fought the serif + cream identity.

   One deliberate difference from the app version: the app reads its box
   size out of an inline `style.fontSize`, because that is how its call
   sites were written. This codebase is Tailwind, so the svg is sized in
   `em` and inherits whatever `text-*` class sits on it or its parent —
   `<Icon name="check" className="text-[20px] text-primary" />` needs no
   size prop, and colour comes through currentColor.

   Names not in the table below fall through to the Material font, which
   index.css re-weights to wght 200 / GRAD -25 so the fallback sits at
   the same visual weight and doesn't look like a second icon system.
   That path matters here: several call sites take their icon name from
   the database (lab groups, admin dashboard tiles).
   ============================================================ */
const S = 1.4

// Zero-length path + round cap = a dot.
const dot = (x, y) => `M${x} ${y}h.01`

const GLYPHS = {
  /* -- chrome ------------------------------------------------------- */
  chevron_right:   ['M9.5 5.5 16 12l-6.5 6.5'],
  chevron_left:    ['M14.5 5.5 8 12l6.5 6.5'],
  expand_more:     ['M5.5 9.5 12 16l6.5-6.5'],
  expand_less:     ['M5.5 14.5 12 8l6.5 6.5'],
  arrow_forward:   ['M4 12h15', 'M13 6l6 6-6 6'],
  arrow_back:      ['M20 12H5', 'M11 6l-6 6 6 6'],
  arrow_upward:    ['M12 20V5', 'M6 11l6-6 6 6'],
  arrow_downward:  ['M12 4v15', 'M6 13l6 6 6-6'],
  close:           ['M6.5 6.5l11 11', 'M17.5 6.5l-11 11'],
  cancel:          ['M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2z', 'M9.2 9.2l5.6 5.6', 'M14.8 9.2l-5.6 5.6'],
  check:           ['M5 12.5l4.5 4.5L19 7.5'],
  add:             ['M12 5v14', 'M5 12h14'],
  horizontal_rule: ['M5 12h14'],
  search:          ['M11 4.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4z', 'M15.6 15.6 20 20'],
  edit:            ['M4.5 19.5l.9-4 10-10a2.05 2.05 0 0 1 2.9 2.9l-10 10z', 'M14.4 6.6l2.9 2.9'],
  delete_outline:  ['M5 7h14', 'M9.5 7V5.4A1.4 1.4 0 0 1 10.9 4h2.2a1.4 1.4 0 0 1 1.4 1.4V7', 'M6.6 7l.8 11.7A1.4 1.4 0 0 0 8.8 20h6.4a1.4 1.4 0 0 0 1.4-1.3L17.4 7'],
  share:           ['M6 9.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z', 'M17 4.1a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z', 'M17 15.1a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z', 'M8.2 10.9 14.8 7.6', 'M8.2 13.1 14.8 16.4'],

  /* -- state -------------------------------------------------------- */
  check_circle:    ['M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2z', 'M8.2 12.3l2.7 2.7 5-5.4'],
  lock:            ['M6.6 10.2h10.8a1.8 1.8 0 0 1 1.8 1.8v5.9a1.8 1.8 0 0 1-1.8 1.8H6.6a1.8 1.8 0 0 1-1.8-1.8V12a1.8 1.8 0 0 1 1.8-1.8z', 'M8.6 10.2V7.9a3.4 3.4 0 0 1 6.8 0v2.3'],
  warning:         ['M12 4.6l8.4 14.4a.9.9 0 0 1-.8 1.4H4.4a.9.9 0 0 1-.8-1.4z', 'M12 10v4', dot(12, 17.2)],
  priority_high:   ['M12 5.4v8.4', dot(12, 18)],
  info:            ['M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2z', 'M12 11.2v5', dot(12, 7.9)],
  help_outline:    ['M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2z', 'M9.6 9.6a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.8-.9 1.4v.7', dot(12, 16.8)],
  shield:          ['M12 3.3l7.2 2.6v5.5c0 4.3-3 7.8-7.2 9.6-4.2-1.8-7.2-5.3-7.2-9.6V5.9z'],
  verified:        ['M12 3.3l7.2 2.6v5.5c0 4.3-3 7.8-7.2 9.6-4.2-1.8-7.2-5.3-7.2-9.6V5.9z', 'M8.9 11.8l2.3 2.3 4-4.4'],
  flag:            ['M6 21V4.4', 'M6 5.2h11.6l-2.2 3.9 2.2 3.9H6'],

  /* -- nav tabs (identity glyphs) ----------------------------------- */
  // Home: the Marea orb riding the tide, not a house.
  home_app_logo:   ['M12 4.2a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4z', 'M3 16.8c2-1.9 4-1.9 6 0s4 1.9 6 0 4-1.9 6 0', 'M3 20.2c2-1.9 4-1.9 6 0s4 1.9 6 0 4-1.9 6 0'],
  analytics:       ['M3.5 15.8l4.4-4.7 3.3 2.9 4.3-6.1 5 5.1', 'M3.5 20h17'],
  auto_stories:    ['M12 7.8v11.7', 'M12 7.8C10.4 6.2 8.2 5.6 4.6 5.6v11.7c3.6 0 5.8.6 7.4 2.2', 'M12 7.8c1.6-1.6 3.8-2.2 7.4-2.2v11.7c-3.6 0-5.8.6-7.4 2.2'],
  menu_book:       ['M12 7.8v11.7', 'M12 7.8C10.4 6.2 8.2 5.6 4.6 5.6v11.7c3.6 0 5.8.6 7.4 2.2', 'M12 7.8c1.6-1.6 3.8-2.2 7.4-2.2v11.7c-3.6 0-5.8.6-7.4 2.2'],
  // Intimacy: two arcs meeting in a vesica. Not a lotus.
  spa:             ['M11.4 4.4A9 9 0 0 0 11.4 19.6', 'M12.6 4.4A9 9 0 0 1 12.6 19.6'],
  chat_bubble:     ['M20 14.6a2.6 2.6 0 0 1-2.6 2.6H9.2L4.5 20.6V7a2.6 2.6 0 0 1 2.6-2.6h10.3A2.6 2.6 0 0 1 20 7z'],
  chat:            ['M20 14.6a2.6 2.6 0 0 1-2.6 2.6H9.2L4.5 20.6V7a2.6 2.6 0 0 1 2.6-2.6h10.3A2.6 2.6 0 0 1 20 7z'],

  /* -- tide & body -------------------------------------------------- */
  waves:           ['M2.4 7.6c2.1-2 4.3-2 6.4 0s4.3 2 6.4 0 4.3-2 6.4 0', 'M2.4 12.4c2.1-2 4.3-2 6.4 0s4.3 2 6.4 0 4.3-2 6.4 0', 'M2.4 17.2c2.1-2 4.3-2 6.4 0s4.3 2 6.4 0 4.3-2 6.4 0'],
  bedtime:         ['M19.6 15.1A8.2 8.2 0 0 1 8.9 4.4a8.2 8.2 0 1 0 10.7 10.7z'],
  nightlight:      ['M19.6 15.1A8.2 8.2 0 0 1 8.9 4.4a8.2 8.2 0 1 0 10.7 10.7z'],
  thermostat:      ['M14 14.4V6.2a2 2 0 1 0-4 0v8.2a4 4 0 1 0 4 0z', 'M12 9.4v5.6'],
  water_drop:      ['M12 3.6s6 6.1 6 9.9a6 6 0 0 1-12 0c0-3.8 6-9.9 6-9.9z'],
  shower:          ['M12 3.6s6 6.1 6 9.9a6 6 0 0 1-12 0c0-3.8 6-9.9 6-9.9z'],
  bolt:            ['M13.6 3.6L6.4 13.6h4.9l-1 6.8 7.3-10.1h-4.9z'],
  // Focus / mind: ripples spreading from a center. Fits the tide
  // language far better than a brain outline, and reads at 16px.
  neurology:       ['M12 9.7a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6z', 'M7.9 16.1a5.8 5.8 0 0 1 0-8.2', 'M16.1 7.9a5.8 5.8 0 0 1 0 8.2', 'M5 19a9.9 9.9 0 0 1 0-14', 'M19 5a9.9 9.9 0 0 1 0 14'],
  psychology:      ['M12 9.7a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6z', 'M7.9 16.1a5.8 5.8 0 0 1 0-8.2', 'M16.1 7.9a5.8 5.8 0 0 1 0 8.2', 'M5 19a9.9 9.9 0 0 1 0-14', 'M19 5a9.9 9.9 0 0 1 0 14'],
  sentiment_calm:  ['M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2z', 'M8.4 14.2a4.4 4.4 0 0 0 7.2 0', dot(9.4, 9.8), dot(14.6, 9.8)],
  mood:            ['M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2z', 'M8.4 14.2a4.4 4.4 0 0 0 7.2 0', dot(9.4, 9.8), dot(14.6, 9.8)],
  mood_bad:        ['M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2z', 'M8.4 15.4a4.4 4.4 0 0 1 7.2 0', dot(9.4, 9.8), dot(14.6, 9.8)],
  favorite:        ['M12 20.4S3.6 15.6 3.6 9.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.4 2.6c0 6-8.4 10.8-8.4 10.8z'],
  monitor_heart:   ['M12 20.4S3.6 15.6 3.6 9.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.4 2.6c0 6-8.4 10.8-8.4 10.8z'],
  cycle:           ['M20.2 12a8.2 8.2 0 1 1-2.4-5.8', 'M13.6 4.6l4.4 1.6-1.6 4.4'],
  schedule:        ['M12 3.6a8.4 8.4 0 1 0 0 16.8 8.4 8.4 0 0 0 0-16.8z', 'M12 7.2V12l3.2 1.9'],
  calendar_today:  ['M6.2 5.4h11.6A2.2 2.2 0 0 1 20 7.6v10.2a2.2 2.2 0 0 1-2.2 2.2H6.2A2.2 2.2 0 0 1 4 17.8V7.6a2.2 2.2 0 0 1 2.2-2.2z', 'M4 9.8h16', 'M8.4 3.6v3.4', 'M15.6 3.6v3.4'],
  mail:            ['M5.6 5.6h12.8a2.2 2.2 0 0 1 2.2 2.2v8.4a2.2 2.2 0 0 1-2.2 2.2H5.6a2.2 2.2 0 0 1-2.2-2.2V7.8a2.2 2.2 0 0 1 2.2-2.2z', 'M3.9 7.4l8.1 5.4 8.1-5.4'],
  mark_email_read: ['M5.6 5.6h12.8a2.2 2.2 0 0 1 2.2 2.2v8.4a2.2 2.2 0 0 1-2.2 2.2H5.6a2.2 2.2 0 0 1-2.2-2.2V7.8a2.2 2.2 0 0 1 2.2-2.2z', 'M3.9 7.4l8.1 5.4 8.1-5.4', 'M8.6 12l2.4 2.4 4.6-4.8'],
  assignment:      ['M9 5H7.2A1.7 1.7 0 0 0 5.5 6.7v12.6A1.7 1.7 0 0 0 7.2 21h9.6a1.7 1.7 0 0 0 1.7-1.7V6.7A1.7 1.7 0 0 0 16.8 5H15', 'M10.2 3h3.6a1.2 1.2 0 0 1 1.2 1.2v1.2a1.2 1.2 0 0 1-1.2 1.2h-3.6A1.2 1.2 0 0 1 9 5.4V4.2A1.2 1.2 0 0 1 10.2 3z', 'M8.8 11.8h6.4', 'M8.8 15.4h4.4'],
  biotech:         ['M10 3v6.1L5 17.2a1.9 1.9 0 0 0 1.6 2.9h10.8a1.9 1.9 0 0 0 1.6-2.9L14 9.1V3', 'M8.9 3h6.2', 'M7.3 14.6h9.4'],
  science:         ['M10 3v6.1L5 17.2a1.9 1.9 0 0 0 1.6 2.9h10.8a1.9 1.9 0 0 0 1.6-2.9L14 9.1V3', 'M8.9 3h6.2', 'M7.3 14.6h9.4'],
  experiment:      ['M10 3v6.1L5 17.2a1.9 1.9 0 0 0 1.6 2.9h10.8a1.9 1.9 0 0 0 1.6-2.9L14 9.1V3', 'M8.9 3h6.2', 'M7.3 14.6h9.4'],
  auto_awesome:    ['M12 3.2l1.9 5.3 5.3 1.9-5.3 1.9-1.9 5.3-1.9-5.3-5.3-1.9 5.3-1.9z', 'M18.6 16.4l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z'],
  person:          ['M12 4.4a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6z', 'M5.4 20a6.6 6.6 0 0 1 13.2 0'],
  wb_sunny:        ['M12 7.6a4.4 4.4 0 1 0 0 8.8 4.4 4.4 0 0 0 0-8.8z', 'M12 2.8v2.2', 'M12 19v2.2', 'M2.8 12H5', 'M19 12h2.2', 'M5.5 5.5l1.6 1.6', 'M16.9 16.9l1.6 1.6', 'M18.5 5.5l-1.6 1.6', 'M7.1 16.9l-1.6 1.6'],
  cloud:           ['M7.4 19.4a4.4 4.4 0 0 1-.5-8.8 5.6 5.6 0 0 1 10.7 1.5 3.7 3.7 0 0 1-.6 7.3z'],
  partly_cloudy_day: ['M7.4 19.4a4.4 4.4 0 0 1-.5-8.8 5.6 5.6 0 0 1 10.7 1.5 3.7 3.7 0 0 1-.6 7.3z', 'M15.4 6.8a3 3 0 1 0-4.6-1.4'],

  /* -- data --------------------------------------------------------- */
  show_chart:      ['M3.5 16.4l4.6-5 3.4 3 4.4-6.4 4.6 4.8'],
  insights:        ['M3.5 16.4l4.6-5 3.4 3 4.4-6.4 4.6 4.8'],
  monitoring:      ['M3.5 15.8l4.4-4.7 3.3 2.9 4.3-6.1 5 5.1', 'M3.5 20h17'],
  ssid_chart:      ['M3.5 15.8l4.4-4.7 3.3 2.9 4.3-6.1 5 5.1', 'M3.5 20h17'],
  bar_chart:       ['M6.4 20v-6.4', 'M12 20V6.8', 'M17.6 20v-4.4', 'M3.5 20h17'],
  trending_up:     ['M4 16.4l5.6-5.6 3.4 3.4 6.6-6.6', 'M14.8 7.6H20v5.2'],
  trending_down:   ['M4 7.6l5.6 5.6 3.4-3.4 6.6 6.6', 'M14.8 16.4H20v-5.2'],
  trending_flat:   ['M4 12h13.4', 'M14.4 8.6l3.4 3.4-3.4 3.4'],
}

/**
 * Drop-in replacement for the old Material Symbols span.
 * Sized in `em` so existing Tailwind text-* classes keep working.
 */
export default function Icon({ name, size, strokeWidth, className = '', style, ...rest }) {
  const paths = GLYPHS[name]

  // Long-tail / database-supplied names keep using the (re-weighted) font.
  if (!paths) {
    return (
      <span className={`material-symbols-outlined ${className}`.trim()} style={style} {...rest}>
        {name}
      </span>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size ?? '1em'}
      height={size ?? '1em'}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? S}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle', ...style }}
      {...rest}
    >
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

export { GLYPHS }
