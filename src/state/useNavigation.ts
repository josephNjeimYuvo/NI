import { useCallback, useEffect, useState } from 'react'
import { asRecord, readStored, writeStored } from '@/lib/storage'
import type { ApplicationId } from '@/types'

const STORAGE_KEY = 'nav'

/**
 * The parts of the navigation worth carrying across a reload: which
 * application is selected, and whether the sidebar is a rail.
 *
 * Everything else here — the flyout, the filter, full screen, which
 * categories happen to be open — is a response to what the user is doing
 * right now, and restoring it would be restoring their last gesture rather
 * than their place.
 */
interface StoredNavigation {
  selectedApp: ApplicationId
  collapsed: boolean
}

function parseNavigation(raw: unknown): StoredNavigation | null {
  const record = asRecord(raw)
  if (!record || typeof record.selectedApp !== 'string') return null
  return { selectedApp: record.selectedApp, collapsed: record.collapsed === true }
}

/**
 * The two pseudo-sections pinned above the module categories in the sidebar.
 * They behave like categories but draw from session state rather than the
 * catalog.
 */
export type TopSection = 'favorites' | 'recent'

/** What the rail flyout is currently showing. */
export type FlyoutTarget = ApplicationId | TopSection | null

export interface NavigationState {
  /** Application whose modules the main menu is showing. */
  selectedApp: ApplicationId
  selectApp: (id: ApplicationId) => void

  /** Module card expanded on the main menu, if any. */
  expandedCard: string | null
  toggleCard: (label: string) => void
  clearExpandedCard: () => void

  collapsed: boolean
  toggleCollapsed: (categoryToOpen?: ApplicationId) => void
  expand: () => void

  /** Expansion state of each module category in the sidebar. */
  openCategories: Record<string, boolean>
  toggleCategory: (id: ApplicationId) => void
  openCategory: (id: ApplicationId) => void

  /**
   * Vendors are open by default, so this tracks the ones explicitly closed
   * rather than the ones open.
   */
  closedVendors: Record<string, boolean>
  toggleVendor: (key: string) => void

  /** Expansion state of the pinned sections above the categories. */
  openSections: Record<TopSection, boolean>
  toggleSection: (section: TopSection) => void
  openSection: (section: TopSection) => void

  flyout: FlyoutTarget
  /** Vertical offset of the flyout, aligned to the rail button that opened it. */
  flyoutTop: number
  toggleFlyout: (target: Exclude<FlyoutTarget, null>, anchorTop: number) => void
  closeFlyout: () => void

  /** Full-screen mode hides the sidebar and top bar around the active module. */
  fullscreen: boolean
  toggleFullscreen: () => void
  exitFullscreen: () => void

  /** Free-text filter narrowing the sidebar's module tree. */
  filter: string
  setFilter: (value: string) => void
  clearFilter: () => void
}

/** Keeps the flyout on screen regardless of where its rail button sits. */
function clampFlyoutTop(anchorTop: number): number {
  const FLYOUT_HEIGHT = 380
  const MARGIN = 12
  return Math.min(Math.max(MARGIN, anchorTop), Math.max(MARGIN, window.innerHeight - FLYOUT_HEIGHT))
}

/** Sidebar, rail, flyout and main-menu selection state. */
export function useNavigation(initialApp: ApplicationId = 'ran'): NavigationState {
  const [restored] = useState(() => readStored(STORAGE_KEY, parseNavigation))
  const startingApp = restored?.selectedApp ?? initialApp

  const [selectedApp, setSelectedApp] = useState<ApplicationId>(startingApp)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(restored?.collapsed ?? true)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    [startingApp]: true,
  })
  const [closedVendors, setClosedVendors] = useState<Record<string, boolean>>({})
  const [openSections, setOpenSections] = useState<Record<TopSection, boolean>>({
    favorites: true,
    recent: false,
  })
  const [flyout, setFlyout] = useState<FlyoutTarget>(null)
  const [flyoutTop, setFlyoutTop] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    writeStored(STORAGE_KEY, { selectedApp, collapsed })
  }, [selectedApp, collapsed])

  const selectApp = useCallback((id: ApplicationId) => {
    setSelectedApp(id)
    setExpandedCard(null)
  }, [])

  const toggleCard = useCallback((label: string) => {
    setExpandedCard((current) => (current === label ? null : label))
  }, [])

  const clearExpandedCard = useCallback(() => setExpandedCard(null), [])

  const toggleCategory = useCallback((id: ApplicationId) => {
    setSelectedApp(id)
    setOpenCategories((current) => ({ ...current, [id]: !current[id] }))
  }, [])

  const openCategory = useCallback((id: ApplicationId) => {
    setOpenCategories((current) => ({ ...current, [id]: true }))
  }, [])

  const toggleCollapsed = useCallback((categoryToOpen?: ApplicationId) => {
    setCollapsed((current) => {
      // Expanding the sidebar reveals the category the user is working in.
      if (current && categoryToOpen) {
        setOpenCategories((categories) => ({ ...categories, [categoryToOpen]: true }))
      }
      return !current
    })
    setFlyout(null)
  }, [])

  const expand = useCallback(() => {
    setCollapsed(false)
    setFlyout(null)
  }, [])

  const toggleVendor = useCallback((key: string) => {
    setClosedVendors((current) => ({ ...current, [key]: !current[key] }))
  }, [])

  const toggleSection = useCallback((section: TopSection) => {
    setOpenSections((current) => ({ ...current, [section]: !current[section] }))
  }, [])

  const openSection = useCallback((section: TopSection) => {
    setOpenSections((current) => ({ ...current, [section]: true }))
  }, [])

  const toggleFlyout = useCallback(
    (target: Exclude<FlyoutTarget, null>, anchorTop: number) => {
      setFlyout((current) => (current === target ? null : target))
      setFlyoutTop(clampFlyoutTop(anchorTop))
    },
    [],
  )

  const closeFlyout = useCallback(() => setFlyout(null), [])

  const toggleFullscreen = useCallback(() => {
    setFullscreen((current) => !current)
    setFlyout(null)
  }, [])

  const exitFullscreen = useCallback(() => setFullscreen(false), [])
  const clearFilter = useCallback(() => setFilter(''), [])

  return {
    selectedApp,
    selectApp,
    expandedCard,
    toggleCard,
    clearExpandedCard,
    collapsed,
    toggleCollapsed,
    expand,
    openCategories,
    toggleCategory,
    openCategory,
    closedVendors,
    toggleVendor,
    openSections,
    toggleSection,
    openSection,
    flyout,
    flyoutTop,
    toggleFlyout,
    closeFlyout,
    fullscreen,
    toggleFullscreen,
    exitFullscreen,
    filter,
    setFilter,
    clearFilter,
  }
}
