export default function VendorCardSkeleton() {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-white dark:bg-gray-900">
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
  )
}

