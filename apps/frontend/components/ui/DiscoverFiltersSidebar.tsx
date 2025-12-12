'use client'

import { useState, useEffect } from 'react'
import { Tag, Star, DollarSign, MapPin, X } from 'lucide-react'
import { fetchCategories, createCategory } from '../../libs/services/category.service'
import type { Category } from '../../libs/services/category.service'

interface DiscoverFiltersSidebarProps {
  selectedCategory?: string
  minReputation?: number
  priceRange?: { min: number; max: number }
  location?: string
  onCategoryChange?: (category: string) => void
  onReputationChange?: (minReputation: number) => void
  onPriceRangeChange?: (range: { min: number; max: number }) => void
  onLocationChange?: (location: string) => void
  onApplyFilters?: () => void
  onClearFilters?: () => void
}

export default function DiscoverFiltersSidebar({
  selectedCategory,
  minReputation = 0,
  priceRange,
  location,
  onCategoryChange,
  onReputationChange,
  onPriceRangeChange,
  onLocationChange,
  onApplyFilters,
  onClearFilters
}: DiscoverFiltersSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>('categories')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const result = await fetchCategories(true)
      if (result.success && result.data) {
        setCategories(result.data.categories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleAddCategory = async () => {
    if (!searchQuery.trim() || isCreatingCategory) return

    setIsCreatingCategory(true)
    try {
      const result = await createCategory(searchQuery.trim())
      if (result.success && result.data) {
        setCategories([...categories, result.data])
        onCategoryChange?.(result.data.slug)
        setSearchQuery('')
        setShowAddCategory(false)
      }
    } catch (error) {
      console.error('Error creating category:', error)
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const filterOptions = [
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'reputation', label: 'Reputation Score', icon: Star },
    { id: 'price', label: 'Price Range', icon: DollarSign },
    { id: 'location', label: 'Location', icon: MapPin }
  ]

  return (
    <div className="w-full sm:w-64 bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 h-fit sticky top-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Filters</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Refine your search</p>
      </div>

      <div className="space-y-4 mb-6">
        {filterOptions.map((option) => {
          const Icon = option.icon
          const isActive = activeFilter === option.id
          
          return (
            <div key={option.id}>
              <button
                onClick={() => setActiveFilter(isActive ? null : option.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-linka-emerald text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{option.label}</span>
              </button>

              {isActive && option.id === 'categories' && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="mb-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setShowAddCategory(e.target.value.trim().length > 0 && !categories.some(c => c.slug === e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')))
                      }}
                      placeholder="Search categories..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-linka-emerald"
                    />
                  </div>
                  {showAddCategory && (
                    <button
                      onClick={handleAddCategory}
                      disabled={isCreatingCategory}
                      className="w-full px-3 py-2 text-sm bg-linka-emerald text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {isCreatingCategory ? 'Creating...' : `Add "${searchQuery}"`}
                    </button>
                  )}
                  <div className="max-h-48 overflow-y-auto space-y-1 mt-2">
                    {isLoadingCategories ? (
                      <div className="text-sm text-gray-500">Loading...</div>
                    ) : (
                      categories.map((category) => (
                        <button
                          key={category.slug}
                          onClick={() => onCategoryChange?.(category.slug)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                            selectedCategory === category.slug
                              ? 'bg-linka-emerald text-white'
                              : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {isActive && option.id === 'reputation' && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={minReputation}
                    onChange={(e) => onReputationChange?.(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span className="font-semibold">{minReputation}</span>
                    <span>1000</span>
                  </div>
                </div>
              )}

              {isActive && option.id === 'price' && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
                    <input
                      type="number"
                      value={priceRange?.min || ''}
                      onChange={(e) => onPriceRangeChange?.({ min: Number(e.target.value) || 0, max: priceRange?.max || 1000 })}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
                    <input
                      type="number"
                      value={priceRange?.max || ''}
                      onChange={(e) => onPriceRangeChange?.({ min: priceRange?.min || 0, max: Number(e.target.value) || 1000 })}
                      placeholder="1000"
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                    />
                  </div>
                </div>
              )}

              {isActive && option.id === 'location' && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <input
                    type="text"
                    value={location || ''}
                    onChange={(e) => onLocationChange?.(e.target.value)}
                    placeholder="Enter location..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-linka-emerald"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="space-y-2">
        <button
          onClick={onApplyFilters}
          className="w-full bg-linka-emerald hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          Apply Filters
        </button>
        <button
          onClick={onClearFilters}
          className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-medium py-2 transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  )
}
