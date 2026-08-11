import { useCallback, useState } from 'react'

export interface PaletteState {
  open: boolean
  query: string
  /** Index of the highlighted result within the flattened result list. */
  cursor: number
  setQuery: (query: string) => void
  setCursor: (index: number) => void
  /** Moves the cursor by `delta`, clamped to `[0, count - 1]`. */
  moveCursor: (delta: number, count: number) => void
  openPalette: () => void
  closePalette: () => void
  toggle: () => void
}

/**
 * Command palette. Opening, closing and typing all reset the cursor, so the
 * highlight is always on the first result when the list changes.
 */
export function usePalette(): PaletteState {
  const [open, setOpen] = useState(false)
  const [query, setQueryValue] = useState('')
  const [cursor, setCursor] = useState(0)

  const reset = useCallback(() => {
    setQueryValue('')
    setCursor(0)
  }, [])

  const setQuery = useCallback((next: string) => {
    setQueryValue(next)
    setCursor(0)
  }, [])

  const openPalette = useCallback(() => {
    setOpen(true)
    reset()
  }, [reset])

  const closePalette = useCallback(() => {
    setOpen(false)
    reset()
  }, [reset])

  const toggle = useCallback(() => {
    setOpen((current) => !current)
    reset()
  }, [reset])

  const moveCursor = useCallback((delta: number, count: number) => {
    setCursor((current) => Math.max(0, Math.min(count - 1, current + delta)))
  }, [])

  return {
    open,
    query,
    cursor,
    setQuery,
    setCursor,
    moveCursor,
    openPalette,
    closePalette,
    toggle,
  }
}
