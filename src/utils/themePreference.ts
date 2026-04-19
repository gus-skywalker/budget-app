const THEME_STORAGE_KEY = 'cobudget-theme'

export type AppThemeName = 'light' | 'dark'

export const getStoredThemePreference = (): AppThemeName | null => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
  return raw === 'dark' || raw === 'light' ? raw : null
}

export const resolveInitialTheme = (): AppThemeName => {
  const stored = getStoredThemePreference()
  if (stored) return stored
  return 'light'
}

export const persistThemePreference = (themeName: AppThemeName) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(THEME_STORAGE_KEY, themeName)
}
