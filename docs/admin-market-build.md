# Admin Market — What Was Built, What Was Fixed, and Why

This document covers every change made to the admin market management feature. Written for reading in your own time.

---

## Context — What the Market Page Was Before

The original admin market page could do three things:
1. Create a market event (title, dates, description)
2. See a list of markets
3. Expand a market to see stall applications and approve or reject them with a stall number and note

That was the skeleton. It worked but it was missing the features that make the market feel like **Vuna's flagship event** — not just a list of dates on a screen.

---

## What Was Added and Why

### 1. Market Types — Sunday Vuna Market & Friday Night Market

**What changed:**
Added a `marketType` field to the `Market` database model with two options:
- `SUNDAY_MARKET` — weekly, every Sunday, 8 AM to 6 PM
- `FRIDAY_NIGHT_MARKET` — monthly, last Friday of every month, 5 PM to 11 PM

**Why:**
The Monday Vuna Auction already has its own model (`AuctionEvent`). But the Sunday Market and Friday Night Market were being treated as one generic thing. They are not the same event. They have different energy, different times, different frequencies, different audiences.

Giving each one a type means:
- Admins can see at a glance which kind of event they are looking at
- The buyer and seller experience can be customised per event type in future phases (different MC announcements, different notification copy, different page theming)
- The platform knows which event is a weekly flagship and which is a monthly special

**How it works in admin:**
When you create a market, you first pick the type from a two-button selector. Each button shows the event name and its schedule. Clicking one auto-fills the title field so you do not have to type it from scratch. The type badge appears on every market card in the list.

**Database change:**
```prisma
enum MarketType {
  SUNDAY_MARKET
  FRIDAY_NIGHT_MARKET
}

model Market {
  marketType MarketType @default(SUNDAY_MARKET)
  ...
}
```

---

### 2. Event Status — UPCOMING / LIVE / ENDED

**What changed:**
Every market card now shows a real-time computed status: `UPCOMING`, `LIVE`, or `ENDED`.

**Why:**
The old page had no way to tell which markets were currently running, which were coming up, and which were over. You had to read the dates and figure it out yourself. With potentially dozens of markets in the list, that is slow.

**How it works:**
There is no status field in the database — the status is computed on the fly by comparing the current time against `startDate` and `endDate`:
```ts
function getEventStatus(startDate, endDate) {
  const now = new Date()
  if (now < new Date(startDate)) return 'UPCOMING'
  if (now > new Date(endDate))   return 'ENDED'
  return 'LIVE'
}
```

This is the right approach. Storing status in the database and trying to keep it in sync with real time would be fragile — you would need a cron job or a migration to flip status at the exact right moment. Computing it from the dates means it is always accurate, zero maintenance.

**Colour coding:**
- UPCOMING — blue
- LIVE — green
- ENDED — grey

---

### 3. isActive Toggle — Publish / Hide

**What changed:**
A Publish / Hide button on every market card. A `HIDDEN` badge appears when the market is not active. Hidden markets show a dashed border so they stand out in the list.

**Why:**
The `isActive` field already existed in the database and the API already supported changing it. But there was no button in the UI. This means admins had no way to control whether a market appeared on the seller dashboard.

This is operationally critical. You want to:
- Hide a market while you are still setting it up (before the application deadline is ready)
- Republish after making changes
- Archive old markets without deleting them

**What Publish / Hide controls:**
When `isActive` is `false`, the market does not appear on the seller dashboard. Sellers cannot see it and cannot apply. When `isActive` is `true`, it is live to sellers.

---

### 4. Maker in Residence — Assignment UI

**What changed:**
Every market card now has a Maker in Residence row. If no one is assigned, there is an "Assign Seller" button. If someone is assigned, their name shows with Change and Remove buttons. Clicking Assign opens a modal with a live search across all verified sellers.

**Why:**
The Maker in Residence (`makerInResidenceId`) was already in the database schema and the API already supported setting it. But there was zero UI to use it — meaning it was an unused field.

The Maker in Residence is one of Vuna's signature market features. It is the featured seller for that market event. Their stall gets spotlighted in MC announcements, their story gets told, their work gets prioritised on the market page. It is the curation layer that makes Vuna feel like a real market with a programme, not just a website.

**How the picker works:**
The modal loads all `VERIFIED` sellers (not pending, not suspended — only verified). You can search by brand name or category. Each seller shows their category, location, and product count so you can make an informed choice. Clicking a seller assigns them immediately. The Assign, Change, and Remove buttons all talk to the same API endpoint:
```
PATCH /api/market/[id]
body: { makerInResidenceId: "seller-id" }  // or null to remove
```

**New API route:**
```
GET /api/market/sellers
```
Returns only verified sellers. Used exclusively by the MiR picker modal. Kept separate from the main `/api/sellers` route so the filters do not clash.

---

### 5. Stall Application — Full Seller Intent Visible

**What changed:**
When reviewing stall applications, the admin now sees:
- The seller's **stall message** — their market-day statement ("Come see what I'm bringing today")
- Their **market price** if they have set one (market-only pricing)
- How many products they have selected for this market
- Admin notes from previous actions
- Seller notes they submitted with their application

**Why:**
Before this change, reviewing an application showed only the seller's brand name, email, and product count. That is not enough information to make a good decision. You want to know what they are planning to bring, whether they have set a special price, how committed they are.

The stall message is the seller's voice. It is the digital equivalent of a stallholder saying "I've got 8 new winter pieces, come early." Seeing that when you review their application tells you exactly what energy they are bringing to the market.

**Schema changes:**
```prisma
model MarketListing {
  stallMessage String?  // seller's market-day message
  marketPrice  Float?   // seller's market-only price
  ...
}
```

These fields are set by the seller from their dashboard (that build comes in a later phase). For now, admin can see them when reviewing. The foundation is in the database.

---

### 6. Type Legend at the Top of the Page

**What changed:**
A small reference strip at the top of the market page shows both event types with their schedules.

**Why:**
A new admin or a returning admin after a break should not have to remember what the difference is between a Sunday Market and a Friday Night Market. The legend shows it at a glance — name, frequency, hours — without having to go anywhere.

---

## Summary of All Changes

| Area | Change | Why |
|------|--------|-----|
| Schema | `Market.marketType` enum field | Distinguish Sunday Market from Friday Night Market |
| Schema | `MarketListing.stallMessage` | Seller's market-day message visible to admin during review |
| Schema | `MarketListing.marketPrice` | Seller's market-only price visible to admin during review |
| API | `POST /api/market` — accepts `marketType` | Create market with correct type |
| API | `PATCH /api/market/[id]` — returns `makerInResident` in response | UI can update without refetch |
| API | `GET /api/market/sellers` — new route | Verified sellers only, for MiR picker |
| Admin page | Market type selector in create form | Choose Sunday or Friday Night before creating |
| Admin page | Type badge on every card | See at a glance which kind of event each card is |
| Admin page | UPCOMING / LIVE / ENDED status computed from dates | Real-time status without a cron job |
| Admin page | isActive Publish / Hide toggle | Control seller dashboard visibility per event |
| Admin page | Maker in Residence row on every card | Assign, change, remove featured seller per event |
| Admin page | MiR modal with verified seller search | Pick MiR from real list of verified sellers |
| Admin page | Full stall application detail in review panel | See stallMessage, marketPrice, productIds when reviewing |
| CSS | Type selector buttons, MiR row, legend, inactive card dashing | Visual language for all new components |

---

## What This Unlocks for the Buyer / Seller Phases

These admin changes lay the foundation for:

- **Seller dashboard** — sellers will submit their `stallMessage` and `marketPrice` when applying. Those fields now exist in the database.
- **Market page (buyer)** — the `marketType` tells the page which event mode to activate (Sunday energy vs Friday night energy). The `makerInResident` relation tells the page which seller to spotlight.
- **MC announcements** — the system will use `marketType`, `makerInResident`, and `isActive` to generate the right notification copy. A Sunday Market announcement reads differently to a Friday Night Market announcement.
- **Live market mode** — the UPCOMING / LIVE / ENDED computed status is the same logic the buyer-facing page will use to switch between "countdown" mode (before), "live market" mode (during), and "recap" mode (after).

The admin does not just manage events. The admin is the engine that powers every downstream feature.
