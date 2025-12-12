'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage?: number
  totalItems?: number
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()
  const startItem = ((currentPage - 1) * (itemsPerPage || 12)) + 1
  const endItem = Math.min(currentPage * (itemsPerPage || 12), totalItems || 0)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {totalItems && (
          <span>
            Showing <span className="font-semibold text-gray-900 dark:text-white">{startItem}</span> to{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{endItem}</span> of{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span> vendors
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-linka-emerald/50 dark:hover:border-linka-emerald/50 transition-colors touch-manipulation"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-gray-400 dark:text-gray-600"
                >
                  ...
                </span>
              )
            }

            const pageNum = page as number
            const isActive = pageNum === currentPage

            return (
              <motion.button
                key={pageNum}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(pageNum)}
                className={`flex items-center justify-center min-w-[40px] h-10 px-3 rounded-lg font-medium text-sm transition-all touch-manipulation ${
                  isActive
                    ? 'bg-linka-emerald text-white shadow-lg shadow-linka-emerald/30 dark:shadow-linka-emerald/20'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:border-linka-emerald/50 dark:hover:border-linka-emerald/50 hover:bg-linka-emerald/5 dark:hover:bg-linka-emerald/10'
                }`}
                aria-label={`Go to page ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </motion.button>
            )
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-linka-emerald/50 dark:hover:border-linka-emerald/50 transition-colors touch-manipulation"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  )
}

