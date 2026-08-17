/**
 * Persistence for the slices that should survive a page reload.
 *
 * Everything here is best-effort. `localStorage` throws in private modes and
 * when cookies are blocked, and anything already stored may have been written
 * by an older build with a different shape — so every read is validated by
 * its caller and every failure falls back to the in-memory default rather
 * than surfacing.
 */

const PREFIX = 'ni.'

/**
 * Reads and validates a stored value.
 *
 * `parse` is the caller's shape check: return the value when it is usable and
 * `null` when it is not. Storage from an older build is therefore ignored
 * rather than being fed into the app half-formed, which is what makes it safe
 * to change these shapes without a migration.
 */
export function readStored<T>(key: string, parse: (raw: unknown) => T | null): T | null {
  try {
    const stored = localStorage.getItem(PREFIX + key)
    if (stored === null) return null
    return parse(JSON.parse(stored) as unknown)
  } catch {
    return null
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Quota, private mode, blocked cookies — none of which the user needs
    // telling about for a convenience feature.
  }
}

export function clearStored(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    // As above.
  }
}

/** Narrows an unknown parsed value to a plain object. */
export function asRecord(raw: unknown): Record<string, unknown> | null {
  return typeof raw === 'object' && raw !== null && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : null
}

/** Narrows an unknown parsed value to an array of strings. */
export function asStringArray(raw: unknown): string[] | null {
  return Array.isArray(raw) && raw.every((item) => typeof item === 'string')
    ? (raw as string[])
    : null
}
