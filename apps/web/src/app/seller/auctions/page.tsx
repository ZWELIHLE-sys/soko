'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Gavel, Clock, CheckCircle2, Zap, XCircle, Timer,
  BookOpen, Calendar,
} from 'lucide-react'
import PageLoader from '@/components/ui/PageLoader'
import styles from './auctions.module.css'
import { LiveMonitor } from './_components/LiveMonitor'
import { SubmitForm } from './_components/SubmitForm'
import type { AuctionEvent, MyItem, Category } from './_types'

const ITEM_STATUS: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
  PENDING:   { label: 'Under Review',  cls: styles.statusPending,   Icon: Clock        },
  APPROVED:  { label: 'In Catalogue',  cls: styles.statusApproved,  Icon: CheckCircle2 },
  LIVE:      { label: 'Bidding Open',  cls: styles.statusLive,      Icon: Zap          },
  ENDED:     { label: 'Auction Ended', cls: styles.statusEnded,     Icon: Timer        },
  CANCELLED: { label: 'Not Selected',  cls: styles.statusCancelled, Icon: XCircle      },
}

const EVENT_STATUS: Record<string, { label: string; cls: string }> = {
  ANNOUNCED:      { label: 'Open for Submissions', cls: styles.eventOpen  },
  CATALOGUE_OPEN: { label: 'Catalogue Preview',    cls: styles.eventCat   },
  LIVE:           { label: 'Bidding Live',          cls: styles.eventLive  },
  ENDED:          { label: 'Concluded',             cls: styles.eventEnded },
}

export default function SellerAuctionsPage() {
  const [events, setEvents]         = useState<AuctionEvent[]>([])
  const [myItems, setMyItems]       = useState<MyItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)
  const [submittingTo, setSubmittingTo] = useState<string | null>(null)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [success, setSuccess]       = useState('')

  const load = useCallback(() => {
    Promise.all([
      fetch('/api/seller/auction-events').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([{ events: ev, myItems: mi }, cats]) => {
      setEvents(ev ?? [])
      setMyItems(mi ?? [])
      setCategories(cats)
      setLoading(false)
    })
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmitted = () => {
    setSuccess('Item submitted for consideration! We will review it for the catalogue.')
    setSubmittingTo(null)
    load()
    setTimeout(() => setSuccess(''), 6000)
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })

  if (loading) return <PageLoader text="Loading auctions..." />

  const itemsByEvent: Record<string, MyItem[]> = {}
  const noEventItems: MyItem[] = []
  for (const item of myItems) {
    if (item.auctionEventId) {
      itemsByEvent[item.auctionEventId] = [...(itemsByEvent[item.auctionEventId] ?? []), item]
    } else {
      noEventItems.push(item)
    }
  }

  return (
    <div>
      <div className={styles.heroBanner}>
        <div className={styles.heroBannerEyebrow}>Vuna Auctions</div>
        <h1 className={styles.heroBannerTitle}>Submit your best work for the catalogue</h1>
        <p className={styles.heroBannerSub}>
          Vuna runs curated auction events — like an auction house, not a listing site.
          When an event is announced, submit your piece. Our team selects what enters the catalogue.
          Buyers bid when the event goes live. Hammer prices are published.
        </p>
      </div>

      {success && <div className={styles.successBanner}><CheckCircle2 size={15} /> {success}</div>}

      <section className={styles.section}>
        <div className={styles.sectionTitle}>Upcoming Auction Events</div>
        {events.length === 0 ? (
          <div className={styles.emptyCard}>
            <Gavel size={32} className={styles.emptyCardIcon} />
            <div className={styles.emptyCardTitle}>No auction events announced yet</div>
            <div className={styles.emptyCardSub}>
              Our team announces curated auction events periodically. Watch your email for the next one.
            </div>
          </div>
        ) : (
          <div className={styles.eventList}>
            {events.map(ev => {
              const statusCfg = EVENT_STATUS[ev.status] ?? EVENT_STATUS.ANNOUNCED
              const submissionOpen = ev.status === 'ANNOUNCED' && new Date() <= new Date(ev.submissionDeadline)
              const myEventItems = itemsByEvent[ev.id] ?? []
              const alreadySubmitted = myEventItems.length > 0

              return (
                <div key={ev.id} className={`${styles.eventCard} ${ev.status === 'LIVE' ? styles.eventCardLive : ''}`}>
                  <div className={styles.eventTop}>
                    <div className={styles.eventLeft}>
                      {ev.theme && <div className={styles.eventTheme}>{ev.theme}</div>}
                      <div className={styles.eventTitle}>{ev.title}</div>
                      <div className={styles.eventDates}>
                        <span><Calendar size={11} /> Submissions close: {fmt(ev.submissionDeadline)}</span>
                        <span><BookOpen size={11} /> Catalogue opens: {fmt(ev.catalogueOpenDate)}</span>
                        <span><Gavel size={11} /> Bidding: {fmt(ev.biddingStartDate)} — {fmt(ev.biddingEndDate)}</span>
                      </div>
                    </div>
                    <div className={styles.eventRight}>
                      <span className={`${styles.eventStatusBadge} ${statusCfg.cls}`}>{statusCfg.label}</span>
                      {submissionOpen && !alreadySubmitted && (
                        <button className={styles.submitItemBtn} onClick={() => setSubmittingTo(ev.id)}>
                          Submit Your Item →
                        </button>
                      )}
                      {alreadySubmitted && (
                        <span className={styles.submittedNote}>
                          <CheckCircle2 size={11} /> {myEventItems.length} item{myEventItems.length !== 1 ? 's' : ''} submitted
                        </span>
                      )}
                    </div>
                  </div>

                  {ev.description && <p className={styles.eventDesc}>{ev.description}</p>}

                  {myEventItems.length > 0 && (
                    <div className={styles.myEventItems}>
                      <div className={styles.myItemsLabel}>My Submissions</div>
                      {myEventItems.map(item => {
                        const cfg = ITEM_STATUS[item.status] ?? ITEM_STATUS.PENDING
                        const canMonitor = item.status === 'LIVE' || item.status === 'ENDED'
                        const isOpen = expanded === item.id

                        return (
                          <div key={item.id} className={`${styles.itemCard} ${item.status === 'LIVE' ? styles.itemCardLive : ''}`}>
                            <div className={styles.itemCardInner}
                              onClick={() => canMonitor && setExpanded(isOpen ? null : item.id)}
                              style={{ cursor: canMonitor ? 'pointer' : 'default' }}>
                              <div className={styles.itemLeft}>
                                <div className={styles.itemTitle}>{item.title}</div>
                                {item.artistStatement && (
                                  <div className={styles.itemStatement}>&ldquo;{item.artistStatement}&rdquo;</div>
                                )}
                                <div className={styles.itemMeta}>
                                  {item.category.name} · {item._count.bids} bid{item._count.bids !== 1 ? 's' : ''}
                                  {canMonitor && <span className={styles.tapHint}> · tap to {isOpen ? 'collapse' : 'monitor'}</span>}
                                </div>
                                {item.adminNote && <div className={styles.itemAdminNote}>Review note: {item.adminNote}</div>}
                              </div>
                              <div className={styles.itemRight}>
                                <div className={styles.itemPrice}>
                                  R{(item.currentBid ?? item.startPrice).toFixed(2)}
                                  <span className={styles.priceSub}>{item.currentBid ? 'current bid' : 'start price'}</span>
                                </div>
                                <span className={`${styles.statusBadge} ${cfg.cls}`}>
                                  <cfg.Icon size={11} /> {cfg.label}
                                </span>
                                {item.status === 'LIVE' && (
                                  <Link href={`/auctions/${item.id}`} className={styles.viewLiveBtn}
                                    onClick={e => e.stopPropagation()}>
                                    View Public Listing →
                                  </Link>
                                )}
                              </div>
                            </div>
                            {canMonitor && isOpen && <LiveMonitor itemId={item.id} />}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {submittingTo === ev.id && (
                    <SubmitForm event={ev} categories={categories}
                      onSubmitted={handleSubmitted} onCancel={() => setSubmittingTo(null)} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {noEventItems.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Other Submissions</div>
          <div className={styles.auctionList}>
            {noEventItems.map(item => {
              const cfg = ITEM_STATUS[item.status] ?? ITEM_STATUS.PENDING
              return (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.itemCardInner}>
                    <div className={styles.itemLeft}>
                      <div className={styles.itemTitle}>{item.title}</div>
                      <div className={styles.itemMeta}>{item.category.name}</div>
                    </div>
                    <div className={styles.itemRight}>
                      <div className={styles.itemPrice}>R{item.startPrice.toFixed(2)}</div>
                      <span className={`${styles.statusBadge} ${cfg.cls}`}>
                        <cfg.Icon size={11} /> {cfg.label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
