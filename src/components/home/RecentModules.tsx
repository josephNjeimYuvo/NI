import { DuoIcon } from '@/lib/icons'
import { applicationOfModule } from '@/lib/catalog'
import { relativeTime } from '@/lib/format'
import { useAppState } from '@/state/AppStateProvider'
import './MainMenu.css'

/** Entries shown inline before the list defers to the activity panel. */
const PREVIEW_COUNT = 5

/** The most recently opened modules, newest first. */
export function RecentModules() {
  const { catalog, session, openModule, activity } = useAppState()

  return (
    <div className="ni-section">
      <div className="ni-section__head">
        <h2 className="ni-section__title" style={{ flex: 1 }}>
          Recent Modules
        </h2>
        <button
          type="button"
          className="ni-section__action"
          onClick={() => activity.openActivity('recent')}
        >
          View All
        </button>
      </div>

      <div className="ni-recent">
        {session.recent.slice(0, PREVIEW_COUNT).map((entry) => {
          const app = applicationOfModule(catalog, entry.name)
          return (
            <button
              key={entry.name}
              type="button"
              className="ni-recent__row"
              onClick={() => openModule(entry.name)}
            >
              <span className="ni-entryIcon">
                <DuoIcon name={app.icon} size={17} weight={1.8} />
              </span>
              <span className="ni-recent__text">
                <span className="ni-recent__name">{entry.name}</span>
                <span className="ni-recent__app">{app.short ?? app.label}</span>
              </span>
              <span className="ni-recent__ago">{relativeTime(entry.timestamp)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
