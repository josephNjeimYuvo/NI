import { MARK_PATH } from '@/lib/logo'

/**
 * Illustrative marks for loading and empty states. Each is hand-drawn rather
 * than pulled from the icon set, because they carry more weight on screen and
 * need shapes the 24×24 grid cannot express.
 */

/**
 * The logo drawing itself in as a module loads: a faint ghost underneath, an
 * outline that traces on with progress, then the solid fill.
 */
export function SplashMark({ progress }: { progress: number }) {
  const raw = Math.max(0, Math.min(1, progress / 100))
  // Smoothstep, so the trace eases rather than running linearly.
  const eased = raw * raw * (3 - 2 * raw)

  return (
    <svg
      width={140}
      height={140}
      viewBox="-3 -3 50 46"
      style={{ display: 'block', overflow: 'visible', animation: 'niBreath 3.6s ease-in-out infinite' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ni-splash-stroke" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="var(--cyan2)" />
          <stop offset="1" stopColor="var(--cyan)" />
        </linearGradient>
      </defs>

      <path d={MARK_PATH} fillRule="evenodd" clipRule="evenodd" fill="var(--txt)" opacity={0.07} />
      {/* The outline completes at 75%, leaving the last quarter for the fill. */}
      <path
        d={MARK_PATH}
        fillRule="evenodd"
        clipRule="evenodd"
        fill="none"
        stroke="url(#ni-splash-stroke)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - Math.min(1, eased / 0.75)}
      />
      <path
        d={MARK_PATH}
        fillRule="evenodd"
        clipRule="evenodd"
        fill="var(--head)"
        opacity={Math.max(0, (eased - 0.72) / 0.28)}
      />
    </svg>
  )
}

/** A severed network graph, for the module load failure screen. */
export function BrokenMark() {
  return (
    <svg width={96} height={64} viewBox="0 0 96 64" aria-hidden="true">
      <path
        d="M30 50a18 18 0 0 1 12-16.6"
        stroke="currentColor"
        strokeWidth={4.5}
        strokeLinecap="round"
        fill="none"
        opacity={0.35}
      />
      <path
        d="M66 50a18 18 0 0 0-11-16.4"
        stroke="currentColor"
        strokeWidth={4.5}
        strokeLinecap="round"
        fill="none"
        opacity={0.35}
      />
      <path
        d="M14 34a38 38 0 0 1 21-19"
        stroke="currentColor"
        strokeWidth={4.5}
        strokeLinecap="round"
        fill="none"
        opacity={0.18}
      />
      <path
        d="M82 34a38 38 0 0 0-20-18.8"
        stroke="currentColor"
        strokeWidth={4.5}
        strokeLinecap="round"
        fill="none"
        opacity={0.18}
      />
      <circle cx={48} cy={54} r={6} fill="var(--crit)" opacity={0.8} />
      <path d="M60 6L36 60" stroke="var(--crit)" strokeWidth={3} strokeLinecap="round" opacity={0.55} />
    </svg>
  )
}

/** A table under a magnifier, for the "no rows match" grid state. */
export function EmptyGridMark() {
  return (
    <svg width={76} height={56} viewBox="0 0 76 56" style={{ color: 'var(--cyan2)' }} aria-hidden="true">
      <rect
        x={10}
        y={12}
        width={56}
        height={34}
        rx={4}
        stroke="currentColor"
        strokeWidth={2.2}
        fill="none"
        opacity={0.5}
      />
      <path d="M10 24h56" stroke="currentColor" strokeWidth={2.2} opacity={0.5} />
      <path
        d="M22 34h14M22 40h26"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        opacity={0.22}
      />
      <circle cx={58} cy={40} r={11} fill="var(--card)" stroke="currentColor" strokeWidth={2.2} />
      <path d="M66 48l6 6" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
    </svg>
  )
}

/** An emptied inbox with a tick, for the cleared notification list. */
export function EmptyInboxMark() {
  return (
    <svg width={72} height={56} viewBox="0 0 72 56" style={{ color: 'var(--cyan2)' }} aria-hidden="true">
      <path
        d="M8 30l10-20h36l10 20v14a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z"
        stroke="currentColor"
        strokeWidth={2.2}
        fill="none"
        opacity={0.55}
      />
      <path
        d="M8 30h16l3 6h18l3-6h16"
        stroke="currentColor"
        strokeWidth={2.2}
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M30 20l5 5 9-9"
        stroke="currentColor"
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
