import type { Brand, CatalogMode } from '@/types'
import { useAppState } from '@/state/AppStateProvider'
import './TopBar.css'

/** Swatch colours for the brand picker, one per palette. */
const BRANDS: Array<{ id: Brand; label: string; dot: string }> = [
  { id: 'blue', label: 'Blue', dot: '#06345A' },
  { id: 'orange', label: 'Orange', dot: '#E06A00' },
  { id: 'red', label: 'Red', dot: '#C2101D' },
]

const MODES: CatalogMode[] = ['Normal', 'Advanced']

/**
 * Brand and catalog-mode pickers, docked bottom-right over the content.
 * They are demo affordances rather than product chrome, which is why they
 * float rather than living in the top bar.
 */
export function FloatingToggles() {
  const { preferences } = useAppState()

  return (
    <>
      <div className="ni-floating ni-floating--brand">
        {BRANDS.map((brand) => (
          <button
            key={brand.id}
            type="button"
            className={`ni-brandSwatch${
              preferences.brand === brand.id ? ' ni-brandSwatch--active' : ''
            }`}
            title={`${brand.label} theme`}
            style={
              preferences.brand === brand.id ? { borderColor: brand.dot } : undefined
            }
            onClick={() => preferences.setBrand(brand.id)}
          >
            <span className="ni-brandSwatch__dot" style={{ background: brand.dot }} />
          </button>
        ))}
      </div>

      <div className="ni-floating ni-floating--mode">
        {MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            className={`ni-modeButton${preferences.mode === mode ? ' ni-modeButton--active' : ''}`}
            onClick={() => preferences.setMode(mode)}
          >
            {mode}
          </button>
        ))}
      </div>
    </>
  )
}
