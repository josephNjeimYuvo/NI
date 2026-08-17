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

/**
 * Floors used when the viewer has asked for reduced motion. The splash still
 * appears — it is covering real work — but it stops being a held beat, since
 * the animation is the only reason the full duration exists.
 */
const REDUCED_DURATION = { entering: 400, leaving: 250 } as const

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

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
  /**
   * Runs the same warm-up with no splash over it, for a session that came
   * back from storage. The work still has to happen — a reload starts with
   * nothing fetched — but there is no arrival to mark.
   */
  resume: () => void
  /** Runs the sign-out teardown, ending at `idle`. */
  leave: () => void
}

interface Options {
  /** Warm-up that needs an authenticated user, run on the way in. */
  enter: TransitionTask[]
  /** Teardown run on the way out, before the login screen returns. */
  leave: TransitionTask[]
  /**
   * Where the machine starts. `ready` for a restored session, so the app is
   * on screen from the first frame instead of behind a splash.
   */
  initialPhase?: TransitionPhase
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
export function useSessionTransition({
  enter,
  leave,
  initialPhase = 'idle',
}: Options): SessionTransitionState {
  const [phase, setPhase] = useState<TransitionPhase>(initialPhase)
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

  // Same tasks, same order, no phase change and no minimum duration: the app
  // is already on screen and fills in as each one lands.
  const resume = useCallback(() => {
    void (async () => {
      for (const task of enterRef.current) await task()
    })()
  }, [])

  useEffect(() => {
    if (phase !== 'entering' && phase !== 'leaving') return

    const tasks = phase === 'entering' ? enterRef.current : leaveRef.current
    const minimum = prefersReducedMotion() ? REDUCED_DURATION[phase] : MINIMUM_DURATION[phase]
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

  return { phase, progress, enter: startEnter, resume, leave: startLeave }
}
