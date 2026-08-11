import {
  APPLICATIONS,
  FAILING_MODULES,
  NAVIGATION,
  NORMAL_MODE_APPS,
} from '@/data/catalog'
import { AUDIT_ROWS, EMPTY_KPIS, MANAGED_OBJECT, POPULATED_KPIS, TOTAL_ITEMS } from '@/data/moduleData'
import { NOTIFICATIONS } from '@/data/notifications'
import { buildDefaultSession } from '@/data/session'
import type {
  AppNotification,
  Catalog,
  Credentials,
  ModuleDataFilter,
  ModuleLoadResult,
  ModuleWorkspaceData,
  Session,
} from '@/types'
import { AuthError, type Services } from '../contracts'

/** How long a module takes to come up, in ms. */
const MODULE_LOAD_MS = 1500

/** How often load progress is reported, in ms. */
const PROGRESS_TICK_MS = 60

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

    return { name, status: FAILING_MODULES.includes(name) ? 'error' : 'ready' }
  },

  async getWorkspaceData(filter: ModuleDataFilter): Promise<ModuleWorkspaceData> {
    if (!filter.sitesSelected) {
      return {
        rows: [],
        kpis: EMPTY_KPIS,
        managedObject: MANAGED_OBJECT.empty,
        totalItems: TOTAL_ITEMS,
      }
    }
    return {
      rows: AUDIT_ROWS,
      kpis: POPULATED_KPIS,
      managedObject: MANAGED_OBJECT.selected,
      totalItems: TOTAL_ITEMS,
    }
  },
}

/** Fixture-backed implementation of the full service surface. */
export const mockServices: Services = {
  auth: mockAuth,
  catalog: mockCatalog,
  notifications: mockNotifications,
  modules: mockModules,
}
