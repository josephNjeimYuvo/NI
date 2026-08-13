import { useEffect, type ReactNode } from 'react'
import './Popover.css'

/**
 * A small anchored panel with a click-away scrim.
 *
 * Render it inside a `position: relative` wrapper — it positions itself under
 * that wrapper. The scrim sits between the page and the panel so a click
 * anywhere else dismisses it without reaching whatever is underneath, which
 * also stops a dismissing click from activating a control by accident.
 */
export function Popover({
  open,
  onClose,
  align = 'left',
  width,
  label,
  children,
}: {
  open: boolean
  onClose: () => void
  /** Which edge of the anchor the panel lines up with. */
  align?: 'left' | 'right'
  width?: number
  /** Accessible name for the panel. */
  label: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div className="ni-popover__scrim" onClick={onClose} role="presentation" />
      <div
        className={`ni-popover ni-popover--${align}`}
        style={width ? { width } : undefined}
        role="dialog"
        aria-label={label}
      >
        {children}
      </div>
    </>
  )
}

/** Section label inside a popover. */
export function PopoverHeading({ children }: { children: ReactNode }) {
  return <div className="ni-popover__heading">{children}</div>
}

/** A full-width row inside a popover. */
export function PopoverItem({
  onClick,
  selected = false,
  children,
}: {
  onClick: () => void
  selected?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={`ni-popover__item${selected ? ' ni-popover__item--selected' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function PopoverDivider() {
  return <div className="ni-popover__divider" />
}
