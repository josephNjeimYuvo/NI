import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { DuoIcon, Icon } from '@/lib/icons'
import { applicationOfModule } from '@/lib/catalog'
import { useAppState } from '@/state/AppStateProvider'
import { Popover, PopoverDivider, PopoverItem } from '@/components/common/Popover'
import './TopBar.css'

/** Fraction of the visible width one arrow press travels. */
const PAGE_FRACTION = 0.8

/** Breathing room left around a tab when scrolling it into view, in px. */
const REVEAL_MARGIN = 8

/** Sub-pixel slack, so rounding never reports a scrollable pixel that isn't. */
const EPSILON = 1

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth'
}

interface Overflow {
  canScrollLeft: boolean
  canScrollRight: boolean
  /** Ids of tabs not fully within the visible window. */
  hiddenIds: string[]
}

const NO_OVERFLOW: Overflow = { canScrollLeft: false, canScrollRight: false, hiddenIds: [] }

/**
 * The open-module tab strip.
 *
 * Every tab is rendered into a horizontally scrolling track that fills
 * whatever width the top bar has left, so the number on screen follows the
 * viewport rather than a fixed cap. Arrows appear only once the track
 * overflows, and they scroll it — they never change which module is open, so
 * looking for a tab costs nothing. The overflow chip opens a menu of every
 * tab, for jumping straight to one that is far off-screen.
 */
export function TabStrip() {
  const { tabs, catalog } = useAppState()
  // Written by the callback ref below, so it must be mutable.
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [overflow, setOverflow] = useState<Overflow>(NO_OVERFLOW)
  const [menuOpen, setMenuOpen] = useState(false)
  /** Tab whose context menu is open, if any. */
  const [menuTab, setMenuTab] = useState<string | null>(null)

  const openTabs = tabs.tabs

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track) {
      setOverflow(NO_OVERFLOW)
      return
    }

    // Compared as viewport rectangles rather than offsetLeft, which is
    // measured from the nearest positioned ancestor — not necessarily the
    // track — and would silently drift with the surrounding layout.
    const bounds = track.getBoundingClientRect()
    const hiddenIds: string[] = []
    for (const child of Array.from(track.children)) {
      if (!(child instanceof HTMLElement)) continue
      const id = child.dataset.tabId
      if (!id) continue
      const rect = child.getBoundingClientRect()
      // A tab counts as hidden the moment either edge is clipped — a
      // half-visible tab is not something you can read or reliably click.
      if (rect.left < bounds.left - EPSILON || rect.right > bounds.right + EPSILON) {
        hiddenIds.push(id)
      }
    }

    setOverflow({
      canScrollLeft: track.scrollLeft > EPSILON,
      canScrollRight: track.scrollLeft + track.clientWidth < track.scrollWidth - EPSILON,
      hiddenIds,
    })
  }, [])

  /**
   * Attaches the scroll and resize listeners as a callback ref.
   *
   * The track only exists while tabs are open, so binding it in an effect
   * would miss it entirely: the strip first mounts with none, and the effect
   * would never re-run to catch the track appearing later.
   */
  const detachRef = useRef<() => void>()
  const attachTrack = useCallback(
    (node: HTMLDivElement | null) => {
      detachRef.current?.()
      detachRef.current = undefined
      trackRef.current = node

      if (!node) {
        setOverflow(NO_OVERFLOW)
        return
      }

      node.addEventListener('scroll', measure, { passive: true })

      // The available width also changes with the viewport and with the
      // sidebar collapsing — neither is a scroll or a tab change.
      const observer =
        typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
      observer?.observe(node)

      detachRef.current = () => {
        node.removeEventListener('scroll', measure)
        observer?.disconnect()
      }

      measure()
    },
    [measure],
  )

  useEffect(() => () => detachRef.current?.(), [])

  // Re-measured in a layout effect when the tab list changes, so the arrows
  // are right on first paint rather than flickering in after it.
  useLayoutEffect(measure, [measure, openTabs])

  /** Keeps the active tab on screen when it changes from outside the strip. */
  useEffect(() => {
    const track = trackRef.current
    if (!track || !tabs.activeTabId) return

    const active = track.querySelector<HTMLElement>('[data-tab-active="true"]')
    if (!active) return

    const bounds = track.getBoundingClientRect()
    const rect = active.getBoundingClientRect()

    // Scroll the minimum distance that brings it fully into view, as a delta
    // from where it sits now. Done by hand rather than with scrollIntoView,
    // which would also scroll the page vertically to reach the top bar.
    if (rect.left < bounds.left) {
      track.scrollBy({ left: rect.left - bounds.left - REVEAL_MARGIN, behavior: scrollBehavior() })
    } else if (rect.right > bounds.right) {
      track.scrollBy({
        left: rect.right - bounds.right + REVEAL_MARGIN,
        behavior: scrollBehavior(),
      })
    }
  }, [tabs.activeTabId, openTabs.length])

  const page = (direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({
      left: direction * track.clientWidth * PAGE_FRACTION,
      behavior: scrollBehavior(),
    })
  }

  const selectFromMenu = (id: string) => {
    tabs.selectTab(id)
    setMenuOpen(false)
  }

  const runTabAction = (action: () => void) => {
    action()
    setMenuTab(null)
  }

  /** Arrow keys move between tabs; Enter and Space select the focused one. */
  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    const track = trackRef.current
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const id = openTabs[index]?.id
      if (id) tabs.selectTab(id)
      return
    }

    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (step === 0 || !track) return

    event.preventDefault()
    const next = (index + step + openTabs.length) % openTabs.length
    const target = track.querySelector<HTMLElement>(`[data-tab-id="${CSS.escape(openTabs[next]!.id)}"]`)
    target?.focus()
  }

  // Arrows are pointless until something is actually out of reach.
  const scrollable = overflow.canScrollLeft || overflow.canScrollRight
  const hiddenCount = overflow.hiddenIds.length

  if (openTabs.length === 0) return <div className="ni-topbar__tabs" />

  return (
    <div className="ni-topbar__tabs">
      {scrollable && (
        <button
          type="button"
          className="ni-tabnav"
          title="Scroll tabs left"
          aria-label="Scroll tabs left"
          disabled={!overflow.canScrollLeft}
          onClick={() => page(-1)}
        >
          <Icon name="chevL" size={15} />
        </button>
      )}

      <div ref={attachTrack} className="ni-topbar__track ni-scroll-hidden" role="tablist">
        {openTabs.map((tab, index) => {
          const active = tab.id === tabs.activeTabId
          const app = applicationOfModule(catalog, tab.id)
          return (
            <div
              key={tab.id}
              data-tab-id={tab.id}
              data-tab-active={active}
              className={`ni-tab${active ? ' ni-tab--active' : ''}`}
              role="tab"
              aria-selected={active}
              aria-label={`${tab.label}, ${app.short ?? app.label}`}
              // Roving tabindex: one stop for the whole strip, then arrow
              // keys move within it — the ARIA tablist pattern.
              tabIndex={active || (!tabs.activeTabId && index === 0) ? 0 : -1}
              onClick={() => tabs.selectTab(tab.id)}
              onContextMenu={(event) => {
                event.preventDefault()
                setMenuTab(tab.id)
              }}
              onKeyDown={(event) => onTabKeyDown(event, index)}
            >
              {/* Carries the owning application's mark, so a tab is still
                  identifiable once its label truncates. */}
              <span className="ni-tab__icon">
                <DuoIcon name={app.icon} size={15} />
              </span>
              <span className="ni-tab__label">{tab.label}</span>
              <button
                type="button"
                className="ni-tab__close"
                title="Close tab"
                aria-label={`Close ${tab.label}`}
                tabIndex={-1}
                onClick={(event) => {
                  event.stopPropagation()
                  tabs.closeTab(tab.id)
                }}
              >
                <Icon name="x" size={15} />
              </button>
            </div>
          )
        })}
      </div>

      {menuTab !== null && (
        <div className="ni-tabcontext">
          <Popover
            open
            onClose={() => setMenuTab(null)}
            label="Tab actions"
            width={216}
          >
            <PopoverItem onClick={() => runTabAction(() => tabs.closeTab(menuTab))}>
              <Icon name="x" size={15} />
              Close tab
            </PopoverItem>
            <PopoverItem onClick={() => runTabAction(() => tabs.closeOthers(menuTab))}>
              <Icon name="collapseFs" size={15} />
              Close other tabs
            </PopoverItem>
            <PopoverItem onClick={() => runTabAction(() => tabs.closeToTheRight(menuTab))}>
              <Icon name="chevR" size={15} />
              Close tabs to the right
            </PopoverItem>
            <PopoverDivider />
            <PopoverItem onClick={() => runTabAction(() => tabs.closeAll())}>
              <Icon name="inbox" size={15} />
              Close all tabs
            </PopoverItem>
          </Popover>
        </div>
      )}

      {scrollable && (
        <button
          type="button"
          className="ni-tabnav"
          title="Scroll tabs right"
          aria-label="Scroll tabs right"
          disabled={!overflow.canScrollRight}
          onClick={() => page(1)}
        >
          <Icon name="chevR" size={15} />
        </button>
      )}

      {scrollable && (
        <div className="ni-tabmenu">
          <button
            type="button"
            className="ni-tabmenu__trigger"
            title={`${openTabs.length} open modules`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {hiddenCount > 0 ? `+${hiddenCount}` : openTabs.length}
            <Icon name="chevD" size={13} />
          </button>

          {menuOpen && (
            <>
              <div
                className="ni-tabmenu__scrim"
                onClick={() => setMenuOpen(false)}
                role="presentation"
              />
              <div className="ni-tabmenu__panel" role="menu">
                <div className="ni-tabmenu__heading">Open modules</div>
                {openTabs.map((tab) => {
                  const active = tab.id === tabs.activeTabId
                  const hidden = overflow.hiddenIds.includes(tab.id)
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="menuitem"
                      className={`ni-tabmenu__item${active ? ' ni-tabmenu__item--active' : ''}`}
                      onClick={() => selectFromMenu(tab.id)}
                    >
                      <span className="ni-tabmenu__text">
                        <span className="ni-tabmenu__label">{tab.label}</span>
                        <span className="ni-tabmenu__app">{tab.app}</span>
                      </span>
                      {hidden && (
                        <span className="ni-tabmenu__offscreen" title="Currently off-screen" />
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
