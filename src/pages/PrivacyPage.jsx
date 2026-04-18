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

export default function PrivacyPage() {
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
          Last updated: April 2026
        </p>
        <h1 className="font-headline text-4xl md:text-5xl text-on-background font-normal leading-tight mb-6">
          Privacy Policy
        </h1>
        <p className="text-base text-on-background/80 leading-relaxed p-5 bg-primary/5 border-l-4 border-primary rounded-lg mb-12">
          Marea is a women's health companion for perimenopause. We take your privacy seriously — especially when you're sharing sensitive health information. Please read this carefully.
        </p>

        <Section title="1. Who We Are">
          <p>Marea Health, Inc. ("Marea," "we," "us") operates the Marea app and website. Our platform is designed by Dr. Rodriguez, MD, FACOG and Dr. Richmond, MD, FACOG to support women navigating perimenopause with evidence-based information, symptom tracking, and community support.</p>
          <p>Marea is not a medical practice and does not provide medical diagnoses, treatment, or prescriptions. Content is for informational and educational purposes only.</p>
        </Section>

        <Section title="2. Information We Collect">
          <p><strong>Account information:</strong> When you create an account, we collect your first name, email address, and password. You may optionally provide your zip code (for future local provider recommendations) and phone number (for appointment reminders). If you sign in with Google or Apple, we receive your name, email, and a unique account identifier from that provider — nothing more.</p>
          <p><strong>Health information:</strong> We collect responses to your initial perimenopause assessment, daily symptom logs, sleep data, and any other health information you voluntarily enter. This data is used solely to personalize your experience.</p>
          <p><strong>Apple Health (iOS):</strong> If you choose to connect Apple HealthKit, we read only the data you authorize — typically sleep, heart rate variability, and wrist temperature — to enrich your Marea Index. We never write to HealthKit without your explicit action.</p>
          <p><strong>Community content:</strong> Posts and replies you make in the community are visible to other Marea members. Do not post personally identifying information in community posts.</p>
          <p><strong>Usage data:</strong> We collect standard analytics such as pages visited and features used to improve the product. We do not sell this data.</p>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul className="list-disc pl-5 space-y-2">
            <li>To provide, personalize, and improve the Marea app</li>
            <li>To calculate your daily Marea Index and show you symptom trends relevant to your perimenopause stage</li>
            <li>To connect you with local healthcare providers if you request it</li>
            <li>To send appointment reminders or care updates if you provide your phone number</li>
            <li>To improve our educational content and community features</li>
            <li>To comply with legal obligations</li>
          </ul>
          <p><strong>We do not sell, rent, or share your personal or health information with third parties for marketing purposes. Ever.</strong></p>
        </Section>

        <Section title="4. Health Data">
          <p>Marea is a wellness application, not a HIPAA-covered entity. We treat all health information with the strictest confidentiality. Your symptom logs, assessment results, and health-related data are:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Encrypted in transit and at rest on our infrastructure partners</li>
            <li>Never shared with insurance companies, employers, or data brokers</li>
            <li>Accessible only by you and authorized Marea staff for support purposes</li>
            <li>Deletable at any time upon your request</li>
          </ul>
        </Section>

        <Section title="5. Third-Party Services">
          <p>Marea uses Supabase (database and authentication), Vercel (hosting), Anthropic (Claude AI for personalized insights and chat), Stripe (payment processing), and Google / Apple (OAuth sign-in). These providers have their own privacy policies and are contractually required to protect your data. We do not authorize them to use your data for any other purpose.</p>
        </Section>

        <Section title="6. Community Guidelines">
          <p>The Marea community is a supportive, moderated space for adult women. By participating, you agree to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Be respectful and supportive of other members</li>
            <li>Not share personal contact information publicly</li>
            <li>Not post medical advice, diagnoses, or prescriptions</li>
            <li>Not post content that is harassing, explicit without context, or harmful</li>
          </ul>
          <p>Marea reserves the right to remove content and revoke access for violations.</p>
        </Section>

        <Section title="7. Intimacy &amp; Sexual Health Content">
          <p>Marea includes an Intimacy &amp; Sexual Health section developed in consultation with Dr. Richmond, MD, FACOG. This content is intended for adult women (18+) and addresses medical and wellness topics related to sexual health during perimenopause. Content is clinically grounded and tasteful. It is not explicit or pornographic in nature.</p>
        </Section>

        <Section title="8. Your Rights">
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Access the data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your account and all associated data</li>
            <li>Opt out of non-essential communications</li>
          </ul>
          <p>To exercise any of these rights, contact us at <strong>privacy@mareahealth.com</strong>.</p>
        </Section>

        <Section title="9. Age Restriction">
          <p>Marea is intended for adults 18 years of age or older. By creating an account, you confirm that you are at least 18 years old. We do not knowingly collect data from anyone under 18.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or an in-app notice. Your continued use of Marea after changes indicates acceptance.</p>
        </Section>

        <div className="p-5 bg-surface rounded-xl border border-outline/20 mt-8">
          <p className="text-sm text-on-background/80 leading-relaxed">
            <strong>Questions?</strong> Contact us at <strong>privacy@mareahealth.com</strong> or write to Marea Health, Inc., Miami, FL.
          </p>
          <p className="text-sm text-on-background/70 mt-3">
            See also our <Link to="/terms" className="text-primary font-medium hover:text-tertiary transition-colors">Terms of Service</Link>.
          </p>
        </div>
      </div>
    </main>
  )
}
