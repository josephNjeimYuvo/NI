import { useCallback, useEffect, useState } from 'react'
import { readStored, writeStored } from '@/lib/storage'
import type { Brand, CatalogMode, Theme } from '@/types'

const STORAGE_KEY = 'theme'

function parseTheme(raw: unknown): Theme | null {
  return raw === 'light' || raw === 'dark' ? raw : null
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
  const [theme, setTheme] = useState<Theme>(() => readStored(STORAGE_KEY, parseTheme) ?? 'light')
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
      writeStored(STORAGE_KEY, next)
      return next
    })
  }, [])

  return { theme, brand, mode, toggleTheme, setBrand, setMode }
}
