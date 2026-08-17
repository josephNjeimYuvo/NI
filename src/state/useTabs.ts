import { useCallback, useEffect, useRef, useState } from 'react'
import { services } from '@/services'
import type { Catalog, Tab } from '@/types'
import { applicationOfModule } from '@/lib/catalog'
import { asRecord, asStringArray, readStored, writeStored } from '@/lib/storage'

interface TabBook {
  tabs: Tab[]
  activeId: string | null
}

const STORAGE_KEY = 'tabs'

/** Module names and the selection, which is all a tab strip really is. */
interface StoredTabs {
  tabs: string[]
  activeId: string | null
}

function parseTabs(raw: unknown): StoredTabs | null {
  const record = asRecord(raw)
  const tabs = record && asStringArray(record.tabs)
  if (!tabs) return null

  const activeId = typeof record.activeId === 'string' ? record.activeId : null
  return { tabs, activeId: activeId && tabs.includes(activeId) ? activeId : null }
}

export interface TabsState {
  tabs: Tab[]
  activeTabId: string | null
  activeTab: Tab | null
  /** Load progress, 0–100, for the module currently coming up. */
  progress: number
  openTab: (moduleName: string) => void
  closeTab: (id: string) => void
  /** Closes everything except the named tab, which becomes active. */
  closeOthers: (id: string) => void
  /** Closes every tab positioned after the named one. */
  closeToTheRight: (id: string) => void
  /** Passing `null` deselects without closing anything, showing the main menu. */
  selectTab: (id: string | null) => void
  closeAll: () => void
}

/**
 * Open module tabs.
 *
 * A module opens at most once — re-opening an existing tab puts it back into
 * `loading` rather than adding a duplicate. Each open supersedes the previous
 * one, so a fast sequence of clicks only ever settles the newest request.
 *
 * Tabs and the active selection live in one state object because closing a tab
 * has to move the selection in the same commit.
 */
export function useTabs(catalog: Catalog | null): TabsState {
  const [book, setBook] = useState<TabBook>({ tabs: [], activeId: null })
  const [progress, setProgress] = useState(0)

  /**
   * Identifies the in-flight load. A load that is no longer current when it
   * resolves is discarded, which stops a slow earlier request from
   * overwriting the state of a newer one.
   */
  const loadToken = useRef(0)
  /** Which module that in-flight load is for, if any. */
  const inFlight = useRef<string | null>(null)
  const mounted = useRef(true)

  // Read once, so a write from this session cannot feed back into the restore.
  const stored = useRef(readStored(STORAGE_KEY, parseTabs))
  const hydrated = useRef(false)
  const bookRef = useRef(book)
  bookRef.current = book

  useEffect(
    () => () => {
      mounted.current = false
    },
    [],
  )

  const loadModule = useCallback((moduleName: string) => {
    const token = ++loadToken.current
    inFlight.current = moduleName
    setProgress(0)

    void services.modules
      .load(moduleName, (percent) => {
        if (mounted.current && loadToken.current === token) setProgress(percent)
      })
      .then((result) => {
        if (!mounted.current || loadToken.current !== token) return
        inFlight.current = null
        setBook((current) => ({
          ...current,
          tabs: current.tabs.map((tab) => {
            if (tab.id !== moduleName) return tab
            const failed = result.status === 'error'
            return {
              ...tab,
              status: result.status,
              failure: result.failure,
              // Counts consecutive failures, so the error screen can back
              // off a retry that has already been tried. Coming up clears
              // it — the next failure starts a fresh run.
              failedAttempts: failed ? tab.failedAttempts + 1 : 0,
            }
          }),
        }))
      })
  }, [])

  const openTab = useCallback(
    (moduleName: string) => {
      if (!catalog) return

      const owningApp = applicationOfModule(catalog, moduleName).label
      setBook((current) => ({
        // Re-opening drops the previous failure: the screen behind the splash
        // must not still be describing the attempt before this one.
        tabs: current.tabs.some((tab) => tab.id === moduleName)
          ? current.tabs.map((tab) =>
              tab.id === moduleName
                ? { ...tab, status: 'loading' as const, failure: undefined }
                : tab,
            )
          : [
              ...current.tabs,
              {
                id: moduleName,
                label: moduleName,
                app: owningApp,
                status: 'loading' as const,
                failedAttempts: 0,
              },
            ],
        activeId: moduleName,
      }))

      loadModule(moduleName)
    },
    [catalog, loadModule],
  )

  /**
   * Puts the strip back after a reload.
   *
   * Only the names and the selection are stored, because a tab's contents
   * belong to the page that fetched them. The tabs therefore come back in
   * `loading` and only the one being looked at is fetched — restoring nine
   * tabs must not fire nine requests for screens nobody is reading.
   */
  useEffect(() => {
    if (!catalog || hydrated.current) return
    hydrated.current = true

    const restore = stored.current
    if (!restore || restore.tabs.length === 0) return

    setBook({
      tabs: restore.tabs.map((name) => ({
        id: name,
        label: name,
        app: applicationOfModule(catalog, name).label,
        status: 'loading' as const,
        failedAttempts: 0,
      })),
      activeId: restore.activeId,
    })

    if (restore.activeId) loadModule(restore.activeId)
  }, [catalog, loadModule])

  // Held back until the restore has run, so an empty first render cannot
  // erase the strip it is about to put back.
  useEffect(() => {
    if (!hydrated.current) return
    writeStored(STORAGE_KEY, {
      tabs: book.tabs.map((tab) => tab.id),
      activeId: book.activeId,
    })
  }, [book])

  const closeTab = useCallback((id: string) => {
    setBook((current) => {
      const tabs = current.tabs.filter((tab) => tab.id !== id)
      // Closing the active tab falls back to the most recently opened one.
      const activeId = current.activeId === id ? (tabs.at(-1)?.id ?? null) : current.activeId
      return { tabs, activeId }
    })
  }, [])

  const closeOthers = useCallback((id: string) => {
    setBook((current) => {
      const kept = current.tabs.filter((tab) => tab.id === id)
      return { tabs: kept, activeId: kept.length ? id : null }
    })
  }, [])

  const closeToTheRight = useCallback((id: string) => {
    setBook((current) => {
      const index = current.tabs.findIndex((tab) => tab.id === id)
      if (index === -1) return current
      const tabs = current.tabs.slice(0, index + 1)
      // If the active tab was one of the closed ones, fall back to the
      // anchor tab rather than leaving nothing selected.
      const activeId = tabs.some((tab) => tab.id === current.activeId) ? current.activeId : id
      return { tabs, activeId }
    })
  }, [])

  const selectTab = useCallback(
    (id: string | null) => {
      setBook((current) => ({ ...current, activeId: id }))
      if (id === null) return

      // A tab restored from a previous page has no contents yet, so the first
      // time it is looked at is the first time it is actually loaded.
      const tab = bookRef.current.tabs.find((entry) => entry.id === id)
      if (tab?.status === 'loading' && inFlight.current !== id) loadModule(id)
    },
    [loadModule],
  )

  const closeAll = useCallback(() => {
    // Invalidate any in-flight load so it cannot resurrect a closed tab.
    loadToken.current++
    inFlight.current = null
    setBook({ tabs: [], activeId: null })
  }, [])

  const activeTab = book.tabs.find((tab) => tab.id === book.activeId) ?? null

  return {
    tabs: book.tabs,
    activeTabId: book.activeId,
    activeTab,
    progress,
    openTab,
    closeTab,
    closeOthers,
    closeToTheRight,
    selectTab,
    closeAll,
  }
}
