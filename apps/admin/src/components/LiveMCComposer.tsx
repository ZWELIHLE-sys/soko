'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Radio, Send, CircleStop, CheckCircle2, AlertTriangle, ChevronDown,
  PartyPopper, Store, AlarmClock, Gavel, Sparkles, Megaphone, BookOpen, Sunset,
  type LucideIcon,
} from 'lucide-react'
import shared from '@/app/admin.module.css'
import styles from './livemc.module.css'

export type MCChannel = 'GLOBAL' | 'MARKET' | 'AUCTION' | 'SHOP'

type MicState = 'UPCOMING' | 'LIVE' | 'CLOSING' | 'NONE'

interface MicTarget {
  event: { id: string; title: string } | null
  state: MicState
}

interface Announcement {
  id: string
  message: string
  link: string | null
  kind: string
  channel: string
  isActive: boolean
  expiresAt: string | null
  createdAt: string
  market: { title: string } | null
  auctionEvent: { title: string } | null
}

interface Template { kind: string; Icon: LucideIcon; label: string; text: string }

// Each room gets its own MC vocabulary — including the formal close
const TEMPLATES: Record<MCChannel, Template[]> = {
  MARKET: [
    { kind: 'WELCOME',     Icon: PartyPopper, label: 'Market open',     text: 'The market is OPEN — first 3 buyers get the welcome piece!' },
    { kind: 'SPOTLIGHT',   Icon: Store,       label: 'Stall spotlight', text: 'Spotlight: [maker name] just dropped something special — go see their stall.' },
    { kind: 'LAST_CHANCE', Icon: AlarmClock,  label: 'Last chance',     text: 'Going once, going twice — the market closes soon. Don’t leave empty handed.' },
    { kind: 'HAMMER',      Icon: Gavel,       label: 'Sold!',           text: 'SOLD! Another piece finds its home. Sivunile.' },
    { kind: 'CLOSING',     Icon: Sunset,      label: 'Formal close',    text: 'The market is now CLOSED. Thank you to every maker and every buyer — Sivunile. See you at the next one.' },
  ],
  AUCTION: [
    { kind: 'WELCOME',     Icon: Gavel,       label: 'Bidding open',    text: 'The hammer is up — bidding is now OPEN. Good luck.' },
    { kind: 'SPOTLIGHT',   Icon: Sparkles,    label: 'Piece spotlight', text: 'All eyes on [piece name] by [maker name] — a one-of-a-kind. Current bid climbing.' },
    { kind: 'LAST_CHANCE', Icon: AlarmClock,  label: 'Last call',       text: 'Last call — bidding closes soon. Don’t let it slip away.' },
    { kind: 'HAMMER',      Icon: Gavel,       label: 'Hammer down',     text: 'HAMMER DOWN — sold to the highest bidder. Sivunile.' },
    { kind: 'CLOSING',     Icon: Sunset,      label: 'Formal close',    text: 'The hammer rests — this auction is now CLOSED. Congratulations to our winners, and thank you to every bidder.' },
  ],
  SHOP: [
    { kind: 'SPOTLIGHT',   Icon: Sparkles,    label: 'Just off the hammer', text: 'Fresh from the auction floor — [piece name] is now in the shop. First come, first served.' },
    { kind: 'WELCOME',     Icon: Store,       label: 'New drop',            text: '[maker name] just added new work to their shop. Go look.' },
  ],
  GLOBAL: [
    { kind: 'GENERAL',     Icon: Megaphone,   label: 'Announcement',    text: '' },
    { kind: 'WELCOME',     Icon: PartyPopper, label: 'Big news',        text: 'Big news from Vuna: ' },
    { kind: 'SPOTLIGHT',   Icon: BookOpen,    label: 'This week',       text: 'This week on Vuna: ' },
    { kind: 'CLOSING',     Icon: Sunset,      label: 'Event wrap-up',   text: 'What a day on Vuna — thank you for showing up for local makers. Sivunile.' },
  ],
}

const CHANNEL_LABEL: Record<MCChannel, string> = {
  GLOBAL:  'Everywhere',
  MARKET:  'Market',
  AUCTION: 'Auction',
  SHOP:    'Shop',
}

// The control room only carries the marketing mic + the shop mic.
// Market and auction mics live on their own management pages, wired to real events.
const CONTROL_ROOM_CHANNELS: MCChannel[] = ['GLOBAL', 'SHOP']

const STATE_LABEL: Record<Exclude<MicState, 'NONE'>, string> = {
  UPCOMING: 'Upcoming',
  LIVE:     'Live now',
  CLOSING:  'Closing window — speak the formal close',
}

interface Props {
  channel?: MCChannel     // locked to one room when embedded; undefined = control room
  collapsible?: boolean
  subtitle?: string
}

export default function LiveMCComposer({ channel, collapsible = false, subtitle }: Props) {
  const locked = !!channel
  const isEventMic = channel === 'MARKET' || channel === 'AUCTION'

  const [open, setOpen]           = useState(!collapsible)
  const [message, setMessage]     = useState('')
  const [link, setLink]           = useState('')
  const [kind, setKind]           = useState('GENERAL')
  const [pickChannel, setPickChannel] = useState<MCChannel>(channel ?? 'GLOBAL')
  const [expiry, setExpiry]       = useState('')
  const [sending, setSending]     = useState(false)
  const [sendError, setSendError] = useState('')
  const [sent, setSent]           = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [mic, setMic]             = useState<MicTarget>({ event: null, state: 'NONE' })
  const [micLoaded, setMicLoaded] = useState(!isEventMic)

  const load = useCallback(async () => {
    let target: MicTarget = { event: null, state: 'NONE' }
    if (isEventMic) {
      try {
        const res = await fetch(`/api/live/mic-target?channel=${channel}`)
        target = await res.json()
      } catch { /* keep NONE */ }
      setMic(target)
      setMicLoaded(true)
    }

    const params = new URLSearchParams()
    if (channel === 'MARKET'  && target.event) params.set('marketId', target.event.id)
    else if (channel === 'AUCTION' && target.event) params.set('auctionEventId', target.event.id)
    else if (locked && channel) params.set('channel', channel)

    if (isEventMic && !target.event) { setAnnouncements([]); return }

    fetch(`/api/live/announcements?${params.toString()}`)
      .then(r => r.json())
      .then(d => setAnnouncements(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [locked, channel, isEventMic])

  useEffect(() => { load() }, [load])

  const activeChannel = locked ? channel : pickChannel
  const templates = TEMPLATES[activeChannel] ?? TEMPLATES.GLOBAL

  const send = async () => {
    if (!message.trim()) return
    setSending(true)
    setSendError('')
    const res = await fetch('/api/live/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message, link: link || undefined, kind,
        channel: activeChannel,
        ...(channel === 'MARKET'  && mic.event ? { marketId: mic.event.id } : {}),
        ...(channel === 'AUCTION' && mic.event ? { auctionEventId: mic.event.id } : {}),
        expiresInMinutes: expiry ? Number(expiry) : undefined,
      }),
    })
    setSending(false)
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      setSendError(d.error ?? 'Could not send.')
      return
    }
    setMessage(''); setLink(''); setKind('GENERAL'); setExpiry('')
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    load()
  }

  const endAnnouncement = async (id: string) => {
    await fetch(`/api/live/announcements/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false }),
    })
    load()
  }

  const active = announcements.filter(a => a.isActive && (!a.expiresAt || new Date(a.expiresAt) > new Date()))
  const micOff = isEventMic && micLoaded && !mic.event

  return (
    <div className={`${shared.card} ${styles.wrap}`}>
      <button
        type="button"
        className={styles.header}
        onClick={() => collapsible && setOpen(o => !o)}
        style={collapsible ? undefined : { cursor: 'default' }}
      >
        <span className={styles.headerIcon}><Radio size={15} /></span>
        <span>
          <span className={styles.headerTitle}>
            Live MC{locked ? ` — ${CHANNEL_LABEL[channel]}` : ''}
            {isEventMic && mic.event && <span className={styles.headerEvent}> · {mic.event.title}</span>}
          </span>
          {subtitle && <span className={styles.headerSub}>{subtitle}</span>}
        </span>
        {isEventMic && mic.event && mic.state !== 'NONE' && (
          <span className={`${styles.stateBadge} ${styles[`state${mic.state}`]}`}>
            {mic.state === 'LIVE' && <span className={styles.liveDot} />}
            {STATE_LABEL[mic.state as Exclude<MicState, 'NONE'>]}
          </span>
        )}
        {active.length > 0 && (
          <span className={styles.onAir}><span className={styles.liveDot} /> {active.length} on air</span>
        )}
        {collapsible && (
          <ChevronDown size={16} className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
        )}
      </button>

      {open && micOff && (
        <div className={styles.micOff}>
          The mic is off — there is no {channel === 'MARKET' ? 'market' : 'auction'} event to speak into.
          Create {channel === 'MARKET' ? 'a market event' : 'an auction event'} first, and this mic
          connects to it automatically.
        </div>
      )}

      {open && !micOff && (
        <div className={styles.body}>
          {!locked && (
            <div className={styles.channelRow}>
              {CONTROL_ROOM_CHANNELS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.channelChip} ${pickChannel === c ? styles.channelChipActive : ''}`}
                  onClick={() => setPickChannel(c)}
                >
                  {CHANNEL_LABEL[c]}
                </button>
              ))}
              <span className={styles.channelNote}>
                Market and auction mics live on their own pages, wired to the event.
              </span>
            </div>
          )}

          <div className={styles.templates}>
            {templates.map(t => (
              <button
                key={`${t.kind}-${t.label}`}
                type="button"
                className={`${styles.templateChip} ${mic.state === 'CLOSING' && t.kind === 'CLOSING' ? styles.templateChipUrgent : ''}`}
                onClick={() => { setMessage(t.text); setKind(t.kind) }}
              >
                <t.Icon size={13} /> {t.label}
              </button>
            ))}
          </div>

          <textarea
            className={shared.formTextarea}
            rows={3}
            maxLength={200}
            placeholder="Type your announcement... e.g. Stall 7 just dropped a new piece"
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <div className={styles.charCount}>{message.length}/200</div>

          <div className={styles.composerRow}>
            <input
              className={shared.formInput}
              type="text"
              placeholder="Optional link e.g. /market"
              value={link}
              onChange={e => setLink(e.target.value)}
            />
            <select className={shared.formInput} value={expiry} onChange={e => setExpiry(e.target.value)}>
              <option value="">{isEventMic ? 'Expires with the event' : 'No auto-expiry'}</option>
              <option value="15">Expires in 15 min</option>
              <option value="30">Expires in 30 min</option>
              <option value="60">Expires in 1 hour</option>
              <option value="240">Expires in 4 hours</option>
            </select>
          </div>

          {sendError && <div className={styles.errorMsg}><AlertTriangle size={13} /> {sendError}</div>}
          {sent && <div className={styles.successMsg}><CheckCircle2 size={13} /> Announcement is live.</div>}

          <button className={shared.btnPrimary} onClick={send} disabled={sending || !message.trim()}>
            <Send size={14} />
            {sending
              ? 'Sending...'
              : isEventMic && mic.event
                ? `Send to ${mic.event.title}`
                : `Send to ${CHANNEL_LABEL[activeChannel]}`}
          </button>

          {active.length > 0 && (
            <div className={styles.activeList}>
              <div className={styles.activeLabel}>
                <span className={styles.liveDot} /> Live now ({active.length})
              </div>
              {active.map(a => (
                <div key={a.id} className={styles.activeRow}>
                  <span className={styles.channelBadge}>
                    {a.market?.title ?? a.auctionEvent?.title ?? CHANNEL_LABEL[a.channel as MCChannel] ?? a.channel}
                  </span>
                  <div className={styles.activeMsg}>{a.message}</div>
                  <button className={styles.endBtn} onClick={() => endAnnouncement(a.id)} title="Take off air">
                    <CircleStop size={13} /> End
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
