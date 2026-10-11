import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import mareaLogo from '../assets/marealogo.svg'
import Icon from '../components/Icon'
import ConsoleMock from '../components/ConsoleMock'
import { VendorWatch, ComplianceWatch, CoverageWatch } from '../components/po/Vignettes'
import { Pipeline } from '../components/po/Pipeline'

/* PhysicianOS — Marea Health's second product: the operations platform a
   physician group runs its back office on, built inside our own practice and
   offered to management companies for their divisions.

   Same identity as the rest of the site (Newsreader + Archivo, cream and
   teal, numbered markers, labelled spec rows). No stock photography, no
   testimonials, no check-circle lists: the console illustration is the one
   thing on the page nobody else has, so it carries the hero. Unlisted
   (noindex) until the partnership is public. */

const DEMO_URL = 'https://physicianos.vercel.app'
const CONTACT = 'mailto:hello@mareahealth.com?subject=PhysicianOS'

function Marker({ n, label, light = false }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className={`font-headline text-sm tabular-nums ${light ? 'text-primary-fixed-dim' : 'text-primary'}`}>{n}</span>
      <span className={`h-px w-8 ${light ? 'bg-primary-fixed-dim/40' : 'bg-primary/40'}`} />
      <span className={`text-[11px] uppercase tracking-[0.18em] ${light ? 'text-primary-fixed-dim' : 'text-on-surface-variant'}`} style={{ fontFamily: 'var(--font-mono)' }}>{label}</span>
    </div>
  )
}

function Spec({ rows, light = false }) {
  return (
    <dl className={`border-t ${light ? 'border-white/15' : 'border-on-background/10'}`}>
      {rows.map(([term, desc]) => (
        <div
          key={term}
          className={`grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-1 sm:gap-4 py-3 border-b ${light ? 'border-white/15' : 'border-on-background/10'}`}
        >
          <dt className={`uppercase tracking-[0.14em] text-[10px] sm:pt-1 ${light ? 'text-primary-fixed-dim' : 'text-primary'}`} style={{ fontFamily: 'var(--font-mono)' }}>{term}</dt>
          <dd className={`text-sm font-light leading-snug ${light ? 'text-white/70' : 'text-on-surface-variant'}`}>{desc}</dd>
        </div>
      ))}
    </dl>
  )
}

const MODULES = [
  ['analytics', 'Analytics', 'Productivity, OB volumes, banking and payroll — monthly, by provider, with the collections-to-payroll ratios a partner meeting actually argues about.'],
  ['insights', 'Partner settle-up', 'Compensation and distributions calculated from the source documents, not a spreadsheet. Locked when the partners approve it.'],
  ['assignment', 'Vendors & payments', 'Invoices read by AI, routed for approval, matched against the bank. Check printing, receipts and a QuickBooks sync are next.'],
  ['verified', 'Compliance', 'Licenses, DEA, BAAs, malpractice, CLIA — expirations tracked, documents attached, renewals surfaced ninety days out.'],
  ['person', 'Staffing', 'A skills matrix that answers who else can do this, FTE ratios against benchmark, and the coverage risk hiding in one person.'],
  ['science', 'SOPs', 'Record a task once and the guide writes itself — steps, screenshots, narration. Institutional memory that outlives the office manager.'],
  ['schedule', 'Reviews & HR', '90-day and annual reviews on the practice’s own forms, job descriptions with acknowledgment, market comp bands.'],
  ['bolt', 'Operations inbox', 'Everything across every module that needs a human this week, in one list that empties itself as the work gets done.'],
]

export default function PhysicianOsPage() {
  const [sent, setSent] = useState(false)

  // Unlisted for now: a robots meta the rest of the site doesn't carry, plus
  // this page's own title. Both restored when the visitor leaves.
  useEffect(() => {
    const prevTitle = document.title
    document.title = 'PhysicianOS — the operating system for a physician group'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      document.title = prevTitle
      meta.remove()
    }
  }, [])

  return (
    <div className="bg-surface min-h-screen">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-surface/85 border-b border-on-background/[0.07]">
        <div className="max-w-[1180px] mx-auto flex items-center justify-between px-6 md:px-10 py-4">
          <div className="flex items-center gap-3">
            <Link to="/"><img src={mareaLogo} alt="Marea Health" className="h-6" /></Link>
            <span className="h-4 w-px bg-on-background/15" />
            <span className="font-label text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">PhysicianOS</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#what" className="hidden md:inline text-sm text-on-background/60 hover:text-tertiary transition-colors">What it does</a>
            <a href="#catches" className="hidden md:inline text-sm text-on-background/60 hover:text-tertiary transition-colors">What it catches</a>
            <a href="#groups" className="hidden md:inline text-sm text-on-background/60 hover:text-tertiary transition-colors">For groups</a>
            <a href="#contact" className="whitespace-nowrap bg-primary text-on-primary px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-container transition-colors">
              <span className="hidden sm:inline">Request a walkthrough</span>
              <span className="sm:hidden">Get in touch</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(900px 420px at 72% 18%, rgba(139,210,218,0.22), transparent 70%)' }}
        />
        <div className="relative max-w-[1180px] mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-16 md:pb-24 grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          <div className="lg:col-span-6">
            <p className="font-headline italic text-on-surface-variant text-base md:text-lg mb-5">
              Built in the practice <span className="not-italic text-outline mx-1">·</span> not bought from a vendor
            </p>
            <h1
              className="font-headline text-[2.5rem] leading-[1.06] sm:text-5xl lg:text-[3.9rem] text-on-background mb-6"
              style={{ letterSpacing: '-0.025em' }}
            >
              The back office of a physician group, finally in one place.
            </h1>
            <p className="font-light text-base md:text-lg text-on-surface-variant leading-relaxed mb-8 max-w-xl">
              PhysicianOS reads the payroll register, the EMR productivity report and the bank statement,
              calculates the partner settle-up, chases the expiring licenses, and tells the office manager
              what needs a human this week. We built it inside our own OB/GYN practice. It has run there every day since.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#contact" className="bg-primary text-on-primary px-6 py-3 rounded-full text-sm font-medium hover:bg-primary-container transition-colors">
                Request a walkthrough
              </a>
              <a href="#what" className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:text-tertiary transition-colors">
                See what it does <Icon name="arrow_forward" className="text-[16px]" />
              </a>
            </div>
            <p className="mt-7 text-[11px] uppercase tracking-[0.14em] text-on-background/40" style={{ fontFamily: 'var(--font-mono)' }}>
              marea health · live in one practice · building for multi-practice groups
            </p>
          </div>
          <div className="lg:col-span-6">
            <ConsoleMock />
            <p className="mt-3 text-[11px] text-on-background/40 font-light text-center">
              The group console. Practices, figures and names are illustrative.
            </p>
          </div>
        </div>
      </header>

      {/* ── The problem ── */}
      <section className="bg-surface-container-low border-y border-on-background/[0.07]">
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-10">
            <div className="lg:col-span-7">
              <Marker n="01" label="The problem" />
              <h2 className="font-headline text-3xl md:text-4xl lg:text-[2.75rem] text-on-background" style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Nobody sells software for the part of a practice that isn’t the patient.
              </h2>
            </div>
            <p className="lg:col-span-5 text-on-surface-variant text-base md:text-lg font-light leading-relaxed">
              The EMR runs the clinic and the billing company runs the claims. Everything after that —
              who got paid what, which vendor is owed, whose license lapses in March — lives in
              spreadsheets, a shared inbox, and one person’s head.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              ['Nothing adds up on time', 'The payroll register, the productivity report and the bank statement arrive separately and get reconciled by hand, weeks late.'],
              ['The settle-up is a spreadsheet', 'Partner compensation — the most consequential number in the practice — is calculated once a quarter by whoever built the file.'],
              ['Knowledge walks out', 'When the office manager leaves, so does the only record of how any of it was done.'],
            ].map(([t, d]) => (
              <div key={t} className="bg-surface rounded-2xl p-6 border border-on-background/[0.07]">
                <h3 className="font-headline text-xl text-on-background mb-2 font-normal leading-snug">{t}</h3>
                <p className="text-sm text-on-surface-variant font-light leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What it does ── */}
      <section id="what" className="scroll-mt-20">
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-12">
            <div className="lg:col-span-7">
              <Marker n="02" label="What it does" />
              <h2 className="font-headline text-3xl md:text-4xl lg:text-[2.75rem] text-on-background" style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Ten modules, one login,<br className="hidden sm:block" /> no patient records.
              </h2>
            </div>
            <p className="lg:col-span-5 text-on-surface-variant text-base md:text-lg font-light leading-relaxed">
              Each one exists because our practice needed it on a particular Tuesday. Nothing here is
              a feature somebody imagined a practice might want.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-on-background/[0.08] rounded-2xl overflow-hidden border border-on-background/[0.08]">
            {MODULES.map(([icon, title, body]) => (
              <div key={title} className="bg-surface p-6 hover:bg-surface-container-low transition-colors">
                <Icon name={icon} className="text-[22px] text-primary mb-3" />
                <h3 className="font-headline text-lg text-on-background mb-2 font-normal leading-snug">{title}</h3>
                <p className="text-sm text-on-surface-variant font-light leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-on-surface-variant font-light max-w-3xl leading-relaxed">
            Plus a document archive and a patient-origin map — ten in all. Provider, financial and staff data only:
            patient records stay in the EMR, which is both the right boundary and the smallest possible exposure.
          </p>
        </div>
      </section>

      {/* ── What it catches: the vignettes ── */}
      <section id="catches" className="scroll-mt-20 relative overflow-hidden" style={{ background: '#032125' }}>
        {/* faint blueprint grid — technical, not decorative */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,210,218,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(139,210,218,0.055) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(900px 500px at 50% 0%, black, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(900px 500px at 50% 0%, black, transparent 85%)',
          }}
        />
        <div className="relative max-w-[1180px] mx-auto px-6 md:px-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-12">
            <div className="lg:col-span-7">
              <Marker n="03" label="What it catches" light />
              <h2 className="font-headline text-3xl md:text-4xl lg:text-[2.75rem] text-white" style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                The things nobody has time to notice.
              </h2>
            </div>
            <p className="lg:col-span-5 text-white/60 text-base md:text-lg font-light leading-relaxed">
              Software that only stores what you type is a filing cabinet. These run on every document
              the practice already receives — and raise a hand when the answer matters.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-7 items-start">
            <div>
              <VendorWatch />
              <h3 className="font-headline text-xl text-white mt-5 mb-1.5 font-normal">A vendor quietly raised its price</h3>
              <p className="text-sm text-white/55 font-light leading-relaxed">
                Every invoice is read, matched to the vendor, and set against what that vendor has charged all year.
                An unexplained jump reaches the office manager the day it arrives, not at the annual review.
              </p>
            </div>
            <div>
              <ComplianceWatch />
              <h3 className="font-headline text-xl text-white mt-5 mb-1.5 font-normal">A credential about to lapse</h3>
              <p className="text-sm text-white/55 font-light leading-relaxed">
                Licenses, DEA, malpractice, BLS and the practice&apos;s own certificates, each with its document and its
                date. Renewals surface ninety days out, by themselves.
              </p>
            </div>
            <div>
              <CoverageWatch />
              <h3 className="font-headline text-xl text-white mt-5 mb-1.5 font-normal">The task only one person can do</h3>
              <p className="text-sm text-white/55 font-light leading-relaxed">
                Take any staff member out and watch what stops. The answer is usually one task, one person,
                and nobody had written it down.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative overflow-hidden" style={{ background: '#021a1d' }}>
        <div className="relative max-w-[1180px] mx-auto px-6 md:px-10 py-16 md:py-20">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-10">
            <div className="lg:col-span-7">
              <Marker n="04" label="How it works" light />
              <h2 className="font-headline text-3xl md:text-4xl text-white" style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Documents in. One isolated dataset per practice. Two views out.
              </h2>
            </div>
            <p className="lg:col-span-5 text-white/55 text-base font-light leading-relaxed">
              No integration project, no data entry. The practice keeps sending the files it already gets;
              a format we have not seen before is read by the document AI until a parser exists for it.
            </p>
          </div>
          <Pipeline />
        </div>
      </section>

      {/* ── For groups ── */}
      <section id="groups" className="scroll-mt-20" style={{ background: '#00383d' }}>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6">
              <Marker n="05" label="For management companies" light />
              <h2 className="font-headline text-3xl md:text-4xl lg:text-[2.75rem] text-white mb-6" style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Give every practice the app. Watch the whole network.
              </h2>
              <p className="font-light text-base md:text-lg text-white/70 leading-relaxed mb-8">
                An MSO onboards a practice in six screens — name, branding, payroll and EMR vendors,
                providers and ownership, an administrator. Ten minutes later that practice has its own app,
                its own login page and its own people. The group console shows all of them side by side.
              </p>
              <Spec
                light
                rows={[
                  ['Isolation', 'A practice never sees another. Its rows carry its id and the database itself enforces the boundary.'],
                  ['Read-only', 'The group sees everything inside a practice and changes nothing. Only its own people write to it.'],
                  ['Platform', 'AWS under a Business Associate Agreement, each group customer in its own account.'],
                  ['Economics', 'Mostly fixed cost. Every practice added makes the platform cheaper per practice.'],
                ]}
              />
            </div>
            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['6', 'screens to onboard a practice'],
                  ['0', 'engineers needed to do it'],
                  ['1', 'login for everything a practice runs on'],
                  ['10', 'modules inherited by every new division'],
                ].map(([n, label]) => (
                  <div key={label} className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                    <p className="font-headline text-5xl text-white leading-none mb-2">{n}</p>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-white/50 leading-snug" style={{ fontFamily: 'var(--font-mono)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Where it came from ── */}
      <section>
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-16 md:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-5">
              <Marker n="06" label="Where it came from" />
              <h2 className="font-headline text-3xl md:text-4xl text-on-background mb-5" style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                A practice’s own tool, not a vendor’s idea of one.
              </h2>
              <p className="text-base text-on-surface-variant font-light leading-relaxed">
                Marea Health is an OB/GYN practice that builds software. Marea is the app we made for our
                patients. PhysicianOS is the one we made for ourselves — and the reason it fits is that the
                person who specified every screen is the person who has to use it between clinic days.
              </p>
            </div>
            <div className="lg:col-span-7">
              <Spec
                rows={[
                  ['Built', '2026, inside a nine-physician OB/GYN practice, against that practice’s real payroll registers, EMR reports and bank statements.'],
                  ['In use', 'Every day since, by the partners, the office manager and the staff — each seeing only what their role allows.'],
                  ['Scope', 'Ten modules covering analytics, compensation, payables, compliance, staffing, SOPs and HR.'],
                  ['Next', 'The multi-practice platform, check printing and receipts, and a QuickBooks sync so the CPA’s books fill themselves.'],
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Security ── */}
      <section className="bg-surface-container-low border-y border-on-background/[0.07]">
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-14 md:py-16">
          <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
            <Icon name="shield" className="text-[36px] text-primary" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div>
                <h3 className="font-headline text-xl text-on-background mb-2 font-normal">Built to be audited</h3>
                <p className="text-sm text-on-surface-variant font-light leading-relaxed">
                  Row-level security in the database, documents in private storage, mandatory password change
                  at first sign-in, role-based access, an audit log of who read what.
                </p>
              </div>
              <div>
                <h3 className="font-headline text-xl text-on-background mb-2 font-normal">Agreements in place</h3>
                <p className="text-sm text-on-surface-variant font-light leading-relaxed">
                  Hosted on HIPAA-eligible infrastructure under a Business Associate Agreement, with BAAs
                  covering every vendor that touches data.
                </p>
              </div>
              <div>
                <h3 className="font-headline text-xl text-on-background mb-2 font-normal">Small by design</h3>
                <p className="text-sm text-on-surface-variant font-light leading-relaxed">
                  The app holds no patient records. Keeping clinical data in the EMR is both the right
                  boundary and the smallest possible exposure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="scroll-mt-20">
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-16 md:py-24">
          <div className="rounded-3xl px-6 py-12 md:p-14 text-center" style={{ background: 'linear-gradient(165deg, #e8f3f4 0%, #d8eaec 100%)' }}>
            <h2 className="font-headline text-3xl md:text-[2.75rem] mb-4" style={{ letterSpacing: '-0.02em', lineHeight: 1.15, color: '#0D3F44' }}>
              See it with your own numbers.
            </h2>
            <p className="font-light text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: '#2c4f53' }}>
              We show the group console, walk through a practice, and talk honestly about what is built,
              what is being built, and what onboarding your formats would take.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={CONTACT}
                onClick={() => setSent(true)}
                className="bg-primary text-on-primary px-7 py-3.5 rounded-full text-sm font-medium hover:bg-primary-container transition-colors"
              >
                Request a walkthrough
              </a>
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: '#0D3F44' }}
              >
                Open the prototype console <Icon name="arrow_forward" className="text-[16px]" />
              </a>
            </div>
            <p className="mt-6 text-xs font-light" style={{ color: '#4a6b6f' }}>
              {sent ? 'Your mail app should be open — if not, write to hello@mareahealth.com.' : 'hello@mareahealth.com · the prototype is by invitation'}
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-on-background/10 bg-surface-container-low">
        <div className="max-w-[1180px] mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <img src={mareaLogo} alt="Marea Health" style={{ height: '24px', width: 'auto' }} className="mb-3" />
            <p className="font-light text-xs text-on-background/50 max-w-sm leading-relaxed">
              PhysicianOS is a product of Marea Health, LLC. It is an operations platform for medical practices
              and the companies that manage them; it is not a medical device and provides no clinical care.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <Link className="font-light text-on-background/60 hover:text-tertiary transition-colors" to="/">Marea, for patients</Link>
            <Link className="font-light text-on-background/60 hover:text-tertiary transition-colors" to="/privacy">Privacy</Link>
            <Link className="font-light text-on-background/60 hover:text-tertiary transition-colors" to="/terms">Terms</Link>
            <a className="font-light text-on-background/60 hover:text-tertiary transition-colors" href={CONTACT}>Contact</a>
          </div>
        </div>
        <div className="px-6 md:px-10 py-5 border-t border-on-background/10 max-w-[1180px] mx-auto">
          <p className="font-light text-xs text-on-background/45">&copy; {new Date().getFullYear()} Marea Health, LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
