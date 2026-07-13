# How Cookies Work on Vuna

_A plain-language guide for understanding and handling cookies on the platform._

---

## The short version

Vuna is about as simple as it gets when it comes to cookies. You have:

- **One real cookie** — the login session.
- **Two things people call "cookies" but technically aren't** — the cart and the cookie-consent flag. These live in the browser's *localStorage*, not in cookies.
- **Zero tracking, advertising, or analytics cookies.**

That simplicity is a genuine advantage. It keeps you clean under South African and European privacy law with almost no effort.

---

## What is a cookie, really?

A **cookie** is a tiny piece of text a website asks the browser to store, and the browser then **sends it back to the server automatically on every request**. That "sent back automatically" part is the key — it's how a server remembers who you are between page loads.

**localStorage** is different: it's also browser storage, but it **stays on the user's device** and is *never* sent to the server automatically. Your code has to read it deliberately.

That distinction matters because privacy law cares about data that travels and can identify or track people. Cookies travel; localStorage sits still.

---

## The one cookie Vuna actually uses: the login session

When someone logs in, the authentication system (NextAuth) sets a single session cookie. You never write code to manage it — it's automatic. It is:

- **httpOnly** — JavaScript on the page cannot read it. This blocks a whole class of attacks (if someone injected a malicious script, they still couldn't steal the session).
- **secure (in production)** — only ever sent over HTTPS, never plain HTTP.
- **sameSite: lax** — the browser won't send it along with requests coming from other websites, which defends against cross-site request forgery.
- **signed** — cryptographically sealed with your `NEXTAUTH_SECRET`, so it can't be forged or tampered with.

It exists for one reason: to keep a logged-in user logged in as they move between pages. It's created at login and cleared at logout. **This is a "strictly necessary" cookie** — the service literally cannot work without it.

---

## The two things that look like cookies but aren't

### The cart (`vuna_cart`)
Stored in **localStorage**. When a buyer adds something to their cart, it's saved on *their own device*. It never touches your server until they actually place an order. That's why the cart survives a page refresh without any server involvement — and why one person's cart can never leak to another.

### The cookie-consent flag (`vuna_cookie_consent`)
Also **localStorage**. When someone clicks "Got it" on the cookie banner, that choice is remembered on their device so the banner doesn't nag them again.

Neither of these is sent to your server automatically, and neither tracks anyone.

---

## What Vuna does NOT have

- ❌ No Google Analytics or any analytics cookies
- ❌ No advertising or marketing cookies
- ❌ No third-party trackers (Facebook pixel, etc.)
- ❌ No cross-site tracking of any kind

---

## What this means for the law (POPIA & GDPR)

Both South Africa's **POPIA** and Europe's **GDPR** draw a line between two kinds of cookies:

1. **Strictly necessary cookies** (like your login session) — you only have to **inform** users they exist. You do **not** need to ask permission first.
2. **Non-essential cookies** (analytics, advertising, tracking) — you **must** get clear opt-in consent *before* setting them.

Vuna only uses category 1. So:

- Your cookie banner is a **courtesy notice**, not a legal consent gate. You're actually doing more than the law requires.
- You do **not** need the complicated "Manage cookie preferences / Accept / Reject" machinery you see on big commercial sites — because there is nothing to opt out of.
- The banner's current wording ("essential cookies... no tracking, no advertising") is accurate and appropriate.

---

## The one thing that would change this

If you ever add **analytics** (Google Analytics, Plausible, etc.) or **advertising**, you cross into category 2. At that point you would need to:

1. Turn the banner into a real consent gate with **Accept** and **Reject** buttons.
2. Only load the analytics/ad scripts *after* the user accepts.
3. Remember their choice and honour it.

Until then, you're clean, compliant, and refreshingly simple. Keep it that way as long as you can — "we don't track you" is a real trust advantage in a market full of sites that do.

---

_Last updated: 13 July 2026 — Umzila-AfriRoute / Vuna Marketplace_
