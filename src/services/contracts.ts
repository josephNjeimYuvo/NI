import type {
  AppNotification,
  Catalog,
  Credentials,
  ModuleDataFilter,
  ModuleLoadResult,
  ModuleWorkspaceData,
  Session,
  Site,
  TrendSeries,
} from '@/types'

/**
 * Service contracts.
 *
 * Every piece of data the UI needs enters through one of these interfaces.
 * The mock implementations in `./mock` satisfy them from static fixtures;
 * swapping in HTTP-backed implementations is a change to `./index.ts` alone.
 */

export interface AuthService {
  /**
   * Resolves with the session on success. Rejects with an {@link AuthError}
   * when the credentials are unusable.
   */
  signIn(credentials: Credentials): Promise<Session>
  signOut(): Promise<void>
}

export interface CatalogService {
  /** The full application/module catalog, loaded once at boot. */
  getCatalog(): Promise<Catalog>
}

export interface NotificationService {
  list(): Promise<AppNotification[]>
}

export interface ModuleService {
  /**
   * Opens a module. Resolves once the module is ready or has definitively
   * failed — the returned status drives the tab's state, so a failure here is
   * a normal outcome rather than a rejection.
   *
   * `onProgress` receives 0–100 while the module comes up, driving the splash
   * screen. Implementations without real progress may report 0 then 100.
   */
  load(name: string, onProgress?: (percent: number) => void): Promise<ModuleLoadResult>

  /** One page of workspace data under the supplied filter. */
  getWorkspaceData(filter: ModuleDataFilter): Promise<ModuleWorkspaceData>

  /** Sites the audit can be scoped to. */
  listSites(): Promise<Site[]>

  /** Metrics available to the trend widget. */
  listMetrics(): Promise<string[]>

  /**
   * Trend series for a metric within a module. Rejects with
   * {@link TrendUnavailableError} when the metric service cannot answer,
   * which the workspace surfaces as a retryable widget rather than failing
   * the whole screen.
   */
  getTrend(moduleName: string, metric: string): Promise<TrendSeries>
}

/** The complete service surface handed to the app. */
export interface Services {
  auth: AuthService
  catalog: CatalogService
  notifications: NotificationService
  modules: ModuleService
}

/** Thrown by {@link AuthService.signIn} when credentials are rejected. */
export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

/** Thrown by {@link ModuleService.getTrend} when the metric service fails. */
export class TrendUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TrendUnavailableError'
  }
}
