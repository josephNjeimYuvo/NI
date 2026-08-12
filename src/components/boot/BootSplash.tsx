import { LogoLockup } from '@/lib/logo'
import { BUILD_INFO } from '@/data/session'
import './BootSplash.css'

/**
 * Status line for the splash. Deliberately one product-level message rather
 * than a per-step readout: the warm-up is a single short phase, and narrating
 * it would flash labels too briefly to read.
 */
const STATUS = 'Preparing your workspace'

/** Branded hand-off between sign-in and the landing screen. */
export function BootSplash({ progress }: { progress: number }) {
  return (
    <div
      className="ni-boot"
      role="status"
      aria-live="polite"
      aria-label={`Starting Network Insight — ${STATUS}`}
    >
      <div className="ni-boot__wash" />

      <div className="ni-boot__logo">
        <LogoLockup width={240} />
      </div>

      <div className="ni-boot__status">
        <div
          className="ni-boot__track"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="ni-boot__bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="ni-boot__status-text">{STATUS}</div>
      </div>

      <div className="ni-boot__build">{BUILD_INFO}</div>
    </div>
  )
}
