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
  'You must fulfil orders within the agreed timeframe once payment is verified',
  'You must provide valid banking details so buyers can pay you directly via EFT',
  'You must verify each buyer’s proof of payment before fulfilling an order',
  'You must arrange delivery directly with the buyer (method, cost, timeframe) — Vuna does not manage delivery',
  'You must not list counterfeit, copied or resold products',
  'You are responsible for settling Vuna’s monthly commission invoice within 30 days',
]

const commissionTerms = [
  'Vuna charges a platform commission of 5% on each completed sale',
  'Vuna does NOT process or hold buyer payments — money moves directly between buyer and seller by EFT',
  'The seller keeps 100% of each sale at the point of sale; Vuna invoices the 5% commission separately',
  'Commission invoices are generated monthly, covering the seller’s completed sales in that period',
  'Sellers pay commission invoices to Vuna via EFT within 30 days of invoice date',
  'Non-payment of a commission invoice may result in suspension of the seller’s account until settled',
]

const buyerTerms = [
  'All purchases are final unless the product received materially differs from its description',
  'Buyers are responsible for providing accurate delivery addresses',
  'Delivery is arranged directly between buyer and seller — Vuna does not manage or fulfil delivery',
  'Delivery timeframes, method and cost are agreed directly with the seller after payment is verified',
  'Buyers pay sellers directly via EFT using the banking details displayed at checkout',
  'Buyers must upload accurate proof of payment for each order',
  'Vuna facilitates the introduction and holds sellers to platform standards, but the contract of sale is directly between buyer and seller',
  'Buyers must contact Vuna support within 7 days of delivery for any disputes',
]

const prohibited = [
  'Listing products you did not make, grow or produce personally',
  'Misrepresenting your identity, location or the nature of your products',
  'Using Vuna for money laundering or any illegal financial activity',
  'Harassment, abuse or threatening behaviour toward other users',
  'Creating fake reviews or manipulating the ratings system',
  'Accepting orders from Vuna buyers and then completing the sale off-platform to avoid Vuna commission',
  'Falsifying, forging or reusing proof-of-payment documents',
  'Misrepresenting an animal’s breed, health records, identification marks or legal status, or listing animals you are not entitled to sell',
  'Requesting or accepting payment for a harvest pre-order before marking the harvest ready on the platform',
  'Listing products that infringe on intellectual property rights',
  'Using automated bots or scrapers on the platform',
]

const eligibility = [
  'You must be 18 years or older to use Vuna',
  'You must be a resident of South Africa or operating a registered South African business',
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
          Last updated: 12 July 2026 — Governed by the laws of the Republic of South Africa
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
              { Icon: Globe,      text: 'Locally Owned — Every seller must be a local resident (South Africa)' },
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
            <div className={styles.subHeading}>3.2 Commission and Payments</div>
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
            <h2 className={styles.sectionHeading}>5. Payments — Vuna Is Not A Payment Processor</h2>
            <p className={styles.bodyText}>
              Vuna does <strong>not</strong> accept, hold, route or refund money on behalf of buyers or sellers.
              When a buyer places an order, Vuna displays the seller’s banking details together with the order
              reference. The buyer then makes an EFT payment directly to the seller’s bank account and uploads
              proof of that payment to the platform.
            </p>
            <p className={styles.bodyText}>
              The seller verifies the deposit in their own bank statement and confirms the order in the Vuna
              seller dashboard. Vuna facilitates the introduction, sets platform standards, and holds parties
              accountable to these Terms — but the transaction of money and the resulting contract of sale
              are strictly between buyer and seller.
            </p>
            <p className={styles.bodyText}>
              Vuna does not store any card, bank card, or online-banking credentials of any user.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>6. Delivery — Arranged Directly Between Buyer And Seller</h2>
            <p className={styles.bodyText}>
              Vuna does <strong>not</strong> manage, fulfil, insure or ship any product. Once the seller has
              verified the buyer&apos;s proof of payment, the seller and buyer arrange delivery directly with
              one another — including the method (courier, hand delivery, collection), the cost, and the
              expected timeframe.
            </p>
            <p className={styles.bodyText}>
              Vuna is not liable for lost, damaged, delayed or non-delivered parcels. Delivery costs, if any,
              are agreed between buyer and seller and are separate from the product price shown on the platform.
              Sellers are expected to communicate delivery details promptly and honour the arrangement made
              with the buyer.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>7. Livestock Sales</h2>
            <p className={styles.bodyText}>
              Live animals may be listed under the Livestock category, sold directly from the shop,
              or entered into Vuna market and auction events — where a market appearance serves as a
              <strong> viewing day</strong> and bidding takes place at the subsequent auction. In all
              cases Vuna acts as an <strong>introducer only</strong>: Vuna is not an auctioneer of
              record, livestock agent or dealer, and is not a party to the sale of any animal.
            </p>
            <div className={styles.subHeading}>7.1 Seller Warranties</div>
            {[
              'Sellers warrant compliance with the Animal Identification Act 6 of 2002, including registered brand or tattoo marks where required by law',
              'All listed animal details — species, breed, purpose, sex, age, weight, vaccination and dip records, breeding history — must be accurate and honest',
              'Sellers may not list animals they are not legally entitled to sell, or animals whose movement is prohibited under animal disease control regulations (including controlled or restricted areas)',
              'Sellers must make the animal reasonably available for inspection on viewing days and before collection',
            ].map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
            <div className={styles.subHeading}>7.2 Movement and Collection</div>
            <p className={styles.bodyText}>
              Stock movement documents, removal certificates and any permits required by South African
              law are the joint responsibility of the buyer and the seller. Collection and transport of
              the animal are arranged directly between the parties. The documented sale record on Vuna
              serves both parties as a provenance trail, but does not replace any legally required
              documentation.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>8. Harvest Pre-Orders</h2>
            <p className={styles.bodyText}>
              Farmers may list a future harvest for pre-order. On Vuna,{' '}
              <strong>money moves on a harvest, never on a promise</strong>:
            </p>
            {[
              'A harvest reservation is NOT a purchase and creates NO payment obligation at the time of reservation',
              'No money is due, requested or paid until the farmer marks the harvest as ready on the platform',
              'When the harvest is marked ready, the reservation becomes a normal order and the buyer pays the seller directly via EFT with proof of payment, as with any Vuna order',
              'If the crop fails, the farmer must mark it as failed on the platform — all reservations cancel automatically and no party owes anything',
              'Planted dates, expected harvest dates and estimated yields are good-faith estimates by the farmer, not guarantees',
              'Buyers should complete payment within 7 days of the harvest-ready notice; after that the farmer may release the reserved share to other buyers',
              'Requesting or accepting payment for a pre-order before the harvest is marked ready on the platform is prohibited conduct',
            ].map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>9. Dispute Mediation</h2>
            <p className={styles.bodyText}>
              While Vuna is not a party to the sale contract, we act as an impartial mediator for disputes
              arising from transactions on the platform. Buyers or sellers who wish to raise a dispute must
              contact <strong>support@vunamarketplace.co.za</strong> within 7 days of the incident and provide
              all supporting evidence (order details, proof of payment, communications, photos of goods
              received). Vuna will review both sides and may recommend a resolution. Vuna does not have the
              legal authority to compel a refund but may suspend or terminate accounts found to have acted in
              bad faith.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>10. Prohibited Conduct</h2>
            <p className={styles.bodyText}>The following are strictly prohibited on Vuna:</p>
            {prohibited.map(item => (
              <div key={item} className={styles.listItem}>• {item}</div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>11. Intellectual Property</h2>
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
            <h2 className={styles.sectionHeading}>12. Limitation of Liability</h2>
            <p className={styles.bodyText}>
              Vuna is a marketplace platform that facilitates the introduction of buyers and sellers and
              records the commission owing on each completed sale. Vuna is not a party to any sale contract.
              We are not responsible for the quality of individual products, delays caused by third-party
              delivery partners, non-delivery, non-payment, or losses arising from transactions between users.
              Our maximum liability to any user is limited to the value of the platform commission Vuna
              received on the transaction in dispute.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>13. Account Termination</h2>
            <p className={styles.bodyText}>
              Vuna reserves the right to suspend or permanently terminate any account that violates
              these Terms of Service, our 3 Sacred Rules, or applicable South African law. Users may
              also close their own accounts by contacting <strong>support@vunamarketplace.co.za</strong>.
              Sellers with outstanding commission invoices at the time of closure remain liable for
              settlement of those invoices.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={60}>
          <div className={styles.section}>
            <h2 className={styles.sectionHeading}>14. Governing Law</h2>
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
              <strong className={styles.contactHighlight}>legal@vunamarketplace.co.za</strong>
            </p>
            <p className={styles.contactText}>
              Umzila-AfriRoute — Jolivet, Highflats, KwaZulu-Natal, South Africa
            </p>
          </div>
        </FadeIn>

      </div>

      <Footer />
    </div>
  )
}
