'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronRight, ArrowRight, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface HeaderProps {
  variant?: 'default' | 'minimal' | 'landing'
  showBreadcrumb?: boolean
  showMarketplaceLabel?: boolean
  onAction?: (action: string) => void
  hideNavLinks?: boolean
  hideActionButton?: boolean
  hasUser?: boolean
}

export default function Header({ variant = 'default', showBreadcrumb = false, showMarketplaceLabel = false, onAction, hideNavLinks = false, hideActionButton = false, hasUser: hasUserProp }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const hasUser = hasUserProp !== undefined ? hasUserProp : isAuthenticated
  
  const isAuthPage = pathname === '/login' || pathname?.startsWith('/sign')
  const shouldHideActionButton = hideActionButton || isAuthPage

  const handleNavClick = (href: string, closeMenu?: boolean) => {
    if (closeMenu) {
      setMobileMenuOpen(false)
    }

    if (href.startsWith('#')) {
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      return
    }

    router.push(href)
  }

  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 text-linka-black dark:text-white p-4 sm:p-5 sticky top-0 z-50 shadow-sm"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0"
            >
              <img
                src="/logo_dark.png"
                alt="Synkio Logo"
                className="w-full h-full object-contain transition-all group-hover:scale-110"
              />
            </motion.div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">Synkio</h1>
              {showBreadcrumb && (
                <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  <span>Home</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Chat</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  if (variant === 'landing') {
    const navLinks = useMemo(
      () => [
        { label: 'Marketplace', href: '/vendors' },
        { label: 'About', href: '/about' },
        { label: 'Pricing', href: '/pricing' },
      ],
      []
    )


    return (
      <div className="w-full flex justify-center px-4 md:px-10 lg:px-20 xl:px-40">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between whitespace-nowrap px-4 sm:px-10 py-3 sticky top-5 bg-[#101322]/50 backdrop-blur-lg rounded-full z-50 w-full max-w-[960px]"
        >
          <div className="flex items-center gap-3 text-white">
            <div className="w-32 h-32 flex-shrink-0 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <img
                src="/logo_dark.png"
                alt="Synkio Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="hidden md:flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              {!hideNavLinks && navLinks.map(link => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleNavClick(link.href)}
                  className="text-white text-sm font-medium leading-normal hover:text-linka-emerald transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {onAction && !shouldHideActionButton && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (hasUser) {
                      onAction('go-to-chat')
                    } else {
                      router.push('/login')
                    }
                  }}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 sm:h-12 sm:px-5 px-4 bg-linka-emerald hover:bg-emerald-600 text-white text-sm font-bold leading-normal tracking-[0.015em] sm:text-base sm:font-bold sm:leading-normal sm:tracking-[0.015em] transition-colors touch-manipulation"
                >
                  <span className="truncate">{hasUser ? 'Go to Chat' : 'Get Started'}</span>
                </motion.button>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </motion.header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed top-20 left-4 right-4 border border-white/10 py-4 space-y-4 px-4 sm:px-6 bg-[#101322]/95 backdrop-blur-lg text-white rounded-2xl z-50 max-w-[960px] mx-auto"
            >
              {!hideNavLinks && navLinks.map(link => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleNavClick(link.href, true)}
                  className="block w-full text-left p-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-medium text-white">{link.label}</span>
                </button>
              ))}

              {onAction && !shouldHideActionButton && (
                <div className="flex flex-col gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (hasUser) {
                        onAction('go-to-chat')
                      } else {
                        router.push('/login')
                      }
                      setMobileMenuOpen(false)
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-linka-emerald hover:bg-emerald-600 text-white rounded-full font-bold text-sm transition-colors touch-manipulation"
                  >
                    {hasUser ? 'Go to Chat' : 'Sign Up'}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-gray-950 via-gray-900 to-emerald-900 text-white border-b border-emerald-500/20 p-4 sm:p-5 sticky top-0 z-50 shadow-lg shadow-emerald-900/20"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <motion.div
            whileHover={{ rotate: 5 }}
            className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0"
          >
            <Image
              src="/logo.png"
              alt="Synkio Logo"
              fill
              className="object-contain dark:invert transition-all group-hover:scale-110"
              priority
              unoptimized
            />
          </motion.div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Synkio</h1>
            {showBreadcrumb && (
              <div className="flex items-center space-x-1 text-xs sm:text-sm text-emerald-100/80 mt-0.5">
                <span>Home</span>
                <ChevronRight className="w-3 h-3 text-emerald-200" />
                <span>Chat</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

