import { useEffect, useState } from 'react'
import { useAppState } from '@/state/AppStateProvider'

/**
 * Screen-reader announcements for changes that are otherwise only visual.
 *
 * Opening a module, a module failing, and toasts all change the screen
 * without moving focus, so without this they pass silently. The element is
 * visually hidden rather than removed, because an `aria-live` region has to
 * already be in the document when its content changes for the update to be
 * announced.
 */
export function Announcer() {
  const { tabs, toast } = useAppState()
  const [message, setMessage] = useState('')

  const tab = tabs.activeTab
  const status = tab?.status
  const label = tab?.label
  const failure = tab?.failure?.kind

  useEffect(() => {
    if (!label) {
      setMessage('Main menu')
      return
    }
    if (status === 'loading') setMessage(`Loading ${label}`)
    else if (status === 'error') {
      // Matched to what is on screen: announcing a load failure for a module
      // that was never available would send a screen-reader user off to retry
      // something that cannot work.
      setMessage(
        failure === 'unavailable'
          ? `${label} is not available yet`
          : `${label} could not be loaded`,
      )
    } else if (status === 'ready') setMessage(`${label} ready`)
  }, [label, status, failure])

  useEffect(() => {
    if (toast.message) setMessage(toast.message)
  }, [toast.message])

  return (
    <div className="ni-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  )
}
