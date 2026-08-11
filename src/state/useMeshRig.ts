import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Camera state for the login backdrop's rotating node graph.
 *
 * The rig is held in a ref rather than state: it changes every animation
 * frame, and routing 60 updates a second through React would re-render the
 * whole login screen. A single `frame` counter is published as state instead,
 * which re-renders only the mesh.
 */
export interface MeshRig {
  /** Pitch, radians, clamped to keep the graph from flipping over. */
  rotationX: number
  /** Yaw, radians, unbounded. */
  rotationY: number
  /** Scale multiplier. */
  zoom: number
  /** Pan offset in px. */
  panX: number
  panY: number
  /** Elapsed animation time in ms, driving pulses and travelling packets. */
  time: number
  dragging: boolean
  /** True while the drag is panning rather than orbiting. */
  panning: boolean
  lastX: number
  lastY: number
}

const INITIAL_ROTATION_X = -1.15
const INITIAL_ROTATION_Y = -2.818

const MAX_PITCH = 1.15
const ORBIT_SENSITIVITY_X = 0.0062
const ORBIT_SENSITIVITY_Y = 0.0052
const ZOOM_SENSITIVITY = 0.0011
const ZOOM_RANGE = { min: 0.6, max: 2.3 }
const PAN_RANGE = { x: 260, y: 200 }

/** Caps the per-frame delta so a stalled tab does not jump the animation. */
const MAX_FRAME_MS = 48

function createRig(): MeshRig {
  return {
    rotationX: INITIAL_ROTATION_X,
    rotationY: INITIAL_ROTATION_Y,
    zoom: 1,
    panX: 0,
    panY: 0,
    time: 0,
    dragging: false,
    panning: false,
    lastX: 0,
    lastY: 0,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export interface MeshController {
  rig: MeshRig
  /** Increments once per animation frame, to drive re-renders. */
  frame: number
  cursor: 'grab' | 'grabbing'
  onPointerDown: (event: React.PointerEvent) => void
  onWheel: (event: React.WheelEvent) => void
  onDoubleClick: () => void
}

/**
 * Drives the login mesh: advances its clock while `active`, and translates
 * pointer gestures into orbit, pan and zoom.
 *
 * Drag orbits; shift-drag or middle-drag pans; wheel zooms; double-click
 * resets the camera.
 */
export function useMeshRig(active: boolean): MeshController {
  const rigRef = useRef<MeshRig>()
  rigRef.current ??= createRig()
  const rig = rigRef.current

  const [frame, setFrame] = useState(0)

  // Pointer move and up are bound to the window so a drag survives the
  // pointer leaving the backdrop.
  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      const current = rigRef.current
      if (!current?.dragging) return

      const dx = event.clientX - current.lastX
      const dy = event.clientY - current.lastY
      current.lastX = event.clientX
      current.lastY = event.clientY

      if (current.panning) {
        current.panX = clamp(current.panX + dx, -PAN_RANGE.x, PAN_RANGE.x)
        current.panY = clamp(current.panY + dy, -PAN_RANGE.y, PAN_RANGE.y)
      } else {
        current.rotationY += dx * ORBIT_SENSITIVITY_X
        current.rotationX = clamp(
          current.rotationX + dy * ORBIT_SENSITIVITY_Y,
          -MAX_PITCH,
          MAX_PITCH,
        )
      }
    }

    const handleUp = () => {
      const current = rigRef.current
      if (current) current.dragging = false
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [])

  useEffect(() => {
    if (!active) return

    let raf = 0
    let previous: number | null = null

    const step = (timestamp: number) => {
      const current = rigRef.current
      if (current) {
        const delta = previous === null ? 0 : Math.min(MAX_FRAME_MS, timestamp - previous)
        previous = timestamp
        current.time += delta
        setFrame((n) => n + 1)
      }
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [active])

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    // Let the sign-in form own its own pointer events.
    if (event.target instanceof Element && event.target.closest('input,button,a,label')) return

    const current = rigRef.current
    if (!current) return
    current.dragging = true
    current.panning = event.shiftKey || event.button === 1
    current.lastX = event.clientX
    current.lastY = event.clientY
  }, [])

  const onWheel = useCallback((event: React.WheelEvent) => {
    const current = rigRef.current
    if (!current) return
    current.zoom = clamp(
      current.zoom * (1 - event.deltaY * ZOOM_SENSITIVITY),
      ZOOM_RANGE.min,
      ZOOM_RANGE.max,
    )
  }, [])

  const onDoubleClick = useCallback(() => {
    const current = rigRef.current
    if (!current) return
    current.rotationX = INITIAL_ROTATION_X
    current.rotationY = INITIAL_ROTATION_Y
    current.zoom = 1
    current.panX = 0
    current.panY = 0
  }, [])

  return {
    rig,
    frame,
    cursor: rig.dragging ? 'grabbing' : 'grab',
    onPointerDown,
    onWheel,
    onDoubleClick,
  }
}
