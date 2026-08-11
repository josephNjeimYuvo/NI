import { useCallback, useEffect, useRef, useState } from 'react'
import { services } from '@/services'
import type { Catalog, Tab } from '@/types'
import { applicationOfModule } from '@/lib/catalog'

interface TabBook {
  tabs: Tab[]
  activeId: string | null
}

export interface TabsState {
  tabs: Tab[]
  activeTabId: string | null
  activeTab: Tab | null
  /** Load progress, 0–100, for the module currently coming up. */
  progress: number
  openTab: (moduleName: string) => void
  closeTab: (id: string) => void
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
  const mounted = useRef(true)

  useEffect(
    () => () => {
      mounted.current = false
    },
    [],
  )

  const openTab = useCallback(
    (moduleName: string) => {
      if (!catalog) return

      const owningApp = applicationOfModule(catalog, moduleName).label
      setBook((current) => ({
        tabs: current.tabs.some((tab) => tab.id === moduleName)
          ? current.tabs.map((tab) =>
              tab.id === moduleName ? { ...tab, status: 'loading' as const } : tab,
            )
          : [
              ...current.tabs,
              { id: moduleName, label: moduleName, app: owningApp, status: 'loading' as const },
            ],
        activeId: moduleName,
      }))
      setProgress(0)

      const token = ++loadToken.current
      void services.modules
        .load(moduleName, (percent) => {
          if (mounted.current && loadToken.current === token) setProgress(percent)
        })
        .then((result) => {
          if (!mounted.current || loadToken.current !== token) return
          setBook((current) => ({
            ...current,
            tabs: current.tabs.map((tab) =>
              tab.id === moduleName ? { ...tab, status: result.status } : tab,
            ),
          }))
        })
    },
    [catalog],
  )

  const closeTab = useCallback((id: string) => {
    setBook((current) => {
      const tabs = current.tabs.filter((tab) => tab.id !== id)
      // Closing the active tab falls back to the most recently opened one.
      const activeId = current.activeId === id ? (tabs.at(-1)?.id ?? null) : current.activeId
      return { tabs, activeId }
    })
  }, [])

  const selectTab = useCallback((id: string | null) => {
    setBook((current) => ({ ...current, activeId: id }))
  }, [])

  const closeAll = useCallback(() => {
    // Invalidate any in-flight load so it cannot resurrect a closed tab.
    loadToken.current++
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
    selectTab,
    closeAll,
  }
}
