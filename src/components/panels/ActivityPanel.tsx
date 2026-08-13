import { DuoIcon, Icon, IconBold } from '@/lib/icons'
import { applicationOfModule } from '@/lib/catalog'
import { relativeTime } from '@/lib/format'
import { useAppState } from '@/state/AppStateProvider'
import './Panels.css'

/**
 * The full history behind the main menu's Recent and Favorites previews.
 * Favorites have no timestamp, so their rows omit the age column.
 */
export function ActivityPanel() {
  const { catalog, session, activity, openModule } = useAppState()

  const favorites = activity.mode === 'favorites'
  const entries = favorites
    ? session.favorites.map((name) => ({ name, timestamp: null }))
    : session.recent.map((entry) => ({ name: entry.name, timestamp: entry.timestamp }))

  const open = (name: string) => {
    activity.close()
    openModule(name)
  }

  return (
    <div className="ni-overlay">
      <div className="ni-overlay__scrim" onClick={activity.close} role="presentation" />

      <div className="ni-panel-slide">
        <div className="ni-panel-slide__head ni-panel-slide__head--bordered">
          <span className="ni-panel-slide__title">
            {favorites ? 'My Favorites' : 'Recently Used'}
          </span>
          <span className="ni-panel-slide__meta">
            {entries.length} {favorites ? 'pinned' : 'modules'}
          </span>
          <div className="ni-spacer" />
          <button
            type="button"
            className="ni-panel-slide__close"
            title="Close"
            onClick={activity.close}
          >
            <Icon name="x" size={17} />
          </button>
        </div>

        <div className="ni-panel-slide__body">
          {entries.map((entry) => {
            const app = applicationOfModule(catalog, entry.name)
            return (
              <button
                key={entry.name}
                type="button"
                className="ni-activity__row"
                onClick={() => open(entry.name)}
              >
                <span className="ni-entryIcon">
                  <DuoIcon name={app.icon} size={17} weight={1.8} />
                </span>
                <span className="ni-activity__text">
                  <span className="ni-activity__name">{entry.name}</span>
                  <span className="ni-activity__app">{app.short ?? app.label}</span>
                </span>
                <span className="ni-activity__ago">
                  {entry.timestamp === null ? '' : relativeTime(entry.timestamp)}
                </span>
              </button>
            )
          })}

          {entries.length === 0 && (
            <div className="ni-panel-empty ni-panel-empty--top">
              <span style={{ color: 'var(--mut)', opacity: 0.6, display: 'flex' }}>
                <IconBold name="inbox" size={34} />
              </span>
              <div className="ni-panel-empty__title" style={{ marginTop: 4, fontSize: 13.5 }}>
                {favorites ? 'No pinned items yet' : 'Nothing opened yet'}
              </div>
              <div className="ni-panel-empty__text" style={{ fontSize: 12, maxWidth: 240 }}>
                {favorites
                  ? 'Pin a module from the catalog to keep it here.'
                  : 'Modules you open will be listed here.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
