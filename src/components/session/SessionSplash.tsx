import { LogoLockup } from '@/lib/logo'
import { BUILD_INFO } from '@/data/session'
import './SessionSplash.css'

/** Which way the session is moving: into the app, or back out to sign-in. */
export type SplashDirection = 'in' | 'out'

/**
 * Status line for each direction. Deliberately one product-level message
 * rather than a per-step readout: each transition is a single short phase,
 * and narrating it would flash labels too briefly to read.
 */
const STATUS: Record<SplashDirection, string> = {
  in: 'Preparing your workspace',
  out: 'Signing you out',
}

/**
 * Branded hand-off either side of a session — between sign-in and the landing
 * screen, and between signing out and the login screen. It reuses the login
 * screen's gradient and wash, so both transitions read as one continuous
 * surface rather than a cut.
 */
export function SessionSplash({
  direction,
  progress,
}: {
  direction: SplashDirection
  progress: number
}) {
  const status = STATUS[direction]

  return (
    <div
      className="ni-splashscreen"
      role="status"
      aria-live="polite"
      aria-label={`Network Insight — ${status}`}
    >
      <div className="ni-splashscreen__wash" />

      <div className="ni-splashscreen__logo">
        <LogoLockup width={240} />
      </div>

      <div className="ni-splashscreen__status">
        <div
          className="ni-splashscreen__track"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="ni-splashscreen__bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="ni-splashscreen__text">{status}</div>
      </div>

      <div className="ni-splashscreen__build">{BUILD_INFO}</div>
    </div>
  )
}
