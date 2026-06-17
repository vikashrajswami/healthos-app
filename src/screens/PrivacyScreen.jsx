import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

const UPDATED = 'June 17, 2026'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 10, borderLeft: '3px solid #14b8a6', paddingLeft: 12 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  )
}

function Bullet({ children }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
      <span style={{ color: '#14b8a6', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>•</span>
      <span>{children}</span>
    </div>
  )
}

export default function PrivacyScreen() {
  const nav = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f3a3a,#0a2424)', padding: '44px 22px 28px' }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#9fd9cf', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Logo size={44}/>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Privacy Policy</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Last updated: {UPDATED}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* Intro */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', marginBottom: 24, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.8 }}>
            AROGYOS ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal and health data when you use the AROGYOS application (the "App"). By using AROGYOS, you agree to the practices described in this Policy.
          </div>
        </div>

        <Section title="1. Who We Are">
          AROGYOS is a health intelligence platform developed and operated by AROGYOS Intelligence. We help individuals understand and improve their biological age using lab reports, lifestyle data, and AI analysis.
          <br/><br/>
          <strong>Contact:</strong> support@arogyos.com
        </Section>

        <Section title="2. What Data We Collect">
          <strong>A. Information you provide directly:</strong>
          <Bullet>Name, age, and profile information you enter during onboarding</Bullet>
          <Bullet>Lifestyle quiz answers (exercise, sleep, diet, stress, smoking habits)</Bullet>
          <Bullet>Lab report files you upload (PDF or image)</Bullet>
          <Bullet>Email address and mobile number (if added in Settings)</Bullet>
          <Bullet>Weight and water intake entries (daily vitals)</Bullet>
          <Bullet>Family members you invite and their quiz data (only data they consent to share)</Bullet>

          <br/><strong>B. Information collected automatically:</strong>
          <Bullet>Anonymous usage analytics (which screens you visit, how often you open the app)</Bullet>
          <Bullet>Device type, browser type, and operating system</Bullet>
          <Bullet>A randomly generated unique ID (UUID) stored on your device — not linked to your identity unless you provide contact details</Bullet>
          <Bullet>Push notification subscription data (if you opt in)</Bullet>

          <br/><strong>C. What we do NOT collect:</strong>
          <Bullet>We do NOT collect your Aadhaar number, PAN, passport, or government identity</Bullet>
          <Bullet>We do NOT access your camera, microphone, or contacts without explicit permission</Bullet>
          <Bullet>We do NOT store raw payment card data — payments are processed entirely by Razorpay or Paddle</Bullet>
          <Bullet>We do NOT sell, rent, or trade your data to any third party</Bullet>
        </Section>

        <Section title="3. How We Use Your Data">
          <Bullet><strong>BioAge Calculation:</strong> Your age, lifestyle answers, and lab biomarkers are used to estimate and track your biological age over time</Bullet>
          <Bullet><strong>AI Analysis:</strong> Uploaded lab reports are processed by Anthropic Claude AI to extract and interpret biomarkers. Files are processed in real time and not stored permanently by the AI provider</Bullet>
          <Bullet><strong>Personalised Insights:</strong> Your quiz answers and biomarkers are used to generate personalised daily health tips, diet plans, and protocol recommendations</Bullet>
          <Bullet><strong>Family Tracker:</strong> Data from family members you invite is displayed to you only after they consent by completing their own onboarding</Bullet>
          <Bullet><strong>Service Improvement:</strong> Aggregated, anonymous usage patterns help us improve features and fix bugs</Bullet>
          <Bullet><strong>Communication:</strong> If you provide contact details, we may send health alerts, weekly reports, or important updates (you can opt out anytime)</Bullet>
        </Section>

        <Section title="4. Data Storage and Security">
          <Bullet><strong>Local storage:</strong> Your profile, quiz answers, and daily vitals are stored locally on your device using browser storage (localStorage). This data stays on your device unless you explicitly sync it</Bullet>
          <Bullet><strong>Cloud storage:</strong> If you use features like Family Tracker or data sync, your profile and subscription data is stored in Supabase (PostgreSQL) hosted on AWS in the ap-south-1 (Mumbai) region</Bullet>
          <Bullet><strong>Lab reports:</strong> Uploaded files are processed immediately and not permanently stored on our servers — they are deleted after analysis</Bullet>
          <Bullet><strong>Encryption:</strong> All data in transit is encrypted using TLS 1.3. All data at rest in Supabase is encrypted using AES-256</Bullet>
          <Bullet><strong>Payment data:</strong> Subscription payments are processed by Razorpay (India) or Paddle (International). We receive only a subscription confirmation — no card details are stored by us</Bullet>
          <Bullet><strong>Access control:</strong> Only the individual user can access their own data. We use row-level access controls to enforce this</Bullet>
        </Section>

        <Section title="5. Third-Party Services We Use">
          <Bullet><strong>Anthropic Claude:</strong> AI processing of lab reports and health queries. Processed in real time; no permanent data retention by Anthropic</Bullet>
          <Bullet><strong>Supabase:</strong> Database and authentication infrastructure, hosted on AWS Mumbai</Bullet>
          <Bullet><strong>Razorpay:</strong> Payment processing for India (PCI DSS Level 1 certified)</Bullet>
          <Bullet><strong>Paddle:</strong> Payment processing for international users (Merchant of Record)</Bullet>
          <Bullet><strong>Vercel:</strong> Application hosting and serverless functions</Bullet>
        </Section>

        <Section title="6. Your Rights">
          Under India's Digital Personal Data Protection (DPDP) Act 2023 and GDPR (for EU residents), you have the right to:
          <Bullet><strong>Access:</strong> Request a copy of all data we hold about you</Bullet>
          <Bullet><strong>Correction:</strong> Correct inaccurate data through the Settings screen</Bullet>
          <Bullet><strong>Deletion:</strong> Delete your account and all associated data from Settings → Delete Account. This is permanent and irreversible</Bullet>
          <Bullet><strong>Export:</strong> Request an export of your health data in machine-readable format</Bullet>
          <Bullet><strong>Opt-out:</strong> Disable marketing communications, push notifications, and emails from the Settings → Notifications section at any time</Bullet>
          <Bullet><strong>Withdraw consent:</strong> Stop using the app at any time. Your locally-stored data can be cleared by uninstalling the app or clearing browser data</Bullet>
          To exercise these rights, email us at <strong>support@arogyos.com</strong>. We will respond within 30 days.
        </Section>

        <Section title="7. Children's Privacy">
          AROGYOS is not intended for children under 13 years of age. We do not knowingly collect personal data from children under 13. Family tracker features for children require a parent or guardian to set up the account on their behalf. If you believe we have inadvertently collected data from a minor, please contact us immediately.
        </Section>

        <Section title="8. Data Retention">
          <Bullet>Account data is retained as long as your account is active</Bullet>
          <Bullet>On account deletion, all data is permanently removed within 30 days</Bullet>
          <Bullet>Payment transaction records may be retained for 7 years as required by Indian tax law (GST/IT Act)</Bullet>
          <Bullet>Anonymised, aggregated analytics data with no personal identifiers may be retained indefinitely</Bullet>
        </Section>

        <Section title="9. Cookies and Tracking">
          AROGYOS uses only essential browser storage (localStorage and sessionStorage) to store your preferences and profile. We do not use third-party tracking cookies, advertising trackers, or fingerprinting technologies.
        </Section>

        <Section title="10. Medical Disclaimer">
          <div style={{ background: '#fff3cd', border: '1px solid #fbbf24', borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
            <strong>IMPORTANT:</strong> AROGYOS is an educational and informational health tool only. It is NOT a medical device, does NOT diagnose any medical condition, and does NOT replace professional medical advice. Biological age estimates are based on lifestyle questionnaires and lab biomarker patterns — they are not diagnostic conclusions. Always consult a qualified doctor before making changes to your health, medication, or treatment plan.
          </div>
          AROGYOS does not claim to prevent, treat, cure, or mitigate any disease. If you are experiencing a medical emergency, call 112 (India) or your local emergency number immediately.
        </Section>

        <Section title="11. Changes to This Policy">
          We may update this Privacy Policy periodically. When we do, we will update the "Last updated" date at the top of this page and notify you via the app. Continued use of AROGYOS after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="12. Governing Law">
          This Privacy Policy is governed by the laws of India. Disputes shall be subject to the jurisdiction of courts in India. For EU/UK residents, we comply with GDPR and UK GDPR requirements.
        </Section>

        {/* Contact */}
        <div style={{ background: 'linear-gradient(135deg,#0f3a3a,#0a2424)', borderRadius: 16, padding: '20px 22px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Questions about your privacy?</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>We are here to help and will respond within 30 days.</div>
          <a href="mailto:support@arogyos.com" style={{ display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(90deg,#14b8a6,#059669)', color: '#fff', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            Email: support@arogyos.com →
          </a>
        </div>

      </div>
    </div>
  )
}
