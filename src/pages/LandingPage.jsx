import { Link } from 'react-router-dom'
import mareaLogo from '../assets/marealogo.svg'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Clinical', href: '#clinical' },
  { label: 'Blog', href: '/blog', isRoute: true },
]

const FEATURES = [
  {
    icon: 'quiz',
    title: 'Perimenopause Assessment',
    desc: 'A 4-minute clinically-grounded assessment based on the STRAW+10 framework. Know your stage, understand your symptoms, and get a personalized action plan.',
  },
  {
    icon: 'biotech',
    title: 'Lab Interpreter',
    desc: 'Enter your hormone levels — AMH, FSH, Estradiol, Testosterone, Progesterone — and get a plain-language interpretation personalized to your stage.',
  },
  {
    icon: 'trending_up',
    title: 'Symptom Tracker',
    desc: 'Daily check-ins for hot flashes, sleep, mood, energy, and focus. Track patterns over time and see what\'s actually changing.',
  },
  {
    icon: 'chat_bubble',
    title: 'AI Health Assistant',
    desc: 'Ask questions about your symptoms, hormones, or treatment options. Get answers grounded in clinical evidence, not internet noise.',
  },
  {
    icon: 'forum',
    title: 'Community',
    desc: 'Connect with other women navigating perimenopause. Anonymous posting available. Monthly live Q&A with our medical team.',
  },
  {
    icon: 'assignment',
    title: 'Appointment Prep',
    desc: 'Generate a visit summary to bring to your doctor — your stage, symptoms, labs, and questions, formatted for a productive conversation.',
  },
]

const TEAM = [
  { name: 'Dr. Leandro Rodriguez, MD, FACOG', role: 'Co-Founder & Medical Director' },
]

export default function LandingPage() {
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(252,249,244,0.92)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src={mareaLogo} alt="Marea Health" style={{ height: '1.4rem' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {NAV_LINKS.map(l => l.isRoute ? (
              <Link key={l.label} to={l.href} style={{ fontSize: '0.85rem', fontWeight: 500, color: '#3f484a' }}>{l.label}</Link>
            ) : (
              <a key={l.label} href={l.href} style={{ fontSize: '0.85rem', fontWeight: 500, color: '#3f484a' }}>{l.label}</a>
            ))}
            <a href="#download" style={{ background: '#005258', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 600 }}>
              Download
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '8rem 2rem 4rem', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(0,82,88,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '720px', position: 'relative' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#842b16', fontWeight: 600, marginBottom: '1.5rem' }}>
            Designed by practicing OB/GYNs
          </p>
          <h1 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 400, lineHeight: 1.1, color: '#1c1c19', marginBottom: '1.5rem' }}>
            Perimenopause,<br />finally understood.
          </h1>
          <p style={{ fontSize: '1.1rem', fontWeight: 300, color: '#3f484a', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '560px', margin: '0 auto 2.5rem' }}>
            The app that gives you clinical answers about your hormones, your symptoms, and what to do next — built by the doctors who treat this every day.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="#download" style={{ background: '#005258', color: '#fff', padding: '1rem 2.5rem', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 600, boxShadow: '0 4px 24px rgba(0,82,88,0.25)' }}>
              Download the app
            </a>
            <a href="#features" style={{ background: '#fff', color: '#005258', padding: '1rem 2.5rem', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 600, border: '1.5px solid #005258' }}>
              See features
            </a>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section style={{ background: '#005258', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2rem', fontWeight: 400, color: '#fff' }}>STRAW+10</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>Clinical staging framework</p>
          </div>
          <div>
            <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2rem', fontWeight: 400, color: '#fff' }}>5</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>Hormone labs interpreted</p>
          </div>
          <div>
            <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2rem', fontWeight: 400, color: '#fff' }}>Evidence-based</p>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>Every recommendation cited</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '6rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#842b16', fontWeight: 600, marginBottom: '1rem' }}>Features</p>
          <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 400, color: '#1c1c19', marginBottom: '1rem' }}>
            Everything you need in one place
          </h2>
          <p style={{ fontSize: '1rem', fontWeight: 300, color: '#3f484a', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
            No more piecing together answers from forums, outdated articles, and dismissive appointments.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: '#fff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0,82,88,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#005258' }}>{f.icon}</span>
              </div>
              <h3 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.2rem', fontWeight: 400, color: '#1c1c19', marginBottom: '0.6rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.88rem', fontWeight: 300, color: '#6f797a', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Clinical credibility */}
      <section id="clinical" style={{ background: '#0D3F44', padding: '6rem 2rem', color: '#fff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#e8755a', fontWeight: 600, marginBottom: '1rem' }}>Built by clinicians</p>
          <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 400, marginBottom: '1.5rem' }}>
            Designed by practicing OB/GYNs who see perimenopause patients every day
          </h2>
          <p style={{ fontSize: '1rem', fontWeight: 300, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, marginBottom: '3rem', maxWidth: '640px', margin: '0 auto 3rem' }}>
            Marea was born from a clinical practice — not a tech startup. Every assessment question, every lab range, every recommendation comes from the same evidence base we use with our own patients. We built the app we wished existed for the women we see every week.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            {TEAM.map(t => (
              <div key={t.name} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '2rem', maxWidth: '320px', backdropFilter: 'blur(8px)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'rgba(255,255,255,0.8)' }}>person</span>
                </div>
                <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>{t.name}</p>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '6rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#842b16', fontWeight: 600, marginBottom: '1rem' }}>How it works</p>
          <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 400, color: '#1c1c19' }}>
            Three steps to clarity
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {[
            { step: '01', title: 'Take the assessment', desc: 'Answer questions about your cycle, symptoms, and history. In 4 minutes, get your STRAW+10 stage and a personalized symptom profile.' },
            { step: '02', title: 'Understand your body', desc: 'Read your lab results in plain language. Track daily symptoms. Learn the science behind what you\'re experiencing — not just that it\'s "normal."' },
            { step: '03', title: 'Take action', desc: 'Get a doctor-ready visit summary. Know which questions to ask. Understand your treatment options with evidence, not opinions.' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', background: '#fff', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
              <div style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2.5rem', fontWeight: 400, color: 'rgba(0,82,88,0.15)', lineHeight: 1, flexShrink: 0, minWidth: '60px' }}>{s.step}</div>
              <div>
                <h3 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.2rem', fontWeight: 400, color: '#1c1c19', marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.88rem', fontWeight: 300, color: '#6f797a', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA / Download */}
      <section id="download" style={{ background: 'linear-gradient(135deg, #005258 0%, #0D3F44 50%, #842b16 100%)', padding: '6rem 2rem', textAlign: 'center', color: '#fff' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 400, marginBottom: '1rem' }}>
            Your hormones deserve better than Google.
          </h2>
          <p style={{ fontSize: '1rem', fontWeight: 300, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Download Marea and get the answers you've been looking for — backed by the doctors who know this best.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="#" style={{ background: '#fff', color: '#005258', padding: '1rem 2.5rem', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>apple</span>
              App Store
            </a>
            <a href="#" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '1rem 2.5rem', borderRadius: '9999px', fontSize: '0.95rem', fontWeight: 600, border: '1.5px solid rgba(255,255,255,0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>play_arrow</span>
              Google Play
            </a>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '1.5rem' }}>Coming soon to iOS and Android</p>
        </div>
      </section>

      {/* Blog preview */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#842b16', fontWeight: 600, marginBottom: '0.5rem' }}>From the blog</p>
            <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.8rem', fontWeight: 400, color: '#1c1c19' }}>Clinical insights, made clear</h2>
          </div>
          <Link to="/blog" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#005258' }}>
            View all posts →
          </Link>
        </div>
        <div style={{ background: '#fff', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', textAlign: 'center', color: '#888780' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#d4d1cc', marginBottom: '1rem', display: 'block' }}>article</span>
          <p style={{ fontSize: '0.95rem', fontWeight: 300 }}>Blog posts will appear here once published from the admin panel.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1c1c19', padding: '3rem 2rem', color: 'rgba(255,255,255,0.5)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <img src={mareaLogo} alt="Marea Health" style={{ height: '1.2rem', filter: 'brightness(0) invert(1)', opacity: 0.6, marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.75rem' }}>Perimenopause care, designed by OB/GYNs.</p>
          </div>
          <div style={{ display: 'flex', gap: '2rem', fontSize: '0.8rem' }}>
            <Link to="/blog">Blog</Link>
            <a href="#features">Features</a>
            <a href="#clinical">Our Team</a>
          </div>
          <p style={{ fontSize: '0.72rem', width: '100%', textAlign: 'center', marginTop: '1rem', color: 'rgba(255,255,255,0.3)' }}>
            &copy; {new Date().getFullYear()} Marea Health. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
