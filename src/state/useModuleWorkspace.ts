import { useCallback, useEffect, useState } from 'react'
import { services } from '@/services'
import { EMPTY_KPIS, MANAGED_OBJECT, TOTAL_ITEMS } from '@/data/moduleData'
import type { GridLevel, ModuleWorkspaceData } from '@/types'

const EMPTY_WORKSPACE: ModuleWorkspaceData = {
  rows: [],
  kpis: EMPTY_KPIS,
  managedObject: MANAGED_OBJECT.empty,
  totalItems: TOTAL_ITEMS,
}

export interface ModuleWorkspaceState {
  sitesSelected: boolean
  toggleSites: () => void
  level: GridLevel
  setLevel: (level: GridLevel) => void
  data: ModuleWorkspaceData

  /** "Technical details" disclosure on the module error screen. */
  detailsOpen: boolean
  toggleDetails: () => void
  /** True briefly after copying the correlation ID, to confirm the copy. */
  copied: boolean
  copyCorrelationId: (value: string) => void

  /** Clears filters and disclosures, for when a new module is opened. */
  reset: () => void
}

/** How long the "Copied" confirmation stays on the button, in ms. */
const COPY_FEEDBACK_MS = 1600

/**
 * The filter state of the module workspace and the data it produces.
 * Data is re-fetched whenever the filter changes.
 */
export function useModuleWorkspace(): ModuleWorkspaceState {
  const [sitesSelected, setSitesSelected] = useState(false)
  const [level, setLevel] = useState<GridLevel>('Cell')
  const [data, setData] = useState<ModuleWorkspaceData>(EMPTY_WORKSPACE)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    void services.modules.getWorkspaceData({ sitesSelected, level }).then((next) => {
      if (active) setData(next)
    })
    return () => {
      active = false
    }
  }, [sitesSelected, level])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
    return () => clearTimeout(timer)
  }, [copied])

  const toggleSites = useCallback(() => setSitesSelected((current) => !current), [])
  const toggleDetails = useCallback(() => setDetailsOpen((current) => !current), [])

  const copyCorrelationId = useCallback((value: string) => {
    // Clipboard access can be denied; the confirmation is shown either way
    // because the ID is visible on screen for manual copying.
    void navigator.clipboard?.writeText(value).catch(() => undefined)
    setCopied(true)
  }, [])

  const reset = useCallback(() => {
    setSitesSelected(false)
    setDetailsOpen(false)
    setCopied(false)
  }, [])

  return {
    sitesSelected,
    toggleSites,
    level,
    setLevel,
    data,
    detailsOpen,
    toggleDetails,
    copied,
    copyCorrelationId,
    reset,
  }
}
