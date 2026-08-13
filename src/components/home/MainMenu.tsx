import { DuoIcon, Icon, MODULE_ICON } from '@/lib/icons'
import { MODULE_ICONS } from '@/data/catalog'
import { useAppState } from '@/state/AppStateProvider'
import { QuickAccess } from './QuickAccess'
import { RecentModules } from './RecentModules'
import './MainMenu.css'

/**
 * The application catalog.
 *
 * Left: every application as a tile, then the selected application's modules
 * as cards. Right: the user's pinned and recent modules. Below the narrow
 * breakpoint the side column moves above the catalog, since it is the more
 * immediately useful of the two.
 */
export function MainMenu({ narrow }: { narrow: boolean }) {
  const { applications, selectedApplication, navigation, session, tabs, openModule, togglePin } =
    useAppState()

  /** Picking an application also drops out of any module that was open. */
  const selectApplication = (id: string) => {
    navigation.selectApp(id)
    tabs.selectTab(null)
  }

  /** Grouping cards expand in place; leaf cards open straight into a tab. */
  const activateCard = (label: string, grouping: boolean) => {
    if (grouping) navigation.toggleCard(label)
    else openModule(label)
  }

  return (
    <div
      className="ni-home"
      style={{ gridTemplateColumns: narrow ? 'minmax(0,1fr)' : 'minmax(0,1fr) 360px' }}
    >
      <div className="ni-home__main" style={{ order: narrow ? 2 : 1 }}>
        <div>
          <div className="ni-home__heading">
            <span style={{ color: 'var(--cyan2)', display: 'flex' }}>
              <Icon name="grid" size={17} />
            </span>
            <h2 className="ni-home__headingText">Network Insight Applications</h2>
          </div>

          <div className="ni-panel">
            <div className="ni-tiles">
              {applications.map((app) => {
                const selected = app.id === selectedApplication.id
                return (
                  <button
                    key={app.id}
                    type="button"
                    className={`ni-tile${selected ? ' ni-tile--selected' : ''}`}
                    onClick={() => selectApplication(app.id)}
                  >
                    <span className="ni-tile__icon">
                      <DuoIcon name={app.icon} size={26} />
                    </span>
                    <span className="ni-tile__label">{app.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Keyed on the application so switching replays the entrance. */}
        <div key={selectedApplication.id} style={{ animation: 'niUp .26s ease' }}>
          <div className="ni-home__heading">
            <span className="ni-ico">
              <DuoIcon name={selectedApplication.icon} size={18} />
            </span>
            <h2 className="ni-home__headingText">{selectedApplication.label}</h2>
            <span className="ni-home__headingMeta">
              {selectedApplication.modules.length} modules
            </span>
          </div>

          <div className="ni-panel">
            <div className="ni-cards">
              {selectedApplication.modules.map((module) => {
                const expanded = navigation.expandedCard === module.label
                const pinned = session.favorites.includes(module.label)
                const grouping = Boolean(module.children)

                return (
                  <div
                    key={module.label}
                    className={`ni-card${expanded ? ' ni-card--expanded' : ''}`}
                  >
                    <div className="ni-card__head">
                      {/* The card body is one button; the pin sits beside it
                          rather than nested, since a button cannot contain
                          another button. */}
                      <button
                        type="button"
                        className="ni-card__open"
                        aria-expanded={grouping ? expanded : undefined}
                        onClick={() => activateCard(module.label, grouping)}
                      >
                        <span className="ni-card__icon">
                          <DuoIcon
                            name={MODULE_ICONS[module.label] ?? selectedApplication.icon}
                            size={20}
                          />
                        </span>
                        <span className="ni-card__label">{module.label}</span>
                        {grouping ? (
                          <span
                            className={`ni-card__chevron${expanded ? ' ni-card__chevron--open' : ''}`}
                          >
                            <Icon name="chevD" size={15} />
                          </span>
                        ) : (
                          <span className="ni-card__leafMark">
                            <Icon name="arrowUpRight" size={15} />
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        className={`ni-card__pin${pinned ? ' ni-card__pin--pinned' : ''}`}
                        title={pinned ? 'Remove from Quick Access' : 'Pin to Quick Access'}
                        aria-label={
                          pinned
                            ? `Remove ${module.label} from Quick Access`
                            : `Pin ${module.label} to Quick Access`
                        }
                        onClick={() => togglePin(module.label)}
                      >
                        <Icon name="pin" size={14} />
                      </button>
                    </div>

                    {expanded && module.children && (
                      <div className="ni-card__children">
                        <div className="ni-card__childList">
                          {module.children.map((child) => (
                            <button
                              key={child}
                              type="button"
                              className="ni-card__child"
                              onClick={() => openModule(child)}
                            >
                              <span className="ni-ico">
                                <DuoIcon name={MODULE_ICON} size={15} />
                              </span>
                              {child}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="ni-home__side" style={{ order: narrow ? 1 : 2 }}>
        <QuickAccess />
        <RecentModules />
      </div>
    </div>
  )
}
