import { DuoIcon, IconBold } from '@/lib/icons'
import { useAppState } from '@/state/AppStateProvider'
import './Panels.css'

/**
 * ⌘K search over the whole catalog.
 *
 * With no query it offers the user's pinned modules as quick links; typing
 * switches to grouped results. The highlighted row follows both the keyboard
 * cursor (handled globally) and the pointer.
 */
export function CommandPalette() {
  const { palette, searchResults, quickLinks, openModule, runSearchResult } = useAppState()

  const hasQuery = palette.query.trim().length > 0
  const noResults = hasQuery && searchResults.length === 0

  /** Running index across groups, matching the keyboard cursor's ordering. */
  let cursorIndex = -1

  return (
    <div className="ni-palette">
      <div className="ni-palette__scrim" onClick={palette.closePalette} role="presentation" />

      <div className="ni-palette__sheet">
        <div className="ni-palette__inner">
          <div className="ni-palette__search">
            <span style={{ color: 'var(--cyan2)', display: 'flex', flexShrink: 0 }}>
              <IconBold name="search" size={24} />
            </span>
            <input
              className="ni-palette__input"
              value={palette.query}
              placeholder="Search Network Insight"
              onChange={(event) => palette.setQuery(event.target.value)}
              autoFocus
              aria-label="Search Network Insight"
            />
            <button type="button" className="ni-palette__esc" onClick={palette.closePalette}>
              ESC
            </button>
          </div>

          {!hasQuery && (
            <div className="ni-palette__quick">
              <div className="ni-palette__quickLabel">Quick Links</div>
              {quickLinks.length === 0 && (
                <div className="ni-palette__quickEmpty">
                  Pin items to Quick Access to see them here.
                </div>
              )}
              {quickLinks.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="ni-palette__quickItem"
                  onClick={() => openModule(name)}
                >
                  <span className="ni-palette__quickArrow">
                    <IconBold name="arrowR" size={16} />
                  </span>
                  <span className="ni-palette__quickText">{name}</span>
                </button>
              ))}
            </div>
          )}

          {hasQuery && searchResults.length > 0 && (
            <div className="ni-palette__results">
              {searchResults.map((group) => (
                <div key={group.label} className="ni-palette__group">
                  <div className="ni-palette__groupLabel">{group.label}</div>
                  {group.items.map((result) => {
                    cursorIndex += 1
                    const index = cursorIndex
                    return (
                      <button
                        key={`${group.label}-${result.label}`}
                        type="button"
                        className={`ni-palette__result${
                          index === palette.cursor ? ' ni-palette__result--cursor' : ''
                        }`}
                        onMouseEnter={() => palette.setCursor(index)}
                        onClick={() => runSearchResult(result)}
                      >
                        <span className="ni-palette__resultIcon">
                          <DuoIcon name={result.icon} size={18} weight={1.8} />
                        </span>
                        <span className="ni-palette__resultText">
                          <span className="ni-palette__resultLabel">{result.label}</span>
                          <span className="ni-palette__resultPath">{result.path}</span>
                        </span>
                        <span className="ni-palette__resultType">{result.type}</span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          {noResults && (
            <div className="ni-palette__empty">
              <span style={{ color: 'var(--mut)', opacity: 0.7, display: 'flex' }}>
                <IconBold name="inbox" size={34} />
              </span>
              <div className="ni-panel-empty__title">No results found</div>
              <div className="ni-panel-empty__text">
                Try a different application, module or submodule name.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
