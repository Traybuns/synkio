'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
type ThemeScope = 'chat' | 'system'

interface ThemeContextType {
  theme: Theme
  scope: ThemeScope
  setTheme: (value: Theme) => void
  setScope: (value: ThemeScope) => void
}

const THEME_KEY = 'linka_theme'
const SCOPE_KEY = 'linka_theme_scope'

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [scope, setScopeState] = useState<ThemeScope>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme
    const savedScope = localStorage.getItem(SCOPE_KEY) as ThemeScope

    if (savedTheme) {
      setThemeState(savedTheme)
    }

    if (savedScope) {
      setScopeState(savedScope)
    }
  }, [])

  useEffect(() => {
    if (!mounted) {
      return
    }

    if (scope === 'system') {
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme)
    } else {
      document.documentElement.classList.remove('light', 'dark')
    }

    localStorage.setItem(THEME_KEY, theme)
    localStorage.setItem(SCOPE_KEY, scope)
  }, [theme, scope, mounted])

  const setTheme = (value: Theme) => {
    setThemeState(value)
  }

  const setScope = (value: ThemeScope) => {
    setScopeState(value)
  }

  return (
    <ThemeContext.Provider value={{ theme, scope, setTheme, setScope }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

