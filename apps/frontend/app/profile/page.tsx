'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User as UserIcon, Mail, Wallet, Edit2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@')
  if (!domain) return email
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`
  }
  const visibleChars = Math.min(2, Math.floor(localPart.length / 3))
  const masked = localPart.slice(0, visibleChars) + '***' + localPart.slice(-1)
  return `${masked}@${domain}`
}

function maskWalletAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatUsername(username?: string): string {
  if (!username) return ''
  if (username.toLowerCase().endsWith('.synkio')) {
    return username
  }
  return `${username}.synkio`
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !user) {
    return null
  }

  const displayUsername = formatUsername(user.username)

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
            <h1 className="text-xl sm:text-2xl font-bold">Profile</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Manage your account information</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6 safe-area-inset-bottom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-linka-emerald/20 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-linka-emerald" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold truncate">{user.name}</h2>
                {displayUsername && (
                  <p className="text-linka-emerald font-semibold text-sm sm:text-base truncate">@{displayUsername}</p>
                )}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-semibold hover:border-linka-emerald hover:text-linka-emerald transition-colors flex items-center justify-center gap-2 touch-manipulation min-h-[44px]"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </motion.button>
          </div>

          <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-start sm:items-center gap-3">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-sm sm:text-base break-all">{maskEmail(user.email)}</p>
              </div>
            </div>

            {user.walletAddress && (
              <div className="flex items-start sm:items-center gap-3">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Wallet Address</p>
                  <p className="font-mono text-xs sm:text-sm break-all">{maskWalletAddress(user.walletAddress)}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

