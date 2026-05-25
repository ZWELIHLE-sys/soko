import { Shield, Eye, PenLine, Trash2, Ban, MessageSquare } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/ui/FadeIn'
import styles from '../legal.module.css'

export const metadata = {
  title: 'Privacy Policy — Vuna',
  description: 'How Vuna collects, uses and protects your personal information in compliance with POPIA.',
}

const buyerData = [
  'Full name and email address (account registration)',
  'Phone number (optional — for delivery updates)',
  'Delivery address (for order fulfilment)',
  'Order and purchase history',
  'Device and browser information (for security)',
]

const sellerData = [
  'Full name, email address and phone number',
  'Brand / shop name and personal story (bio)',
  'Location — province, district and city',
  'Proof photos submitted during verification',
  'Bank account details (for weekly payouts)',
  'Product listings, descriptions and images',
]

const autoData = [
  'IP address and approximate location',
  'Browser type and operating system',
  'Pages visited and time spent on platform',
  'Referring website (how you found Vuna)',
]

const purposes = [
  ['To operate your account',    'Creating and managing your buyer or seller account on Vuna'],
  ['To process orders',          'Facilitating purchases between buyers and sellers, processing payments via PayFast'],
  ['To arrange delivery',        'Sharing your delivery address with the seller so they can arrange fulfilment. Vuna does not manage delivery directly — logistics are coordinated between buyer and seller'],
  ['To pay sellers',             'Processing weekly payouts to verified sellers using their banking details'],
  ['To verify sellers',          'Reviewing seller applications to maintain the authenticity of the Vuna marketplace'],
  ['To communicate with you',    'Sending order confirmations, delivery updates, and platform notifications'],
  ['For platform security',      'Detecting and preventing fraud, abuse and unauthorised access'],
  ['To improve Vuna',            'Analysing platform usage to improve features and user experience'],
]

const partners = [
  ['PayFast',    'Payment processing — buyer payment details for secure transaction completion'],
  ['Cloudinary', 'Image storage — seller product photos and profile images'],
  ['Vercel',     'Platform hosting — encrypted data storage in compliance with POPIA'],
]

const rights = [
  { Icon: Eye,           title: 'Right to access',     desc: 'You may request a copy of all personal information we hold about you' },
  { Icon: PenLine,       title: 'Right to correction', desc: 'You may request that incorrect information be corrected or updated' },
  { Icon: Trash2,        title: 'Right to deletion',   desc: 'You may request that we delete your personal information (subject to legal obligations)' },
  { Icon: Ban,           title: 'Right to object',     desc: 'You may object to us processing your information for direct marketing purposes' },
  { Icon: MessageSquare, title: 'Right to complain',   desc: 'You may lodge a complaint with the Information Regulator of South Africa' },
]

const retention = [
  ['Active accounts',         'For as long as your account remains active on Vuna'],
  ['Order records',           '5 years (required for financial and tax compliance)'],
  ['Seller banking details',  'For the duration of the seller relationship + 5 years'],
  ['Deleted accounts',        'Basic records retained for 1 year then permanently deleted'],
  ['Payment records',         '7 years (SARS tax compliance requirement)'],
]

const security = [
  'All passwords are hashed using bcrypt — we never store plain-text passwords',
  'All data transmission is encrypted using HTTPS / SSL',
  'Database access is restricted and monitored',
  'Banking details are stored with encryption and never displayed in full',
  'Authentication uses industry-standard JWT tokens with expiry',
  'Regular security reviews before and after deployment',
]

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.heroEyebrow}>Legal</div>
        <h1 className={styles.heroTitle}>Privacy Policy</h1>
        <p className={styles.heroSub}>
          Last updated: 1 June 2026 — Compliant with POPIA (Protection of Personal Information Act 4 of 2013)
        </p>
      </div>

      <div className={styles.body}>

        <FadeIn>
          <div className={styles.popiaBadge}>
            <Shield size={22} className={styles.popiaBadgeIcon} />
            <div>
              <div className={styles.popiaBadgeTitle}>POPIA Compliant Platform</div>
              <div className={styles.popiaBadgeText}>
                Vuna is committed to protecting your personal information in accordance with the
                Protection of Personal Information Act 4 of 2013 (POPIA) of South Africa.
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>1. Who We Are</h2>
            <p className={styles.bodyText}>
              Vuna is an African e-commerce marketplace operated by <strong>Umzila-AfriRoute (Pty) Ltd</strong>,
              a technology and communication company.
            </p>
            <p className={styles.bodyText}>
              Vuna connects verified African creators — sellers of handmade, locally produced goods — with buyers
              across South Africa and internationally.
            </p>
            <div className={styles.infoBox}>
              <div className={styles.infoBoxTitle}>Information Officer</div>
              {[
                ['Name',                'Zwelihle Mhlongo'],
                ['Company',             'Umzila-AfriRoute (Pty) Ltd'],
                ['Registration No.',    '2026-010607'],
                ['Registration Date',   '2026-04-28'],
                ['Platform',            'Vuna — vuna.co.za'],
                ['Address',             'Durban, KwaZulu-Natal, South Africa'],
                ['Email',               'privacy@vuna.co.za'],
              ].map(([label, value]) => (
                <div key={label} className={styles.infoRow}>
                  <strong>{label}:</strong> {value}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>2. What Personal Information We Collect</h2>
            <p className={styles.bodyText}>
              We collect only the information necessary to operate the Vuna platform. This includes:
            </p>
            <div className={styles.categoryLabel}>For Buyers:</div>
            {buyerData.map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
            <div className={styles.categoryLabel}>For Sellers:</div>
            {sellerData.map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
            <div className={styles.subHeading}>Automatically Collected:</div>
            {autoData.map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>3. Why We Collect Your Information</h2>
            <p className={styles.bodyText}>
              Under POPIA, we must have a lawful reason to process your personal information.
              We collect and use your information for the following purposes:
            </p>
            {purposes.map(([purpose, description]) => (
              <div key={purpose} className={styles.purposeRow}>
                <div className={styles.purposeKey}>{purpose}</div>
                <div className={styles.purposeVal}>{description}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>4. Who We Share Your Information With</h2>
            <p className={styles.bodyText}>
              We do not sell your personal information to third parties.
              We only share information with the following trusted service providers who help us operate the platform:
            </p>
            {partners.map(([partner, purpose]) => (
              <div key={partner} className={styles.partnerRow}>
                <div className={styles.partnerKey}>{partner}</div>
                <div className={styles.partnerVal}>{purpose}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>5. Your Rights Under POPIA</h2>
            <p className={styles.bodyText}>
              The Protection of Personal Information Act gives you the following rights regarding your personal information:
            </p>
            {rights.map(({ Icon, title, desc }) => (
              <div key={title} className={styles.rightCard}>
                <Icon size={16} className={styles.rightCardIcon} />
                <div>
                  <div className={styles.rightCardTitle}>{title}</div>
                  <div className={styles.rightCardText}>{desc}</div>
                </div>
              </div>
            ))}
            <p className={styles.bodyTextMt}>
              To exercise any of these rights, contact us at <strong>privacy@vuna.co.za</strong>.
              We will respond within 30 days as required by POPIA.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>6. How Long We Keep Your Information</h2>
            {retention.map(([type, period]) => (
              <div key={type} className={styles.retentionRow}>
                <span className={styles.retentionType}>{type}</span>
                <span className={styles.retentionPeriod}>{period}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>7. How We Protect Your Information</h2>
            <p className={styles.bodyText}>
              We take the security of your personal information seriously. Our security measures include:
            </p>
            {security.map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>8. Cookies</h2>
            <p className={styles.bodyText}>
              Vuna uses essential cookies to keep you logged in and remember your session.
              We do not use tracking or advertising cookies. You may disable cookies in your browser
              settings, but this may affect platform functionality.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>9. Children&apos;s Privacy</h2>
            <p className={styles.bodyText}>
              Vuna is not intended for persons under the age of 18. We do not knowingly collect
              personal information from minors. If you believe a minor has registered on our platform,
              please contact us immediately at <strong>privacy@vuna.co.za</strong>.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>10. Changes To This Policy</h2>
            <p className={styles.bodyText}>
              We may update this Privacy Policy from time to time. When we make significant changes,
              we will notify registered users by email and display a notice on the Vuna platform.
              The date at the top of this page always reflects when it was last updated.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.contactCard}>
            <div className={styles.contactEyebrow}>Contact &amp; Complaints</div>
            <h2 className={styles.contactTitle}>Questions About Your Privacy?</h2>
            <p className={styles.contactText}>
              Contact our Information Officer at{' '}
              <strong className={styles.contactHighlight}>privacy@vuna.co.za</strong>
            </p>
            <p className={styles.contactText}>
              You may also lodge a complaint with the Information Regulator of South Africa:<br />
              <strong className={styles.contactAccent}>inforeg.org.za</strong>
              {' '}| complaints.IR@justice.gov.za
            </p>
          </div>
        </FadeIn>

      </div>

      <Footer />
    </div>
  )
}
