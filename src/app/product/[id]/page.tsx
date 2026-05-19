'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight, ArrowLeft, MapPin, BadgeCheck,
  ShoppingCart, CheckCircle, AlertTriangle, PackageX, Handshake, Globe
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import styles from './product.module.css'

interface Review {
  id: string
  rating: number
  comment: string | null
  user: { name: string; avatar: string | null }
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  images: string[]
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

    const cart: CartItem[] = JSON.parse(localStorage.getItem('soko_cart') || '[]')
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

    localStorage.setItem('soko_cart', JSON.stringify(cart))
    setAddingToCart(false)
    setCartMessage('Added to cart!')
    setTimeout(() => setCartMessage(''), 3000)
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
                  Soko Verified
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

            <Link href="/shop" className={styles.continueBtn}>
              <ArrowLeft size={14} />
              Continue Shopping
            </Link>

            <div className={styles.promise}>
              <div className={styles.promiseLabel}>The Soko Promise</div>
              <div className={styles.promiseItem}><Handshake size={13} /> Handmade by a real African creator</div>
              <div className={styles.promiseItem}><BadgeCheck size={13} /> Seller verified by Soko team</div>
              <div className={styles.promiseItem}><Globe size={13} /> Supporting African livelihoods</div>
            </div>
          </div>
        </div>

        {/* Seller */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>About The Seller</h2>
          <div className={styles.sellerRow}>
            <div className={styles.avatar}>{product.seller.brandName.charAt(0)}</div>
            <div className={styles.sellerMeta}>
              <div className={styles.sellerNameRow}>
                <span className={styles.sellerName}>{product.seller.brandName}</span>
                {product.seller.isVerified && (
                  <span className={styles.sellerVerified}>
                    <BadgeCheck size={11} /> Soko Verified
                  </span>
                )}
              </div>
              <div className={styles.sellerInfo}>
                <MapPin size={12} />
                {product.seller.location.name} &middot; {product.seller._count.products} product{product.seller._count.products !== 1 ? 's' : ''} on Soko
              </div>
              {product.seller.bio && (
                <p className={styles.sellerBio}>{product.seller.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Reviews */}
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

      </div>

      <Footer />
    </div>
  )
}
