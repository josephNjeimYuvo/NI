import { useState } from 'react'
import { Icon } from '@/lib/icons'
import { DEFAULT_USER } from '@/data/session'
import { useAppState } from '@/state/AppStateProvider'
import { Popover, PopoverDivider, PopoverItem } from '@/components/common/Popover'
import { AboutDialog, HelpDialog } from './HelpDialog'
import { TabStrip } from './TabStrip'
import './TopBar.css'

/** Above this, the bell shows a plus rather than an exact figure. */
const MAX_BADGE_COUNT = 99

/**
 * Top bar: open tabs on the left, search in the middle, and the account and
 * appearance controls on the right.
 */
export function TopBar() {
  const { palette, preferences, notifications, signOut } = useAppState()
  const [helpOpen, setHelpOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const dark = preferences.theme === 'dark'
  const unread = notifications.unreadCount

  return (
    <header className="ni-topbar">
      <TabStrip />

      <button
        type="button"
        className="ni-topbar__search"
        onClick={palette.openPalette}
        aria-label="Search Network Insight"
      >
        <Icon name="search" size={16} />
        <span className="ni-topbar__searchLabel">Search…</span>
        <span className="ni-topbar__kbd" aria-hidden="true">
          ⌘K
        </span>
      </button>

      <div className="ni-topbar__actions">
        <button
          type="button"
          className="ni-iconbutton"
          title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={preferences.toggleTheme}
        >
          <Icon name={dark ? 'sun' : 'moon'} size={19} />
        </button>

        <button
          type="button"
          className="ni-iconbutton"
          title="Keyboard shortcuts"
          aria-label="Keyboard shortcuts"
          onClick={() => setHelpOpen(true)}
        >
          <Icon name="help" size={19} />
        </button>

        <button
          type="button"
          className="ni-iconbutton"
          title="About Network Insight"
          aria-label="About Network Insight"
          onClick={() => setAboutOpen(true)}
        >
          <Icon name="info" size={19} />
        </button>

        <button
          type="button"
          className="ni-iconbutton"
          title={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
          onClick={notifications.toggle}
        >
          <Icon name="bell" size={19} />
          {unread > 0 && (
            <span className="ni-iconbutton__count" aria-hidden="true">
              {unread > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : unread}
            </span>
          )}
        </button>

        {/* Sign out lives inside this menu rather than beside it: as a bare
            icon it was a single stray click away from ending the session. */}
        <div className="ni-usermenu">
          <button
            type="button"
            className="ni-iconbutton"
            title={DEFAULT_USER.name}
            aria-label={`Account: ${DEFAULT_USER.name}`}
            aria-haspopup="menu"
            aria-expanded={userOpen}
            onClick={() => setUserOpen((open) => !open)}
          >
            <Icon name="user" size={19} />
          </button>

          <Popover
            open={userOpen}
            onClose={() => setUserOpen(false)}
            align="right"
            label="Account"
            width={244}
          >
            <div className="ni-usermenu__identity">
              <span className="ni-usermenu__avatar">
                <Icon name="user" size={18} />
              </span>
              <span className="ni-usermenu__text">
                <span className="ni-usermenu__name">{DEFAULT_USER.name}</span>
                <span className="ni-usermenu__email">{DEFAULT_USER.email}</span>
              </span>
            </div>
            <PopoverDivider />
            <PopoverItem
              onClick={() => {
                setUserOpen(false)
                setHelpOpen(true)
              }}
            >
              <Icon name="help" size={15} />
              Keyboard shortcuts
            </PopoverItem>
            <PopoverItem
              onClick={() => {
                setUserOpen(false)
                setAboutOpen(true)
              }}
            >
              <Icon name="info" size={15} />
              About Network Insight
            </PopoverItem>
            <PopoverDivider />
            <PopoverItem
              onClick={() => {
                setUserOpen(false)
                signOut()
              }}
            >
              <Icon name="logout" size={15} />
              Sign out
            </PopoverItem>
          </Popover>
        </div>
      </div>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </header>
  )
}
