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

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-base text-on-background/80 leading-relaxed p-5 bg-primary/5 border-l-4 border-primary rounded-lg mb-12">
          These Terms govern your use of Marea. Please read them carefully — they include important information about medical disclaimers, subscriptions, and your rights. By creating an account you agree to these Terms and to our{' '}
          <Link to="/privacy" className="text-primary font-medium hover:text-tertiary transition-colors">Privacy Policy</Link>.
        </p>

        <Section title="1. Acceptance of these Terms">
          <p>By accessing or using the Marea app, website, or related services ("Marea"), you agree to be bound by these Terms of Service. If you do not agree, do not use Marea.</p>
        </Section>

        <Section title="2. Eligibility">
          <p>You must be at least 18 years old to use Marea. By creating an account, you represent that you are of legal age to form a binding contract and have the authority to enter into these Terms on your own behalf.</p>
        </Section>

        <Section title="3. Medical Disclaimer — please read">
          <div className="p-4 bg-[#842b16]/5 border-l-4 border-[#842b16] rounded-lg mb-3">
            <p className="font-semibold text-[#842b16] mb-2">Marea is not a medical device, a diagnostic tool, or a substitute for professional medical care.</p>
            <p>The information, scores, insights, AI responses, and educational content provided by Marea are for general informational and wellness purposes only. They do not constitute medical advice, diagnosis, or treatment.</p>
          </div>
          <p>Always seek the advice of a qualified healthcare provider with any questions you may have about a medical condition or treatment. Never disregard, delay, or avoid professional medical advice based on anything you read or receive from Marea.</p>
          <p><strong>If you are experiencing a medical emergency — including postmenopausal bleeding, chest pain, severe abdominal pain, signs of stroke, or any acute change — call your local emergency number or go to the nearest emergency room immediately.</strong></p>
        </Section>

        <Section title="4. Your Account">
          <p>You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized access. Marea is not liable for any loss or damage arising from your failure to safeguard your credentials.</p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree not to: (a) use Marea for any unlawful purpose; (b) attempt to gain unauthorized access to any part of the service; (c) reverse engineer, decompile, or tamper with the service; (d) upload malicious code; (e) impersonate any person; (f) harass or abuse other users in community features; or (g) use Marea to provide medical services to others.</p>
        </Section>

        <Section title="6. Subscriptions, Billing & Cancellation">
          <p>Marea offers both free and paid features. Paid subscriptions ("Membership") are billed in advance on a recurring basis (monthly or annually) at the price disclosed at checkout. By subscribing you authorize us and our payment processor to charge your selected payment method on each renewal date.</p>
          <p><strong>Cancellation:</strong> You may cancel your Membership at any time from your account settings. Cancellation takes effect at the end of the current billing period; you will retain paid access until that date. Unless required by law or explicitly stated, fees already paid are non-refundable.</p>
          <p>We reserve the right to change pricing. Any price change will take effect at your next renewal after reasonable advance notice.</p>
        </Section>

        <Section title="7. Mobile App Purchases">
          <p>If you subscribe through an app store (e.g., Apple App Store or Google Play), the purchase and billing are governed by that platform's terms. Cancellations and refunds for app-store purchases must be handled through the applicable platform.</p>
        </Section>

        <Section title="8. User Content">
          <p>Content you submit to community features (posts, replies, profile content) remains yours, but you grant Marea a worldwide, non-exclusive, royalty-free license to host, display, and distribute that content within the service. You are solely responsible for the content you post and agree not to post anything unlawful, defamatory, or that violates another person's rights.</p>
          <p>We may remove content or suspend accounts that violate these Terms or our community guidelines, at our discretion.</p>
        </Section>

        <Section title="9. Intellectual Property">
          <p>Marea, including all software, content, branding, and designs, is owned by Marea Health, Inc. and its licensors and is protected by intellectual-property laws. Except for user-generated content, you may not copy, modify, distribute, sell, or lease any part of the service without our written permission.</p>
        </Section>

        <Section title="10. Third-Party Services">
          <p>Marea integrates with third-party services including Apple HealthKit, Supabase, Anthropic (Claude), Vercel, and payment processors. Your use of those services is governed by their respective terms and privacy policies. We are not responsible for third-party services, but we strive to work only with reputable providers.</p>
        </Section>

        <Section title="11. Disclaimer of Warranties">
          <p>Marea is provided "as is" and "as available" without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, non-infringement, or accuracy of content. We do not warrant that the service will be uninterrupted, error-free, or that any defect will be corrected.</p>
        </Section>

        <Section title="12. Limitation of Liability">
          <p>To the maximum extent permitted by law, Marea and its affiliates, officers, employees, and agents will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, revenues, data, or health outcomes, arising from or related to your use of the service. Our total liability to you for any claim arising out of these Terms or the service will not exceed the amount you paid us in the twelve (12) months preceding the claim.</p>
        </Section>

        <Section title="13. Indemnification">
          <p>You agree to indemnify and hold Marea harmless from any claims, damages, or expenses (including reasonable legal fees) arising from your use of the service, your content, or your violation of these Terms or any law.</p>
        </Section>

        <Section title="14. Termination">
          <p>You may close your account at any time. We may suspend or terminate your access, with or without notice, if we reasonably believe you have violated these Terms, created risk or legal exposure for Marea, or for any other reason permitted by law. Sections that by their nature should survive termination (including disclaimers, limitation of liability, and indemnification) will survive.</p>
        </Section>

        <Section title="15. Governing Law & Disputes">
          <p>These Terms are governed by the laws of the State of Florida, USA, without regard to its conflict-of-law principles. Any dispute arising out of or related to these Terms or the service will be resolved in the state or federal courts located in Miami-Dade County, Florida, and you consent to the jurisdiction of those courts.</p>
        </Section>

        <Section title="16. Changes to These Terms">
          <p>We may update these Terms from time to time. If we make material changes, we will notify you via the app or by email before the changes take effect. Your continued use of Marea after the effective date constitutes acceptance of the updated Terms.</p>
        </Section>

        <Section title="17. Contact">
          <p>Questions about these Terms? Contact us at <strong>hello@mareahealth.com</strong> or see our{' '}
            <Link to="/privacy" className="text-primary font-medium hover:text-tertiary transition-colors">Privacy Policy</Link>.
          </p>
        </Section>

      </div>
    </main>
  )
}
