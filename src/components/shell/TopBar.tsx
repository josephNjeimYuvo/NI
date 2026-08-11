import { Icon } from '@/lib/icons'
import { DEFAULT_USER } from '@/data/session'
import { useAppState } from '@/state/AppStateProvider'
import './TopBar.css'

/** Tabs shown in the strip before the rest collapse into an overflow chip. */
const MAX_VISIBLE_TABS = 4

/**
 * Top bar: open tabs on the left, search in the middle, and the account and
 * appearance controls on the right.
 */
export function TopBar() {
  const { tabs, palette, preferences, notifications, signOut } = useAppState()

  const visible = tabs.tabs.slice(-MAX_VISIBLE_TABS)
  const hidden = tabs.tabs.length - visible.length
  const dark = preferences.theme === 'dark'

  return (
    <div className="ni-topbar">
      <div className="ni-topbar__tabs">
        {visible.map((tab) => {
          const active = tab.id === tabs.activeTabId
          return (
            <div
              key={tab.id}
              className={`ni-tab${active ? ' ni-tab--active' : ''}`}
              onClick={() => tabs.selectTab(tab.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') tabs.selectTab(tab.id)
              }}
            >
              <span className="ni-tab__label">{tab.label}</span>
              <button
                type="button"
                className="ni-tab__close"
                title="Close tab"
                onClick={(event) => {
                  event.stopPropagation()
                  tabs.closeTab(tab.id)
                }}
              >
                <Icon name="x" size={13} />
              </button>
            </div>
          )
        })}

        {hidden > 0 && (
          <div className="ni-topbar__overflow" title={`${hidden} more open modules`}>
            +{hidden}
          </div>
        )}
      </div>

      <button type="button" className="ni-topbar__search" onClick={palette.openPalette}>
        <Icon name="search" size={16} />
        <span className="ni-topbar__searchLabel">Search…</span>
        <span className="ni-topbar__kbd">⌘K</span>
      </button>

      <div className="ni-topbar__actions">
        <button
          type="button"
          className="ni-iconbutton"
          title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={preferences.toggleTheme}
        >
          <Icon name={dark ? 'sun' : 'moon'} size={19} />
        </button>
        <button type="button" className="ni-iconbutton" title="Help">
          <Icon name="help" size={19} />
        </button>
        <button type="button" className="ni-iconbutton" title="About Network Insight">
          <Icon name="info" size={19} />
        </button>
        <button
          type="button"
          className="ni-iconbutton"
          title="Notifications"
          onClick={notifications.toggle}
        >
          <Icon name="bell" size={19} />
          {notifications.unreadCount > 0 && <span className="ni-iconbutton__badge" />}
        </button>
        <button
          type="button"
          className="ni-iconbutton"
          title={`${DEFAULT_USER.name} · ${DEFAULT_USER.email}`}
        >
          <Icon name="user" size={19} />
        </button>
        <button type="button" className="ni-iconbutton" title="Sign out" onClick={signOut}>
          <Icon name="logout" size={19} />
        </button>
      </div>
    </div>
  )
}
