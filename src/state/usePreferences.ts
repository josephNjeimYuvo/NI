import { useCallback, useEffect, useState } from 'react'
import type { Brand, CatalogMode, Theme } from '@/types'

const THEME_STORAGE_KEY = 'ni.theme'

function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); the
    // in-memory default is a fine fallback.
    return null
  }
}

function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Persisting is best-effort.
  }
}

export interface Preferences {
  theme: Theme
  brand: Brand
  mode: CatalogMode
  toggleTheme: () => void
  setBrand: (brand: Brand) => void
  setMode: (mode: CatalogMode) => void
}

/**
 * Appearance and catalog-visibility preferences.
 *
 * Theme and brand are published to the document element, where the token
 * stylesheet keys off them, so every descendant re-colours in one paint.
 */
export function usePreferences(initialBrand: Brand = 'blue'): Preferences {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? 'light')
  const [brand, setBrand] = useState<Brand>(initialBrand)
  const [mode, setMode] = useState<CatalogMode>('Advanced')

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.setAttribute('data-brand', brand)
  }, [theme, brand])

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      persistTheme(next)
      return next
    })
  }, [])

  return { theme, brand, mode, toggleTheme, setBrand, setMode }
}
