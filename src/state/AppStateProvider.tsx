import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { services } from '@/services'
import {
  applicationById,
  applicationOfModule,
  flattenResults,
  moduleExists,
  searchCatalog,
  visibleApplications,
} from '@/lib/catalog'
import type {
  Application,
  Brand,
  Catalog,
  Credentials,
  SearchResult,
  SearchResultGroup,
} from '@/types'
import { usePreferences, type Preferences } from './usePreferences'
import { useSession, type SessionState } from './useSession'
import { useTabs, type TabsState } from './useTabs'
import { useNavigation, type NavigationState } from './useNavigation'
import { useNotifications, type NotificationsState } from './useNotifications'
import { usePalette, type PaletteState } from './usePalette'
import { useModuleWorkspace, type ModuleWorkspaceState } from './useModuleWorkspace'
import { useToast, type ToastState } from './useToast'
import {
  useSessionTransition,
  type SessionTransitionState,
  type TransitionTask,
} from './useSessionTransition'

/** Which list the activity slide-over is showing. */
export type ActivityMode = 'recent' | 'favorites'

/** Most Quick Links the command palette offers before a query is typed. */
const QUICK_LINK_LIMIT = 6

export interface AppState {
  catalog: Catalog
  preferences: Preferences
  session: SessionState
  tabs: TabsState
  navigation: NavigationState
  notifications: NotificationsState
  palette: PaletteState
  workspace: ModuleWorkspaceState
  toast: ToastState
  transition: SessionTransitionState

  /** Applications visible under the current catalog mode. */
  applications: Application[]
  /** The application the main menu is showing. */
  selectedApplication: Application
  /** Grouped palette results for the current query. */
  searchResults: SearchResultGroup[]
  /** Palette results flattened into keyboard-cursor order. */
  flatResults: SearchResult[]
  /** Favorites still reachable in the current mode, capped for the palette. */
  quickLinks: string[]

  activity: {
    open: boolean
    mode: ActivityMode
    openActivity: (mode?: ActivityMode) => void
    close: () => void
  }

  signIn: (credentials: Credentials) => Promise<void>
  signOut: () => void
  /** Opens a module in a tab, closing whatever overlay is in the way. */
  openModule: (name: string) => void
  /** Returns to the main menu without closing any tabs. */
  goHome: () => void
  /** Pins or unpins a module, confirming with a toast either way. */
  togglePin: (name: string) => void
  /** Runs a palette result: apps select, modules open. */
  runSearchResult: (result: SearchResult) => void
}

const AppStateContext = createContext<AppState | null>(null)

export function useAppState(): AppState {
  const state = useContext(AppStateContext)
  if (!state) throw new Error('useAppState must be used within an AppStateProvider')
  return state
}

/**
 * Composes the feature hooks into the application's state.
 *
 * Each hook owns one slice; this provider owns the interactions that cross
 * slices — opening a module touches tabs, history, overlays and the module
 * workspace at once, and that orchestration belongs here rather than inside
 * any single slice.
 */
export function AppStateProvider({
  children,
  brand = 'blue',
}: {
  children: ReactNode
  brand?: Brand
}) {
  const [catalog, setCatalog] = useState<Catalog | null>(null)

  const preferences = usePreferences(brand)
  const session = useSession()
  const tabs = useTabs(catalog)
  const navigation = useNavigation()
  const notifications = useNotifications()
  const palette = usePalette()
  const workspace = useModuleWorkspace()
  const toast = useToast()

  const { load: loadNotifications, clear: clearNotifications } = notifications
  const { signOut: endSession } = session
  const { closeAll: closeAllTabs } = tabs

  /**
   * Warm-up run between sign-in and the landing screen. These are the fetches
   * that need a signed-in user, so they cannot happen any earlier.
   */
  const enterTasks = useMemo<TransitionTask[]>(() => [loadNotifications], [loadNotifications])

  /**
   * Teardown run while the sign-out splash is up: revoke the session, then
   * drop everything belonging to it so nothing survives into the next one.
   */
  const leaveTasks = useMemo<TransitionTask[]>(
    () => [
      endSession,
      async () => {
        closeAllTabs()
        clearNotifications()
      },
    ],
    [endSession, closeAllTabs, clearNotifications],
  )

  const transition = useSessionTransition({ enter: enterTasks, leave: leaveTasks })

  const [activityOpen, setActivityOpen] = useState(false)
  const [activityMode, setActivityMode] = useState<ActivityMode>('recent')

  useEffect(() => {
    let active = true
    void services.catalog.getCatalog().then((loaded) => {
      if (active) setCatalog(loaded)
    })
    return () => {
      active = false
    }
  }, [])

  const applications = useMemo(
    () => (catalog ? visibleApplications(catalog, preferences.mode === 'Normal') : []),
    [catalog, preferences.mode],
  )

  const searchResults = useMemo(
    () => searchCatalog(applications, palette.query),
    [applications, palette.query],
  )

  const flatResults = useMemo(() => flattenResults(searchResults), [searchResults])

  const quickLinks = useMemo(
    () =>
      session.favorites.filter((name) => moduleExists(applications, name)).slice(0, QUICK_LINK_LIMIT),
    [session.favorites, applications],
  )

  const { setMode } = preferences
  const { selectApp, selectedApp } = navigation

  /**
   * Narrowing the catalog can hide the application the main menu is showing,
   * so fall back to the first one that survives the switch.
   */
  useEffect(() => {
    if (!applications.length) return
    if (!applications.some((app) => app.id === selectedApp)) {
      selectApp(applications[0]!.id)
    }
  }, [applications, selectedApp, selectApp])

  const openModule = useCallback(
    (name: string) => {
      tabs.openTab(name)
      session.recordVisit(name)
      navigation.closeFlyout()
      palette.closePalette()
      notifications.close()
      workspace.reset()
    },
    [tabs, session, navigation, palette, notifications, workspace],
  )

  const goHome = useCallback(() => {
    tabs.selectTab(null)
    notifications.close()
    navigation.exitFullscreen()
  }, [tabs, notifications, navigation])

  const signIn = useCallback(
    async (credentials: Credentials) => {
      if (await session.signIn(credentials)) transition.enter()
    },
    [session, transition],
  )

  // The teardown itself is a leave task, so it happens behind the splash
  // rather than before it.
  const signOut = useCallback(() => transition.leave(), [transition])

  const togglePin = useCallback(
    (name: string) => {
      if (session.favorites.includes(name)) {
        session.removeFavorite(name)
        toast.show(`${name} removed from Quick Access`)
      } else {
        session.addFavorite(name)
        toast.show(`${name} pinned to Quick Access`)
      }
    },
    [session, toast],
  )

  const runSearchResult = useCallback(
    (result: SearchResult) => {
      if (result.kind === 'app' && result.id) {
        navigation.selectApp(result.id)
        tabs.selectTab(null)
        palette.closePalette()
        return
      }
      openModule(result.label)
    },
    [navigation, tabs, palette, openModule],
  )

  const openActivity = useCallback((mode: ActivityMode = 'recent') => {
    setActivityMode(mode)
    setActivityOpen(true)
  }, [])

  const closeActivity = useCallback(() => setActivityOpen(false), [])

  // Global shortcuts. Registered once and reading the latest handlers through
  // the effect's dependencies, so the palette cursor stays in step with the
  // result list it is walking.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        palette.toggle()
        return
      }

      if (event.key === 'Escape') {
        const hadOverlay = palette.open || notifications.open
        palette.closePalette()
        notifications.close()
        // Escape leaves full screen only when it was not busy closing an
        // overlay, so one press never does two things.
        if (!hadOverlay) navigation.exitFullscreen()
        return
      }

      if (!palette.open) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        palette.moveCursor(1, flatResults.length)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        palette.moveCursor(-1, flatResults.length)
      } else if (event.key === 'Enter') {
        const result = flatResults[palette.cursor]
        if (result) runSearchResult(result)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [palette, notifications, navigation, flatResults, runSearchResult])

  // Nothing can render meaningfully until the catalog is in hand.
  if (!catalog) return null

  const selectedApplication = applicationById(catalog, navigation.selectedApp)

  const value: AppState = {
    catalog,
    preferences: { ...preferences, setMode },
    session,
    tabs,
    navigation,
    notifications,
    palette,
    workspace,
    toast,
    transition,
    applications,
    selectedApplication,
    searchResults,
    flatResults,
    quickLinks,
    activity: {
      open: activityOpen,
      mode: activityMode,
      openActivity,
      close: closeActivity,
    },
    signIn,
    signOut,
    openModule,
    goHome,
    togglePin,
    runSearchResult,
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

/** Resolves which application owns a module, for breadcrumbs and list rows. */
export function useApplicationOfModule(moduleName: string): Application {
  const { catalog } = useAppState()
  return applicationOfModule(catalog, moduleName)
}
