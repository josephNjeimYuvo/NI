import { Fragment } from 'react'
import { Icon } from '@/lib/icons'
import { useAppState } from '@/state/AppStateProvider'
import './TopBar.css'

/**
 * Trail above the content area. Every crumb but the last returns to the main
 * menu — there is no intermediate destination to navigate to.
 */
export function Breadcrumbs() {
  const { tabs, goHome } = useAppState()
  const tab = tabs.activeTab

  const trail = tab
    ? ['Network Insight', tab.app, tab.label]
    : ['Network Insight', 'Applications', 'Main menu']

  return (
    <div className="ni-crumbs">
      {trail.map((label, index) => {
        const last = index === trail.length - 1
        return (
          <Fragment key={`${label}-${index}`}>
            <div className="ni-crumbs__item">
              <button
                type="button"
                className={`ni-crumbs__link${last ? ' ni-crumbs__link--current' : ''}`}
                onClick={last ? undefined : goHome}
              >
                {label}
              </button>
              {!last && (
                <span className="ni-crumbs__sep">
                  <Icon name="chevR" size={13} />
                </span>
              )}
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
