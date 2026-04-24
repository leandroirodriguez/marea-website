import { Link } from 'react-router-dom'
import mareaLogo from '../assets/marealogo.svg'

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h3 className="font-headline text-xl text-primary mb-3 font-normal">{title}</h3>
      <div className="text-sm text-on-background/90 leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/90 border-b border-outline/20">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/">
            <img src={mareaLogo} alt="Marea Health" className="h-7" />
          </Link>
          <Link
            to="/"
            className="text-xs font-label uppercase tracking-wider text-on-background/50 hover:text-tertiary transition-colors"
          >
            Back to home
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 pt-12">
        <p className="text-[11px] font-label uppercase tracking-widest text-on-background/50 mb-2">
          Support
        </p>
        <h1 className="font-headline text-4xl md:text-5xl text-on-background font-normal leading-tight mb-6">
          We're here to help.
        </h1>
        <p className="text-base text-on-background/80 leading-relaxed p-5 bg-primary/5 border-l-4 border-primary rounded-lg mb-12">
          Marea is a companion for the perimenopause years — tracking, patterns, and a little help making sense of it all. If something's broken, confusing, or missing, we want to hear about it.
        </p>

        <Section title="Email us">
          <p>
            The fastest way to reach a human is{' '}
            <a href="mailto:hello@mareahealth.com" className="text-primary font-medium hover:text-tertiary transition-colors">
              hello@mareahealth.com
            </a>.
          </p>
          <p>We aim to respond within 48 hours, Monday through Friday. Bug reports, feature requests, billing questions, and privacy requests all go to the same inbox.</p>
        </Section>

        <Section title="Account & billing">
          <p><strong>Manage your subscription.</strong> If you subscribed through the Apple App Store, you can view, pause, or cancel your subscription from your iPhone: Settings → your name → Subscriptions → Marea.</p>
          <p><strong>Delete your account.</strong> Open Marea → Account → Danger zone → Delete my account. All associated data — cycle logs, symptom check-ins, Marea Index history, forecasts, letters, and profile information — is removed. This cannot be undone.</p>
          <p><strong>Export your data.</strong> Email us and we'll send you a full export of everything on your account within 30 days.</p>
        </Section>

        <Section title="Common questions">
          <p><strong>Is Marea a medical service?</strong> No. Marea is an educational and tracking tool. We do not diagnose, prescribe, or replace medical care. Always consult a qualified healthcare provider for medical questions.</p>
          <p><strong>Does Marea work without an Apple Watch?</strong> Yes. Sleep, HRV, and wrist-temperature signals come from Apple Health when available — but your daily check-in, Marea Index, cycle tracking, and education library all work without any wearable.</p>
          <p><strong>Is Marea on Android?</strong> Not yet. We launched on iOS first. Android is on the roadmap.</p>
          <p><strong>Why do you ask for my zip code?</strong> It's optional and only used to tailor what's regionally relevant (e.g., provider availability, climate-sensitive symptom patterns). It's never sold or shared.</p>
        </Section>

        <Section title="Medical emergencies">
          <div className="p-4 bg-[#842b16]/5 border-l-4 border-[#842b16] rounded-lg">
            <p className="font-semibold text-[#842b16] mb-2">Marea is not an emergency service.</p>
            <p>If you are experiencing a medical emergency — including postmenopausal bleeding, chest pain, severe abdominal pain, signs of stroke, or any acute change — call your local emergency number or go to the nearest emergency room immediately.</p>
          </div>
        </Section>

        <Section title="Legal">
          <p>
            See our{' '}
            <Link to="/privacy" className="text-primary font-medium hover:text-tertiary transition-colors">Privacy Policy</Link>
            {' '}and{' '}
            <Link to="/terms" className="text-primary font-medium hover:text-tertiary transition-colors">Terms of Service</Link>
            {' '}for details on how we handle your data and what you're agreeing to when you use Marea.
          </p>
        </Section>

      </div>
    </main>
  )
}
