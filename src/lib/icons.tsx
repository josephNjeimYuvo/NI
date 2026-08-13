/**
 * Icon system.
 *
 * Icons are stroked 24×24 outlines stored as raw path data, so the whole set
 * costs a few kilobytes and inherits `currentColor` from its container.
 *
 * Three renderers share the table:
 *   <Icon>     — uniform stroke, the default
 *   <IconBold> — slightly heavier stroke, for larger sizes
 *   <DuoIcon>  — two-tone, for anything representing an application, module
 *                or submodule
 */

export const ICON_PATHS = {
  // Application marks
  ran: [
    'M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M16.2 7.8a6 6 0 0 1 0 8.4',
    'M7.8 16.2a6 6 0 0 1 0 -8.4',
    'M19 5a10 10 0 0 1 0 14',
    'M5 19a10 10 0 0 1 0 -14',
  ],
  core: ['M4 20V10', 'M9.5 20V4', 'M15 20v-7', 'M20.5 20V8'],
  fault: ['M12 4 2.5 20h19L12 4z', 'M12 10v4', 'M12 17.5v.01'],
  data: [
    'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z',
    'M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6',
    'M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6',
  ],
  netopt: [
    'M4 7h6',
    'M14 7h6',
    'M4 17h10',
    'M18 17h2',
    'M12 7m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
    'M16 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0',
  ],
  dash: ['M3 4h18v13H3z', 'M8 21h8', 'M12 17v4', 'M7 13l3-4 3 3 4-5'],
  site: ['M4 4h7v7H4z', 'M15 4h5v5h-5z', 'M4 15h5v5H4z', 'M17.5 14v7', 'M14 17.5h7'],
  exec: ['M3 3v18h18', 'M7 15l4-5 3 3 4-6'],
  auto: [
    'M4 6h6',
    'M4 18h6',
    'M14 12h6',
    'M10 6a3 3 0 1 0 0 .01',
    'M10 18a3 3 0 1 0 0 .01',
    'M10 6h2a2 2 0 0 1 2 2v8a2 2 0 0 0 2 2h-2',
  ],
  admin: [
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    'M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.2A1.6 1.6 0 0 0 7.5 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.9 7.5l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4.9z',
  ],
  react: ['M3 18l5-7 4 4 4-6 5 6'],

  /** Stands in for a module or submodule, which have no mark of their own. */
  file: [
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
    'M14 2v6h6',
  ],

  // Chevrons and arrows
  chevD: ['M6 9l6 6 6-6'],
  chevR: ['M9 6l6 6-6 6'],
  chevL: ['M15 6l-6 6 6 6'],
  arrowR: ['M5 12h13', 'M12 6l6 6-6 6'],
  arrowUpRight: ['M7 17L17 7', 'M8 7h9v9'],

  // Chrome
  x: ['M18 6 6 18', 'M6 6l12 12'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.3-4.3'],
  bell: ['M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8', 'M13.7 21a2 2 0 0 1-3.4 0'],
  help: [
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
    'M9.2 9.2a2.8 2.8 0 0 1 5.5.7c0 1.9-2.8 2.8-2.8 2.8',
    'M12 17h.01',
  ],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 16v-4', 'M12 8h.01'],
  user: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  sun: [
    'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
    'M12 1v2',
    'M12 21v2',
    'M4.2 4.2l1.4 1.4',
    'M18.4 18.4l1.4 1.4',
    'M1 12h2',
    'M21 12h2',
    'M4.2 19.8l1.4-1.4',
    'M18.4 5.6l1.4-1.4',
  ],
  moon: ['M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'],
  pin: ['M12 17v5', 'M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6z'],
  grid: ['M3 3h8v8H3z', 'M13 3h8v8h-8z', 'M3 13h8v8H3z', 'M13 13h8v8h-8z'],
  panel: ['M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z', 'M9.5 4v16'],

  // Status and actions
  alert: ['M12 4 2.5 20h19L12 4z', 'M12 10v4', 'M12 17.5v.01'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  copy: ['M9 9h10v12H9z', 'M5 15H3V3h12v2'],
  more: ['M12 6h.01', 'M12 12h.01', 'M12 18h.01'],
  expand: ['M15 3h6v6', 'M9 21H3v-6', 'M21 3l-7 7', 'M3 21l7-7'],
  collapseFs: [
    'M9 3H5a2 2 0 0 0-2 2v4',
    'M15 3h4a2 2 0 0 1 2 2v4',
    'M9 21H5a2 2 0 0 1-2-2v-4',
    'M15 21h4a2 2 0 0 0 2-2v-4',
  ],
  share: [
    'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    'M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    'M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    'M8.6 13.5l6.8 4',
    'M15.4 6.5l-6.8 4',
  ],
  external: [
    'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
    'M15 3h6v6',
    'M10 14L21 3',
  ],
  pivot: ['M3 3h18v18H3z', 'M3 9h18', 'M9 9v12'],
  refresh: ['M21 12a9 9 0 1 1-3-6.7', 'M21 4v5h-5'],
  eye: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  eyeOff: [
    'M10.6 5.2A9.8 9.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4',
    'M6.2 6.4A17 17 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 4.5-1.1',
    'M3 3l18 18',
    'M9.9 9.9a3 3 0 0 0 4.2 4.2',
  ],
  check: ['M20 6L9 17l-5-5'],
  /** Neutral sort affordance, shown on columns that are not sorted. */
  eq: ['M7 9l5-5 5 5', 'M7 15l5 5 5-5'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
  star: ['M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 10l6.1-.9L12 3.5z'],
  inbox: [
    'M22 12h-6l-2 3h-4l-2-3H2',
    'M5.4 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.4-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.8 1.1z',
  ],
} as const

export type IconKey = keyof typeof ICON_PATHS

/** The icon standing in for a module or submodule anywhere one is listed. */
export const MODULE_ICON = 'file'

/**
 * Which paths of each icon are drawn in the accent tone; the rest take the
 * primary. Chosen per icon rather than by a positional rule, because the
 * split that reads well is a drawing decision — the signal arcs of an
 * antenna, the knobs of a slider, the trend line over its axes — and no
 * index formula lands on those consistently.
 *
 * Icons absent from this table render in a single tone, which is the right
 * result for the ones drawn as a single path.
 */
const ICON_ACCENT_PATHS: Partial<Record<IconKey, readonly number[]>> = {
  ran: [1, 2, 3, 4], // every signal arc; only the emitter stays primary
  core: [1, 3], // alternating bars
  fault: [1, 2], // the exclamation inside the triangle
  data: [0, 1], // top face and upper band of the cylinder
  netopt: [1, 3, 4, 5], // slider knobs and the track beyond each one
  dash: [2, 3], // the stand and the chart line
  site: [1, 2, 3, 4], // satellite blocks and the join marker
  exec: [1], // trend line over the axes
  auto: [2, 3, 4], // both nodes and the branch they feed
  admin: [0], // hub of the gear
  file: [1], // folded corner of the module mark
}

function pathsFor(name: string): readonly string[] {
  return ICON_PATHS[name as IconKey] ?? ICON_PATHS.react
}

interface IconProps {
  name: string
  size?: number
  /** Stroke weight; defaults to the standard 1.7. */
  weight?: number
}

/** Standard stroked icon. */
export function Icon({ name, size = 18, weight = 1.7 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {pathsFor(name).map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

/** Heavier stroke, used where an icon is rendered large. */
export function IconBold({ name, size = 18 }: Omit<IconProps, 'weight'>) {
  return <Icon name={name} size={size} weight={1.8} />
}

/**
 * Two-tone icon, used wherever an application, module or submodule is
 * represented — so the same thing carries the same treatment in the catalog,
 * the sidebar, Quick Access, Recent and the command palette.
 *
 * Colour comes from `--icon-primary` and `--icon-accent` rather than props,
 * so a container can restate the pair to suit its own background. A tile
 * with a dark fill sets the primary to its foreground colour and the icon
 * follows, without this component knowing anything about tiles.
 */
export function DuoIcon({ name, size = 18, weight = 1.7 }: IconProps) {
  const accentPaths = ICON_ACCENT_PATHS[name as IconKey] ?? []
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {pathsFor(name).map((d, i) => (
        <path
          key={i}
          d={d}
          stroke={
            accentPaths.includes(i)
              ? 'var(--icon-accent, currentColor)'
              : 'var(--icon-primary, currentColor)'
          }
        />
      ))}
    </svg>
  )
}
