/**
 * Domain models for Network Insight.
 *
 * These types describe the shapes the UI consumes. The service layer in
 * `src/services` is responsible for producing them — today from static
 * fixtures, later from a real backend — so nothing below should ever
 * reference a transport detail.
 */

/** Visual brand palette. Swaps the whole token set at the `data-brand` root. */
export type Brand = 'blue' | 'orange' | 'red'

/** Light/dark appearance, applied via `data-theme` at the root. */
export type Theme = 'light' | 'dark'

/**
 * Catalog visibility mode. `Normal` narrows the catalog to the everyday
 * applications; `Advanced` exposes everything.
 */
export type CatalogMode = 'Normal' | 'Advanced'

/** Identifier for an application in the catalog, e.g. `ran`, `fault`. */
export type ApplicationId = string

/** Name of an icon in the shared icon table (`src/lib/icons`). */
export type IconName = string

/**
 * A module is a single openable screen. Modules with `children` act as
 * groupings in the catalog: the parent is not openable, only its children.
 */
export interface CatalogModule {
  label: string
  children?: string[]
}

/** A top-level application, holding a flat list of modules. */
export interface Application {
  id: ApplicationId
  /** Full display name, used in the catalog and breadcrumbs. */
  label: string
  /** Abbreviated name for tight spaces (quick access, palette paths). */
  short?: string
  icon: IconName
  modules: CatalogModule[]
}

/** A vendor grouping inside an application's navigation tree. */
export interface NavigationVendor {
  name: string
  items: string[]
}

/**
 * The sidebar's view of an application. Vendor-scoped modules are nested
 * under `vendors`; everything else sits flat in `items`.
 */
export interface NavigationTree {
  vendors?: NavigationVendor[]
  items: string[]
}

/** The complete catalog, as delivered by the catalog service. */
export interface Catalog {
  applications: Application[]
  navigation: Record<ApplicationId, NavigationTree>
  /** Applications visible while in `Normal` mode. */
  normalModeApps: ApplicationId[]
  /**
   * Modules known not to open, and why. Anything absent is expected to work,
   * so a failure on one of those is transient by definition.
   */
  failingModules: Record<string, ModuleFailureKind>
}

export type NotificationSeverity = 'critical' | 'warning' | 'info'
export type NotificationCategory = 'Alarms' | 'System' | 'Reports'

export interface AppNotification {
  id: number
  severity: NotificationSeverity
  title: string
  body: string
  /** Pre-formatted age, e.g. `4m`, `1d`. */
  time: string
  read: boolean
  category: NotificationCategory
}

/** Lifecycle of an open module tab. */
export type TabStatus = 'loading' | 'ready' | 'error'

export interface Tab {
  /** Module name — also the tab's identity, so a module opens at most once. */
  id: string
  label: string
  /** Owning application's display name, shown in the breadcrumb. */
  app: string
  status: TabStatus
  /** Why the last open failed. Present only while `status` is `error`. */
  failure?: ModuleFailure
  /** Consecutive failed opens, reset the moment the module comes up. */
  failedAttempts: number
}

/**
 * Why a module did not open.
 *
 * These are not variations on one message. Only one of the three is worth
 * retrying, and each needs a different way forward — which is what stops the
 * failure screen offering an action that cannot possibly work.
 */
export type ModuleFailureKind =
  /** The module exists in the catalog but is not enabled for this tenant. */
  | 'unavailable'
  /** The module should work; the request did not come back in time. */
  | 'timeout'
  /** The module answered, and what it answered with was a fault of its own. */
  | 'internal'

export interface ModuleFailure {
  kind: ModuleFailureKind
  /** Support-facing code, quoted on the failure screen. */
  code: string
  /**
   * Stable for a given module, so a recurring failure carries one ID that
   * support can search for rather than a fresh one per attempt.
   */
  correlationId: string
  /** When the failure was observed, epoch ms. */
  at: number
}

/** A module the user opened, with when they opened it. */
export interface RecentEntry {
  name: string
  timestamp: number
}

/** Result of asking the module service to load a module. */
export interface ModuleLoadResult {
  name: string
  status: Extract<TabStatus, 'ready' | 'error'>
  /** Present when `status` is `error`, describing what went wrong. */
  failure?: ModuleFailure
}

/** Grid aggregation level. */
export type GridLevel = 'Cell' | 'Site'

/** A network site the audit can be scoped to. */
export interface Site {
  /** Short code, e.g. `LSB0421` — also what the grid displays. */
  id: string
  name: string
  region: string
}

export type SortDirection = 'asc' | 'desc'

export interface GridSort {
  /** Key of the column being sorted, matching `AUDIT_COLUMNS`. */
  column: string
  direction: SortDirection
}

/** Filters the module workspace applies to its data requests. */
export interface ModuleDataFilter {
  /** Site codes in scope. Empty means nothing is selected yet. */
  sites: string[]
  level: GridLevel
  /** Zero-based page index. */
  page: number
  pageSize: number
  sort: GridSort | null
}

/** One row of the parameter-audit grid. */
export interface AuditRow {
  date: string
  site: string
  neType: string
  parameter: string
  value: string
  previousValue: string
}

/** Direction of a KPI's movement, which drives its colour. */
export type KpiTone = 'positive' | 'warning' | 'neutral'

export interface Kpi {
  label: string
  value: string
  delta: string
  tone: KpiTone
}

/** Everything the module workspace renders for the current filter. */
export interface ModuleWorkspaceData {
  /** Just the requested page, already sorted. */
  rows: AuditRow[]
  kpis: Kpi[]
  /** Managed object class in scope, shown in the filter bar. */
  managedObject: string
  /** Total matching rows across every page, for the footer count. */
  totalItems: number
  /** Total pages available under the current page size. */
  totalPages: number
  /** When this result was produced, for the freshness stamp. */
  updatedAt: number
}

/** One point on a trend series. */
export interface TrendPoint {
  label: string
  value: number
}

/** A metric plotted over time, shown beside the KPI tiles. */
export interface TrendSeries {
  metric: string
  points: TrendPoint[]
  /** Human-readable movement across the window. */
  delta: string
  tone: KpiTone
}

/** The signed-in user. */
export interface User {
  name: string
  email: string
}

/** Credentials submitted by the sign-in form. */
export interface Credentials {
  email: string
  password: string
}

export interface Session {
  user: User
  /** Modules pinned to Quick Access, in user-defined order. */
  favorites: string[]
  recent: RecentEntry[]
}

/** Search result kinds, ordered as they appear in the command palette. */
export type SearchResultKind = 'app' | 'module'
export type SearchResultType = 'App' | 'Module' | 'Submodule'

export interface SearchResult {
  kind: SearchResultKind
  type: SearchResultType
  /** Present only when `kind` is `app`. */
  id?: ApplicationId
  label: string
  /** Breadcrumb-ish trail shown under the label. */
  path: string
  icon: IconName
}

export interface SearchResultGroup {
  label: string
  items: SearchResult[]
}
