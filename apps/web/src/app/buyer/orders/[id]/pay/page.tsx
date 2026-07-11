'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Banknote, Copy, CheckCircle2, AlertTriangle, Upload, ArrowLeft, ShieldCheck, Clock,
} from 'lucide-react'
import styles from './pay.module.css'

interface OrderForPayment {
  id:               string
  orderNumber:      string
  status:           string
  totalAmount:      number
  paymentRef:       string | null
  paymentProofUrl:  string | null
  paymentSubmittedAt: string | null
  paymentVerifiedAt:  string | null
  items: {
    quantity: number
    price:    number
    product:  { name: string; images: string[]; category: { icon: string | null } }
  }[]
  seller: {
    id:            string
    brandName:     string
    email:         string
    phone:         string | null
    bankName:      string | null
    accountHolder: string | null
    accountNumber: string | null
    accountType:   string | null
    branchCode:    string | null
  }
}

export default function PayOrderPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [order, setOrder]       = useState<OrderForPayment | null>(null)
  const [loading, setLoading]   = useState(true)
  const [paymentRef, setPaymentRef] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [copied, setCopied]     = useState('')

  useEffect(() => {
    if (!params?.id) return
    fetch(`/api/buyer/orders/${params.id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: OrderForPayment) => {
        setOrder(d)
        setPaymentRef(d.paymentRef ?? '')
        setProofUrl(d.paymentProofUrl ?? '')
        setLoading(false)
      })
      .catch(() => { setError('Could not load this order.'); setLoading(false) })
  }, [params?.id])

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 1500)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'vuna/payment-proofs')
    const res  = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (!data.url) { setError(data.error ?? 'Upload failed'); return }
    setProofUrl(data.url)
  }

  const submit = async () => {
    if (!order || !proofUrl) return
    setSaving(true)
    setError('')
    const res = await fetch(`/api/buyer/orders/${order.id}/proof`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proofUrl, paymentRef }),
    })
    setSaving(false)
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? 'Could not submit proof.'); return }
    router.refresh()
    const refreshed = await fetch(`/api/buyer/orders/${order.id}`).then(r => r.json())
    setOrder(refreshed)
  }

  if (loading) return <div className={styles.loading}>Loading order...</div>
  if (!order)  return <div className={styles.loading}>{error || 'Order not found.'}</div>

  const bankReady = order.seller.bankName && order.seller.accountNumber && order.seller.accountHolder
  const submitted = !!order.paymentProofUrl
  const verified  = !!order.paymentVerifiedAt

  return (
    <div className={styles.page}>
      <Link href="/buyer/orders" className={styles.back}><ArrowLeft size={14} /> All Orders</Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Pay for your order</h1>
        <p className={styles.subtitle}>
          Order #{order.orderNumber.slice(-8).toUpperCase()} from <strong>{order.seller.brandName}</strong>
        </p>
      </div>

      {verified ? (
        <div className={styles.statusCard}>
          <div className={`${styles.statusIcon} ${styles.statusOk}`}><CheckCircle2 size={20} /></div>
          <div>
            <div className={styles.statusTitle}>Payment Confirmed</div>
            <p className={styles.statusText}>
              The seller has confirmed receipt of your payment. Your order is now being prepared for delivery.
            </p>
            <Link href="/buyer/orders" className={styles.statusBtn}>View My Orders</Link>
          </div>
        </div>
      ) : submitted ? (
        <div className={styles.statusCard}>
          <div className={`${styles.statusIcon} ${styles.statusPending}`}><Clock size={20} /></div>
          <div>
            <div className={styles.statusTitle}>Awaiting Seller Confirmation</div>
            <p className={styles.statusText}>
              We&apos;ve received your proof of payment. The seller will verify the deposit and confirm your order
              shortly. You can close this page — we&apos;ll notify you when it&apos;s confirmed.
            </p>
            <Link href="/buyer/orders" className={styles.statusBtn}>View My Orders</Link>
          </div>
        </div>
      ) : null}

      {!verified && (
        <>
          {!bankReady && (
            <div className={styles.warning}>
              <AlertTriangle size={14} /> This seller hasn&apos;t added their banking details yet.
              Please contact them via email ({order.seller.email}) to arrange payment.
            </div>
          )}

          {bankReady && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>
                <Banknote size={14} /> Step 1 — Pay via EFT
              </div>
              <p className={styles.cardIntro}>
                Make a direct bank transfer (EFT) to the seller using the details below. Use the reference
                given so the seller can match your payment.
              </p>

              <div className={styles.bankGrid}>
                <BankRow label="Account holder" value={order.seller.accountHolder!} k="holder" copied={copied} copy={copy} />
                <BankRow label="Bank"           value={order.seller.bankName!}      k="bank"   copied={copied} copy={copy} />
                <BankRow label="Account number" value={order.seller.accountNumber!} k="acc"    copied={copied} copy={copy} />
                {order.seller.branchCode  && <BankRow label="Branch code"  value={order.seller.branchCode}  k="branch"  copied={copied} copy={copy} />}
                {order.seller.accountType && <BankRow label="Account type" value={order.seller.accountType} k="type"    copied={copied} copy={copy} />}
                <BankRow label="Amount"  value={`R${order.totalAmount.toFixed(2)}`}  k="amount" copied={copied} copy={copy} highlight />
                <BankRow label="Reference (use this!)" value={order.orderNumber.slice(-8).toUpperCase()} k="ref" copied={copied} copy={copy} highlight />
              </div>

              <div className={styles.vunaPromise}>
                <ShieldCheck size={13} />
                Vuna stands between you and the seller. If anything goes wrong with this transaction,
                contact <strong>support@vunamarketplace.co.za</strong> and we will mediate.
              </div>
            </div>
          )}

          {bankReady && (
            <div className={styles.card}>
              <div className={styles.cardLabel}>
                <Upload size={14} /> Step 2 — Upload your proof of payment
              </div>
              <p className={styles.cardIntro}>
                Once you&apos;ve made the EFT, upload a screenshot or PDF of the confirmation from your bank.
                The seller will verify and confirm your order.
              </p>

              <div className={styles.field}>
                <label className={styles.label}>EFT reference you used <span className={styles.optional}>(optional)</span></label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder={order.orderNumber.slice(-8).toUpperCase()}
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Proof of payment</label>
                {proofUrl ? (
                  <div className={styles.proofPreview}>
                    {proofUrl.endsWith('.pdf') ? (
                      <a href={proofUrl} target="_blank" rel="noreferrer" className={styles.proofPdf}>
                        <CheckCircle2 size={16} /> PDF uploaded — click to view
                      </a>
                    ) : (
                      <div className={styles.proofImgWrap}>
                        <Image src={proofUrl} alt="Proof of payment" fill sizes="280px" style={{ objectFit: 'cover' }} />
                      </div>
                    )}
                    <button type="button" className={styles.replaceBtn} onClick={() => setProofUrl('')}>Replace</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.uploadBtn}
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload size={16} />
                    {uploading ? 'Uploading...' : 'Choose file (image or PDF)'}
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  style={{ display: 'none' }}
                  onChange={handleUpload}
                />
              </div>

              {error && <div className={styles.errorMsg}><AlertTriangle size={14} /> {error}</div>}

              <button
                type="button"
                className={styles.submitBtn}
                disabled={!proofUrl || saving}
                onClick={submit}
              >
                {saving ? 'Submitting...' : 'I have paid — Submit proof'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function BankRow({
  label, value, k, copied, copy, highlight,
}: {
  label: string; value: string; k: string;
  copied: string; copy: (v: string, k: string) => void; highlight?: boolean;
}) {
  return (
    <div className={`${styles.bankRow} ${highlight ? styles.bankRowHighlight : ''}`}>
      <span className={styles.bankLabel}>{label}</span>
      <span className={styles.bankValue}>{value}</span>
      <button className={styles.copyBtn} onClick={() => copy(value, k)} title="Copy">
        {copied === k ? <CheckCircle2 size={13} /> : <Copy size={13} />}
      </button>
    </div>
  )
}
