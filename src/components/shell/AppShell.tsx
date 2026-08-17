import { MainMenu } from '@/components/home/MainMenu'
import { ModuleError } from '@/components/module/ModuleError'
import { ModuleWorkspace } from '@/components/module/ModuleWorkspace'
import { SplashLoader } from '@/components/module/SplashLoader'
import { CommandPalette } from '@/components/panels/CommandPalette'
import { NotificationsPanel } from '@/components/panels/NotificationsPanel'
import { Announcer } from '@/components/common/Announcer'
import { Toast } from '@/components/common/Toast'
import { useAppState } from '@/state/AppStateProvider'
import { useNarrowLayout } from '@/state/useNarrowLayout'
import { Breadcrumbs } from './Breadcrumbs'
import { FloatingToggles } from './FloatingToggles'
import { RailFlyout } from './RailFlyout'
import { Sidebar } from './Sidebar'
import { SidebarRail } from './SidebarRail'
import { TopBar } from './TopBar'

/**
 * The signed-in application.
 *
 * Navigation sits on the left in one of two forms, the content area shows
 * either the catalog or the active module, and overlays stack on top. Full
 * screen hides all surrounding chrome so a module can use the whole viewport.
 */
export function AppShell() {
  const { tabs, navigation, notifications, palette, toast } = useAppState()
  const layout = useNarrowLayout()

  const tab = tabs.activeTab
  const fullscreen = navigation.fullscreen && tab !== null
  const showChrome = !fullscreen

  /** Names the current view for assistive technology and the page heading. */
  const viewTitle = tab ? tab.label : 'Applications'

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      <a className="ni-skip-link" href="#ni-content">
        Skip to content
      </a>
      <Announcer />

      {showChrome && (navigation.collapsed ? <SidebarRail /> : <Sidebar />)}
      {showChrome && navigation.collapsed && <RailFlyout />}

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--pg)',
        }}
      >
        {showChrome && <TopBar />}

        {/**
         * A column, so the breadcrumb keeps its own band and the view below
         * fills what is left. The views used to be absolutely positioned over
         * the whole of `main`, which painted them across the breadcrumb and
         * swallowed every click on it.
         */}
        <main
          id="ni-content"
          ref={layout.ref}
          tabIndex={-1}
          aria-label={viewTitle}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            position: 'relative',
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* The page's one h1. It is not drawn — the breadcrumb and grid
              heading carry that visually — but it anchors the outline. */}
          <h1 className="ni-visually-hidden">{viewTitle}</h1>

          {showChrome && <Breadcrumbs />}

          {tab === null && <MainMenu narrow={layout.narrow} />}
          {tab?.status === 'loading' && (
            <SplashLoader name={tab.label} progress={tabs.progress} />
          )}
          {tab?.status === 'error' && <ModuleError tab={tab} />}
          {tab?.status === 'ready' && <ModuleWorkspace moduleName={tab.label} />}
        </main>
      </div>

      <FloatingToggles />

      {notifications.open && <NotificationsPanel />}
      {palette.open && <CommandPalette />}
      {toast.message && <Toast message={toast.message} />}
    </div>
  )
}
