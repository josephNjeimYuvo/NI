import { MainMenu } from '@/components/home/MainMenu'
import { ModuleError } from '@/components/module/ModuleError'
import { ModuleWorkspace } from '@/components/module/ModuleWorkspace'
import { SplashLoader } from '@/components/module/SplashLoader'
import { ActivityPanel } from '@/components/panels/ActivityPanel'
import { CommandPalette } from '@/components/panels/CommandPalette'
import { NotificationsPanel } from '@/components/panels/NotificationsPanel'
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
  const { tabs, navigation, notifications, palette, activity, toast } = useAppState()
  const layout = useNarrowLayout()

  const tab = tabs.activeTab
  const fullscreen = navigation.fullscreen && tab !== null
  const showChrome = !fullscreen

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
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

        <div
          ref={layout.ref}
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative' }}
        >
          {showChrome && <Breadcrumbs />}

          {tab === null && <MainMenu narrow={layout.narrow} />}
          {tab?.status === 'loading' && (
            <SplashLoader name={tab.label} progress={tabs.progress} />
          )}
          {tab?.status === 'error' && <ModuleError moduleName={tab.id} />}
          {tab?.status === 'ready' && <ModuleWorkspace moduleName={tab.label} />}
        </div>
      </div>

      <FloatingToggles />

      {notifications.open && <NotificationsPanel />}
      {activity.open && <ActivityPanel />}
      {palette.open && <CommandPalette />}
      {toast.message && <Toast message={toast.message} />}
    </div>
  )
}
