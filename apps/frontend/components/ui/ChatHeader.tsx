'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Wallet,
  ChevronRight,
  LogOut,
  MessageSquare,
  Lock,
  Home,
  Store,
  Sun,
  Moon,
  Check,
  User as UserIcon,
  Settings
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import type { User, WalletBalance } from '../../libs/types'

interface ChatHeaderProps {
  user: User | null
  walletBalance: WalletBalance | null
  showUserMenu: boolean
  onToggleUserMenu: () => void
  onViewLanding: () => void
  onLogout: () => void
  onShowFeedback: () => void
  onQuickAction: (action: string) => void
}

export default function ChatHeader({
  user,
  walletBalance,
  showUserMenu,
  onToggleUserMenu,
  onViewLanding,
  onLogout,
  onShowFeedback,
  onQuickAction
}: ChatHeaderProps) {
  const router = useRouter()
  const { theme, setTheme, setScope } = useTheme()
  const [showNavMenu, setShowNavMenu] = useState(false)
  const [showAppearanceOptions, setShowAppearanceOptions] = useState(false)

  const breadcrumbOptions = [
    {
      label: 'Home',
      description: 'Return to landing',
      icon: Home,
      action: () => onViewLanding()
    },
    {
      label: 'Marketplace',
      description: 'Browse vendor discovery',
      icon: Store,
      action: () => onQuickAction('marketplace')
    }
  ]

  const themeOptions = [
    { value: 'light', label: 'Daylight', description: 'Bright surface', icon: Sun },
    { value: 'dark', label: 'Midnight', description: 'Low-light palette', icon: Moon }
  ] as const

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-gray-950 via-gray-900 to-emerald-900 text-white border-b border-emerald-500/20 p-3 sm:p-4 md:p-5 flex items-center justify-between flex-shrink-0 sticky top-0 z-50 shadow-lg shadow-emerald-900/20 transition-all duration-300 safe-area-inset-top"
    >
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={onViewLanding}
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group text-left touch-manipulation min-w-0"
        >
          <motion.div className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex-shrink-0">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-linka-emerald rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" strokeWidth={1.5} />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Lock className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-linka-emerald" strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
          <h1 className="text-base sm:text-lg md:text-2xl font-bold tracking-tight text-white truncate">Synkio</h1>
        </button>

        <span className="text-amber-300 text-xs sm:text-sm md:text-base flex items-center flex-shrink-0 hidden sm:inline">—</span>

        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowNavMenu(prev => !prev)}
            aria-expanded={showNavMenu}
            className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-amber-200 hover:bg-amber-400/20 hover:text-white transition-colors touch-manipulation min-h-[44px]"
          >
            <span className="text-xs sm:text-sm md:text-base tracking-tight">Chat</span>
            <ChevronRight
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-200 transition-transform ${showNavMenu ? 'rotate-90' : ''}`}
            />
          </button>

          <AnimatePresence>
            {showNavMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-30"
                  onClick={() => setShowNavMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-11 w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-xl z-40 p-3 space-y-2"
                >
                  <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500 dark:text-gray-400">
                    Navigation
                  </p>
                  {breadcrumbOptions.map(option => (
                    <button
                      key={option.label}
                      onClick={() => {
                        option.action()
                        setShowNavMenu(false)
                      }}
                      className="w-full flex items-center gap-3 rounded-2xl border border-transparent hover:border-linka-emerald/40 px-3 py-2 text-left transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-linka-blue/10 flex items-center justify-center text-linka-emerald">
                        <option.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-linka-black dark:text-gray-100">{option.label}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
        {walletBalance && (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onToggleUserMenu}
              className="flex items-center space-x-1.5 sm:space-x-2 bg-white/10 hover:bg-white/20 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer border border-white/20 shadow-inner shadow-emerald-900/40 touch-manipulation min-h-[44px]"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-lg border border-emerald-300/30 flex items-center justify-center bg-emerald-300/10 flex-shrink-0">
                <Wallet className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-emerald-300" />
              </div>
              <div className="flex flex-col min-w-0 hidden sm:flex">
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-white truncate">
                  {walletBalance.balance} {walletBalance.currency}
                </span>
                {walletBalance.network && (
                  <span className="text-[9px] sm:text-[10px] md:text-xs text-emerald-100/80 truncate">
                    {walletBalance.network.name} ({walletBalance.network.chainId})
                  </span>
                )}
              </div>
            </motion.button>
            
            <AnimatePresence>
              {showUserMenu && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={onToggleUserMenu}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 sm:w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 z-50 overflow-hidden transition-all"
                  >
                    <motion.button
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        router.push('/profile')
                        onToggleUserMenu()
                      }}
                      className="w-full px-4 py-4 border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gradient-to-r hover:from-linka-emerald/5 hover:to-transparent transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-linka-emerald/10 flex items-center justify-center group-hover:bg-linka-emerald/20 transition-colors flex-shrink-0 border border-linka-emerald/20">
                          <UserIcon className="w-4 h-4 text-linka-emerald" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-linka-black dark:text-white group-hover:text-linka-emerald transition-colors truncate">{user?.name}</p>
                          {user?.username && (
                            <p className="text-xs text-linka-emerald font-semibold mt-0.5">@{user.username}.synkio</p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                    </motion.button>
                    
                    <div className="border-t border-gray-200/50 dark:border-gray-800/50">
                    <motion.button
                        whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onQuickAction('fund')
                        onToggleUserMenu()
                      }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-linka-emerald/5 hover:to-transparent transition-colors text-left group"
                    >
                        <div className="w-9 h-9 rounded-xl bg-linka-emerald/10 flex items-center justify-center group-hover:bg-linka-emerald/20 transition-colors border border-linka-emerald/20">
                      <Wallet className="w-4 h-4 text-linka-emerald" />
                        </div>
                      <span className="text-sm font-medium text-linka-black dark:text-gray-100">Manage wallet</span>
                    </motion.button>
                      
                      <motion.button
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          onShowFeedback()
                          onToggleUserMenu()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 border-t border-gray-200/50 dark:border-gray-800/50 hover:bg-gradient-to-r hover:from-linka-emerald/5 hover:to-transparent transition-colors text-left group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-linka-emerald/10 flex items-center justify-center group-hover:bg-linka-emerald/20 transition-colors border border-linka-emerald/20">
                          <MessageSquare className="w-4 h-4 text-linka-emerald" />
                        </div>
                        <span className="text-sm font-medium text-linka-black dark:text-gray-100">Feedback</span>
                      </motion.button>
                    </div>
                    
                    <div className="border-t border-gray-200/50 dark:border-gray-800/50">
                      <motion.button
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAppearanceOptions(!showAppearanceOptions)}
                        className="w-full px-4 py-4 hover:bg-gradient-to-r hover:from-linka-emerald/5 hover:to-transparent transition-all text-left group cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-linka-emerald/10 to-linka-emerald/5 flex items-center justify-center border border-linka-emerald/20">
                              <Settings className="w-4 h-4 text-linka-emerald" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-linka-black dark:text-white block">Appearance</span>
                              <span className="text-[10px] tracking-[0.15em] text-gray-500 dark:text-gray-400 uppercase">Chat only</span>
                            </div>
                          </div>
                          <ChevronRight 
                            className={`w-4 h-4 text-gray-400 transition-transform ${showAppearanceOptions ? 'rotate-90' : ''}`} 
                          />
                      </div>
                      </motion.button>
                      
                      <AnimatePresence>
                        {showAppearanceOptions && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2">
                              <div className="flex flex-col gap-2.5">
                        {themeOptions.map(option => (
                                  <motion.button
                            key={option.value}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                              setScope('chat')
                              setTheme(option.value)
                            }}
                                    className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all relative overflow-hidden ${
                              theme === option.value
                                        ? 'border-linka-emerald bg-gradient-to-br from-linka-emerald/15 via-linka-emerald/5 to-transparent shadow-md shadow-linka-emerald/20'
                                        : 'border-gray-200/60 dark:border-gray-700/60 hover:border-linka-emerald/40 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                            }`}
                          >
                                    {theme === option.value && (
                                      <div className="absolute inset-0 bg-gradient-to-r from-linka-emerald/5 to-transparent" />
                                    )}
                            <div
                                      className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                theme === option.value
                                          ? 'bg-linka-emerald/20 text-linka-emerald shadow-sm shadow-linka-emerald/20'
                                          : 'bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400'
                              }`}
                            >
                                      <option.icon className={`w-5 h-5 ${theme === option.value ? 'text-linka-emerald' : ''}`} />
                            </div>
                                    <div className="flex-1 relative">
                                      <p className={`text-sm font-bold ${theme === option.value ? 'text-linka-emerald' : 'text-linka-black dark:text-white'}`}>
                                        {option.label}
                                      </p>
                                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{option.description}</p>
                            </div>
                            {theme === option.value && (
                                      <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-linka-emerald/10 text-xs font-bold text-linka-emerald border border-linka-emerald/20"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                Active
                                      </motion.span>
                            )}
                                  </motion.button>
                        ))}
                      </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <motion.button
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 mb-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors border border-red-200/50 dark:border-red-800/50">
                        <LogOut className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="text-sm font-medium text-linka-black dark:text-gray-100 group-hover:text-red-500">Log out</span>
                    </motion.button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}

