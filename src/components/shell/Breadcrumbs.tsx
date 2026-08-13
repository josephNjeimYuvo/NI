import { Fragment } from 'react'
import { Icon } from '@/lib/icons'
import { applicationOfModule } from '@/lib/catalog'
import { useAppState } from '@/state/AppStateProvider'
import './TopBar.css'

/**
 * Trail above the content area.
 *
 * Each crumb goes somewhere different: the root returns to the catalog, and
 * the middle crumb selects the owning application so the catalog opens
 * showing that application's modules — previously it duplicated the root,
 * which made it look broken.
 */
export function Breadcrumbs() {
  const { catalog, tabs, navigation, goHome } = useAppState()
  const tab = tabs.activeTab

  const openApplication = (appId: string) => {
    navigation.selectApp(appId)
    goHome()
  }

  const trail = tab
    ? (() => {
        const app = applicationOfModule(catalog, tab.id)
        return [
          { label: 'Network Insight', onClick: goHome },
          { label: tab.app, onClick: () => openApplication(app.id) },
          { label: tab.label, onClick: null },
        ]
      })()
    : [
        { label: 'Network Insight', onClick: goHome },
        { label: 'Applications', onClick: goHome },
        { label: 'Main menu', onClick: null },
      ]

  return (
    <nav className="ni-crumbs" aria-label="Breadcrumb">
      {trail.map((crumb, index) => {
        const last = index === trail.length - 1
        return (
          <Fragment key={`${crumb.label}-${index}`}>
            <div className="ni-crumbs__item">
              <button
                type="button"
                className={`ni-crumbs__link${last ? ' ni-crumbs__link--current' : ''}`}
                aria-current={last ? 'page' : undefined}
                onClick={crumb.onClick ?? undefined}
                disabled={last}
              >
                {crumb.label}
              </button>
              {!last && (
                <span className="ni-crumbs__sep" aria-hidden="true">
                  <Icon name="chevR" size={13} />
                </span>
              )}
            </div>
          </Fragment>
        )
      })}
    </nav>
  )
}
