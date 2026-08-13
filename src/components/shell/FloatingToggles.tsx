import { useState } from 'react'
import type { Brand, CatalogMode } from '@/types'
import { Icon } from '@/lib/icons'
import { Popover, PopoverDivider, PopoverHeading } from '@/components/common/Popover'
import { useAppState } from '@/state/AppStateProvider'
import './TopBar.css'

/** Swatch colours for the brand picker, one per palette. */
const BRANDS: Array<{ id: Brand; label: string; dot: string }> = [
  { id: 'blue', label: 'Blue', dot: '#06345A' },
  { id: 'orange', label: 'Orange', dot: '#E06A00' },
  { id: 'red', label: 'Red', dot: '#C2101D' },
]

const MODES: Array<{ id: CatalogMode; hint: string }> = [
  { id: 'Normal', hint: 'Everyday applications only' },
  { id: 'Advanced', hint: 'The full catalog' },
]

/**
 * Brand and catalog-mode pickers.
 *
 * These are demo affordances rather than product chrome. They used to sit as
 * two bars floating over the content, where they overlapped the grid footer;
 * collapsing them into one button keeps them reachable without covering the
 * thing being demonstrated.
 */
export function FloatingToggles() {
  const { preferences } = useAppState()
  const [open, setOpen] = useState(false)

  return (
    <div className="ni-demoSettings">
      <button
        type="button"
        className="ni-demoSettings__trigger"
        title="Appearance and catalog mode"
        aria-label="Appearance and catalog mode"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name="admin" size={17} />
      </button>

      <Popover
        open={open}
        onClose={() => setOpen(false)}
        align="right"
        label="Appearance and catalog mode"
        width={228}
      >
        <PopoverHeading>Brand</PopoverHeading>
        <div className="ni-demoSettings__swatches">
          {BRANDS.map((brand) => (
            <button
              key={brand.id}
              type="button"
              className={`ni-brandSwatch${
                preferences.brand === brand.id ? ' ni-brandSwatch--active' : ''
              }`}
              title={`${brand.label} theme`}
              aria-label={`${brand.label} theme`}
              aria-pressed={preferences.brand === brand.id}
              style={preferences.brand === brand.id ? { borderColor: brand.dot } : undefined}
              onClick={() => preferences.setBrand(brand.id)}
            >
              <span className="ni-brandSwatch__dot" style={{ background: brand.dot }} />
            </button>
          ))}
        </div>

        <PopoverDivider />

        <PopoverHeading>Catalog</PopoverHeading>
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`ni-popover__item${
              preferences.mode === mode.id ? ' ni-popover__item--selected' : ''
            }`}
            role="radio"
            aria-checked={preferences.mode === mode.id}
            onClick={() => preferences.setMode(mode.id)}
          >
            <span className="ni-popover__itemText">
              <span>{mode.id}</span>
              <span className="ni-popover__itemMeta">{mode.hint}</span>
            </span>
            {preferences.mode === mode.id && <Icon name="check" size={14} />}
          </button>
        ))}
      </Popover>
    </div>
  )
}
