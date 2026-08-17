import { Fragment } from 'react'
import { Icon } from '@/lib/icons'
import { applicationOfModule, groupOfModule } from '@/lib/catalog'
import { useAppState } from '@/state/AppStateProvider'
import './TopBar.css'

interface Crumb {
  label: string
  /** `null` for a crumb that is not somewhere else to go. */
  onClick: (() => void) | null
}

/**
 * Trail above the content area.
 *
 * Every crumb that looks like a link goes somewhere the user is not already:
 * the root to the catalog, the application crumb to that application's
 * modules, and a grouping crumb to the same place with the group expanded.
 * Anything that would land on the current screen is rendered as plain text
 * rather than as a control that does nothing when clicked.
 *
 * The trail follows the catalog's real depth, which is four levels for a
 * module inside a grouping — `Trace Sessions` is reached through
 * `Subscriber Trace`, and a trail that skipped it would describe a route that
 * does not exist.
 */
export function Breadcrumbs() {
  const { catalog, tabs, navigation, selectedApplication, goHome } = useAppState()
  const tab = tabs.activeTab

  const openApplication = (appId: string, card?: string) => {
    navigation.selectApp(appId)
    if (card) navigation.openCard(card)
    goHome()
  }

  const trail: Crumb[] = []

  if (tab) {
    const app = applicationOfModule(catalog, tab.id)
    const group = groupOfModule(catalog, tab.id)

    trail.push({ label: 'Network Insight', onClick: goHome })
    trail.push({ label: tab.app, onClick: () => openApplication(app.id) })
    if (group) trail.push({ label: group, onClick: () => openApplication(app.id, group) })
    trail.push({ label: tab.label, onClick: null })
  } else {
    // On the catalog itself there is nowhere further up, and the application
    // being shown is the location rather than a destination.
    trail.push({ label: 'Network Insight', onClick: null })
    trail.push({ label: selectedApplication.label, onClick: null })
  }

  return (
    <nav className="ni-crumbs" aria-label="Breadcrumb">
      {trail.map((crumb, index) => {
        const last = index === trail.length - 1
        const className = `ni-crumbs__link${last ? ' ni-crumbs__link--current' : ''}`

        return (
          <Fragment key={`${crumb.label}-${index}`}>
            <div className="ni-crumbs__item">
              {crumb.onClick ? (
                <button type="button" className={className} onClick={crumb.onClick}>
                  {crumb.label}
                </button>
              ) : (
                // A span rather than a disabled button: there is no action to
                // disable, and a disabled control cannot carry `aria-current`
                // meaningfully because it is skipped entirely.
                <span className={className} aria-current={last ? 'page' : undefined}>
                  {crumb.label}
                </span>
              )}
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
