'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, Bell, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import DiscoverFiltersSidebar from '../../components/ui/DiscoverFiltersSidebar'
import VendorCard from '../../components/ui/VendorCard'
import ProductCard from '../../components/ui/ProductCard'
import { fetchVendors } from '../../libs/backend'
import { getProducts } from '../../libs/services/product.service'
import type { Vendor } from '../../libs/types'
import type { Product } from '../../libs/types/product'
import { useAuth } from '../../contexts/AuthContext'

type ProductSort = 'trending' | 'reputation' | 'new'

export default function DiscoverPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [minReputation, setMinReputation] = useState(0)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | undefined>()
  const [location, setLocation] = useState<string | undefined>()
  
  const [featuredVendors, setFeaturedVendors] = useState<Vendor[]>([])
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [productSort, setProductSort] = useState<ProductSort>('trending')
  const [isLoadingVendors, setIsLoadingVendors] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [vendorMap, setVendorMap] = useState<Record<string, string>>({})

  useEffect(() => {
    loadVendorMap()
    loadFeaturedVendors()
    loadTrendingProducts()
  }, [])

  const loadVendorMap = async () => {
    try {
      const data = await fetchVendors()
      if (data.success && data.data?.vendors) {
        const map: Record<string, string> = {}
        data.data.vendors.forEach((vendor: Vendor) => {
          map[vendor.email] = vendor.profile.name
        })
        setVendorMap(map)
      }
    } catch (error) {
      console.error('Error loading vendor map:', error)
    }
  }

  const loadFeaturedVendors = async () => {
    try {
      setIsLoadingVendors(true)
      const data = await fetchVendors(selectedCategory, minReputation)
      if (data.success && data.data?.vendors) {
        const vendors = data.data.vendors
        const sorted = [...vendors].sort((a, b) => (b.reputation?.score || 0) - (a.reputation?.score || 0))
        setFeaturedVendors(sorted.slice(0, 4))
      }
    } catch (error) {
      console.error('Error loading featured vendors:', error)
    } finally {
      setIsLoadingVendors(false)
    }
  }

  const loadTrendingProducts = async () => {
    try {
      setIsLoadingProducts(true)
      const params: any = {
        status: 'active',
        limit: 8
      }
      
      if (selectedCategory) {
        params.category = selectedCategory
      }

      const data = await getProducts(params)
      if (data.success && data.data?.products) {
        let products = data.data.products
        
        if (productSort === 'reputation') {
          products = [...products].sort((a, b) => {
            return 0
          })
        } else if (productSort === 'new') {
          products = [...products].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          })
        }
        
        setTrendingProducts(products.slice(0, 4))
      }
    } catch (error) {
      console.error('Error loading trending products:', error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  useEffect(() => {
    loadFeaturedVendors()
  }, [selectedCategory, minReputation])

  useEffect(() => {
    loadTrendingProducts()
  }, [selectedCategory, productSort])

  const handleStartChat = (vendor: Vendor) => {
    if (!isAuthenticated || !user) {
      router.push('/login')
      return
    }
    const startMessage = `I want to buy from ${vendor.profile.name}`
    router.push(`/chat?message=${encodeURIComponent(startMessage)}`)
  }

  const handleApplyFilters = () => {
    loadFeaturedVendors()
    loadTrendingProducts()
  }

  const handleClearFilters = () => {
    setSelectedCategory(undefined)
    setMinReputation(0)
    setPriceRange(undefined)
    setLocation(undefined)
    setSearchQuery('')
  }

  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo_dark.png"
                  alt="Synkio Logo"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Synkio</span>
            </Link>

            <div className="hidden md:flex items-center flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vendors, products..."
                  className="w-full pl-12 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-linka-emerald text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/' ? 'text-linka-emerald' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                href="/discover"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/discover' ? 'text-linka-emerald' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Discover
              </Link>
              <Link
                href="/chat"
                className={`text-sm font-medium transition-colors ${
                  pathname === '/chat' ? 'text-linka-emerald' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                My Orders
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:hidden mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendors, products..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-linka-emerald text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-64 flex-shrink-0">
            <DiscoverFiltersSidebar
              selectedCategory={selectedCategory}
              minReputation={minReputation}
              priceRange={priceRange}
              location={location}
              onCategoryChange={setSelectedCategory}
              onReputationChange={setMinReputation}
              onPriceRangeChange={setPriceRange}
              onLocationChange={setLocation}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          </aside>

          <main className="flex-1">
            <div className="mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-500 via-emerald-500 to-orange-500 p-12 text-white relative">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10">
                <h1 className="text-4xl font-bold mb-4">Discover Your Next Favorite Thing</h1>
                <p className="text-lg opacity-90">Explore unique vendors and trending products</p>
              </div>
            </div>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Featured Vendors</h2>
              {isLoadingVendors ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : featuredVendors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featuredVendors.map((vendor) => (
                    <VendorCard
                      key={vendor.id}
                      vendor={vendor}
                      onStartChat={handleStartChat}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p>No featured vendors found</p>
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Products</h2>
                <div className="flex gap-2">
                  {(['trending', 'reputation', 'new'] as ProductSort[]).map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setProductSort(sort)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        productSort === sort
                          ? 'bg-linka-emerald text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {sort === 'trending' ? 'Trending' : sort === 'reputation' ? 'Highest Reputation' : 'New'}
                    </button>
                  ))}
                </div>
              </div>

              {isLoadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden animate-pulse">
                      <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : trendingProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trendingProducts.map((product) => (
                    <ProductCard
                      key={product.productId}
                      product={product}
                      vendorName={vendorMap[product.vendorEmail]}
                      onClick={() => router.push(`/chat?message=${encodeURIComponent(`I want to buy ${product.name}`)}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p>No products found</p>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
