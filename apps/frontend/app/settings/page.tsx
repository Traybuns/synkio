'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Settings as SettingsIcon, Sun, Moon, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme, setScope } = useTheme()
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !user) {
    return null
  }

  const themeOptions = [
    { value: 'light', label: 'Daylight', description: 'Bright surface', icon: Sun },
    { value: 'dark', label: 'Midnight', description: 'Low-light palette', icon: Moon }
  ] as const

  return (
    <div className="min-h-screen bg-linka-white dark:bg-gray-950 text-linka-black dark:text-white transition-colors">
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 p-3 sm:p-4 md:p-6 sticky top-0 z-40 safe-area-inset-top">
        <div className="max-w-4xl mx-auto flex items-center gap-3 sm:gap-4">
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/chat')}
            className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </motion.button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Customize your experience</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6 safe-area-inset-bottom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-linka-emerald flex-shrink-0" />
            <div>
              <h2 className="text-base sm:text-lg font-bold">Appearance</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:gap-3">
            {themeOptions.map(option => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setScope('chat')
                  setTheme(option.value)
                }}
                className={`w-full flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl border p-3 sm:p-4 text-left transition-all touch-manipulation min-h-[44px] ${
                  theme === option.value
                    ? 'border-linka-emerald bg-gradient-to-br from-linka-emerald/10 via-transparent to-transparent shadow-lg shadow-emerald-900/20'
                    : 'border-gray-200/70 dark:border-gray-800/70 hover:border-linka-emerald/60'
                }`}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    theme === option.value
                      ? 'bg-linka-emerald/20 text-linka-emerald'
                      : 'bg-white/70 dark:bg-gray-900/70 text-gray-500'
                  }`}
                >
                  <option.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-linka-black dark:text-white">{option.label}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                </div>
                {theme === option.value && (
                  <span className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-linka-emerald flex-shrink-0">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Active</span>
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              Theme settings apply to the chat interface only
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

