import type { Brand } from '@/types'
import type { MeshRig } from '@/state/useMeshRig'

/**
 * The animated node graph behind the sign-in screen.
 *
 * A fixed 12-node graph is projected from 3D to 2D each frame under a simple
 * perspective transform. Depth drives everything visual: nodes further from
 * the camera are drawn smaller, fainter and earlier, which reads as volume
 * without any real 3D machinery.
 */

/** Node positions in a unit-ish cube, ordered so links can reference them. */
const NODES: ReadonlyArray<readonly [number, number, number]> = [
  [-0.86, -0.6, 0.22],
  [-0.28, -0.9, -0.38],
  [0.56, -0.68, 0.32],
  [-0.96, -0.08, -0.46],
  [-0.18, -0.16, 0.58],
  [0.82, -0.26, -0.14],
  [-0.6, 0.36, 0.42],
  [0.06, 0.28, -0.56],
  [0.74, 0.18, 0.46],
  [-0.76, 0.86, -0.18],
  [0.16, 0.92, 0.28],
  [0.88, 0.74, -0.42],
]

/** Edges as index pairs into {@link NODES}. */
const LINKS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [0, 3], [1, 4], [2, 5], [3, 4], [4, 5], [2, 4], [3, 6], [4, 7],
  [5, 8], [6, 7], [7, 8], [6, 9], [7, 9], [7, 10], [8, 11], [9, 10], [10, 11],
]

/** Nodes drawn larger and given emanating rings. */
const HUBS = [4, 7, 10]

/** Per-brand colours for the graph, which sits outside the token system. */
const MESH_COLORS: Record<Brand, { link: string; node: string; hub: string; spark: string }> = {
  blue: { link: '#5BA6D8', node: '#9AC6E6', hub: '#CFE6F7', spark: '#EAF4FC' },
  orange: { link: '#FF9F45', node: '#FFC38F', hub: '#FFE3CC', spark: '#FFF4EA' },
  red: { link: '#F2707B', node: '#F7AEB4', hub: '#FBD5D8', spark: '#FFF0F1' },
}

const VIEWBOX = { width: 1000, height: 620 }
const CENTER = { x: 500, y: 310 }
/** Base scale before zoom. */
const SCALE = 342
/** Horizontal stretch, so the graph fills a wide panel. */
const ASPECT = 1.66
/** Camera distance; smaller values exaggerate the perspective. */
const FOCAL = 3.1

interface Projected {
  x: number
  y: number
  /** Perspective scale factor — the depth cue everything else keys off. */
  s: number
  /** Depth after rotation, used only for painter's-algorithm sorting. */
  z: number
}

export function NetworkMesh({ rig, brand }: { rig: MeshRig; brand: Brand }) {
  const colors = MESH_COLORS[brand]

  const scale = SCALE * rig.zoom
  const cosY = Math.cos(rig.rotationY)
  const sinY = Math.sin(rig.rotationY)
  const cosX = Math.cos(rig.rotationX)
  const sinX = Math.sin(rig.rotationX)

  const project = ([x, y, z]: readonly [number, number, number]): Projected => {
    // Yaw about the vertical axis, then pitch about the horizontal one.
    const x1 = x * cosY + z * sinY
    const z1 = z * cosY - x * sinY
    const y1 = y * cosX - z1 * sinX
    const z2 = z1 * cosX + y * sinX

    const s = FOCAL / (FOCAL - z2)
    return {
      x: CENTER.x + x1 * scale * ASPECT * s + rig.panX,
      y: CENTER.y + y1 * scale * s + rig.panY,
      s,
      z: z2,
    }
  }

  const points = NODES.map(project)
  const elements: JSX.Element[] = []

  // Edges first, so nodes and packets sit on top of them.
  LINKS.forEach(([from, to], i) => {
    const a = points[from]!
    const b = points[to]!
    const depth = (a.s + b.s) / 2
    elements.push(
      <line
        key={`link-${i}`}
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={colors.link}
        strokeWidth={0.7 * depth}
        opacity={0.06 + 0.14 * (depth - 0.6)}
      />,
    )
  })

  // Rings expanding out of each hub, three per hub at staggered phases so the
  // effect reads as continuous rather than pulsed.
  HUBS.forEach((index, hubIndex) => {
    const point = points[index]!
    for (let ring = 0; ring < 3; ring++) {
      const phase = ((rig.time / 1000 + hubIndex * 1.7 + ring * 3.1) % 9) / 9
      elements.push(
        <circle
          key={`ring-${index}-${ring}`}
          cx={point.x}
          cy={point.y}
          r={(14 + phase * 96) * point.s}
          fill="none"
          stroke={colors.link}
          strokeWidth={0.9}
          opacity={0.3 * (1 - phase) * point.s}
        />,
      )
    }
  })

  // Nodes, painted back to front so nearer ones overlap correctly.
  NODES.map((_, i) => ({ index: i, point: points[i]!, hub: HUBS.includes(i) }))
    .sort((a, b) => a.point.z - b.point.z)
    .forEach(({ index, point, hub }) => {
      const pulse = 0.86 + 0.16 * Math.sin(rig.time / 900 + index)
      elements.push(
        <circle
          key={`glow-${index}`}
          cx={point.x}
          cy={point.y}
          r={(hub ? 12 : 8) * point.s * pulse}
          fill={colors.link}
          opacity={0.11 * point.s}
        />,
        <circle
          key={`node-${index}`}
          cx={point.x}
          cy={point.y}
          r={(hub ? 4.6 : 3.1) * point.s * pulse}
          fill={hub ? colors.hub : colors.node}
          opacity={0.45 + 0.42 * (point.s - 0.6)}
        />,
      )
    })

  // Packets travelling along the edges. Every third link is skipped and
  // alternate links run backwards, so traffic looks routed rather than
  // synchronised.
  LINKS.forEach(([from, to], i) => {
    if (i % 3 === 2) return

    const reversed = i % 2 === 1
    const start = NODES[reversed ? to : from]!
    const end = NODES[reversed ? from : to]!
    const duration = 6200 + (i % 5) * 900
    const t = ((rig.time + i * 1450) % duration) / duration

    const position = project([
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
      start[2] + (end[2] - start[2]) * t,
    ])
    // Fade in and out at the ends of the run so packets do not pop.
    const fade = Math.min(1, Math.sin(Math.PI * t) * 2.2)

    elements.push(
      <circle
        key={`packet-glow-${i}`}
        cx={position.x}
        cy={position.y}
        r={6.5 * position.s}
        fill={colors.node}
        opacity={0.18 * fade * position.s}
      />,
      <circle
        key={`packet-${i}`}
        cx={position.x}
        cy={position.y}
        r={2.6 * position.s}
        fill={colors.spark}
        opacity={0.9 * fade}
      />,
    )
  })

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ overflow: 'visible' }}
      aria-hidden="true"
    >
      {elements}
    </svg>
  )
}
