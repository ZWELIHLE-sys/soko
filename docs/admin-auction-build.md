# Admin Auction — What Was Built, What Was Fixed, and Why

This document covers every change made to the admin auction management feature.

---

## Context — What the Auction Page Was Before

The original admin auction page could do five things:
1. Create an `AuctionEvent` with all the date fields
2. List events with a status badge
3. Transition event status: ANNOUNCED → CATALOGUE_OPEN → LIVE → ENDED
4. Expand an event to see submitted items
5. Approve or reject items with an admin note

The problem: it stopped there. Once you clicked through those steps, the page told you almost nothing. An item was LIVE — but at what price? Who was bidding? Did the hammer fall? Who won? Was the reserve met? You had no way to know from the admin panel.

---

## No Schema Changes Were Needed

Everything required was already in the database. The `Auction` model already had:
- `currentBid Float?` — the highest bid at any point
- `reservePrice Float?` — the hidden minimum the seller requires
- `winnerId / winner` — who the auction was sold to
- `artistStatement String?` — the maker's own words about their piece
- `images String[]` — photos of the item
- `bids Bid[]` — the full bid history
- `_count { bids }` — how many bids were placed

The data was there. The admin page just was not reading it.

---

## What Was Added and Why

### 1. The Date Pipeline — Knowing Where You Are

**What changed:**
Every event card now shows a visual timeline strip with four steps:
- Submissions close
- Catalogue opens
- Bidding starts
- Hammer falls

Steps that have already passed are highlighted green. Steps still to come are grey.

**Why:**
The auction has a precise multi-stage lifecycle. Admin needs to know at a glance where each event is in that journey — not just the final status badge. The pipeline lets you see:
- We are in the catalogue-open phase — submissions are closed, buyers can browse
- Bidding starts in 3 days
- The hammer falls on Monday at 8 PM

This is the same reason a flight boarding card shows "Check-in → Security → Boarding → Depart" with your current step highlighted. One glance tells you everything.

---

### 2. Artist Statement — The Maker's Voice

**What changed:**
When reviewing a PENDING item, admin now sees the `artistStatement` — the maker's own 2-3 sentences about the piece — shown as a pull-quote with a brand-colour left border.

**Why:**
This is the most important text on the item. The artist statement is what separates Vuna's auction from a generic sale. A wire sculpture from Soweto is not just "a wire sculpture." It is a piece by Mandla, who has been weaving wire for 20 years in his backyard. That context is what makes someone bid R800 instead of R200.

Admin is the quality gate. To decide whether to approve a piece, you need to read what the artist says about it. Before this change, that text existed in the database but was invisible in the admin panel.

---

### 3. Reserve Price — Visible to Admin Only

**What changed:**
When reviewing items, admin can see the `reservePrice` if one was set. It is clearly labelled "(hidden from buyers)" so there is no confusion about what buyers can see.

**Why:**
The reserve price is the seller's secret minimum. If bidding does not reach it, the item does not sell. Admin needs to know this when curating the catalogue — if a seller has set an unrealistically high reserve on a piece with a R50 starting bid, that is a problem worth flagging before the event goes live.

The "(hidden from buyers)" label is important. It reminds admin that this information is confidential — it should not appear in any buyer-facing communication.

---

### 4. Image Thumbnails on Every Item

**What changed:**
If an item has photos, a row of up to four image thumbnails appears at the top of the item card before the text details.

**Why:**
You cannot curate an art auction by reading descriptions alone. Admin needs to see the piece. This is the most basic requirement for an auction house — you look at what you are selling.

---

### 5. LIVE Items — Current Bid, Bid Count, Reserve Status

**What changed:**
When an event is LIVE and items are actively receiving bids, each item now shows:
- The current highest bid (e.g. "Current bid: R450")
- How many bids have been placed
- Whether the reserve price has been met (green "✓ Reserve met" or red "✗ Reserve not met")
- A "View Bids" button

**Why:**
During a live auction, admin is the auctioneer. You need to know what is happening in real time. Is item 3 sitting at the starting bid with no movement? Is item 1 getting a bidding war? Has item 2 cleared the reserve? These are the signals that tell you whether the auction is healthy or whether something needs attention.

The reserve status is especially important. If an item has not met its reserve by the last 30 minutes, that is a signal — you might want to notify the seller, or prepare them for the possibility that the item does not sell.

---

### 6. ENDED Items — Winner, Hammer Price, Reserve Outcome

**What changed:**
After an event ends, each item shows:
- Who won: "Sold to [buyer name]"
- The hammer price (the final bid amount)
- Whether the reserve was met
- "View All Bids (X)" button showing total bid count

If no bids were placed, it shows "No bids — item unsold."

**Why:**
This is the result of the auction. It is the most important information on the page after the event closes. Before this change, a ENDED event expanded to show items with just a grey "ENDED" badge — no winner, no price, nothing. That is like an auction house printing a results sheet with all the lots listed but no hammer prices.

The seller needs to know their piece sold for R450 to a buyer in Cape Town. The admin needs to confirm that happened. This is where the record lives.

---

### 7. Bid History Modal

**What changed:**
A "View Bids" button on LIVE and ENDED items opens a modal showing the full bid history. Each row shows:
- The bidder's name
- The amount they bid
- When they placed the bid

The highest bid is highlighted at the top with a trophy icon and larger text. The list is ordered from highest to lowest.

**Why:**
The bid history is the auction's paper trail. If there is a dispute — "I was the highest bidder" — the admin has the full record. It is also useful for understanding buyer behaviour: did one person drive the price up, or was it a genuine bidding war between multiple buyers?

This is also the data that will feed the "Going once... going twice..." MC announcements in Phase 3. The history tells you who bid, when, and for how much.

---

### 8. Create Form — Context Note

**What changed:**
A small note under the "Create Auction Event" heading reminds admin: "Monday Vuna Auction runs every Monday 12:00 PM – 8:00 PM. One-of-a-kind pieces only."

**Why:**
The auction format has rules. A new admin or someone filling in should not have to guess what kind of event they are creating. The note is a one-line brief that keeps the curation standard consistent.

---

### 9. API Changes

**`GET /api/auctions/events/[id]`** — updated to include:
- `currentBid` — highest bid on each item
- `reservePrice` — seller's hidden minimum
- `artistStatement` — maker's own description
- `images` — photo array
- `winner.name` — who won (after ENDED)
- `_count.bids` — total bid count per item

**`GET /api/auctions/items/[id]`** — new handler:
Returns a single item with full bid history including bidder names and timestamps. Used by the bid history modal.

The `PATCH` handler on `items/[id]` was already there and was left unchanged.

---

## Summary Table

| Area | Change | Why |
|------|--------|-----|
| API `events/[id]` GET | Added `currentBid`, `reservePrice`, `artistStatement`, `images`, `winner`, `_count.bids` | Admin can see live and ended state |
| API `items/[id]` GET | New handler — returns item with full `bids` history | Powers the bid history modal |
| Admin page | Date pipeline strip on every event | See where in the auction lifecycle each event sits |
| Admin page | Artist statement pull-quote on PENDING items | Admin reads the maker's voice before approving |
| Admin page | Reserve price shown on PENDING items | Admin sees the secret minimum during curation |
| Admin page | Image thumbnails on every item | Admin sees the piece before approving it |
| Admin page | LIVE row — current bid, bid count, reserve status | Admin monitors the auction while it is running |
| Admin page | ENDED row — winner, hammer price, reserve outcome | Admin sees the result of every item |
| Admin page | Bid history modal | Full audit trail of every bid |
| Admin page | Create form context note | Reminds admin of the Monday/one-of-a-kind format |
| CSS | Pipeline, item card, live row, hammer row, bid list | Visual language for all new states |

---

## What This Unlocks for Later Phases

- **Phase 3 — Real-time bidding**: The bid history data model is already being read. Switching from HTTP polling to WebSocket is a transport change, not a data change. The `Bid` model, `currentBid`, and `winnerId` fields are already the source of truth.
- **MC bid announcements**: "New bid on Mandla's Wire Sculpture — R350!" — the system will read `currentBid` and the latest `Bid` record to generate these. The data pipeline is in place.
- **Hammer down moment**: "Sold to a buyer in Cape Town for R450" — `winner.name` and `currentBid` already have everything needed.
- **Seller post-auction dashboard**: Sellers will see their item's final result (hammer price, winner city, bid history) on their dashboard. Admin's view is the same data — the groundwork is done.
- **Reserve logic**: When real-time bidding is added, the system will use `reservePrice` to determine whether a sale is valid. That field is already being read and displayed correctly.
