import { useCallback, useEffect, useRef, useState } from 'react'
import { services } from '@/services'
import { TrendUnavailableError } from '@/services'
import { EMPTY_KPIS, MANAGED_OBJECT, METRICS, PAGE_SIZE } from '@/data/moduleData'
import type {
  GridLevel,
  GridSort,
  ModuleWorkspaceData,
  Site,
  SortDirection,
  TrendSeries,
} from '@/types'

const EMPTY_WORKSPACE: ModuleWorkspaceData = {
  rows: [],
  kpis: EMPTY_KPIS,
  managedObject: MANAGED_OBJECT.empty,
  totalItems: 0,
  totalPages: 0,
  updatedAt: 0,
}

/** How long the "Copied" confirmation stays on the button, in ms. */
const COPY_FEEDBACK_MS = 1600

export type TrendStatus = 'loading' | 'ready' | 'failed'

export interface ModuleWorkspaceState {
  /** Sites available to pick from. */
  sites: Site[]
  /** Site codes currently in scope. */
  selectedSites: string[]
  toggleSite: (id: string) => void
  selectAllSites: () => void
  clearSites: () => void

  metrics: string[]
  metric: string
  setMetric: (metric: string) => void

  level: GridLevel
  setLevel: (level: GridLevel) => void

  page: number
  setPage: (page: number) => void
  sort: GridSort | null
  /** Cycles a column through ascending, descending, then unsorted. */
  toggleSort: (column: string) => void

  data: ModuleWorkspaceData
  loading: boolean
  /** Re-fetches the current page without changing any filter. */
  refresh: () => void

  trend: TrendSeries | null
  trendStatus: TrendStatus
  retryTrend: () => void

  /** "Technical details" disclosure on the module error screen. */
  detailsOpen: boolean
  toggleDetails: () => void
  /** True briefly after copying, to confirm it happened. */
  copied: boolean
  copyToClipboard: (value: string) => void

  /** Clears filters and disclosures, for when a new module is opened. */
  reset: () => void
}

/**
 * Filter state for the module workspace and the data it produces.
 *
 * Filtering, sorting and paging are all sent to the service rather than
 * applied to a local array, so the component behaves the same once a real
 * backend is answering.
 */
export function useModuleWorkspace(moduleName: string | null): ModuleWorkspaceState {
  const [sites, setSites] = useState<Site[]>([])
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [metrics, setMetrics] = useState<string[]>(METRICS)
  const [metric, setMetric] = useState<string>(METRICS[0]!)
  const [level, setLevelValue] = useState<GridLevel>('Cell')
  const [page, setPageValue] = useState(0)
  const [sort, setSort] = useState<GridSort | null>(null)

  const [data, setData] = useState<ModuleWorkspaceData>(EMPTY_WORKSPACE)
  const [loading, setLoading] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  const [trend, setTrend] = useState<TrendSeries | null>(null)
  const [trendStatus, setTrendStatus] = useState<TrendStatus>('loading')
  const [trendToken, setTrendToken] = useState(0)

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    void Promise.all([services.modules.listSites(), services.modules.listMetrics()]).then(
      ([loadedSites, loadedMetrics]) => {
        if (!active) return
        setSites(loadedSites)
        setMetrics(loadedMetrics)
      },
    )
    return () => {
      active = false
    }
  }, [])

  // Identifies the in-flight request, so a slow earlier one cannot overwrite
  // the result of a newer filter.
  const requestToken = useRef(0)

  useEffect(() => {
    const token = ++requestToken.current
    setLoading(true)
    void services.modules
      .getWorkspaceData({ sites: selectedSites, level, page, pageSize: PAGE_SIZE, sort })
      .then((next) => {
        if (requestToken.current !== token) return
        setData(next)
        setLoading(false)
      })
  }, [selectedSites, level, page, sort, reloadToken])

  useEffect(() => {
    if (!moduleName) return
    let active = true
    setTrendStatus('loading')
    setTrend(null)
    void services.modules
      .getTrend(moduleName, metric)
      .then((series) => {
        if (!active) return
        setTrend(series)
        setTrendStatus('ready')
      })
      .catch((cause) => {
        if (!active) return
        // Anything unexpected is still a widget-level failure: the rest of
        // the workspace is fine and the user can retry just this piece.
        if (!(cause instanceof TrendUnavailableError)) console.error(cause)
        setTrendStatus('failed')
      })
    return () => {
      active = false
    }
  }, [moduleName, metric, trendToken])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
    return () => clearTimeout(timer)
  }, [copied])

  /** Any filter change invalidates the current page number. */
  const toggleSite = useCallback((id: string) => {
    setPageValue(0)
    setSelectedSites((current) =>
      current.includes(id) ? current.filter((site) => site !== id) : [...current, id],
    )
  }, [])

  const selectAllSites = useCallback(() => {
    setPageValue(0)
    setSelectedSites(sites.map((site) => site.id))
  }, [sites])

  const clearSites = useCallback(() => {
    setPageValue(0)
    setSelectedSites([])
  }, [])

  const setLevel = useCallback((next: GridLevel) => {
    setPageValue(0)
    setLevelValue(next)
  }, [])

  const setPage = useCallback((next: number) => setPageValue(Math.max(0, next)), [])

  const toggleSort = useCallback((column: string) => {
    setPageValue(0)
    setSort((current) => {
      if (current?.column !== column) return { column, direction: 'asc' as SortDirection }
      // Third click clears the sort rather than looping back to ascending,
      // so the unsorted order stays reachable.
      if (current.direction === 'asc') return { column, direction: 'desc' }
      return null
    })
  }, [])

  const refresh = useCallback(() => setReloadToken((n) => n + 1), [])
  const retryTrend = useCallback(() => setTrendToken((n) => n + 1), [])
  const toggleDetails = useCallback(() => setDetailsOpen((current) => !current), [])

  const copyToClipboard = useCallback((value: string) => {
    // Clipboard access can be denied; the confirmation shows either way
    // because the value is on screen for manual copying.
    void navigator.clipboard?.writeText(value).catch(() => undefined)
    setCopied(true)
  }, [])

  const reset = useCallback(() => {
    setSelectedSites([])
    setPageValue(0)
    setSort(null)
    setDetailsOpen(false)
    setCopied(false)
  }, [])

  return {
    sites,
    selectedSites,
    toggleSite,
    selectAllSites,
    clearSites,
    metrics,
    metric,
    setMetric,
    level,
    setLevel,
    page,
    setPage,
    sort,
    toggleSort,
    data,
    loading,
    refresh,
    trend,
    trendStatus,
    retryTrend,
    detailsOpen,
    toggleDetails,
    copied,
    copyToClipboard,
    reset,
  }
}
