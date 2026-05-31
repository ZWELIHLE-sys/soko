import { Globe, HandHeart, BadgeCheck } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/ui/FadeIn'
import styles from '../legal.module.css'

export const metadata = {
  title: 'Terms of Service — Vuna',
  description: 'Terms and conditions for buyers and sellers on the Vuna marketplace.',
}

const sellerResponsibilities = [
  'All products listed must be made, grown or produced personally by you or your business',
  'Product descriptions and photos must be accurate and honest',
  'You are responsible for the quality of your products',
  'You must fulfil orders within the agreed timeframe',
  'You must provide valid banking details for payouts',
  'You must not list counterfeit, copied or resold products',
]

const commissionTerms = [
  'Vuna charges a commission of 8–12% on each completed sale',
  'Seller payouts are processed weekly via EFT to your registered bank account',
  'Vuna deducts commission before processing payout',
  'PayFast transaction fees are separate and will be disclosed at checkout',
]

const buyerTerms = [
  'All purchases are final unless the product received materially differs from its description',
  'Buyers are responsible for providing accurate delivery addresses',
  'Delivery timeframes are estimates and may vary based on delivery method selected',
  'Vuna facilitates the transaction but the contract of sale is between buyer and seller',
  'Buyers must contact Vuna support within 7 days of delivery for any disputes',
]

const prohibited = [
  'Listing products you did not make, grow or produce personally',
  'Misrepresenting your identity, location or the nature of your products',
  'Using Vuna for money laundering or any illegal financial activity',
  'Harassment, abuse or threatening behaviour toward other users',
  'Creating fake reviews or manipulating the ratings system',
  "Attempting to bypass Vuna's payment system (side deals)",
  'Listing products that infringe on intellectual property rights',
  'Using automated bots or scrapers on the platform',
]

const eligibility = [
  'You must be 18 years or older to use Vuna',
  'You must be a resident of or operating from an African country',
  'You must provide accurate and complete information when registering',
  'One person may not operate multiple accounts',
]

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.heroEyebrow}>Legal</div>
        <h1 className={styles.heroTitle}>Terms of Service</h1>
        <p className={styles.heroSub}>
          Last updated: 1 June 2026 — Governed by the laws of the Republic of South Africa
        </p>
      </div>

      <div className={styles.body}>

        <FadeIn>
          <p className={styles.bodyText}>
            Welcome to Vuna, operated by <strong>Umzila-AfriRoute</strong>. By accessing
            or using the Vuna platform at vunamarketplace.co.za, you agree to be bound by these Terms of Service.
            Please read them carefully.
          </p>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.sacredBox}>
            <div className={styles.sacredEyebrow}>The Foundation</div>
            <div className={styles.sacredTitle}>
              Vuna&apos;s 3 Sacred Rules — Non-Negotiable For All Sellers
            </div>
            {[
              { Icon: Globe,      text: 'African Owned — Every seller must be African' },
              { Icon: HandHeart,  text: 'Maker Made — Every product must be made, grown or built by the seller personally' },
              { Icon: BadgeCheck, text: 'Vuna Verified — Every seller must complete our verification process before listing' },
            ].map(({ Icon, text }) => (
              <div key={text} className={styles.sacredRule}>
                <Icon size={14} className={styles.sacredRuleIcon} />
                {text}
              </div>
            ))}
            <div className={styles.sacredNote}>
              Violation of any of these rules will result in immediate suspension from the platform
              without refund of any fees paid.
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>1. Acceptance of Terms</h2>
            <p className={styles.bodyText}>
              By creating an account, listing a product, or making a purchase on Vuna, you confirm
              that you have read, understood and agree to these Terms of Service and our Privacy Policy.
              If you do not agree, you may not use the platform.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>2. Eligibility</h2>
            {eligibility.map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>3. Seller Terms</h2>
            <div className={styles.subHeading}>3.1 Seller Responsibilities</div>
            {sellerResponsibilities.map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
            <div className={styles.subHeading}>3.2 Commission and Payouts</div>
            {commissionTerms.map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
            <div className={styles.subHeading}>3.3 Seller Verification</div>
            <p className={styles.bodyText}>
              All sellers must complete the Vuna Verified process before their listings go live.
              Vuna reserves the right to reject or suspend any seller application that does not meet
              our authenticity requirements. Verification is free and typically completed within 48 hours.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>4. Buyer Terms</h2>
            {buyerTerms.map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>5. Payments</h2>
            <p className={styles.bodyText}>
              All payments are processed securely through PayFast, a South African payment gateway.
              Vuna does not store credit card or banking details. By making a purchase you agree to
              PayFast&apos;s terms and conditions available at payfast.co.za.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>6. Prohibited Conduct</h2>
            <p className={styles.bodyText}>The following are strictly prohibited on Vuna:</p>
            {prohibited.map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>7. Intellectual Property</h2>
            <p className={styles.bodyText}>
              Sellers retain all intellectual property rights to their original creations listed on Vuna.
              By listing on Vuna, sellers grant Umzila-AfriRoute a non-exclusive licence to display,
              promote and market their products on the Vuna platform and associated social media channels.
            </p>
            <p className={styles.bodyText}>
              The Vuna brand, logo, platform design and code are the property of Umzila-AfriRoute
              and may not be reproduced without written permission.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>8. Limitation of Liability</h2>
            <p className={styles.bodyText}>
              Vuna is a marketplace platform that facilitates transactions between buyers and sellers.
              We are not responsible for the quality of individual products, delays caused by third-party
              delivery partners, or losses arising from transactions between users. Our maximum liability
              is limited to the value of the transaction in dispute.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>9. Account Termination</h2>
            <p className={styles.bodyText}>
              Vuna reserves the right to suspend or permanently terminate any account that violates
              these Terms of Service, our 3 Sacred Rules, or applicable South African law. Users may
              also close their own accounts by contacting support@vuna.co.za.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>10. Governing Law</h2>
            <p className={styles.bodyText}>
              These Terms of Service are governed by the laws of the Republic of South Africa.
              Any disputes shall be subject to the jurisdiction of the South African courts.
              These terms are also subject to the Consumer Protection Act 68 of 2008, the Electronic
              Communications and Transactions Act 25 of 2002, and POPIA.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.contactCard}>
            <h2 className={styles.contactTitle}>Questions About These Terms?</h2>
            <p className={styles.contactText}>
              Contact us at{' '}
              <strong className={styles.contactHighlight}>legal@vuna.co.za</strong>
            </p>
            <p className={styles.contactText}>
              Umzila-AfriRoute — KwaZulu-Natal, South Africa
            </p>
          </div>
        </FadeIn>

      </div>

      <Footer />
    </div>
  )
}
