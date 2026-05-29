# Admin Dashboard — What Broke, Why, and How We Fixed It

This document explains everything that went wrong getting the Vuna admin dashboard to work. Written for reading in your own time — no assumed deep knowledge, just plain explanations.

---

## Background

The admin app (`apps/admin`) is a completely separate Next.js application that runs on port 3001. It shares the database with the main web app but has its own auth, its own pages, and its own `.env` file. That separation is what caused most of the problems below — things that "just worked" in the web app had never been set up for the admin app.

---

## Bug 1 — The Login Page Returned "doctype is not valid JSON"

### What happened
When you tried to log in, the browser showed an error in the terminal like:
> `SyntaxError: Unexpected token '<', "<!DOCTYPE ..."` is not valid JSON

### Why
NextAuth (the library that handles login) needs to register two API routes: one for `GET` requests and one for `POST` requests. These live at `/api/auth/[...nextauth]`.

In the old version of Next.js (called the **Pages Router**), NextAuth set up those routes automatically — you just imported it and it worked.

In the new version (called the **App Router**, which Vuna uses), **nothing is automatic**. You have to create the file yourself. Without that file, every login attempt hit a 404 "page not found" response. But instead of getting back JSON, Next.js returned a full HTML error page (which starts with `<!DOCTYPE html>`). The login code tried to read that HTML as JSON → crash.

### The fix
Created the missing file at:

```
apps/admin/src/app/api/auth/[...nextauth]/route.ts
```

Contents — 4 lines:

```ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

This tells Next.js: "when someone hits `/api/auth/anything`, hand it to NextAuth."

---

## Bug 2 — "Invalid credentials" Even With the Right Password

### What happened
After fixing Bug 1, the login form accepted the request but always returned "Invalid credentials" or "Access denied." The admin user existed in the database, the password was correct, but login still failed.

### Why — Part A: No `.env` file
Every Next.js app needs its own `.env` file. The main web app had one at `apps/web/.env`. Nobody had ever created `apps/admin/.env`.

Without it, three critical variables were `undefined`:
- `DATABASE_URL` — Prisma couldn't find the database
- `NEXTAUTH_SECRET` — NextAuth couldn't sign or verify login tokens
- `NEXTAUTH_URL` — NextAuth didn't know where it was running

### The fix for Part A
Created `apps/admin/.env`:

```
DATABASE_URL="postgresql://postgres:scholar123@localhost:5432/soko_db"
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="soko-secret-key-change-this-in-production"
```

> **Note:** The database is still called `soko_db` — it was built when the platform was called Soko. We rebranded to Vuna but didn't rename the database (it's just a name, it doesn't matter).

---

## Bug 3 — "SASL Authentication Error" (The Deep One)

This was the hardest bug. Even after creating the `.env` file, login still failed — this time with a PostgreSQL error about SASL authentication.

### What SASL means
SASL (Simple Authentication and Security Layer) is how PostgreSQL handles passwords. When it says "SASL error," it almost always means: **the connection had no password at all.**

### Why it happened

To understand this you need to know how JavaScript modules work.

When Next.js starts up, it loads all your code files. Every file with an `import` statement at the top gets loaded ("imported") immediately — before anything else runs. Including before Next.js has a chance to read your `.env` file.

Here is what the original `packages/db/src/index.ts` looked like:

```ts
// This ran immediately when the file was imported
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
export { prisma }
```

The problem: this code ran at **import time**, before Next.js loaded `apps/admin/.env`. So `process.env.DATABASE_URL` was `undefined`. The PostgreSQL connection was created with no connection string → no username, no password → PostgreSQL rejected it with a SASL error.

The confusing part was that the web app (`apps/web`) never had this problem. That's because `apps/web` loads its `.env` early in the process, before Prisma gets imported. The admin app's startup order was different — Prisma got imported first.

### Why earlier workarounds failed

We tried a few things that didn't work:

**Dynamic import:**
```ts
// Tried this — didn't help
const { prisma } = await import('@vuna/db')
```
Node.js caches modules. Even with `await import(...)`, if the module was already loaded (with a broken connection), you got the cached broken version back.

**Direct import from generated client:**
```ts
import { PrismaClient } from '@vuna/db/src/generated/prisma/client'
```
That path isn't exported by the package — it's internal. Build failed.

### The actual fix — Lazy Proxy

The real solution: **don't create the Prisma client at import time. Create it the first time something tries to use it.**

By that point, Next.js has fully loaded the `.env` file, so `DATABASE_URL` is available.

We did this using a JavaScript feature called a **Proxy** — it's an object that intercepts property access and runs custom code:

```ts
// packages/db/src/index.ts — the fixed version

let cachedClient: PrismaClientType | undefined

function getPrisma(): PrismaClientType {
  if (!cachedClient) {
    // Only runs when first USED — not when imported
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
    cachedClient = new PrismaClient({ adapter })
  }
  return cachedClient
}

// This is what every file imports as `prisma`
// It LOOKS like a Prisma client but it's actually a Proxy
export const prisma = new Proxy({} as PrismaClientType, {
  get(_target, prop) {
    // When someone writes `prisma.user`, this runs getPrisma() first
    return (getPrisma() as Record<string, unknown>)[prop as string]
  },
})
```

**In plain English:**

Before the fix, importing `@vuna/db` was like ordering a pizza the moment you open the app — the order goes in before you even know what you want, and the kitchen has no address yet.

After the fix, it's like having a placeholder. The order only goes to the kitchen when you say "I want pepperoni" — by which point the address is loaded.

The Proxy is the placeholder. Every other file in the codebase still writes `import { prisma } from '@vuna/db'` and uses it the same way — they never know the difference.

---

## Bug 4 — Route Paths Had Wrong Prefix

### What happened
Some navigation links and API calls in the admin app used paths like `/admin/dashboard` or `/api/admin/stats`.

### Why that's wrong
The admin app is a **standalone Next.js app**. Its URL is `http://localhost:3001`. There's no `/admin/` prefix — the app itself IS the admin. So routes are:
- `/dashboard` ✓ (not `/admin/dashboard`)
- `/sellers` ✓ (not `/admin/sellers`)
- `/api/stats` ✓ (not `/api/admin/stats`)

This confused navigation (links went to 404) and API calls (fetches returned 404 HTML instead of JSON).

### The fix
Updated all nav items in `AdminSidebar.tsx` and all `fetch()` calls in page components to use the correct paths.

---

## Bug 5 — TypeScript Error in Dynamic Route Handlers

### What happened
The file `apps/admin/src/app/api/sellers/[id]/route.ts` had a TypeScript type error.

### Why
Next.js 15 changed how dynamic route parameters are typed. The old way was:

```ts
// Old (Next.js 14 and earlier)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id  // immediate access
}
```

The new way (Next.js 15+):

```ts
// New (Next.js 15+) — params is now a Promise
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // must be awaited
}
```

This change was made by the Next.js team so route parameters can be resolved asynchronously.

### The fix
Updated all dynamic route handlers in the admin API to use the new `Promise<{ id: string }>` pattern and `await params`.

---

## Bug 6 — Admin User Didn't Exist in the Database

### What happened
Even with all the above fixed, login said "No account found with this email."

### Why
The database seed script (`packages/db/prisma/seed.ts`) didn't include an admin user — it only seeded seller/buyer test accounts. The seed `update` block was also empty (`update: {}`), so if the user existed with the wrong role, the seed was a no-op.

### The fix
Added the admin user to `seed.ts`:

```ts
await prisma.user.upsert({
  where:  { email: 'admin@vuna.co.za' },
  update: { role: 'ADMIN', isVerified: true },  // fixes role if wrong
  create: {
    id:         'user-admin',
    email:      'admin@vuna.co.za',
    name:       'Vuna Admin',
    password:   '$2b$10$...',  // bcrypt hash of 'VunaAdmin2026!'
    role:       'ADMIN',
    isVerified: true,
  },
})
```

Run with:
```
pnpm --filter @vuna/db db:seed
```

Admin login credentials:
- **Email:** `admin@vuna.co.za`
- **Password:** `VunaAdmin2026!`

---

## Summary Table

| # | Bug | Root Cause | Fix |
|---|-----|-----------|-----|
| 1 | "doctype is not valid JSON" on login | Missing `api/auth/[...nextauth]/route.ts` — required in App Router | Created the 4-line route handler file |
| 2 | "Invalid credentials" | No `apps/admin/.env` file — all env vars undefined | Created the `.env` file with DB URL, NextAuth secret, NextAuth URL |
| 3 | SASL authentication error | Prisma client created at import time before `.env` loaded → no `DATABASE_URL` | Wrapped Prisma in a lazy Proxy in `packages/db/src/index.ts` |
| 4 | 404 on navigation/API calls | Routes used `/admin/dashboard` prefix — admin app has no prefix | Updated all hrefs and fetch paths to use `/dashboard`, `/sellers`, etc. |
| 5 | TypeScript errors | Next.js 15 changed route params to `Promise<{id}>` | Updated all `[id]` route handlers to `await params` |
| 6 | "No account found" | Admin user not seeded | Added admin upsert to `seed.ts` |

---

## Key Things to Remember

**1. Each Next.js app needs its own `.env`**
`apps/web/.env` and `apps/admin/.env` are separate. Anything in one doesn't apply to the other.

**2. App Router is not Pages Router**
Old Next.js tutorials you find online are often for the Pages Router. In the App Router, nothing is automatic — API routes, auth handlers, layouts all need explicit files.

**3. The Prisma Proxy pattern**
`packages/db/src/index.ts` now exports a lazy client. This means it's safe to import `@vuna/db` in any app in the monorepo — the real database connection only happens when first used, by which point the right `.env` has been loaded.

**4. Next.js 15 route params are Promises**
Any `[id]` route handler must use `{ params: Promise<{ id: string }> }` and `await params`.
