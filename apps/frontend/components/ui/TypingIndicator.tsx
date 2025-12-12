'use client'

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white dark:bg-gray-900 text-linka-black dark:text-gray-100 border border-gray-200/50 dark:border-gray-800/50 px-4 py-3 rounded-2xl shadow-sm transition-colors">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-linka-emerald rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-linka-emerald rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-linka-emerald rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

