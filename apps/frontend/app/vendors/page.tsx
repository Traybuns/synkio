'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { fetchVendors } from '../../libs/backend'
import { fetchCategories } from '../../libs/services/category.service'
import Header from '../../components/ui/Header'
import OnboardingModal from '../../components/OnboardingModal'
import VendorsPageLoadingFallback from '../../components/ui/VendorsPageLoadingFallback'
import PageHeader from '../../components/ui/PageHeader'
import VendorSearch from '../../components/ui/VendorSearch'
import CategoryFilter from '../../components/ui/CategoryFilter'
import VendorList from '../../components/ui/VendorList'
import Pagination from '../../components/ui/Pagination'
import type { Vendor } from '../../libs/types'
import { useAuth } from '../../contexts/AuthContext'

const ITEMS_PER_PAGE = 12

function VendorsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [categories, setCategories] = useState<string[]>(['all'])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [error, setError] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadCategories()
    loadVendors()
    checkOnboardingStatus()
  }, [user])

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const result = await fetchCategories(true)
      if (result.success && result.data) {
        const categorySlugs = ['all', ...result.data.categories.map(cat => cat.slug)]
        setCategories(categorySlugs)
      } else {
        const fallbackCategories = ['all', 'electronics', 'clothing', 'food', 'services', 'digital', 'art', 'home', 'beauty', 'sports', 'automotive']
        setCategories(fallbackCategories)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      const fallbackCategories = ['all', 'electronics', 'clothing', 'food', 'services', 'digital', 'art', 'home', 'beauty', 'sports', 'automotive']
      setCategories(fallbackCategories)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleCategoryCreated = (newCategorySlug: string) => {
    if (!categories.includes(newCategorySlug)) {
      setCategories([...categories, newCategorySlug])
    }
  }

  const checkOnboardingStatus = () => {
    if (!user || user.onboardingCompleted) {
      return
    }
    setShowOnboarding(true)
  }

  const loadVendors = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const data = await fetchVendors()
      
      if (data.success) {
        setVendors(data.data.vendors || [])
      } else {
        setError(data.error || 'Failed to load vendors. Please try again.')
        setVendors([])
      }
    } catch (error: any) {
      console.error('Error fetching vendors:', error)
      setError(error.message || 'Failed to load vendors. Please try again.')
      setVendors([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = vendor.profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           vendor.profile.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || 
                             vendor.profile.categories?.some(cat => cat.toLowerCase() === selectedCategory.toLowerCase())
      return matchesSearch && matchesCategory
    })
  }, [vendors, searchQuery, selectedCategory])

  const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE)
  const paginatedVendors = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredVendors.slice(startIndex, endIndex)
  }, [filteredVendors, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  const handleStartChat = (vendor: Vendor) => {
    if (!isAuthenticated || !user) {
      router.push('/login')
      return
    }

    if (!user.onboardingCompleted) {
      router.push('/login')
      return
    }

    const startMessage = `I want to buy from ${vendor.profile.name}`
    router.push(`/chat?message=${encodeURIComponent(startMessage)}`)
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    if (selectedVendor) {
      const startMessage = `I want to buy from ${selectedVendor.profile.name}`
      router.push(`/chat?message=${encodeURIComponent(startMessage)}`)
    } else {
      router.push('/chat')
    }
  }

  const handleSignIn = () => {
    setShowOnboarding(false)
    if (selectedVendor) {
      const startMessage = `I want to buy from ${selectedVendor.profile.name}`
      router.push(`/chat?message=${encodeURIComponent(startMessage)}`)
    } else {
      router.push('/chat')
    }
  }

  if (showOnboarding) {
    return (
      <OnboardingModal 
        onComplete={handleOnboardingComplete}
        onSignIn={handleSignIn}
        isNewUser={false}
        onClose={() => setShowOnboarding(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background-dark flex flex-col">
      <Header 
        variant="landing" 
        showMarketplaceLabel={true} 
        hideNavLinks={true}
        hideActionButton={true}
        hasUser={isAuthenticated}
        onAction={(action) => {
          if (action === 'sign-in') {
            router.push('/login')
          } else if (action === 'carts-orders') {
            router.push('/chat')
          }
        }} 
      />
      
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="mb-6 sm:mb-8 md:mb-10">
          <PageHeader
            title="Explore Marketplace"
            description="Browse trusted vendors and pay securely for goods and services"
            darkMode={true}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <VendorSearch
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          <div className="sm:w-auto">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onCategoryCreated={handleCategoryCreated}
            />
          </div>
        </div>

        <div className="w-full">
          <VendorList
            vendors={paginatedVendors}
            isLoading={isLoading}
            error={error}
            onStartChat={handleStartChat}
            onRetry={loadVendors}
          />
        </div>

        {!isLoading && !error && filteredVendors.length > 0 && (
          <div className="mt-8 sm:mt-10 md:mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredVendors.length}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function VendorsPageWrapper() {
  return (
    <Suspense fallback={<VendorsPageLoadingFallback />}>
      <VendorsPage />
    </Suspense>
  )
}

