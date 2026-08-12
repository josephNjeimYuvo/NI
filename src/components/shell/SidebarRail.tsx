import { DuoIcon, Icon } from '@/lib/icons'
import { LogoMark } from '@/lib/logo'
import { applicationOfModule } from '@/lib/catalog'
import { useAppState } from '@/state/AppStateProvider'
import type { TopSection } from '@/state/useNavigation'
import './Sidebar.css'

const SECTIONS: Array<{ key: TopSection; label: string; icon: string }> = [
  { key: 'favorites', label: 'My Favorites', icon: 'star' },
  { key: 'recent', label: 'Recently Used', icon: 'clock' },
]

/**
 * Collapsed navigation rail.
 *
 * Each button opens a flyout anchored to its own vertical position, so the
 * rail stays usable at 66px without losing access to the full tree.
 */
export function SidebarRail() {
  const { catalog, applications, navigation, tabs, goHome } = useAppState()

  const activeCategory = tabs.activeTab
    ? applicationOfModule(catalog, tabs.activeTab.id).id
    : navigation.selectedApp

  /** Expanding from the rail reveals the category the user is working in. */
  const expandSidebar = () => navigation.toggleCollapsed(activeCategory)

  return (
    <div className="ni-rail">
      <div
        className="ni-rail__logo"
        title="Back to main menu"
        role="button"
        tabIndex={0}
        onClick={goHome}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') goHome()
        }}
      >
        <LogoMark size={29} />
      </div>

      <button
        type="button"
        className="ni-rail__toggle"
        title="Expand navigation"
        onClick={expandSidebar}
      >
        <Icon name="chevR" size={17} />
      </button>

      <div className="ni-rail__rule" />

      <div className="ni-rail__scroll">
        {SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            className="ni-rail__button"
            title={section.label}
            style={{ color: 'var(--pri)' }}
            onClick={(event) =>
              navigation.toggleFlyout(section.key, event.currentTarget.getBoundingClientRect().top)
            }
          >
            <span className="ni-rail__bar" />
            <Icon name={section.icon} size={18} />
          </button>
        ))}

        <span className="ni-rail__divider" />

        {applications.map((app) => (
          <button
            key={app.id}
            type="button"
            className="ni-rail__button"
            title={app.label}
            onClick={(event) => {
              navigation.selectApp(app.id)
              navigation.toggleFlyout(app.id, event.currentTarget.getBoundingClientRect().top)
            }}
          >
            <span
              className={`ni-rail__bar${activeCategory === app.id ? ' ni-rail__bar--on' : ''}`}
            />
            <DuoIcon name={app.icon} size={18} />
          </button>
        ))}
      </div>

      <div className="ni-rail__status" title="All systems operational">
        <span className="ni-status-dot" style={{ display: 'block' }} />
      </div>
    </div>
  )
}
