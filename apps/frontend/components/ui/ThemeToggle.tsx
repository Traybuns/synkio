'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, MessageSquare, Monitor, Moon, Palette, Sun } from 'lucide-react'
import clsx from 'clsx'
import { useTheme } from '../../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, scope, setTheme, setScope } = useTheme()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const themeOptions: Array<{
    value: 'light' | 'dark'
    label: string
    description: string
    icon: React.ComponentType<{ className?: string }>
  }> = [
    {
      value: 'light',
      label: 'Daylight',
      description: 'Bright surface, crisp contrast',
      icon: Sun
    },
    {
      value: 'dark',
      label: 'Midnight',
      description: 'Low-light friendly palette',
      icon: Moon
    }
  ]

  const scopeOptions: Array<{
    value: 'chat' | 'system'
    label: string
    description: string
    icon: React.ComponentType<{ className?: string }>
  }> = [
    {
      value: 'chat',
      label: 'Chat only',
      description: 'Keep landing pages unchanged',
      icon: MessageSquare
    },
    {
      value: 'system',
      label: 'Entire app',
      description: 'Apply palette everywhere',
      icon: Monitor
    }
  ]

  return (
    <div className="relative" ref={containerRef}>
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center space-x-2 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 px-3 py-2 shadow-sm hover:shadow-md transition-all"
        aria-label="Open appearance settings"
      >
        <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-linka-blue to-white dark:from-gray-800 dark:to-gray-900 text-linka-emerald">
          <Palette className="w-4 h-4" />
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Appearance</span>
          <span className="text-xs font-semibold text-linka-black dark:text-white">
            {scope === 'chat' ? 'Chat focus' : 'Full app'} · {theme === 'dark' ? 'Midnight' : 'Daylight'}
          </span>
        </div>
        <ChevronDown className={clsx('w-4 h-4 text-gray-500 transition-transform', open && 'rotate-180')} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white/95 dark:bg-gray-950/95 shadow-2xl backdrop-blur-xl z-50 p-4 space-y-4"
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Theme</p>
              <div className="mt-2 space-y-2">
                {themeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={clsx(
                      'w-full flex items-start space-x-3 rounded-2xl border px-3 py-3 text-left transition-all',
                      option.value === theme
                        ? 'border-linka-emerald bg-linka-emerald/10 shadow-lg'
                        : 'border-gray-200 dark:border-gray-800 hover:border-linka-emerald/60'
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-linka-blue/50 dark:bg-gray-800 flex items-center justify-center text-linka-emerald">
                      <option.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-linka-black dark:text-white">{option.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                    </div>
                    {option.value === theme && <Check className="w-4 h-4 text-linka-emerald" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Scope</p>
              <div className="mt-2 space-y-2">
                {scopeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setScope(option.value)}
                    className={clsx(
                      'w-full flex items-start space-x-3 rounded-2xl border px-3 py-3 text-left transition-all',
                      option.value === scope
                        ? 'border-linka-emerald bg-linka-emerald/10 shadow-lg'
                        : 'border-gray-200 dark:border-gray-800 hover:border-linka-emerald/60'
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-linka-blue/50 dark:bg-gray-800 flex items-center justify-center text-linka-emerald">
                      <option.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-linka-black dark:text-white">{option.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                    </div>
                    {option.value === scope && <Check className="w-4 h-4 text-linka-emerald" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

