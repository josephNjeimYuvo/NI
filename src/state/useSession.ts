import { useCallback, useEffect, useState } from 'react'
import { services } from '@/services'
import { AuthError } from '@/services'
import { asRecord, asStringArray, clearStored, readStored, writeStored } from '@/lib/storage'
import type { Credentials, RecentEntry, Session } from '@/types'

/** How many recently-opened modules to remember. */
const RECENT_LIMIT = 24

const STORAGE_KEY = 'session'

/**
 * Rebuilds a stored session, or rejects it.
 *
 * A user and a favorites list are the parts the app cannot invent; recent
 * history is nice to have, so a stored blob missing it is still usable and
 * simply comes back empty.
 */
function parseSession(raw: unknown): Session | null {
  const record = asRecord(raw)
  const user = record && asRecord(record.user)
  if (!user || typeof user.name !== 'string' || typeof user.email !== 'string') return null

  const favorites = asStringArray(record.favorites)
  if (!favorites) return null

  const recent = Array.isArray(record.recent)
    ? record.recent.filter((entry): entry is RecentEntry => {
        const item = asRecord(entry)
        return typeof item?.name === 'string' && typeof item.timestamp === 'number'
      })
    : []

  return { user: { name: user.name, email: user.email }, favorites, recent }
}

export interface SessionState {
  session: Session | null
  authenticated: boolean
  /**
   * True when this session came back from storage rather than from a
   * sign-in. The app skips the arrival splash in that case — a reload is not
   * an arrival.
   */
  restored: boolean
  /** Message from the last failed sign-in, cleared as soon as input changes. */
  error: string | null
  signIn: (credentials: Credentials) => Promise<boolean>
  /** Revokes the session server-side, then drops it locally. */
  signOut: () => Promise<void>
  clearError: () => void

  favorites: string[]
  /** Adds to favorites if absent. Returns false when it was already pinned. */
  addFavorite: (name: string) => boolean
  removeFavorite: (name: string) => void
  reorderFavorites: (from: number, to: number) => void

  recent: RecentEntry[]
  recordVisit: (name: string) => void
}

/**
 * The signed-in session and everything scoped to it: who is signed in, which
 * modules they pinned, and what they opened recently.
 *
 * The session survives a reload, so refreshing the page does not throw the
 * user back to the sign-in form. Favorites and history ride along with it,
 * because they belong to the session rather than to the page. A real
 * deployment would keep a token here and re-validate it against the server on
 * boot; against fixtures there is nothing to validate, so the stored session
 * is trusted as-is.
 */
export function useSession(): SessionState {
  const [session, setSession] = useState<Session | null>(() =>
    readStored(STORAGE_KEY, parseSession),
  )
  const [error, setError] = useState<string | null>(null)
  // Captured once, before anything can sign in or out over the top of it.
  const [restored] = useState(() => session !== null)

  // Mirrors every change back to storage — including favorites and history,
  // which are edited through `updateSession` rather than through sign-in.
  useEffect(() => {
    if (session) writeStored(STORAGE_KEY, session)
    else clearStored(STORAGE_KEY)
  }, [session])

  const signIn = useCallback(async (credentials: Credentials): Promise<boolean> => {
    try {
      const next = await services.auth.signIn(credentials)
      setSession(next)
      setError(null)
      return true
    } catch (cause) {
      setError(
        cause instanceof AuthError ? cause.message : 'Sign-in failed. Please try again.',
      )
      return false
    }
  }, [])

  const signOut = useCallback(async () => {
    await services.auth.signOut()
    setSession(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const updateSession = useCallback((update: (current: Session) => Session) => {
    setSession((current) => (current ? update(current) : current))
  }, [])

  const addFavorite = useCallback(
    (name: string): boolean => {
      const alreadyPinned = session?.favorites.includes(name) ?? false
      if (!alreadyPinned) {
        updateSession((current) => ({ ...current, favorites: [name, ...current.favorites] }))
      }
      return !alreadyPinned
    },
    [session, updateSession],
  )

  const removeFavorite = useCallback(
    (name: string) => {
      updateSession((current) => ({
        ...current,
        favorites: current.favorites.filter((favorite) => favorite !== name),
      }))
    },
    [updateSession],
  )

  const reorderFavorites = useCallback(
    (from: number, to: number) => {
      if (from === to) return
      updateSession((current) => {
        const favorites = [...current.favorites]
        const [moved] = favorites.splice(from, 1)
        if (moved === undefined) return current
        favorites.splice(to, 0, moved)
        return { ...current, favorites }
      })
    },
    [updateSession],
  )

  const recordVisit = useCallback(
    (name: string) => {
      updateSession((current) => ({
        ...current,
        recent: [{ name, timestamp: Date.now() }, ...current.recent.filter((r) => r.name !== name)].slice(
          0,
          RECENT_LIMIT,
        ),
      }))
    },
    [updateSession],
  )

  return {
    session,
    authenticated: session !== null,
    restored,
    error,
    signIn,
    signOut,
    clearError,
    favorites: session?.favorites ?? [],
    addFavorite,
    removeFavorite,
    reorderFavorites,
    recent: session?.recent ?? [],
    recordVisit,
  }
}
