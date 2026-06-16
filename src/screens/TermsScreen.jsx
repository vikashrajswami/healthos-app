import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    id: 'about',
    title: '1. About HealthOS',
    content: `HealthOS (operated by HealthOS Intelligence Pvt. Ltd.) is a health-technology platform that enables users to upload, analyse, and track biological and clinical data including blood test reports, biomarkers, and related health parameters. HealthOS is not a medical device, not a diagnostic laboratory, and does not provide medical diagnoses or prescriptions.

HealthOS partners with NABL/CAP-accredited laboratories for doorstep sample collection services available in select cities in India. All laboratory tests are conducted by partner labs under applicable regulatory frameworks.

By creating an account, you confirm that you have read, understood, and agree to be bound by these Terms and all policies incorporated by reference.`,
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    content: `You must be at least 18 years of age to create an account and use HealthOS independently. Persons between 13 and 17 years may use the platform only with explicit, verifiable parental or guardian consent. Persons under 13 years are not permitted to use this platform.

By accepting these Terms, you confirm that: (a) you are at least 18 years old, or have obtained verifiable parental consent; (b) you have the legal capacity to enter into a binding agreement; (c) you are not a resident of any jurisdiction where use of this service is prohibited by applicable law.`,
  },
  {
    id: 'health-data',
    title: '3. Health Data — Collection & Processing',
    content: `HealthOS collects and processes the following categories of personal data:

IDENTITY DATA: Name, date of birth, gender, contact details (mobile number and/or email address).

HEALTH DATA (SENSITIVE): Laboratory test reports, biomarker values, biological age calculations, health scores, upload history, and any health-related information you voluntarily provide. Under applicable law, health data is classified as "Sensitive Personal Data" (India: DPDP Act 2023 / IT (Reasonable Security Practices) Rules 2011), "Special Category Data" (EU/UK: GDPR Article 9), and "Protected Health Information" (USA: HIPAA).

USAGE DATA: Device identifiers, IP address, browser type, pages visited, time spent, and interaction logs (used solely for service improvement and security).

PURPOSE OF PROCESSING: Your health data is processed exclusively to (a) compute biological age and health scores; (b) generate AI-assisted health insights; (c) store and present your health history in the Health Vault; (d) facilitate laboratory bookings; (e) generate reports for sharing with your authorised healthcare providers.

LEGAL BASIS: Processing is performed on the basis of your explicit, informed, and freely given consent (withdrawable at any time), and, where applicable, for the performance of the service contract with you.

DATA MINIMISATION: We collect only what is strictly necessary for the stated purposes. You are never required to upload raw laboratory reports — you may manually enter values instead.`,
  },
  {
    id: 'laws',
    title: '4. Applicable Laws & Your Rights',
    content: `HealthOS complies with, and you are protected under, the following frameworks:

🇮🇳 INDIA — Digital Personal Data Protection (DPDP) Act, 2023; Information Technology Act, 2000; IT (Amendment) Act, 2008; IT (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011; Consumer Protection Act, 2019; Telemedicine Practice Guidelines, 2020 (MoHFW).

🇪🇺 EUROPEAN UNION / 🇬🇧 UK — General Data Protection Regulation (GDPR) (EU) 2016/679; UK GDPR; UK Data Protection Act 2018. For EU/UK users, HealthOS acts as a Data Controller. You have the right to: access, rectify, erase ("right to be forgotten"), restrict processing, data portability, and object to processing. You may lodge a complaint with your local Data Protection Authority (DPA).

🇺🇸 USA — California Consumer Privacy Act (CCPA) / California Privacy Rights Act (CPRA) for California residents. We do not "sell" personal data as defined under CCPA. You may opt out of any data sharing for cross-context behavioural advertising. For US users, HealthOS is not a HIPAA Covered Entity; however, we apply equivalent safeguards to your health data voluntarily.

🇸🇬 SINGAPORE — Personal Data Protection Act (PDPA) 2012. You may withdraw consent or request access/correction at any time.

🇦🇪 UAE — UAE Federal Data Protection Law (Federal Decree-Law No. 45 of 2021). Data transferred from the UAE is subject to adequacy safeguards.

🇦🇺 AUSTRALIA — Privacy Act 1988 (Cth) and Australian Privacy Principles (APPs). You may request access to or correction of your personal information held by us.

🇨🇦 CANADA — Personal Information Protection and Electronic Documents Act (PIPEDA). You may withdraw consent subject to legal or contractual restrictions.

TO EXERCISE ANY RIGHT: Email privacy@healthos.in with your registered email and request type. We respond within 30 days (GDPR: 1 month).`,
  },
  {
    id: 'retention',
    title: '5. Data Retention',
    content: `We retain your personal data for the period your account is active and for a legally mandated period thereafter. Specifically:

• Health reports and biomarker data: retained for 7 years (Indian statutory period for medical records; aligns with GDPR proportionality for health research purposes) or until account deletion, whichever is earlier.
• Identity data: retained for 3 years post-account closure for fraud prevention and legal compliance.
• Payment records: retained for 8 years as required under Indian accounting standards (Companies Act 2013) and international equivalents.
• Usage/log data: retained for 90 days on a rolling basis for security and debugging.

Upon verified account deletion request, all personal and health data is purged within 30 days from active systems and within 90 days from backup systems, except where retention is required by law.`,
  },
  {
    id: 'transfers',
    title: '6. International Data Transfers',
    content: `Your data is stored on servers located in India (primary) and replicated to secure cloud infrastructure for availability and disaster recovery. Where data is transferred outside India (e.g., to cloud providers with data centres in other regions), such transfers are protected by:

• Standard Contractual Clauses (SCCs) approved by the European Commission (for EU/UK users).
• Adequacy decisions or equivalent safeguards under applicable law.
• Data Processing Agreements (DPAs) with all sub-processors binding them to GDPR-equivalent obligations.

Sub-processors include: cloud storage providers, email delivery services (for OTP), and analytics tools (all configured for data minimisation). A current list of sub-processors is available at healthos.in/sub-processors.`,
  },
  {
    id: 'security',
    title: '7. Security',
    content: `HealthOS implements the following technical and organisational security measures:

TECHNICAL: 256-bit AES encryption for data at rest; TLS 1.3 for data in transit; session-based encryption for locally cached data; Content Security Policy (CSP) headers; HTTP Strict Transport Security (HSTS); anti-clickjacking controls; input sanitisation and validation; OTP rate limiting (5 attempts per 15 minutes); automatic session expiry.

ORGANISATIONAL: Access controls on a need-to-know basis; employee data handling training; incident response procedures; periodic security reviews.

INCIDENT NOTIFICATION: In the event of a data breach affecting your rights and freedoms, we will notify you within 72 hours of becoming aware (as required by GDPR Article 33) and within the timeframe prescribed by applicable local law.

LIMITATION: No digital system is completely impenetrable. While we implement industry-standard measures, HealthOS cannot guarantee absolute security. You are responsible for maintaining the security of your account credentials and device.`,
  },
  {
    id: 'disclaimer',
    title: '8. Medical Disclaimer',
    content: `HEALTHOS IS A HEALTH-EDUCATION AND DATA-TRACKING PLATFORM. IT IS NOT A LICENSED MEDICAL DEVICE, DIAGNOSTIC LABORATORY, OR HEALTHCARE PROVIDER.

The biological age score, biomarker analysis, and AI-generated insights provided by HealthOS are for informational and educational purposes only. They do not constitute medical advice, diagnosis, treatment recommendations, or prescriptions.

Always consult a qualified, licensed healthcare professional before making any changes to your diet, medication, supplementation, or lifestyle based on information from HealthOS. HealthOS explicitly disclaims liability for any health decisions made based solely on information provided by the platform.

Laboratory tests booked through HealthOS are conducted by independent, NABL/CAP-accredited partner laboratories. HealthOS is not responsible for the accuracy of laboratory results — queries regarding test results should be directed to the testing laboratory.

In an emergency, call your local emergency services (India: 112; USA: 911; UK: 999; EU: 112) immediately. Do not rely on HealthOS in emergency situations.`,
  },
  {
    id: 'payment',
    title: '9. Subscription & Payment',
    content: `SUBSCRIPTION PLANS: HealthOS offers monthly and annual subscription plans. Pricing is displayed in INR for users selecting India as their country, and in USD for all other users. All prices are inclusive of applicable taxes for Indian users (GST at applicable rate); international prices exclude local taxes for which you are responsible.

BILLING: Subscriptions are billed in advance for the chosen period (monthly or annual). Your subscription automatically renews unless cancelled at least 24 hours before the renewal date.

PAYMENT PROCESSING: Indian users may pay via UPI, credit card, or debit card through Razorpay (a PCI DSS Level 1 certified payment processor). International users may pay via credit or debit card through Stripe (PCI DSS Level 1 certified). HealthOS does not store full card numbers or CVV/CVC at any point — payment data is processed solely by the payment processor.

REFUND POLICY: Subscriptions cancelled within 7 days of first purchase (and before consuming any doorstep lab service or downloading a report) are eligible for a full refund. No refunds are provided after 7 days or after consumption of included services. Refund requests must be submitted to support@healthos.in.

PRICE CHANGES: We may revise subscription prices with 30 days' advance written notice. Continued use after the notice period constitutes acceptance of the new price.`,
  },
  {
    id: 'ip',
    title: '10. Intellectual Property',
    content: `All content, software, AI models, algorithms, designs, trademarks, and brand elements of HealthOS are the exclusive intellectual property of HealthOS Intelligence Pvt. Ltd. and are protected under the Copyright Act, 1957 (India), and equivalent international copyright laws.

Your health data belongs to you. HealthOS claims no ownership over your personal health records. You grant HealthOS a limited, non-exclusive, revocable licence to process your data solely for the purposes described in these Terms.

You may not reproduce, reverse-engineer, decompile, scrape, or create derivative works from any part of the HealthOS platform without prior written consent.`,
  },
  {
    id: 'liability',
    title: '11. Limitation of Liability',
    content: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:

HealthOS shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, loss of revenue, bodily harm, or adverse health outcomes arising from your use of or reliance on the platform.

HealthOS's total cumulative liability for any claim arising out of or related to these Terms shall not exceed the total subscription fees paid by you in the 12 months preceding the claim.

These limitations do not apply to: (a) death or personal injury caused by our negligence; (b) fraud or fraudulent misrepresentation; (c) any liability that cannot be excluded by applicable law (including consumer protection laws in your jurisdiction).`,
  },
  {
    id: 'dispute',
    title: '12. Dispute Resolution & Governing Law',
    content: `INDIAN USERS: These Terms are governed by the laws of India. Any dispute shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be referred to binding arbitration under the Arbitration and Conciliation Act, 1996, with a sole arbitrator seated in Bengaluru, India. Consumer disputes may alternatively be filed with the appropriate consumer forum under the Consumer Protection Act, 2019.

EU/UK USERS: Nothing in these Terms affects your statutory rights as a consumer under EU/UK law. You may bring proceedings in the courts of your country of residence. For GDPR complaints, you may contact your local supervisory authority.

USA USERS: For California residents, this agreement does not limit rights under the CCPA. Disputes for US users shall be resolved by binding arbitration under JAMS rules, with proceedings conducted in English.

ALL OTHER USERS: Disputes shall be governed by the laws of India, with the courts of Bengaluru having non-exclusive jurisdiction.

CLASS ACTION WAIVER: To the extent permitted by law, you waive any right to participate in a class action lawsuit or class-wide arbitration against HealthOS.`,
  },
  {
    id: 'changes',
    title: '13. Changes to These Terms',
    content: `We may update these Terms from time to time to reflect changes in law, technology, or our services. We will notify you of material changes by email (to your registered address) and/or by a prominent notice within the app at least 30 days before the change takes effect.

Your continued use of HealthOS after the effective date of the revised Terms constitutes acceptance. If you do not agree to the revised Terms, you must close your account before the effective date.

The current version of these Terms is always accessible at healthos.in/terms. The version date is shown at the bottom of this document.`,
  },
  {
    id: 'contact',
    title: '14. Contact & Grievance Officer',
    content: `For any queries, complaints, or requests related to your data or these Terms:

Email: privacy@healthos.in
Support: support@healthos.in

GRIEVANCE OFFICER (India — as required by IT Rules 2011 and DPDP Act 2023):
Name: [Grievance Officer Name]
Email: grievance@healthos.in
Response time: Acknowledgement within 48 hours; resolution within 30 days.

DATA PROTECTION OFFICER (EU/UK — GDPR Article 37):
Email: dpo@healthos.in

REGISTERED OFFICE:
HealthOS Intelligence Pvt. Ltd.
[Registered Address], Bengaluru, Karnataka — 560001, India
CIN: [Company Identification Number]`,
  },
]

const LAW_BADGES = [
  { flag: '🇮🇳', label: 'DPDP Act 2023' },
  { flag: '🇪🇺', label: 'GDPR' },
  { flag: '🇺🇸', label: 'CCPA / HIPAA' },
  { flag: '🇬🇧', label: 'UK GDPR' },
  { flag: '🇸🇬', label: 'PDPA' },
  { flag: '🇦🇪', label: 'UAE DPL' },
  { flag: '🇦🇺', label: 'Privacy Act' },
  { flag: '🇨🇦', label: 'PIPEDA' },
]

export default function TermsScreen() {
  const nav = useNavigate()
  const [open, setOpen] = useState({})
  const toggle = id => setOpen(o => ({ ...o, [id]: !o[id] }))

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f3a3a,#0a2424)', padding: '40px 24px 32px', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#9fd9cf', fontSize: 13, cursor: 'pointer', fontWeight: 600, marginBottom: 16, padding: 0 }}>
          ← Back
        </button>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Terms & Conditions</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Effective: 17 June 2026 · Version 1.0</div>

        {/* Law badge strip */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 16, paddingBottom: 2 }}>
          {LAW_BADGES.map(b => (
            <div key={b.label} style={{ flexShrink: 0, background: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: '#9fd9cf', fontWeight: 600, whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.1)' }}>
              {b.flag} {b.label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* Intro */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', marginBottom: 16, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.75 }}>
            These Terms govern your use of HealthOS across all features including health report analysis, biological age tracking, Health Vault, Lab-at-Doorstep, and subscription services. HealthOS operates globally and this document incorporates applicable data protection and consumer rights laws for users in India, the EU/UK, USA, Singapore, UAE, Australia, and Canada.
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(s => (
          <div key={s.id} style={{ background: '#fff', borderRadius: 14, marginBottom: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <button onClick={() => toggle(s.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{s.title}</span>
              <span style={{ fontSize: 18, color: '#94a3b8', transform: open[s.id] ? 'rotate(90deg)' : 'none', transition: 'transform .18s' }}>›</span>
            </button>
            {open[s.id] && (
              <div style={{ padding: '0 20px 18px', fontSize: 13, color: '#475569', lineHeight: 1.85, borderTop: '1px solid #f1f5f9', paddingTop: 14, whiteSpace: 'pre-wrap' }}>
                {s.content}
              </div>
            )}
          </div>
        ))}

        {/* Key rights summary */}
        <div style={{ background: 'linear-gradient(135deg,#0f3a3a,#0a2424)', borderRadius: 14, padding: '20px 22px', marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#14b8a6', marginBottom: 12, letterSpacing: 1 }}>YOUR KEY RIGHTS AT A GLANCE</div>
          {[
            ['📥', 'Access', 'Request a copy of all data we hold about you'],
            ['✏️', 'Rectify', 'Correct inaccurate personal data at any time'],
            ['🗑️', 'Erase', 'Delete your account and all associated data'],
            ['📦', 'Portability', 'Export your health data in machine-readable format'],
            ['🚫', 'Object', 'Object to processing for direct marketing'],
            ['↩️', 'Withdraw', 'Withdraw consent for health data processing at any time'],
          ].map(([icon, right, desc]) => (
            <div key={right} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 15, marginTop: 1 }}>{icon}</span>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{right}: </span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{desc}</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14, fontSize: 12, color: '#14b8a6', fontWeight: 600 }}>
            Exercise any right: privacy@healthos.in · Response within 30 days
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 24, lineHeight: 1.7 }}>
          HealthOS Intelligence Pvt. Ltd. · CIN: [Pending] · Bengaluru, Karnataka, India<br/>
          Registered under Companies Act 2013 · DPDP Act 2023 compliant<br/>
          These Terms were last updated on 17 June 2026
        </div>
      </div>
    </div>
  )
}
