'use client'

import { Search } from 'lucide-react'

interface VendorSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function VendorSearch({ value, onChange, placeholder = "Search vendors..." }: VendorSearchProps) {
  return (
    <div className="relative flex-1 min-w-[60%]">
      <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500 z-10 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 sm:pl-10 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-linka-emerald/50 focus:border-linka-emerald bg-white dark:bg-gray-800 text-linka-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all touch-manipulation"
      />
    </div>
  )
}

