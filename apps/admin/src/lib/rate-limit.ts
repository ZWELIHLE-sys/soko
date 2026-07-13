import { NextResponse } from 'next/server'

/**
 * In-memory fixed-window rate limiter.
 *
 * Sufficient for the single-instance pilot deployment. When Vuna scales to
 * multiple instances, swap the Map for a shared store (Redis / Upstash) —
 * the checkRateLimit() interface stays identical, only this file changes.
 */

interface Bucket { count: number; resetAt: number }

const store = new Map<string, Bucket>()
let lastSweep = Date.now()

// Drop expired buckets occasionally so the Map can't grow without bound
function sweep(now: number) {
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key)
  }
}

export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/**
 * Returns a 429 response if the caller has exceeded `limit` requests to
 * `bucket` within `windowMs`, otherwise null. Keyed by bucket + client IP.
 *
 *   const limited = checkRateLimit(req, 'login', 5, 60_000)
 *   if (limited) return limited
 */
export function checkRateLimit(
  req: Request,
  bucket: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const now = Date.now()
  sweep(now)

  const key = `${bucket}:${clientIp(req)}`
  const existing = store.get(key)

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  if (existing.count >= limit) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000)
    return NextResponse.json(
      { error: `Too many attempts. Please wait ${retryAfter} second${retryAfter !== 1 ? 's' : ''} and try again.` },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }

  existing.count += 1
  return null
}
