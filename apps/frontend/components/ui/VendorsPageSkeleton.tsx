'use client'

export default function VendorsPageSkeleton() {
  return (
    <div className="min-h-screen bg-linka-white dark:bg-gray-950 flex flex-col">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 p-4 sm:p-5 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 space-y-4">
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-6 w-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        
        <div className="mb-6">
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-white dark:bg-gray-900">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-5 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="flex items-center justify-between mt-4">
                    <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

