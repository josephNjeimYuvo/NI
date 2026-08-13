import { Dialog } from '@/components/common/Dialog'
import { LogoLockup } from '@/lib/logo'
import { BUILD_INFO } from '@/data/session'

/** Shortcuts the app actually implements — nothing aspirational listed here. */
const SHORTCUTS: Array<{ label: string; keys: string[] }> = [
  { label: 'Open search', keys: ['⌘', 'K'] },
  { label: 'Move through search results', keys: ['↑', '↓'] },
  { label: 'Open the highlighted result', keys: ['↵'] },
  { label: 'Close search, panels or full screen', keys: ['Esc'] },
  { label: 'Move between open tabs', keys: ['←', '→'] },
]

export function HelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Keyboard shortcuts">
      <div className="ni-shortcuts">
        {SHORTCUTS.map((shortcut) => (
          <div key={shortcut.label} className="ni-shortcuts__row">
            <span className="ni-shortcuts__label">{shortcut.label}</span>
            <span className="ni-shortcuts__keys">
              {shortcut.keys.map((key) => (
                <kbd key={key} className="ni-kbd">
                  {key}
                </kbd>
              ))}
            </span>
          </div>
        ))}
      </div>
    </Dialog>
  )
}

export function AboutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="About Network Insight">
      <p className="ni-about__lead">
        <LogoLockup width={170} />
      </p>
      <div className="ni-about">
        <div className="ni-about__row">
          <span className="ni-about__key">Version</span>
          <span className="ni-about__value ni-about__mono">{BUILD_INFO}</span>
        </div>
        <div className="ni-about__row">
          <span className="ni-about__key">Data source</span>
          <span className="ni-about__value">
            Fixture services — no backend is attached in this build
          </span>
        </div>
        <div className="ni-about__row">
          <span className="ni-about__key">Support</span>
          <span className="ni-about__value">networkinsight-support@ni-telecom.com</span>
        </div>
      </div>
    </Dialog>
  )
}
