import { useState } from 'react'
import { DuoIcon, Icon, IconBold } from '@/lib/icons'
import { applicationOfModule } from '@/lib/catalog'
import { useAppState } from '@/state/AppStateProvider'
import './MainMenu.css'

/**
 * Pinned modules, reorderable by drag or by Alt + arrow keys.
 *
 * Drag indices are local: they exist only while a drag is in flight, so
 * there is nothing for the rest of the app to know about them.
 */
export function QuickAccess() {
  const { catalog, session, openModule, togglePin, toast } = useAppState()
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  const endDrag = () => {
    setDragIndex(null)
    setDropIndex(null)
  }

  /** Alt + arrow moves a card, which drag alone cannot offer a keyboard user. */
  const moveByKeyboard = (event: React.KeyboardEvent, index: number, name: string) => {
    if (!event.altKey) return
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (step === 0) return

    const target = index + step
    if (target < 0 || target >= session.favorites.length) return

    event.preventDefault()
    session.reorderFavorites(index, target)
    toast.show(`${name} moved to position ${target + 1}`)
  }

  return (
    <section className="ni-section" aria-label="Quick Access">
      <div className="ni-section__head">
        <h2 className="ni-section__title">Quick Access</h2>
        <span className="ni-section__hint">Drag or Alt + arrows to reorder</span>
      </div>

      <div className="ni-quick">
        {session.favorites.map((name, index) => {
          const app = applicationOfModule(catalog, name)
          return (
            <div
              key={name}
              className={[
                'ni-quick__card',
                dropIndex === index ? 'ni-quick__card--dropTarget' : '',
                dragIndex === index ? 'ni-quick__card--dragging' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = 'move'
                event.dataTransfer.setData('text/plain', name)
                setDragIndex(index)
              }}
              onDragOver={(event) => {
                event.preventDefault()
                event.dataTransfer.dropEffect = 'move'
                if (dropIndex !== index) setDropIndex(index)
              }}
              onDrop={(event) => {
                event.preventDefault()
                event.stopPropagation()
                if (dragIndex !== null) session.reorderFavorites(dragIndex, index)
                endDrag()
              }}
              onDragEnd={endDrag}
            >
              <button
                type="button"
                className="ni-quick__open"
                aria-label={`${name}, ${app.short ?? app.label}. Position ${index + 1} of ${session.favorites.length}`}
                aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight"
                onClick={() => openModule(name)}
                onKeyDown={(event) => moveByKeyboard(event, index, name)}
              >
                <span className="ni-entryIcon">
                  <DuoIcon name={app.icon} size={17} weight={1.8} />
                </span>
                <span className="ni-quick__text">
                  <span className="ni-quick__name">{name}</span>
                  <span className="ni-quick__app">{app.short ?? app.label}</span>
                </span>
              </button>

              <button
                type="button"
                className="ni-quick__remove"
                title="Remove from Quick Access"
                aria-label={`Remove ${name} from Quick Access`}
                onClick={() => togglePin(name)}
              >
                <Icon name="x" size={13} />
              </button>
            </div>
          )
        })}
      </div>

      {session.favorites.length === 0 && (
        <div className="ni-empty-dashed">
          <span style={{ color: 'var(--mut)', opacity: 0.65, display: 'flex' }}>
            <IconBold name="inbox" size={34} />
          </span>
          <div className="ni-empty-dashed__title">No pinned items yet</div>
          <div className="ni-empty-dashed__hint">
            Hover a module in the catalog and press the pin to keep it here.
          </div>
        </div>
      )}
    </section>
  )
}
