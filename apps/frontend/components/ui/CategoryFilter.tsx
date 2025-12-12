'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Filter, Plus, Loader2 } from 'lucide-react'
import { createCategory } from '../../libs/services/category.service'

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
  onCategoryCreated?: (category: string) => void
}

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory, onCategoryCreated }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const getDisplayName = (category: string) => {
    return category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)
  }

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories
    const query = searchQuery.toLowerCase().trim()
    return categories.filter(cat => 
      cat.toLowerCase().includes(query) || 
      getDisplayName(cat).toLowerCase().includes(query)
    )
  }, [categories, searchQuery])

  const showAddOption = useMemo(() => {
    if (!searchQuery.trim()) return false
    const query = searchQuery.toLowerCase().trim()
    return !categories.some(cat => cat.toLowerCase() === query)
  }, [categories, searchQuery])

  const handleAddCategory = async () => {
    if (!searchQuery.trim() || isCreating) return

    const categoryName = searchQuery.trim()
    setIsCreating(true)

    try {
      const result = await createCategory(categoryName)
      if (result.success && result.data) {
        onSelectCategory(result.data.slug)
        onCategoryCreated?.(result.data.slug)
        setSearchQuery('')
        setIsOpen(false)
      } else {
        alert(result.error || 'Failed to create category')
      }
    } catch (error: any) {
      console.error('Error creating category:', error)
      alert(error.message || 'Failed to create category')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto sm:min-w-[200px] flex items-center justify-between px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-linka-emerald focus:border-linka-emerald transition-all touch-manipulation min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>{getDisplayName(selectedCategory)}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 sm:right-auto mt-2 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg max-h-[300px] overflow-y-auto min-w-[250px]"
            >
              <div className="p-2">
                <div className="mb-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search or add category..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-linka-emerald focus:border-linka-emerald"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {showAddOption && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddCategory()
                      }}
                      disabled={isCreating}
                      className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all bg-linka-emerald/10 text-linka-emerald hover:bg-linka-emerald/20 dark:bg-linka-emerald/20 dark:hover:bg-linka-emerald/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add "{searchQuery}"</span>
                        </>
                      )}
                    </button>
                  )}
                  {filteredCategories.length === 0 && !showAddOption && searchQuery && (
                    <div className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">
                      No categories found
                    </div>
                  )}
                  {filteredCategories.map((category) => {
                    const isSelected = selectedCategory === category
                    return (
                      <button
                        key={category}
                        onClick={() => {
                          onSelectCategory(category)
                          setIsOpen(false)
                          setSearchQuery('')
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-linka-emerald text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {getDisplayName(category)}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

