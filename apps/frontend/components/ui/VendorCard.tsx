'use client'

import { motion } from 'framer-motion'
import { MapPin, Star, Shield, Store, ExternalLink, CheckCircle, MessageCircle } from 'lucide-react'
import type { Vendor } from '../../libs/types'

interface VendorCardProps {
  vendor: Vendor
  onStartChat: (vendor: Vendor) => void
}

function formatUsername(username?: string): string {
  if (!username) return ''
  if (username.toLowerCase().endsWith('.synkio')) {
    return username
  }
  return `${username}.synkio`
}

export default function VendorCard({ vendor, onStartChat }: VendorCardProps) {
  const { profile, reputation } = vendor
  const name = profile.name
  const location = profile.location
  const reputationScore = reputation.score
  const categories = profile.categories
  const description = profile.bio
  const username = vendor.username
  const website = profile.website
  const totalTransactions = reputation.totalTransactions

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-md hover:shadow-lg transition-all cursor-pointer touch-manipulation"
      onClick={() => onStartChat(vendor)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-3 mb-3 sm:mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-linka-emerald to-emerald-600 flex items-center justify-center flex-shrink-0">
          <Store className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
            {name}
          </h3>
          {location && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      </div>

      {description && (
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 leading-relaxed line-clamp-2">
          {description}
        </p>
      )}

      <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {reputationScore !== undefined && (
            <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400 flex-shrink-0" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {reputationScore}
              </span>
            </div>
          )}

          {totalTransactions !== undefined && (
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="whitespace-nowrap">
                {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
              {categories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md whitespace-nowrap"
                >
                  {category}
                </span>
              ))}
              {categories.length > 2 && (
                <span className="px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
                  +{categories.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onStartChat(vendor)
            }}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-linka-emerald hover:bg-emerald-600 text-white rounded-lg sm:rounded-xl transition-colors text-xs sm:text-sm font-semibold touch-manipulation min-h-[44px] flex-1 sm:flex-none"
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Start Chat</span>
          </button>

          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 bg-linka-emerald/10 hover:bg-linka-emerald/20 text-linka-emerald dark:text-emerald-400 rounded-lg sm:rounded-xl transition-colors text-xs sm:text-sm font-medium touch-manipulation min-h-[44px]"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Website</span>
            </a>
          )}

          {username && (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-linka-emerald dark:text-emerald-400 w-full sm:w-auto">
              <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span className="font-semibold truncate">
                @{formatUsername(username)}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
