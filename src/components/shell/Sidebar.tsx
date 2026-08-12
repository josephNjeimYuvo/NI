import { DuoIcon, Icon } from '@/lib/icons'
import { LogoLockup } from '@/lib/logo'
import { applicationOfModule } from '@/lib/catalog'
import { useAppState } from '@/state/AppStateProvider'
import type { TopSection } from '@/state/useNavigation'
import { ModuleLeaf, VendorGroup } from './ModuleTree'
import './Sidebar.css'

/** Most entries the Recently Used section shows inline. */
const RECENT_PREVIEW = 8

interface SectionSpec {
  key: TopSection
  label: string
  icon: string
  emptyHint: string
}

const SECTIONS: SectionSpec[] = [
  {
    key: 'favorites',
    label: 'My Favorites',
    icon: 'star',
    emptyHint: 'Pin a module from the catalog to keep it here.',
  },
  {
    key: 'recent',
    label: 'Recently Used',
    icon: 'clock',
    emptyHint: 'Modules you open will be listed here.',
  },
]

/**
 * Expanded sidebar: the pinned Favorites and Recent sections, then the module
 * categories, each expanding into its vendor groups and modules.
 */
export function Sidebar() {
  const { catalog, applications, navigation, session, tabs, goHome } = useAppState()

  /** The category to highlight: whatever owns the open tab, else the selection. */
  const activeCategory = tabs.activeTab
    ? applicationOfModule(catalog, tabs.activeTab.id).id
    : navigation.selectedApp

  const namesFor = (section: TopSection) =>
    section === 'favorites'
      ? session.favorites
      : session.recent.map((entry) => entry.name).slice(0, RECENT_PREVIEW)

  return (
    <div className="ni-sidebar">
      <div className="ni-sidebar__header">
        <div
          className="ni-sidebar__logo"
          title="Back to main menu"
          role="button"
          tabIndex={0}
          onClick={goHome}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') goHome()
          }}
        >
          <LogoLockup width={142} />
        </div>
        <button
          type="button"
          className="ni-sidebar__toggle"
          title="Collapse navigation"
          onClick={() => navigation.toggleCollapsed()}
        >
          <Icon name="chevL" size={17} />
        </button>
      </div>

      <div className="ni-sidebar__rule" />

      <div className="ni-sidebar__scroll">
        <div className="ni-sidebar__pinned">
          {SECTIONS.map((section) => {
            const open = navigation.openSections[section.key]
            const names = namesFor(section.key)

            return (
              <div key={section.key} className="ni-sidebar__group">
                <button
                  type="button"
                  className={`ni-cat${open ? ' ni-cat--active' : ''}`}
                  onClick={() => navigation.toggleSection(section.key)}
                  aria-expanded={open}
                >
                  <span className={`ni-cat__bar${open ? ' ni-cat__bar--on' : ''}`} />
                  <span className="ni-cat__icon" style={{ color: 'var(--pri)' }}>
                    <Icon name={section.icon} size={18} />
                  </span>
                  <span className="ni-cat__label">{section.label}</span>
                  {names.length > 0 && <span className="ni-cat__count">{names.length}</span>}
                  <span className={`ni-cat__chevron${open ? ' ni-cat__chevron--open' : ''}`}>
                    <Icon name="chevD" size={15} />
                  </span>
                </button>

                {open && (
                  <div className="ni-tree ni-tree--indent">
                    {names.map((name) => (
                      <ModuleLeaf key={name} name={name} />
                    ))}
                    {names.length === 0 && (
                      <div className="ni-tree__empty">{section.emptyHint}</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="ni-sidebar__sectionLabel">
          <span>MODULES</span>
          <span />
        </div>

        {applications.map((app) => {
          const nav = catalog.navigation[app.id] ?? { items: [] }
          const open = Boolean(navigation.openCategories[app.id])
          const active = activeCategory === app.id

          return (
            <div key={app.id} className="ni-sidebar__group">
              <button
                type="button"
                className={`ni-cat${open || active ? ' ni-cat--active' : ''}`}
                onClick={() => navigation.toggleCategory(app.id)}
                aria-expanded={open}
              >
                <span className={`ni-cat__bar${active ? ' ni-cat__bar--on' : ''}`} />
                <span className="ni-cat__icon">
                  <DuoIcon name={app.icon} size={18} />
                </span>
                <span className="ni-cat__label">{app.label}</span>
                <span className={`ni-cat__chevron${open ? ' ni-cat__chevron--open' : ''}`}>
                  <Icon name="chevD" size={15} />
                </span>
              </button>

              {open && (
                <div className="ni-tree">
                  {(nav.vendors ?? []).map((vendor) => (
                    <VendorGroup key={vendor.name} scope={app.id} vendor={vendor} />
                  ))}
                  <div className="ni-tree__leaves">
                    {nav.items.map((item) => (
                      <ModuleLeaf key={item} name={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="ni-sidebar__status">
        <span className="ni-status-dot" />
        <span>All systems operational</span>
      </div>
    </div>
  )
}
