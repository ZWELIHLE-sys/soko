import { prisma } from '@vuna/db'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FadeIn from '@/components/ui/FadeIn'
import Link from 'next/link'
import Image from 'next/image'
import { Gavel, ArrowLeft, Award, TrendingUp, Users } from 'lucide-react'
import styles from './history.module.css'

export const revalidate = 300

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function AuctionHistoryPage() {
  const pastEvents = await prisma.auctionEvent.findMany({
    where: { status: 'ENDED' },
    orderBy: { biddingEndDate: 'desc' },
    include: {
      _count: { select: { items: true } },
      items: {
        where: { status: 'ENDED' },
        orderBy: { currentBid: 'desc' },
        include: {
          seller:   { select: { brandName: true } },
          category: { select: { name: true } },
          winner:   { select: { name: true } },
          _count:   { select: { bids: true } },
        },
      },
    },
  })

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>Vuna Auctions</div>
          <h1 className={styles.heroTitle}>Auction History</h1>
          <p className={styles.heroSub}>
            Every hammer that has fallen on the Vuna platform. One-of-a-kind pieces,
            verified makers, and the buyers who claimed them.
          </p>
        </div>
      </div>

      <div className={styles.inner}>

        <Link href="/auctions" className={styles.backLink}>
          <ArrowLeft size={14} /> Back to Auctions
        </Link>

        {pastEvents.length === 0 ? (
          <FadeIn>
            <div className={styles.emptyState}>
              <Gavel size={48} className={styles.emptyIcon} />
              <h2 className={styles.emptyTitle}>No completed auctions yet</h2>
              <p className={styles.emptySub}>
                History is being written. Check back after the first auction event concludes.
              </p>
            </div>
          </FadeIn>
        ) : (
          <div className={styles.eventList}>
            {pastEvents.map((event, i) => {
              const soldItems    = event.items.filter(a => a.currentBid !== null)
              const totalHammer  = soldItems.reduce((sum, a) => sum + (a.currentBid ?? 0), 0)
              const topItems     = event.items.slice(0, 3)
              const remaining    = event.items.length - topItems.length

              return (
                <FadeIn key={event.id} delay={i * 40}>
                  <div className={styles.eventCard}>

                    <div className={styles.eventHeader}>
                      <div className={styles.eventLeft}>
                        {event.theme && (
                          <div className={styles.eventTheme}>{event.theme}</div>
                        )}
                        <h2 className={styles.eventTitle}>{event.title}</h2>
                        <div className={styles.eventDate}>
                          {fmtDate(event.biddingStartDate)} — {fmtDate(event.biddingEndDate)}
                        </div>
                      </div>
                      <div className={styles.eventStats}>
                        <div className={styles.stat}>
                          <span className={styles.statValue}>{event.items.length}</span>
                          <span className={styles.statLabel}>
                            <Users size={10} /> Items sold
                          </span>
                        </div>
                        {totalHammer > 0 && (
                          <div className={styles.stat}>
                            <span className={styles.statValue}>R{totalHammer.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}</span>
                            <span className={styles.statLabel}>
                              <TrendingUp size={10} /> Total hammer
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {topItems.length > 0 && (
                      <div className={styles.itemList}>
                        {topItems.map((item, rank) => (
                          <Link key={item.id} href={`/auctions/${item.id}`} className={styles.itemRow}>
                            <div className={styles.itemRank}>#{rank + 1}</div>

                            <div className={styles.itemThumb}>
                              {item.images[0] ? (
                                <Image
                                  src={item.images[0]}
                                  alt={item.title}
                                  fill
                                  className={styles.thumbImg}
                                  sizes="56px"
                                />
                              ) : (
                                <div className={styles.thumbFallback}><Gavel size={16} /></div>
                              )}
                            </div>

                            <div className={styles.itemInfo}>
                              <div className={styles.itemTitle}>{item.title}</div>
                              <div className={styles.itemMeta}>
                                {item.category.name} · {item.seller.brandName} · {item._count.bids} bid{item._count.bids !== 1 ? 's' : ''}
                              </div>
                            </div>

                            <div className={styles.itemResult}>
                              {item.currentBid !== null ? (
                                <>
                                  <div className={styles.hammerPrice}>
                                    R{item.currentBid.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                                  </div>
                                  {item.winner && (
                                    <div className={styles.winner}>
                                      <Award size={10} /> {item.winner.name}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className={styles.noBids}>No bids</div>
                              )}
                            </div>
                          </Link>
                        ))}

                        {remaining > 0 && (
                          <div className={styles.moreItems}>
                            +{remaining} more item{remaining !== 1 ? 's' : ''} in this event
                          </div>
                        )}
                      </div>
                    )}

                    {event.items.length === 0 && (
                      <div className={styles.noItems}>No items were sold in this event.</div>
                    )}

                  </div>
                </FadeIn>
              )
            })}
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}
