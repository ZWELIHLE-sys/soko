import { NextResponse } from 'next/server'

/**
 * Dependency-free input validation for API route bodies.
 *
 * Each validator returns a clean value or throws ValidationError. Wrap a
 * route body in try/catch and use validationError(err) to turn a thrown
 * ValidationError into a 400 (and re-throw anything else):
 *
 *   try {
 *     const email = vEmail(body.email)
 *     const qty   = vNumber(body.quantity, 'Quantity', { int: true, min: 1 })
 *   } catch (err) {
 *     const bad = validationError(err); if (bad) return bad
 *     throw err
 *   }
 */

export class ValidationError extends Error {}

export function vString(
  value: unknown,
  label: string,
  opts: { min?: number; max?: number } = {},
): string {
  if (typeof value !== 'string') throw new ValidationError(`${label} is required.`)
  const v = value.trim()
  const min = opts.min ?? 1
  if (v.length < min) {
    throw new ValidationError(
      min === 1 ? `${label} is required.` : `${label} must be at least ${min} characters.`,
    )
  }
  if (opts.max != null && v.length > opts.max) {
    throw new ValidationError(`${label} must be ${opts.max} characters or less.`)
  }
  return v
}

export function vOptionalString(value: unknown, label: string, max = 500): string | null {
  if (value == null || value === '') return null
  return vString(value, label, { max })
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function vEmail(value: unknown): string {
  const v = vString(value, 'Email', { max: 254 }).toLowerCase()
  if (!EMAIL_RE.test(v)) throw new ValidationError('Please enter a valid email address.')
  return v
}

export function vPassword(value: unknown): string {
  if (typeof value !== 'string') throw new ValidationError('Password is required.')
  if (value.length < 8) throw new ValidationError('Password must be at least 8 characters.')
  if (value.length > 200) throw new ValidationError('Password is too long.')
  return value
}

export function vNumber(
  value: unknown,
  label: string,
  opts: { min?: number; max?: number; int?: boolean } = {},
): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) throw new ValidationError(`${label} must be a number.`)
  if (opts.int && !Number.isInteger(n)) throw new ValidationError(`${label} must be a whole number.`)
  if (opts.min != null && n < opts.min) throw new ValidationError(`${label} must be at least ${opts.min}.`)
  if (opts.max != null && n > opts.max) throw new ValidationError(`${label} must be ${opts.max} or less.`)
  return n
}

// IDs are opaque cuids in this codebase — just bound the length to stop abuse
export function vId(value: unknown, label = 'Identifier'): string {
  return vString(value, label, { max: 64 })
}

export function vEnum<T extends string>(value: unknown, allowed: readonly T[], label: string): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new ValidationError(`${label} is invalid.`)
  }
  return value as T
}

/** Turns a thrown ValidationError into a 400 response; returns null otherwise. */
export function validationError(err: unknown): NextResponse | null {
  if (err instanceof ValidationError) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
  return null
}
