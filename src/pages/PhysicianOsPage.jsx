import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import mareaLogo from '../assets/marealogo.svg'

/* PhysicianOS — Marea Health's second product: the operations platform a
   physician group runs its back office on, built inside Beaches OBGYN and
   offered through an MSO to its divisions. A quiet page, reached from a
   small footer link, kept out of search until the partnership is public. */

const DEMO_URL = 'https://physicianos.vercel.app'
const CONTACT = 'mailto:hello@mareahealth.com?subject=PhysicianOS'

function Marker({ n, label }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="font-headline text-sm text-primary tabular-nums">{n}</span>
      <span className="h-px w-8 bg-primary/40" />
      <span className="font-label text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">{label}</span>
    </div>
  )
}

function Spec({ rows }) {
  return (
    <dl className="border-t border-on-background/10">
      {rows.map(([term, desc]) => (
        <div key={term} className="grid grid-cols-[7rem_1fr] sm:grid-cols-[9rem_1fr] gap-4 py-3 border-b border-on-background/10">
          <dt className="font-label uppercase tracking-[0.14em] text-[10px] pt-1 text-primary">{term}</dt>
          <dd className="text-sm text-on-surface-variant font-light leading-snug">{desc}</dd>
        </div>
      ))}
    </dl>
  )
}

function Section({ n, label, title, children }) {
  return (
    <section className="mb-16">
      <Marker n={n} label={label} />
      <h2 className="font-headline text-3xl md:text-4xl text-on-background font-normal leading-tight mb-5">{title}</h2>
      {children}
    </section>
  )
}

export default function PhysicianOsPage() {
  // Unlisted for now: a robots meta the rest of the site doesn't carry, and
  // the page's own title. Both restored when the visitor leaves.
  useEffect(() => {
    const prevTitle = document.title
    document.title = 'PhysicianOS — Marea Health for physician groups'
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
    <main className="min-h-screen bg-surface pb-24">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-surface/90 border-b border-outline/20">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/">
            <img src={mareaLogo} alt="Marea Health" className="h-7" />
          </Link>
          <Link to="/" className="text-xs font-label uppercase tracking-wider text-on-background/50 hover:text-tertiary transition-colors">
            Back to home
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 pt-14">
        <p className="text-[11px] font-label uppercase tracking-widest text-on-background/50 mb-3">For physician groups</p>
        <h1 className="font-headline text-4xl md:text-6xl text-on-background font-normal leading-[1.05] mb-6">
          PhysicianOS
        </h1>
        <p className="font-headline text-xl md:text-2xl text-on-background/80 font-light leading-snug mb-6 max-w-2xl">
          The operating system for a physician group — the analytics, partner settle-up, payables, compliance, staffing and HR a practice runs on, built inside one and offered to every division of a group.
        </p>
        <p className="text-base text-on-background/80 leading-relaxed p-5 bg-primary/5 border-l-4 border-primary rounded-lg mb-16">
          Marea Health makes two things. Marea is the app we built for patients in the perimenopause years. PhysicianOS is the one we built for ourselves — the back office of our own OB/GYN practice — and are now building for other practices through the management companies that serve them.
        </p>

        <Section n="01" label="Where it came from" title="A practice's own tool, not a vendor's idea of one.">
          <p className="text-sm text-on-surface-variant font-light leading-relaxed mb-5">
            Every month a practice receives a payroll register, an EMR productivity report, bank statements, vendor invoices and a partner settle-up to calculate. In 2026 our practice stopped doing that in spreadsheets and email and built a system that reads the documents, does the math, and shows the partners what is happening. It has run the practice every day since — designed by a physician who is also the user.
          </p>
        </Section>

        <Section n="02" label="What it does" title="Eleven modules, one login, no patient records.">
          <Spec rows={[
            ['Analytics', 'Productivity, OB volumes, banking and payroll — monthly, by provider, with the collections-to-payroll ratios that matter.'],
            ['Settle-up', 'Partner compensation and distributions calculated from the source documents, locked when approved.'],
            ['Payables', 'Invoices read by AI, approvals, payment runs, bank matching. Check printing and receipts next; journal entries posted to QuickBooks or Sage so the CPA changes nothing.'],
            ['Compliance', 'Licenses, DEA, BAAs, malpractice — expirations tracked, documents attached, renewals surfaced before they lapse.'],
            ['Staffing', 'Skills matrix, coverage risk, FTE ratios against benchmark, a roster that answers who can do what.'],
            ['SOPs', 'Record a task once; the guide writes itself with screenshots and narration.'],
            ['HR', 'Reviews, job descriptions with acknowledgment, market comp bands.'],
            ['Inbox', 'Everything that needs attention this week, from every module, in one list.'],
          ]} />
          <p className="text-xs text-on-background/50 font-light leading-relaxed mt-4">
            Provider, financial and staff data only. Patient records stay in the EMR by design.
          </p>
        </Section>

        <Section n="03" label="For a group" title="Each division gets the app. The group sees all of them.">
          <p className="text-sm text-on-surface-variant font-light leading-relaxed mb-5">
            A management services organization onboards a practice in six screens: name, branding, payroll and EMR vendors, providers and ownership, an administrator. The practice gets its own login page, its own data and its own people. The MSO console shows every division side by side — collections, payroll share, what needs attention — and lets the group set the policies every division inherits.
          </p>
          <Spec rows={[
            ['Isolation', 'A division never sees another. Its rows carry its id and the database enforces the boundary.'],
            ['Read-only', 'The group sees everything inside a division and changes nothing. Only the division’s own people write to it.'],
            ['Platform', 'Hosted on AWS under a Business Associate Agreement; each group customer in its own account.'],
            ['Cost', 'Mostly fixed. Every practice added makes it cheaper per practice.'],
          ]} />
        </Section>

        <Section n="04" label="Status" title="Live in one practice. Being built for a network.">
          <p className="text-sm text-on-surface-variant font-light leading-relaxed mb-5">
            PhysicianOS runs Beaches OBGYN today. The multi-division platform is in development with partners, and a working prototype of the group console is available to practices and management companies we are talking with.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={CONTACT}
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-full text-sm font-medium hover:bg-primary-container transition-colors"
            >
              Talk to us
            </a>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary font-medium hover:text-tertiary transition-colors"
            >
              Prototype console (by invitation) &rarr;
            </a>
          </div>
        </Section>

        <p className="text-xs text-on-background/45 font-light leading-relaxed border-t border-on-background/10 pt-6">
          PhysicianOS is a product of Marea Health, LLC. It is an operations platform for medical practices and management companies; it is not a medical device and does not provide clinical care.
        </p>
      </div>
    </main>
  )
}
