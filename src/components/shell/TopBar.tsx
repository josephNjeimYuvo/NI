import { Icon } from '@/lib/icons'
import { DEFAULT_USER } from '@/data/session'
import { useAppState } from '@/state/AppStateProvider'
import { TabStrip } from './TabStrip'
import './TopBar.css'

/**
 * Top bar: open tabs on the left, search in the middle, and the account and
 * appearance controls on the right.
 */
export function TopBar() {
  const { palette, preferences, notifications, signOut } = useAppState()

  const dark = preferences.theme === 'dark'

  return (
    <div className="ni-topbar">
      <TabStrip />

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
