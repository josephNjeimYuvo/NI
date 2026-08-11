import { useState } from 'react'
import { DuoIcon, Icon, IconBold } from '@/lib/icons'
import { applicationOfModule } from '@/lib/catalog'
import { useAppState } from '@/state/AppStateProvider'
import './MainMenu.css'

/**
 * Pinned modules, reorderable by drag.
 *
 * Drag indices are local: they exist only while a drag is in flight, so
 * there is nothing for the rest of the app to know about them.
 */
export function QuickAccess() {
  const { catalog, session, openModule, togglePin } = useAppState()
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  const endDrag = () => {
    setDragIndex(null)
    setDropIndex(null)
  }

  return (
    <div className="ni-section">
      <div className="ni-section__head">
        <span className="ni-section__title">Quick Access</span>
        <span className="ni-section__hint">Drag to reorder · hover a card to pin or remove</span>
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
              onClick={() => openModule(name)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') openModule(name)
              }}
            >
              <div className="ni-quick__row">
                <span className="ni-entryIcon">
                  <DuoIcon name={app.icon} size={17} weight={1.8} />
                </span>
                <span className="ni-quick__text">
                  <span className="ni-quick__name">{name}</span>
                  <span className="ni-quick__app">{app.short ?? app.label}</span>
                </span>
              </div>

              <button
                type="button"
                className="ni-quick__remove"
                title="Remove from Quick Access"
                onClick={(event) => {
                  event.stopPropagation()
                  togglePin(name)
                }}
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
    </div>
  )
}
