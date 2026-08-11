import { useCallback, useRef, useState } from 'react'

/**
 * Width below which the main menu stacks its side column above the catalog
 * instead of beside it. Measured on the content area's inner width.
 */
const NARROW_BREAKPOINT = 1040
const CONTENT_PADDING = 48

/**
 * Tracks whether the content area is too narrow for the two-column main menu.
 *
 * This observes the element rather than the viewport, because the available
 * width also changes when the sidebar collapses or expands.
 */
export function useNarrowLayout(): { narrow: boolean; ref: (el: HTMLElement | null) => void } {
  const [narrow, setNarrow] = useState(false)
  const observer = useRef<ResizeObserver>()

  const ref = useCallback((element: HTMLElement | null) => {
    observer.current?.disconnect()
    observer.current = undefined
    if (!element || typeof ResizeObserver === 'undefined') return

    const check = (width: number) => setNarrow(width - CONTENT_PADDING < NARROW_BREAKPOINT)
    observer.current = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) check(entry.contentRect.width)
    })
    observer.current.observe(element)
    check(element.clientWidth)
  }, [])

  return { narrow, ref }
}
