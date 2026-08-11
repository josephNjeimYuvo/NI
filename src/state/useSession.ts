import { useCallback, useState } from 'react'
import { services } from '@/services'
import { AuthError } from '@/services'
import type { Credentials, RecentEntry, Session } from '@/types'

/** How many recently-opened modules to remember. */
const RECENT_LIMIT = 24

export interface SessionState {
  session: Session | null
  authenticated: boolean
  /** Message from the last failed sign-in, cleared as soon as input changes. */
  error: string | null
  signIn: (credentials: Credentials) => Promise<boolean>
  signOut: () => void
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
 */
export function useSession(): SessionState {
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const signOut = useCallback(() => {
    void services.auth.signOut()
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
