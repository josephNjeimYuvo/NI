import { Icon } from '@/lib/icons'
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
 * How each failure kind marks up the logo, and what its badge shows.
 *
 * `fill` and `outline` are tuned against each other rather than set from one
 * scale: a dashed outline reads lighter than a solid one at the same opacity,
 * so it is carried a little stronger to keep the three marks the same weight
 * on the page.
 */
const FAILURE_TREATMENT: Record<
  ModuleFailureKind,
  { badge: string; tone: string; fill: number; outline: number; dashed: boolean; scar?: string }
> = {
  // Only half filled in, because it is not all the way here yet.
  unavailable: {
    badge: 'clock',
    tone: 'var(--icon-accent)',
    fill: 0.035,
    outline: 0.75,
    dashed: true,
  },
  // One clean cut: what was there did not hold.
  timeout: {
    badge: 'alert',
    tone: 'var(--crit)',
    fill: 0.07,
    outline: 0.55,
    dashed: false,
    scar: 'M34 2L10 38',
  },
  // A fracture rather than a cut: it broke rather than being severed.
  internal: {
    badge: 'x',
    tone: 'var(--crit)',
    fill: 0.07,
    outline: 0.55,
    dashed: false,
    scar: 'M27 2 L20 15 L28 21 L18 38',
  },
}

/**
 * The Network Insight mark, for the failure screen.
 *
 * The logo rather than a drawing of the failure: at this size an illustration
 * competes with the sentence underneath it, and the sentence is what the user
 * actually needs. Held in muted greys so it reads as a watermark, with the
 * only colour on the badge.
 *
 * Each kind still marks the same shape differently, so the three are
 * distinguishable before a word is read — not drawn in yet, cut through, or
 * fractured.
 */
export function ModuleFailureMark({ kind }: { kind: ModuleFailureKind }) {
  const treatment = FAILURE_TREATMENT[kind]

  return (
    <svg width={132} height={120} viewBox="-2 -2 56 50" aria-hidden="true">
      <path
        d={MARK_PATH}
        fillRule="evenodd"
        clipRule="evenodd"
        fill="var(--txt)"
        opacity={treatment.fill}
      />
      <path
        d={MARK_PATH}
        fillRule="evenodd"
        clipRule="evenodd"
        fill="none"
        stroke="var(--dim)"
        strokeWidth={0.8}
        strokeLinejoin="round"
        strokeDasharray={treatment.dashed ? '2 2.4' : undefined}
        opacity={treatment.outline}
      />

      {/* Twice over: a wide stroke in the page colour splits the mark apart,
          and the thin one on top is what did the splitting. */}
      {treatment.scar && (
        <>
          <path
            d={treatment.scar}
            stroke="var(--pg)"
            strokeWidth={2.4}
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d={treatment.scar}
            stroke={treatment.tone}
            strokeWidth={0.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={0.8}
          />
        </>
      )}

      <circle cx={45} cy={35} r={8.5} fill="var(--pg)" stroke="var(--bd)" strokeWidth={1} />
      <g transform="translate(39.5 29.5) scale(0.458)" style={{ color: treatment.tone }}>
        <Icon name={treatment.badge} size={24} weight={2.2} />
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
