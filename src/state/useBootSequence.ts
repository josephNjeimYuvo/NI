import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Shortest time the splash stays up, in ms.
 *
 * Warm-up finishes almost instantly against fixtures. Without a floor the
 * splash would flash for a frame and read as a glitch, so the sequence always
 * runs for at least this long and the progress bar is paced to match.
 */
const MINIMUM_DURATION = 1800

/** How often the progress bar advances, in ms. */
const PROGRESS_TICK = 60

/** Beat spent at 100% so the bar visibly completes before handing over. */
const COMPLETION_DWELL = 260

export type BootPhase = 'idle' | 'preparing' | 'ready'

/** A unit of post-sign-in warm-up. */
export type BootTask = () => Promise<unknown>

export interface BootSequenceState {
  phase: BootPhase
  /** 0–100, paced against {@link MINIMUM_DURATION}. */
  progress: number
  start: () => void
  reset: () => void
}

/**
 * Runs the warm-up between sign-in and the landing screen.
 *
 * Tasks run in order, and the sequence completes when both they and the
 * minimum duration are done — so real latency extends the splash rather than
 * being hidden behind it.
 */
export function useBootSequence(tasks: BootTask[]): BootSequenceState {
  const [phase, setPhase] = useState<BootPhase>('idle')
  const [progress, setProgress] = useState(0)

  // Held in a ref so a new task array identity cannot restart a run in flight.
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks

  const start = useCallback(() => {
    setProgress(0)
    setPhase('preparing')
  }, [])

  const reset = useCallback(() => {
    setPhase('idle')
    setProgress(0)
  }, [])

  useEffect(() => {
    if (phase !== 'preparing') return

    let cancelled = false
    const startedAt = Date.now()

    // Hold just short of full until the work is actually finished, so the bar
    // never sits at 100% while something is still running.
    const ticker = setInterval(() => {
      if (cancelled) return
      const elapsed = Date.now() - startedAt
      setProgress(Math.min(99, Math.round((elapsed / MINIMUM_DURATION) * 100)))
    }, PROGRESS_TICK)

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    const run = async () => {
      for (const task of tasksRef.current) {
        if (cancelled) return
        await task()
      }
      if (cancelled) return

      const remaining = MINIMUM_DURATION - (Date.now() - startedAt)
      if (remaining > 0) await wait(remaining)
      if (cancelled) return

      clearInterval(ticker)
      setProgress(100)
      await wait(COMPLETION_DWELL)
      if (cancelled) return

      setPhase('ready')
    }

    void run()

    return () => {
      cancelled = true
      clearInterval(ticker)
    }
  }, [phase])

  return { phase, progress, start, reset }
}
