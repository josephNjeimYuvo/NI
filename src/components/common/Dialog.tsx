import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from '@/lib/icons'
import './Dialog.css'

/**
 * A centred modal dialog.
 *
 * Focus moves into the dialog on open and is trapped while it is up, so
 * keyboard users cannot tab out into the page behind it, and Escape or a
 * click on the backdrop closes it.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="ni-dialog__layer">
      <div className="ni-dialog__backdrop" onClick={onClose} role="presentation" />
      <div
        ref={panelRef}
        className="ni-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="ni-dialog__head">
          <h2 className="ni-dialog__title">{title}</h2>
          <div className="ni-spacer" />
          <button type="button" className="ni-dialog__close" aria-label="Close" onClick={onClose}>
            <Icon name="x" size={17} />
          </button>
        </div>
        <div className="ni-dialog__body">{children}</div>
      </div>
    </div>
  )
}
