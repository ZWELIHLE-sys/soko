'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import shared from '../../admin.module.css'
import styles from './auctions.module.css'
import type { AuctionEvent, AuctionItem, Bid, EventStatus } from './_types'
import { EMPTY_EVENT_FORM } from './_types'
import { CreateEventForm } from './_components/CreateEventForm'
import { EventCard } from './_components/EventCard'
import { ItemReviewModal } from './_components/ItemReviewModal'
import { BidHistoryModal } from './_components/BidHistoryModal'
import { AdminLocationFilter } from '@/components/AdminLocationFilter'

export default function AdminAuctionsPage() {
  const [events, setEvents]         = useState<AuctionEvent[]>([])
  const [loading, setLoading]       = useState(true)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [items, setItems]           = useState<Record<string, AuctionItem[]>>({})
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm]             = useState(EMPTY_EVENT_FORM)
  const [saving, setSaving]         = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState<string | null>(null)

  const [reviewId, setReviewId]         = useState<string | null>(null)
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'CANCELLED' | null>(null)
  const [reviewNote, setReviewNote]     = useState('')
  const [updating, setUpdating]         = useState<string | null>(null)

  const [bidsItemId, setBidsItemId]   = useState<string | null>(null)
  const [bids, setBids]               = useState<Bid[]>([])
  const [bidsLoading, setBidsLoading] = useState(false)
  const [bidsTitle, setBidsTitle]     = useState('')
  const [locationId, setLocationId]   = useState('')

  useEffect(() => {
    fetch('/api/auctions/events')
      .then(r => r.json())
      .then(data => { setEvents(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const loadItems = async (eventId: string) => {
    if (items[eventId]) return
    const res  = await fetch(`/api/auctions/events/${eventId}`)
    const data = await res.json()
    setItems(prev => ({ ...prev, [eventId]: data.items }))
  }

  const openBids = async (item: AuctionItem) => {
    setBidsTitle(item.title)
    setBidsItemId(item.id)
    setBidsLoading(true)
    const res  = await fetch(`/api/auctions/items/${item.id}`)
    const data = await res.json()
    setBids(data.bids ?? [])
    setBidsLoading(false)
  }

  const deleteItem = async (itemId: string) => {
    if (!confirm('Permanently delete this auction item? This also removes all bids on it.')) return
    const res = await fetch(`/api/auctions/items/${itemId}`, { method: 'DELETE' })
    if (!res.ok) {
      alert('Could not delete the item.')
      return
    }
    // Refresh items for any event containing this id
    setItems(prev => {
      const next: typeof prev = {}
      for (const [eventId, list] of Object.entries(prev)) {
        next[eventId] = list.filter(i => i.id !== itemId)
      }
      return next
    })
  }

  const toggleEvent = (id: string) => {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    loadItems(id)
  }

  const createEvent = async () => {
    setSaving(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/auctions/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      if (res.ok) {
        const created = await res.json()
        setEvents(prev => [{ ...created, _count: { items: 0 }, items: [] }, ...prev])
        setForm(EMPTY_EVENT_FORM)
        setShowCreate(false)
      } else {
        const err = await res.json().catch(() => ({}))
        setCreateError(err.error ?? `Server error ${res.status}`)
      }
    } catch {
      setCreateError('Network error — check the console for details')
    }
    setSaving(false)
  }

  const transitionStatus = async (eventId: string, next: EventStatus) => {
    setTransitioning(eventId)
    const res = await fetch(`/api/auctions/events/${eventId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    if (res.ok) setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: next } : e))
    setTransitioning(null)
  }

  const submitItemReview = async () => {
    if (!reviewId || !reviewAction) return
    setUpdating(reviewId)
    const res = await fetch(`/api/auctions/items/${reviewId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: reviewAction, adminNote: reviewNote }),
    })
    if (res.ok) {
      const updated = await res.json()
      setItems(prev => {
        const next = { ...prev }
        for (const key of Object.keys(next)) {
          next[key] = next[key].map(i => i.id === reviewId ? { ...i, ...updated } : i)
        }
        return next
      })
      if (reviewAction === 'APPROVED') {
        setEvents(prev => prev.map(e => ({ ...e, items: e.items.filter(i => i.id !== reviewId) })))
      }
    }
    setUpdating(null)
    setReviewId(null)
    setReviewAction(null)
    setReviewNote('')
  }

  return (
    <div>
      <div className={styles.headerRow}>
        <div className={shared.pageHeader} style={{ marginBottom: 0 }}>
          <h1 className={shared.pageTitle}>Auction Management</h1>
          <p className={shared.pageSub}>
            Create auction events, curate items into the catalogue, manage the live auction.
          </p>
        </div>
        <button className={shared.btnPrimary} onClick={() => setShowCreate(!showCreate)}>
          <Plus size={14} /> New Auction Event
        </button>
      </div>

      {showCreate && (
        <CreateEventForm
          form={form}
          saving={saving}
          error={createError}
          onFormChange={updates => setForm(p => ({ ...p, ...updates }))}
          onCreate={createEvent}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <AdminLocationFilter value={locationId} onChange={setLocationId} />

      {loading ? (
        <div className={shared.loading}>Loading auction events...</div>
      ) : (
        <div className={styles.list}>
          {events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              isOpen={expanded === event.id}
              items={
                locationId && items[event.id]
                  ? items[event.id].filter(i => i.seller.locationId === locationId)
                  : items[event.id]
              }
              transitioning={transitioning}
              onToggle={() => toggleEvent(event.id)}
              onTransition={next => transitionStatus(event.id, next)}
              onReview={(id, action) => { setReviewId(id); setReviewAction(action) }}
              onViewBids={openBids}
              onDelete={deleteItem}
            />
          ))}
          {events.length === 0 && <div className={shared.empty}>No auction events yet. Create the first one.</div>}
        </div>
      )}

      {reviewId && reviewAction && (
        <ItemReviewModal
          action={reviewAction}
          note={reviewNote}
          updating={updating === reviewId}
          onNoteChange={setReviewNote}
          onConfirm={submitItemReview}
          onCancel={() => { setReviewId(null); setReviewAction(null); setReviewNote('') }}
        />
      )}

      {bidsItemId && (
        <BidHistoryModal
          title={bidsTitle}
          bids={bids}
          loading={bidsLoading}
          onClose={() => { setBidsItemId(null); setBids([]) }}
        />
      )}
    </div>
  )
}
