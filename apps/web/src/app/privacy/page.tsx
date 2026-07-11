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
  'Proof of payment uploads (for order verification)',
]

const sellerData = [
  'Full name, email address and phone number',
  'Brand name and personal story (bio)',
  'Location — province, district and city',
  'Proof photos submitted during verification',
  'Bank account details (shared with buyers for direct EFT payment)',
  'Product listings, descriptions and images',
]

const purposes = [
  ['To operate your account',   'Creating and managing your buyer or seller account on Vuna.'],
  ['To connect buyer and seller','Sharing a seller’s banking details with a buyer at checkout so the buyer can pay the seller directly via EFT. Vuna does not process, hold or route any payment funds.'],
  ['To verify payment',          'Storing the buyer’s proof-of-payment upload so the seller can confirm they received the EFT before fulfilling the order.'],
  ['To arrange delivery',        'Sharing your delivery address with the seller so they can arrange delivery with you directly. Vuna does not manage, fulfil or insure delivery — the method, cost and timeframe are agreed between buyer and seller after payment is verified.'],
  ['To verify sellers',          'Reviewing seller applications to maintain the authenticity of the platform.'],
  ['To invoice commission',      'Recording seller sales so Vuna can calculate and invoice its monthly 5% platform commission from the seller.'],
  ['To communicate with you',    'Sending order confirmations, updates, and platform notifications.'],
  ['For platform security',      'Detecting and preventing fraud, abuse and unauthorised access.'],
]

const partners = [
  ['Cloudinary',  'Image storage — seller product photos, verification proof, and buyer proof-of-payment uploads.'],
]

const security = [
  'Passwords are never stored in plain text — they are encrypted before saving',
  'All data sent between you and Vuna is encrypted in transit',
  'Database access is restricted and monitored',
  'Seller banking details are only revealed to buyers who have placed a real order with that seller — never public',
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
        <p className={styles.heroSub}>Last updated: 8 June 2026</p>
      </div>

      <div className={styles.body}>

        <FadeIn>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>1. Who We Are</h2>
            <p className={styles.bodyText}>
              Vuna is a local marketplace operated by <strong>Umzila-AfriRoute</strong>,
              a technology and communications company based in Jolivet, Highflats, KwaZulu-Natal.
              We connect verified local makers with buyers in their neighbourhoods and beyond.
            </p>
            <p className={styles.bodyText}>
              For privacy enquiries contact us at <strong>privacy@vunamarketplace.co.za</strong>
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
            <p className={styles.bodyText}>
              <strong>Important — Vuna is not a payment processor.</strong> We do not accept,
              hold, route or refund money on behalf of buyers or sellers. All money moves directly
              between buyer and seller via EFT. What we collect is used only for the following purposes:
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
            <h2 className={styles.sectionHeading}>4. Who We Share It With</h2>
            <p className={styles.bodyText}>
              We do not sell your personal information. We share only what is strictly necessary
              with these service providers, and only for the purposes of running the platform:
            </p>
            {partners.map(([partner, purpose]) => (
              <div key={partner} className={styles.partnerRow}>
                <div className={styles.partnerKey}>{partner}</div>
                <div className={styles.partnerVal}>{purpose}</div>
              </div>
            ))}
            <p className={styles.bodyTextMt}>
              Seller banking details are shared with a buyer <strong>only</strong> after that buyer has
              placed an order with that seller. Vuna does not use, store or display those details for
              any other purpose.
            </p>
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
              To exercise any of these rights, email <strong>privacy@vunamarketplace.co.za</strong>. We will respond within 30 days.
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
              contact us immediately at <strong>privacy@vunamarketplace.co.za</strong>.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.contactCard}>
            <div className={styles.contactEyebrow}>Contact</div>
            <h2 className={styles.contactTitle}>Questions About Your Privacy?</h2>
            <p className={styles.contactText}>
              Email us at{' '}
              <strong className={styles.contactHighlight}>privacy@vunamarketplace.co.za</strong>
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
