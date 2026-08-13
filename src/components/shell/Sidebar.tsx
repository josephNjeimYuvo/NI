import { useMemo } from 'react'
import { DuoIcon, Icon } from '@/lib/icons'
import { LogoLockup } from '@/lib/logo'
import { applicationOfModule } from '@/lib/catalog'
import { useAppState } from '@/state/AppStateProvider'
import type { TopSection } from '@/state/useNavigation'
import type { NavigationTree } from '@/types'
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

const matches = (value: string, query: string) => value.toLowerCase().includes(query)

/** Narrows a navigation tree to the modules matching the filter. */
function filterTree(tree: NavigationTree, query: string): NavigationTree {
  if (!query) return tree
  return {
    vendors: (tree.vendors ?? [])
      .map((vendor) => ({
        ...vendor,
        // A vendor whose own name matches keeps all of its modules, so
        // typing "nokia" shows everything under Nokia.
        items: matches(vendor.name, query)
          ? vendor.items
          : vendor.items.filter((item) => matches(item, query)),
      }))
      .filter((vendor) => vendor.items.length > 0),
    items: tree.items.filter((item) => matches(item, query)),
  }
}

function treeSize(tree: NavigationTree): number {
  return tree.items.length + (tree.vendors ?? []).reduce((n, v) => n + v.items.length, 0)
}

/**
 * Expanded sidebar: the pinned Favorites and Recent sections, then the module
 * categories, each expanding into its vendor groups and modules.
 *
 * With a filter active the tree switches to results mode: categories with no
 * match are hidden and the rest are forced open, so matches are visible
 * without hunting through collapsed sections.
 */
export function Sidebar() {
  const { catalog, applications, navigation, session, tabs, goHome } = useAppState()

  const query = navigation.filter.trim().toLowerCase()
  const filtering = query.length > 0

  /** The category to highlight: whatever owns the open tab, else the selection. */
  const activeCategory = tabs.activeTab
    ? applicationOfModule(catalog, tabs.activeTab.id).id
    : navigation.selectedApp

  const namesFor = (section: TopSection) =>
    section === 'favorites'
      ? session.favorites
      : session.recent.map((entry) => entry.name).slice(0, RECENT_PREVIEW)

  const categories = useMemo(
    () =>
      applications
        .map((app) => {
          const tree = catalog.navigation[app.id] ?? { items: [] }
          // A category whose own name matches keeps its whole tree.
          const nameMatch = filtering && matches(app.label, query)
          return { app, tree: nameMatch ? tree : filterTree(tree, query) }
        })
        .filter(({ tree }) => !filtering || treeSize(tree) > 0),
    [applications, catalog.navigation, filtering, query],
  )

  const totalMatches = filtering ? categories.reduce((n, c) => n + treeSize(c.tree), 0) : 0

  return (
    <nav className="ni-sidebar" aria-label="Modules">
      <div className="ni-sidebar__header">
        <button
          type="button"
          className="ni-sidebar__logo"
          title="Back to main menu"
          aria-label="Back to main menu"
          onClick={goHome}
        >
          <LogoLockup width={142} />
        </button>
        <button
          type="button"
          className="ni-sidebar__toggle"
          title="Collapse navigation"
          aria-label="Collapse navigation"
          onClick={() => navigation.toggleCollapsed()}
        >
          <Icon name="chevL" size={17} />
        </button>
      </div>

      <div className="ni-sidebar__search">
        <span className="ni-sidebar__searchIcon">
          <Icon name="search" size={15} />
        </span>
        <input
          className="ni-sidebar__searchInput"
          type="search"
          value={navigation.filter}
          placeholder="Filter modules…"
          aria-label="Filter modules"
          onChange={(event) => navigation.setFilter(event.target.value)}
        />
        {filtering && (
          <button
            type="button"
            className="ni-sidebar__searchClear"
            aria-label="Clear filter"
            onClick={navigation.clearFilter}
          >
            <Icon name="x" size={13} />
          </button>
        )}
      </div>

      <div className="ni-sidebar__scroll">
        {!filtering && (
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
        )}

        <div className="ni-sidebar__sectionLabel">
          <span>{filtering ? `${totalMatches} matches` : 'MODULES'}</span>
          <span />
        </div>

        {categories.map(({ app, tree }) => {
          // While filtering, every surviving category is open — collapsing a
          // match would hide the thing the user just searched for.
          const open = filtering || Boolean(navigation.openCategories[app.id])
          const active = activeCategory === app.id

          return (
            <div key={app.id} className="ni-sidebar__group">
              <button
                type="button"
                className={`ni-cat${open || active ? ' ni-cat--active' : ''}`}
                onClick={() => navigation.toggleCategory(app.id)}
                aria-expanded={open}
                disabled={filtering}
              >
                <span className={`ni-cat__bar${active ? ' ni-cat__bar--on' : ''}`} />
                <span className="ni-cat__icon">
                  <DuoIcon name={app.icon} size={18} />
                </span>
                <span className="ni-cat__label">{app.label}</span>
                {!filtering && (
                  <span className={`ni-cat__chevron${open ? ' ni-cat__chevron--open' : ''}`}>
                    <Icon name="chevD" size={15} />
                  </span>
                )}
              </button>

              {open && (
                <div className="ni-tree">
                  {(tree.vendors ?? []).map((vendor) => (
                    <VendorGroup
                      key={vendor.name}
                      scope={app.id}
                      vendor={vendor}
                      forceOpen={filtering}
                    />
                  ))}
                  <div className="ni-tree__leaves">
                    {tree.items.map((item) => (
                      <ModuleLeaf key={item} name={item} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filtering && totalMatches === 0 && (
          <div className="ni-sidebar__noMatch">
            <div className="ni-sidebar__noMatchTitle">No modules match “{navigation.filter}”</div>
            <button type="button" className="ni-sidebar__noMatchAction" onClick={navigation.clearFilter}>
              Clear filter
            </button>
          </div>
        )}
      </div>

      <div className="ni-sidebar__status">
        <span className="ni-status-dot" />
        <span>All systems operational</span>
      </div>
    </nav>
  )
}
