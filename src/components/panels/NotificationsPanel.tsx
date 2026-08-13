import { EmptyInboxMark } from '@/components/common/Marks'
import { NOTIFICATION_TARGETS } from '@/data/notifications'
import { Icon } from '@/lib/icons'
import { useAppState } from '@/state/AppStateProvider'
import { NOTIFICATION_FILTERS } from '@/state/useNotifications'
import type { NotificationSeverity } from '@/types'
import './Panels.css'

/** Severity colours. Warning has no token because it is shared across brands. */
const SEVERITY_COLOR: Record<NotificationSeverity, string> = {
  critical: 'var(--crit)',
  warning: '#F59E0B',
  info: 'var(--cyan2)',
}

/** Alarm inbox, as a right-hand slide-over. */
export function NotificationsPanel() {
  const { notifications, openModule } = useAppState()

  return (
    <div className="ni-overlay">
      <div className="ni-overlay__scrim" onClick={notifications.close} role="presentation" />

      <div className="ni-panel-slide">
        <div className="ni-panel-slide__head">
          <span className="ni-panel-slide__title">Notifications</span>
          {notifications.unreadCount > 0 && (
            <span className="ni-panel-slide__badge">{notifications.unreadCount}</span>
          )}
          <div className="ni-spacer" />
          <button
            type="button"
            className="ni-panel-slide__link"
            onClick={notifications.markAllRead}
          >
            Mark all read
          </button>
          <button
            type="button"
            className="ni-panel-slide__close"
            title="Close"
            onClick={notifications.close}
          >
            <Icon name="x" size={17} />
          </button>
        </div>

        <div className="ni-notif__filters">
          {NOTIFICATION_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`ni-notif__filter${
                notifications.filter === filter ? ' ni-notif__filter--active' : ''
              }`}
              onClick={() => notifications.setFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="ni-panel-slide__body">
          {notifications.visible.map((item) => {
            const color = SEVERITY_COLOR[item.severity]
            const target = NOTIFICATION_TARGETS[item.category] ?? 'Run History'
            return (
              /* The row looked clickable but only its buttons worked, so the
                 whole row now opens the notification's module. */
              <div
                key={item.id}
                className={`ni-notif__item${item.read ? '' : ' ni-notif__item--unread'}`}
                role="button"
                tabIndex={0}
                aria-label={`${item.title}. Open ${target}`}
                onClick={() => openModule(target)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  openModule(target)
                }}
              >
                <span className="ni-notif__dot" style={{ background: color }} />
                <span className="ni-notif__icon" style={{ color }}>
                  <Icon name={item.severity === 'info' ? 'info' : 'alert'} size={15} />
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ni-notif__head">
                    <span className="ni-notif__title">{item.title}</span>
                    <span className="ni-notif__time">{item.time}</span>
                  </div>
                  <div className="ni-notif__body">{item.body}</div>

                  <div className="ni-notif__actions">
                    <button
                      type="button"
                      className="ni-notif__open"
                      onClick={(event) => {
                        event.stopPropagation()
                        openModule(target)
                      }}
                    >
                      Open {target}
                    </button>
                    <button
                      type="button"
                      className="ni-notif__dismiss"
                      onClick={(event) => {
                        event.stopPropagation()
                        notifications.dismiss(item.id)
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {notifications.visible.length === 0 && (
            <div className="ni-panel-empty">
              <EmptyInboxMark />
              <div className="ni-panel-empty__title">You&apos;re all caught up</div>
              <div className="ni-panel-empty__text">
                New alarms, system messages and finished reports will show up here.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
