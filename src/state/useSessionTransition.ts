import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Shortest time each transition stays on screen, in ms.
 *
 * The work behind them finishes almost instantly against fixtures. Without a
 * floor the splash would flash for a frame and read as a glitch, so each
 * transition always runs for at least this long and its progress bar is paced
 * to match. Signing out is the brisker of the two — it is an exit, not an
 * arrival, and lingering on it just delays the user.
 */
const MINIMUM_DURATION = { entering: 1800, leaving: 1100 } as const

/** How often the progress bar advances, in ms. */
const PROGRESS_TICK = 60

/** Beat spent at 100% so the bar visibly completes before handing over. */
const COMPLETION_DWELL = 260

/**
 * Where the session is between the login screen and the app.
 *
 * `idle` and `ready` are the two settled states — signed out and signed in.
 * The other two are the transitions between them, each covered by a splash.
 */
export type TransitionPhase = 'idle' | 'entering' | 'ready' | 'leaving'

/** A unit of work performed during a transition. */
export type TransitionTask = () => Promise<unknown>

export interface SessionTransitionState {
  phase: TransitionPhase
  /** 0–100, paced against the current transition's minimum duration. */
  progress: number
  /** Runs the sign-in warm-up, ending at `ready`. */
  enter: () => void
  /** Runs the sign-out teardown, ending at `idle`. */
  leave: () => void
}

interface Options {
  /** Warm-up that needs an authenticated user, run on the way in. */
  enter: TransitionTask[]
  /** Teardown run on the way out, before the login screen returns. */
  leave: TransitionTask[]
}

/**
 * Drives the splash screens either side of a session.
 *
 * Both directions work the same way: run the tasks in order, and finish when
 * both they and the minimum duration are done — so real latency lengthens the
 * splash rather than hiding behind it. Teardown is deliberately deferred into
 * the leaving phase, so the sign-out splash covers the work instead of the
 * app tearing itself down behind an already-dismissed screen.
 */
export function useSessionTransition({ enter, leave }: Options): SessionTransitionState {
  const [phase, setPhase] = useState<TransitionPhase>('idle')
  const [progress, setProgress] = useState(0)

  // Held in refs so a new task array identity cannot restart a run in flight.
  const enterRef = useRef(enter)
  enterRef.current = enter
  const leaveRef = useRef(leave)
  leaveRef.current = leave

  const begin = useCallback((next: 'entering' | 'leaving') => {
    setProgress(0)
    setPhase(next)
  }, [])

  const startEnter = useCallback(() => begin('entering'), [begin])
  const startLeave = useCallback(() => begin('leaving'), [begin])

  useEffect(() => {
    if (phase !== 'entering' && phase !== 'leaving') return

    const tasks = phase === 'entering' ? enterRef.current : leaveRef.current
    const minimum = MINIMUM_DURATION[phase]
    const settled: TransitionPhase = phase === 'entering' ? 'ready' : 'idle'

    let cancelled = false
    const startedAt = Date.now()

    // Hold just short of full until the work is actually finished, so the bar
    // never sits at 100% while something is still running.
    const ticker = setInterval(() => {
      if (cancelled) return
      setProgress(Math.min(99, Math.round(((Date.now() - startedAt) / minimum) * 100)))
    }, PROGRESS_TICK)

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    const run = async () => {
      for (const task of tasks) {
        if (cancelled) return
        await task()
      }
      if (cancelled) return

      const remaining = minimum - (Date.now() - startedAt)
      if (remaining > 0) await wait(remaining)
      if (cancelled) return

      clearInterval(ticker)
      setProgress(100)
      await wait(COMPLETION_DWELL)
      if (cancelled) return

      setPhase(settled)
    }

    void run()

    return () => {
      cancelled = true
      clearInterval(ticker)
    }
  }, [phase])

  return { phase, progress, enter: startEnter, leave: startLeave }
}
