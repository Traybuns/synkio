'use client'

import { Search } from 'lucide-react'
import VendorCard from './VendorCard'
import VendorCardSkeleton from './VendorCardSkeleton'
import type { Vendor } from '../../libs/types'

interface VendorListProps {
  vendors: Vendor[]
  isLoading: boolean
  error: string
  onStartChat: (vendor: Vendor) => void
  onRetry: () => void
}

export default function VendorList({ vendors, isLoading, error, onStartChat, onRetry }: VendorListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <VendorCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <p className="text-red-600 dark:text-red-400 mb-4 text-sm sm:text-base">{error}</p>
        <button
          onClick={onRetry}
          className="bg-linka-emerald text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-green-600 transition-colors text-sm sm:text-base font-semibold touch-manipulation min-h-[44px]"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No vendors found</h3>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500">Try adjusting your search or category filter</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {vendors.map((vendor) => (
        <VendorCard key={vendor.id} vendor={vendor} onStartChat={onStartChat} />
      ))}
    </div>
  )
}

