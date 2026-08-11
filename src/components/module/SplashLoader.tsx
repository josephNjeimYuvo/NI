import { SplashMark } from '@/components/common/Marks'
import './ModuleView.css'

/** Shown while a module comes up, with the logo tracing in as progress runs. */
export function SplashLoader({ name, progress }: { name: string; progress: number }) {
  return (
    <div className="ni-splash">
      <SplashMark progress={progress} />
      <div className="ni-splash__label">Loading {name}…</div>
      <div
        className="ni-splash__track"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Loading ${name}`}
      >
        <div className="ni-splash__bar" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
