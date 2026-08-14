import {
  APPLICATIONS,
  FAILING_MODULES,
  NAVIGATION,
  NORMAL_MODE_APPS,
} from '@/data/catalog'
import {
  AUDIT_ROWS,
  EMPTY_KPIS,
  FAILING_TREND_MODULES,
  MANAGED_OBJECT,
  METRICS,
  POPULATED_KPIS,
  SITES,
  buildTrend,
} from '@/data/moduleData'
import { NOTIFICATIONS } from '@/data/notifications'
import { buildDefaultSession } from '@/data/session'
import type {
  AppNotification,
  AuditRow,
  Catalog,
  Credentials,
  ModuleDataFilter,
  ModuleFailure,
  ModuleFailureKind,
  ModuleLoadResult,
  ModuleWorkspaceData,
  Session,
  Site,
  TrendSeries,
} from '@/types'
import { AuthError, TrendUnavailableError, type Services } from '../contracts'

/** How long a module takes to come up, in ms. */
const MODULE_LOAD_MS = 1500

/** How often load progress is reported, in ms. */
const PROGRESS_TICK_MS = 60

/**
 * Modules that time out transiently, and how many opens they fail before
 * coming up. Unlike the catalog's `failingModules` this is not something a
 * backend would ever declare about itself — it lives here because it is
 * fixture behaviour, standing in for a service that is briefly unwell.
 *
 * Two failures rather than one, so the failure screen's back-off is
 * reachable: the first retry is free, the second is held briefly, and the
 * third succeeds.
 */
const FLAKY_MODULES: Record<string, number> = {
  'Interference Map': 2,
}

/** Opens spent against each flaky module's budget, for this page load. */
const flakyOpens = new Map<string, number>()

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const mockAuth = {
  async signIn(credentials: Credentials): Promise<Session> {
    if (!credentials.email.trim() || !credentials.password.trim()) {
      throw new AuthError('Enter an email address and password to continue.')
    }
    return buildDefaultSession()
  },

  async signOut(): Promise<void> {
    // Nothing to tear down while the session lives in memory.
  },
}

const mockCatalog = {
  async getCatalog(): Promise<Catalog> {
    return {
      applications: APPLICATIONS,
      navigation: NAVIGATION,
      normalModeApps: NORMAL_MODE_APPS,
      failingModules: FAILING_MODULES,
    }
  },
}

const mockNotifications = {
  async list(): Promise<AppNotification[]> {
    return NOTIFICATIONS.map((notification) => ({ ...notification }))
  },
}

const mockModules = {
  /**
   * Simulates a module coming up. `onProgress` receives 0–100 while loading;
   * a real implementation would forward server-sent progress, or simply
   * report 0 and then 100.
   */
  async load(name: string, onProgress?: (percent: number) => void): Promise<ModuleLoadResult> {
    const startedAt = Date.now()
    onProgress?.(0)

    let timer: ReturnType<typeof setInterval> | undefined
    if (onProgress) {
      timer = setInterval(() => {
        const percent = Math.min(100, Math.round(((Date.now() - startedAt) / MODULE_LOAD_MS) * 100))
        onProgress(percent)
        if (percent >= 100 && timer) clearInterval(timer)
      }, PROGRESS_TICK_MS)
    }

    try {
      await delay(MODULE_LOAD_MS)
    } finally {
      if (timer) clearInterval(timer)
    }
    onProgress?.(100)

    const kind = FAILING_MODULES[name]
    if (kind) return { name, status: 'error', failure: describeFailure(name, kind) }

    const budget = FLAKY_MODULES[name] ?? 0
    const spent = flakyOpens.get(name) ?? 0
    if (spent < budget) {
      flakyOpens.set(name, spent + 1)
      return { name, status: 'error', failure: describeFailure(name, 'timeout') }
    }

    return { name, status: 'ready' }
  },

  async getWorkspaceData(filter: ModuleDataFilter): Promise<ModuleWorkspaceData> {
    if (filter.sites.length === 0) {
      return {
        rows: [],
        kpis: EMPTY_KPIS,
        managedObject: MANAGED_OBJECT.empty,
        totalItems: 0,
        totalPages: 0,
        updatedAt: Date.now(),
      }
    }

    const matching = AUDIT_ROWS.filter((row) => filter.sites.includes(row.site))
    const sorted = sortRows(matching, filter)

    // Filtering, sorting and slicing all happen here rather than in the UI,
    // because a real backend would do the same and the component should not
    // have to change when it does.
    const start = filter.page * filter.pageSize
    return {
      rows: sorted.slice(start, start + filter.pageSize),
      kpis: POPULATED_KPIS,
      managedObject: MANAGED_OBJECT.selected,
      totalItems: matching.length,
      totalPages: Math.max(1, Math.ceil(matching.length / filter.pageSize)),
      updatedAt: Date.now(),
    }
  },

  async listSites(): Promise<Site[]> {
    return SITES
  },

  async listMetrics(): Promise<string[]> {
    return METRICS
  },

  async getTrend(moduleName: string, metric: string): Promise<TrendSeries> {
    // A brief delay so the widget's loading state is real rather than
    // instantaneous, and retrying visibly does something.
    await delay(600)
    if (FAILING_TREND_MODULES.includes(moduleName)) {
      throw new TrendUnavailableError('Metric service timed out.')
    }
    return buildTrend(metric)
  },
}

/** Support-facing code per failure kind. */
const FAILURE_CODES: Record<ModuleFailureKind, string> = {
  unavailable: 'NI-MODULE-404',
  timeout: 'NI-GATEWAY-504',
}

/**
 * Builds the failure record the error screen reads.
 *
 * The correlation ID is derived from the module name rather than generated,
 * so a module that keeps failing keeps one ID — support can search for a
 * recurring problem instead of chasing a new ID per attempt. A real backend
 * would send the ID its own tracing assigned.
 */
function describeFailure(name: string, kind: ModuleFailureKind): ModuleFailure {
  let hash = 0
  for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  const hex = hash.toString(16).padStart(8, '0')

  return {
    kind,
    code: FAILURE_CODES[kind],
    correlationId: `${hex.slice(0, 4)}-${hex.slice(4)}-${(name.length * 977).toString(16)}`,
    at: Date.now(),
  }
}

/** Sorts a copy of the rows by the requested column, leaving order stable. */
function sortRows(rows: AuditRow[], filter: ModuleDataFilter): AuditRow[] {
  if (!filter.sort) return rows

  const { column, direction } = filter.sort
  const factor = direction === 'asc' ? 1 : -1

  return [...rows].sort((a, b) => {
    const left = String(a[column as keyof AuditRow] ?? '')
    const right = String(b[column as keyof AuditRow] ?? '')

    // Numeric where both sides look numeric, so -124 sorts below -120
    // rather than after it as text would.
    const leftNumber = Number(left)
    const rightNumber = Number(right)
    if (left !== '' && right !== '' && !Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
      return (leftNumber - rightNumber) * factor
    }
    return left.localeCompare(right, 'en', { numeric: true }) * factor
  })
}

/** Fixture-backed implementation of the full service surface. */
export const mockServices: Services = {
  auth: mockAuth,
  catalog: mockCatalog,
  notifications: mockNotifications,
  modules: mockModules,
}
