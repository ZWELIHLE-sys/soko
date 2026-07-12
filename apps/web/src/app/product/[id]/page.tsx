'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight, ArrowLeft, MapPin, BadgeCheck,
  ShoppingCart, CheckCircle, AlertTriangle, PackageX, Handshake, Globe,
  Sparkles, Store, Gavel, Star, PawPrint, Sprout, CalendarDays
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/ui/FadeIn'
import { SPECIES, PURPOSES, SEXES } from '@/lib/livestock'
import styles from './product.module.css'

interface Review {
  id: string
  rating: number
  comment: string | null
  user: { name: string; avatar: string | null }
}

interface PieceJourney {
  id: string
  title: string
  currentStage: 'MARKET' | 'AUCTION' | 'FEATURED' | 'SHOP' | 'SOLD' | 'RETIRED'
  createdAt: string
  marketListings: { id: string; market: { id: string; title: string; startDate: string; endDate: string } }[]
  auctions: {
    id: string
    currentBid: number | null
    startPrice: number
    auctionEvent: { id: string; title: string; biddingEndDate: string } | null
    _count: { bids: number }
  }[]
}

interface LivestockPapers {
  species: string
  breed: string
  purpose: string
  sex: string | null
  approxAgeMonths: number | null
  weightKg: number | null
  colour: string | null
  brandMark: string | null
  vaccinations: string | null
  breedingHistory: string | null
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  images: string[]
  livestockDetail: LivestockPapers | null
  isHarvestPreOrder: boolean
  plantedAt: string | null
  expectedHarvestDate: string | null
  estimatedYield: number | null
  yieldUnit: string | null
  harvestStatus: string | null
  reservedQty: number
  seller: {
    id: string
    brandName: string
    name: string
    bio: string | null
    avatar: string | null
    isVerified: boolean
    location: { name: string }
    category: { name: string; icon: string | null }
    _count: { products: number }
  }
  category: { name: string; icon: string | null; slug: string }
  location: { name: string }
  reviews: Review[]
  piece: PieceJourney | null
}

interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  sellerName: string
  locationName: string
  categoryIcon: string | null
  quantity: number
  sellerId: string
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session } = useSession()

  const [product, setProduct]             = useState<Product | null>(null)
  const [loading, setLoading]             = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity]           = useState(1)
  const [addingToCart, setAddingToCart]   = useState(false)
  const [cartMessage, setCartMessage]     = useState('')

  // Harvest reservation
  const [reserveAddress, setReserveAddress] = useState('')
  const [reserving, setReserving]           = useState(false)
  const [reserveError, setReserveError]     = useState('')
  const [reservedOk, setReservedOk]         = useState(false)

  useEffect(() => {
    if (!params.id) return
    let cancelled = false

    fetch(`/api/products/${params.id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data: Product) => {
        if (!cancelled) {
          setProduct(data)
          setLoading(false)
        }
      })
      .catch(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [params.id])

  const handleAddToCart = () => {
    if (!session) { router.push('/login'); return }
    if (!product) return

    setAddingToCart(true)

    const cart: CartItem[] = JSON.parse(localStorage.getItem('vuna_cart') || '[]')
    const existingIndex = cart.findIndex(item => item.productId === product.id)

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity
  } else {
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '',
      sellerName: product.seller.brandName,
      locationName: product.location.name,
      categoryIcon: product.category.icon,
      quantity,
      sellerId: product.seller.id,
    })
  }

  localStorage.setItem('vuna_cart', JSON.stringify(cart))
  window.dispatchEvent(new Event('vuna_cart_updated'))  // ← ADD THIS LINE
  setAddingToCart(false)
  setCartMessage('Added to cart!')
  setTimeout(() => setCartMessage(''), 3000)
}

  const handleReserve = async () => {
    if (!session) { router.push('/login'); return }
    if (!product) return
    setReserving(true)
    setReserveError('')
    const res = await fetch('/api/orders/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, quantity, deliveryAddress: reserveAddress }),
    })
    setReserving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setReserveError(data.error ?? 'Could not reserve. Try again.')
      return
    }
    setReservedOk(true)
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.loadingWrap}>
          <span className={styles.loadingText}>Loading product...</span>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.notFound}>
          <PackageX size={48} className={styles.notFoundIcon} />
          <h2 className={styles.notFoundTitle}>Product not found</h2>
          <Link href="/shop" className={styles.notFoundLink}>
            <ArrowLeft size={14} /> Back to shop
          </Link>
        </div>
      </div>
    )
  }

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0

  const papers = product.livestockDetail
  const isGrowingPreOrder = product.isHarvestPreOrder && product.harvestStatus === 'GROWING'
  const harvestFailed     = product.isHarvestPreOrder && product.harvestStatus === 'FAILED'
  const remainingYield    = Math.max(0, (product.estimatedYield ?? 0) - product.reservedQty)

  const speciesLabel = (v: string) => SPECIES.find(s => s.value === v)?.label ?? v
  const purposeLabel = (v: string) => PURPOSES.find(p => p.value === v)?.label ?? v
  const sexLabel     = (v: string) => SEXES.find(s => s.value === v)?.label ?? v
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.inner}>

        <nav className={styles.breadcrumb}>
          <Link href="/" className={styles.breadLink}>Home</Link>
          <ChevronRight size={13} />
          <Link href="/shop" className={styles.breadLink}>Shop</Link>
          <ChevronRight size={13} />
          <Link href={`/shop?category=${product.category.slug}`} className={styles.breadLink}>
            {product.category.name}
          </Link>
          <ChevronRight size={13} />
          <span className={styles.breadCurrent}>{product.name}</span>
        </nav>

        <FadeIn>
        <div className={styles.productGrid}>

          {/* Images */}
          <div>
            <div className={styles.mainImage}>
              {product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className={styles.mainImg}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                product.category.icon
              )}
              {product.seller.isVerified && (
                <div className={styles.verifiedBadge}>
                  <BadgeCheck size={13} />
                  Vuna Verified
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className={styles.thumbRow}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${selectedImage === i ? styles.thumbActive : ''}`}
                    onClick={() => setSelectedImage(i)}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill className={styles.thumbImg} sizes="72px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className={styles.catTag}>
              {product.category.icon} {product.category.name}
            </div>

            <h1 className={styles.productName}>{product.name}</h1>

            {product.reviews.length > 0 && (
              <div className={styles.rating}>
                <span className={styles.ratingStars}>
                  {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
                </span>
                <span className={styles.ratingText}>
                  {avgRating.toFixed(1)} ({product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            <div className={styles.price}>R{product.price.toFixed(2)}</div>

            <div className={styles.location}>
              <MapPin size={13} />
              Made in {product.location.name}
            </div>

            <p className={styles.description}>{product.description}</p>

            {/* Animal papers — livestock listings carry what real buyers ask first */}
            {papers && (
              <div className={styles.papersCard}>
                <div className={styles.papersTitle}><PawPrint size={13} /> Animal Details</div>
                <div className={styles.papersGrid}>
                  <div className={styles.papersRow}><span>Species</span><strong>{speciesLabel(papers.species)}</strong></div>
                  <div className={styles.papersRow}><span>Breed</span><strong>{papers.breed}</strong></div>
                  <div className={styles.papersRow}><span>Purpose</span><strong>{purposeLabel(papers.purpose)}</strong></div>
                  {papers.sex && <div className={styles.papersRow}><span>Sex</span><strong>{sexLabel(papers.sex)}</strong></div>}
                  {papers.approxAgeMonths != null && (
                    <div className={styles.papersRow}><span>Approx. age</span><strong>{papers.approxAgeMonths} months</strong></div>
                  )}
                  {papers.weightKg != null && (
                    <div className={styles.papersRow}><span>Weight</span><strong>{papers.weightKg} kg</strong></div>
                  )}
                  {papers.colour && <div className={styles.papersRow}><span>Colour</span><strong>{papers.colour}</strong></div>}
                  {papers.brandMark && <div className={styles.papersRow}><span>Brand mark</span><strong>{papers.brandMark}</strong></div>}
                </div>
                {papers.vaccinations && (
                  <div className={styles.papersNotes}>
                    <span>Vaccinations & dip records</span>
                    <p>{papers.vaccinations}</p>
                  </div>
                )}
                {papers.breedingHistory && (
                  <div className={styles.papersNotes}>
                    <span>Breeding history</span>
                    <p>{papers.breedingHistory}</p>
                  </div>
                )}
                <div className={styles.papersFootnote}>
                  Movement documents and collection are arranged directly between buyer and seller.
                </div>
              </div>
            )}

            {harvestFailed ? (
              <div className={styles.harvestFailed}>
                <AlertTriangle size={15} />
                This harvest did not come in. All reservations were cancelled — nobody paid a cent.
              </div>
            ) : isGrowingPreOrder ? (
              /* ── Future harvest: reserve now, pay when it comes in ── */
              <div className={styles.harvestCard}>
                <div className={styles.harvestTitle}><Sprout size={14} /> Future Harvest — Reserve Your Share</div>
                <div className={styles.harvestMeta}>
                  {product.plantedAt && (
                    <span><CalendarDays size={12} /> Planted {fmtDate(product.plantedAt)}</span>
                  )}
                  {product.expectedHarvestDate && (
                    <span><CalendarDays size={12} /> Expected {fmtDate(product.expectedHarvestDate)}</span>
                  )}
                </div>
                <div className={`${styles.stockBadge} ${remainingYield > 5 ? styles.stockGood : styles.stockLow}`}>
                  {remainingYield > 0
                    ? <><CheckCircle size={12} /> {remainingYield} of {product.estimatedYield} {product.yieldUnit} still open</>
                    : <><AlertTriangle size={12} /> Fully reserved</>
                  }
                </div>

                {reservedOk ? (
                  <div className={styles.cartSuccess}>
                    <CheckCircle size={15} />
                    Reserved! You&apos;ll pay only when the farmer marks this harvest ready.{' '}
                    <Link href="/buyer/orders" className={styles.harvestOrdersLink}>View my orders →</Link>
                  </div>
                ) : remainingYield > 0 ? (
                  <>
                    <div className={styles.qtyLabel}>Quantity ({product.yieldUnit})</div>
                    <div className={styles.qtyRow}>
                      <button className={styles.qtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                      <span className={styles.qtyNum}>{quantity}</span>
                      <button className={styles.qtyBtn} onClick={() => setQuantity(q => Math.min(remainingYield, q + 1))}>+</button>
                    </div>
                    <textarea
                      className={styles.harvestAddress}
                      rows={2}
                      placeholder="Delivery address — where should your share go?"
                      value={reserveAddress}
                      onChange={e => setReserveAddress(e.target.value)}
                    />
                    {reserveError && (
                      <div className={styles.harvestError}><AlertTriangle size={13} /> {reserveError}</div>
                    )}
                    <button
                      className={styles.addToCartBtn}
                      onClick={handleReserve}
                      disabled={reserving || !reserveAddress.trim()}
                    >
                      <Sprout size={18} />
                      {reserving ? 'Reserving...' : `Reserve ${quantity} ${product.yieldUnit}`}
                    </button>
                    <div className={styles.harvestPromise}>
                      No payment now. When the crop comes in, the farmer marks it harvest-ready and
                      you pay the normal way. If the crop fails, your reservation cancels — you owe nothing.
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <>
                {product.isHarvestPreOrder && product.harvestStatus === 'HARVEST_READY' && (
                  <div className={styles.harvestReady}>
                    <Sprout size={13} /> The harvest is in — fresh and ready now
                  </div>
                )}
                <div className={`${styles.stockBadge} ${product.stock > 5 ? styles.stockGood : styles.stockLow}`}>
                  {product.stock > 5
                    ? <><CheckCircle size={12} /> {product.stock} in stock</>
                    : <><AlertTriangle size={12} /> Only {product.stock} left</>
                  }
                </div>

                <div className={styles.qtyLabel}>Quantity</div>
                <div className={styles.qtyRow}>
                  <button className={styles.qtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                  <span className={styles.qtyNum}>{quantity}</span>
                  <button className={styles.qtyBtn} onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>+</button>
                </div>

                {cartMessage ? (
                  <div className={styles.cartSuccess}>
                    <CheckCircle size={15} />
                    {cartMessage}
                  </div>
                ) : (
                  <button
                    className={styles.addToCartBtn}
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.stock === 0}
                  >
                    <ShoppingCart size={18} />
                    {product.stock === 0 ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>
                )}
              </>
            )}

            <Link href="/shop" className={styles.continueBtn}>
              <ArrowLeft size={14} />
              Continue Shopping
            </Link>

            <div className={styles.promise}>
              <div className={styles.promiseLabel}>The Vuna Promise</div>
              <div className={styles.promiseItem}><Handshake size={13} /> Made by a real local maker</div>
              <div className={styles.promiseItem}><BadgeCheck size={13} /> Seller verified by Vuna team</div>
              <div className={styles.promiseItem}><Globe size={13} /> Supporting local livelihoods</div>
            </div>
          </div>
        </div>
        </FadeIn>

        {/* Piece Journey — only shown for Track B pieces */}
        {product.piece && (
          <FadeIn delay={60}>
          <div className={`${styles.card} ${styles.journeyCard}`}>
            <div className={styles.journeyEyebrow}>
              <Sparkles size={12} /> A Vuna Journey Piece
            </div>
            <h2 className={styles.cardTitle}>This Piece&apos;s Story</h2>
            <p className={styles.journeyIntro}>
              This isn&apos;t just a shop listing — it&apos;s a piece that travelled through the Vuna journey
              before landing here.
            </p>
            <div className={styles.journeyTimeline}>
              {product.piece.marketListings.map(ml => (
                <div key={ml.id} className={styles.journeyStep}>
                  <div className={styles.journeyDot}><Store size={11} /></div>
                  <div className={styles.journeyStepBody}>
                    <div className={styles.journeyStepTitle}>Debuted at {ml.market.title}</div>
                    <div className={styles.journeyStepMeta}>
                      {new Date(ml.market.startDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
              {product.piece.auctions.map(a => (
                <div key={a.id} className={styles.journeyStep}>
                  <div className={styles.journeyDot}><Gavel size={11} /></div>
                  <div className={styles.journeyStepBody}>
                    <div className={styles.journeyStepTitle}>
                      Bid at {a.auctionEvent?.title ?? 'auction'}
                    </div>
                    <div className={styles.journeyStepMeta}>
                      {a._count.bids} bid{a._count.bids !== 1 ? 's' : ''}
                      {a.currentBid && ` · top bid R${a.currentBid.toFixed(2)}`}
                    </div>
                  </div>
                </div>
              ))}
              {product.piece.currentStage === 'FEATURED' ? (
                <div className={styles.journeyStep}>
                  <div className={`${styles.journeyDot} ${styles.journeyDotCurrent}`}><Star size={11} /></div>
                  <div className={styles.journeyStepBody}>
                    <div className={styles.journeyStepTitle}>Featured on the Vuna homepage</div>
                    <div className={styles.journeyStepMeta}>
                      Taking its victory lap right now — you can buy it today before it settles into the shop.
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.journeyStep}>
                  <div className={`${styles.journeyDot} ${styles.journeyDotCurrent}`}><CheckCircle size={11} /></div>
                  <div className={styles.journeyStepBody}>
                    <div className={styles.journeyStepTitle}>Now available in shop</div>
                    <div className={styles.journeyStepMeta}>You can buy it directly today.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          </FadeIn>
        )}

        {/* Seller */}
        <FadeIn delay={80}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>About The Seller</h2>
          <div className={styles.sellerRow}>
            <div className={styles.avatar}>{product.seller.brandName.charAt(0)}</div>
            <div className={styles.sellerMeta}>
              <div className={styles.sellerNameRow}>
                <span className={styles.sellerName}>{product.seller.brandName}</span>
                {product.seller.isVerified && (
                  <span className={styles.sellerVerified}>
                    <BadgeCheck size={11} /> Vuna Verified
                  </span>
                )}
              </div>
              <div className={styles.sellerInfo}>
                <MapPin size={12} />
                {product.seller.location.name} &middot; {product.seller._count.products} product{product.seller._count.products !== 1 ? 's' : ''} on Vuna
              </div>
              {product.seller.bio && (
                <p className={styles.sellerBio}>{product.seller.bio}</p>
              )}
            </div>
          </div>
        </div>
        </FadeIn>

        {/* Reviews */}
        <FadeIn delay={80}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            Reviews {product.reviews.length > 0 && `(${product.reviews.length})`}
          </h2>
          {product.reviews.length === 0 ? (
            <div className={styles.reviewEmpty}>
              No reviews yet — be the first to buy and review this product.
            </div>
          ) : (
            <div className={styles.reviewList}>
              {product.reviews.map(review => (
                <div key={review.id} className={styles.review}>
                  <div className={styles.reviewHeader}>
                    <span className={styles.reviewName}>{review.user.name}</span>
                    <span className={styles.reviewStars}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className={styles.reviewComment}>{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        </FadeIn>

      </div>

      <Footer />
    </div>
  )
}
