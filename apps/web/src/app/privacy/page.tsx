import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/ui/FadeIn'
import styles from '../legal.module.css'

export const metadata = {
  title: 'Privacy Policy — Vuna',
  description: 'How Vuna collects, uses and protects your personal information.',
}

const buyerData = [
  'Full name and email address',
  'Phone number (optional — for delivery updates)',
  'Location — province, district and city (optional)',
  'Delivery address (for order fulfilment)',
  'Order and purchase history',
]

const sellerData = [
  'Full name, email address and phone number',
  'Brand name and personal story (bio)',
  'Location — province, district and city',
  'Proof photos submitted during verification',
  'Bank account details (for payouts)',
  'Product listings, descriptions and images',
]

const purposes = [
  ['To operate your account',  'Creating and managing your buyer or seller account on Vuna'],
  ['To process orders',        'Facilitating purchases between buyers and sellers via PayFast'],
  ['To arrange delivery',      'Sharing your delivery address with the seller for fulfilment. Vuna does not manage delivery — logistics are handled between buyer and seller'],
  ['To pay sellers',           'Processing payouts to verified sellers using their banking details'],
  ['To verify sellers',        'Reviewing seller applications to maintain the authenticity of the platform'],
  ['To communicate with you',  'Sending order confirmations, updates, and platform notifications'],
  ['For platform security',    'Detecting and preventing fraud, abuse and unauthorised access'],
]

const partners = [
  ['PayFast',    'Payment processing — buyer payment details for secure transaction completion'],
  ['Cloudinary', 'Image storage — seller product photos and profile images'],
]

const security = [
  'Passwords are never stored in plain text — they are encrypted before saving',
  'All data sent between you and Vuna is encrypted in transit',
  'Database access is restricted and monitored',
  'Banking details are stored with encryption and never displayed in full',
  'Sessions expire automatically for your protection',
]

const rights = [
  'Access the personal information we hold about you',
  'Request correction of incorrect or outdated information',
  'Request deletion of your information (subject to legal obligations)',
  'Object to your information being used for marketing',
  'Lodge a complaint with the Information Regulator of South Africa',
]

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.heroEyebrow}>Legal</div>
        <h1 className={styles.heroTitle}>Privacy Policy</h1>
        <p className={styles.heroSub}>Last updated: 1 June 2026</p>
      </div>

      <div className={styles.body}>

        <FadeIn>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>1. Who We Are</h2>
            <p className={styles.bodyText}>
              Vuna is an African marketplace operated by <strong>Umzila-AfriRoute</strong>,
              a technology and communication company based in Durban, KwaZulu-Natal.
              We connect verified African creators with buyers across Africa and beyond.
            </p>
            <p className={styles.bodyText}>
              For privacy enquiries contact us at <strong>privacy@vuna.co.za</strong>
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>2. What We Collect</h2>
            <p className={styles.bodyText}>We collect only what is necessary to run the platform:</p>
            <div className={styles.categoryLabel}>Buyers:</div>
            {buyerData.map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
            <div className={styles.categoryLabel}>Sellers:</div>
            {sellerData.map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>3. Why We Collect It</h2>
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
            <h2 className={styles.sectionHeading}>4. Who We Share It With</h2>
            <p className={styles.bodyText}>
              We do not sell your personal information. We share only what is necessary with these service providers:
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
            <h2 className={styles.sectionHeading}>5. Your Rights</h2>
            <p className={styles.bodyText}>You have the right to:</p>
            {rights.map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
            <p className={styles.bodyTextMt}>
              To exercise any of these rights, email <strong>privacy@vuna.co.za</strong>. We will respond within 30 days.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>6. How We Protect Your Information</h2>
            {security.map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>7. Cookies</h2>
            <p className={styles.bodyText}>
              Vuna uses essential cookies only — to keep you logged in and remember your session.
              We do not use tracking or advertising cookies. Disabling cookies in your browser may affect platform functionality.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>8. Under 18</h2>
            <p className={styles.bodyText}>
              Vuna is not intended for persons under the age of 18. If you believe a minor has registered,
              contact us immediately at <strong>privacy@vuna.co.za</strong>.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.contactCard}>
            <div className={styles.contactEyebrow}>Contact</div>
            <h2 className={styles.contactTitle}>Questions About Your Privacy?</h2>
            <p className={styles.contactText}>
              Email us at{' '}
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
