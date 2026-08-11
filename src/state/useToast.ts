import { useCallback, useEffect, useRef, useState } from 'react'

/** How long a toast stays on screen, in ms. */
const TOAST_DURATION = 2400

export interface ToastState {
  message: string | null
  show: (message: string) => void
}

/**
 * Transient confirmation messages. A new message replaces any message still
 * showing and restarts the timer, so rapid actions do not queue up.
 */
export function useToast(): ToastState {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    [],
  )

  const show = useCallback((next: string) => {
    setMessage(next)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), TOAST_DURATION)
  }, [])

  return { message, show }
}
