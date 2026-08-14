import { DuoIcon, Icon } from '@/lib/icons'
import { MARK_PATH } from '@/lib/logo'
import type { ModuleFailureKind } from '@/types'

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

/**
 * The module that would not open, for the failure screen.
 *
 * The module's own catalog icon sits in the middle, so the picture is about
 * the thing that was clicked rather than a generic broken network. What
 * surrounds it carries the reason, and each reason is drawn differently
 * enough to be told apart at a glance:
 *
 *   unavailable — dashed frame, arcs that never join: nothing is there yet
 *   timeout     — everything intact, cut through: the link did not hold
 *   internal    — arcs intact, the frame itself fractured: the network is
 *                 fine and the module is what broke
 */
export function ModuleFailureMark({ icon, kind }: { icon: string; kind: ModuleFailureKind }) {
  const pending = kind === 'unavailable'
  const severed = kind === 'timeout'
  const cracked = kind === 'internal'

  return (
    <svg width={208} height={172} viewBox="0 0 208 172" aria-hidden="true">
      <defs>
        {/* A wash rather than a flat field, so the mark sits in something
            instead of floating on an empty page. */}
        <radialGradient id="ni-failure-wash" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--icon-accent)" stopOpacity={0.17} />
          <stop offset="0.6" stopColor="var(--icon-accent)" stopOpacity={0.05} />
          <stop offset="1" stopColor="var(--icon-accent)" stopOpacity={0} />
        </radialGradient>
      </defs>

      <circle cx={104} cy={82} r={86} fill="url(#ni-failure-wash)" />

      <g
        stroke="var(--icon-accent)"
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
        opacity={pending ? 0.45 : 0.55}
        strokeDasharray={pending ? '2 11' : undefined}
      >
        <path d="M40 122a64 64 0 0 1 0-80" />
        <path d="M168 42a64 64 0 0 1 0 80" />
      </g>
      <g
        stroke="var(--icon-primary)"
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
        opacity={pending ? 0.22 : 0.3}
        strokeDasharray={pending ? '2 11' : undefined}
      >
        <path d="M58 110a46 46 0 0 1 0-56" />
        <path d="M150 54a46 46 0 0 1 0 56" />
      </g>

      <rect
        x={64}
        y={42}
        width={80}
        height={80}
        rx={19}
        fill="var(--card)"
        stroke="var(--icon-primary)"
        strokeWidth={2}
        strokeDasharray={pending ? '7 7' : undefined}
        opacity={0.9}
      />

      {/* Scaled rather than redrawn: the icon keeps the two-tone treatment it
          has everywhere else the module is listed. */}
      <g transform="translate(80 58) scale(2)">
        <DuoIcon name={icon} size={24} weight={1.5} />
      </g>

      {severed && (
        <path
          d="M138 32L70 132"
          stroke="var(--crit)"
          strokeWidth={4}
          strokeLinecap="round"
          opacity={0.75}
        />
      )}

      {/* Twice over: a wide stroke in the panel's own fill splits the drawing
          apart, and the thin one on top is the fracture running through it. */}
      {cracked && (
        <>
          <path
            d="M112 40 L96 74 L118 88 L102 124"
            stroke="var(--card)"
            strokeWidth={9}
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M112 40 L96 74 L118 88 L102 124"
            stroke="var(--crit)"
            strokeWidth={3.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={0.85}
          />
        </>
      )}

      <circle
        cx={150}
        cy={118}
        r={18}
        fill="var(--card)"
        stroke="var(--bd)"
        strokeWidth={1.5}
      />
      <g
        transform="translate(140 108) scale(0.833)"
        style={{ color: pending ? 'var(--icon-accent)' : 'var(--crit)' }}
      >
        <Icon name={pending ? 'clock' : severed ? 'alert' : 'x'} size={24} weight={2} />
      </g>
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
