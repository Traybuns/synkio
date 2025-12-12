'use client'

interface PageHeaderProps {
  title: string
  description?: string
  backButton?: React.ReactNode
  darkMode?: boolean
}

export default function PageHeader({ title, description, backButton, darkMode = false }: PageHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6 md:mb-8">
      {backButton}
      <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight ${darkMode ? 'text-white' : 'text-linka-black dark:text-white'}`}>
        {title}
      </h1>
      {description && (
        <p className={`text-sm sm:text-base md:text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>
          {description}
        </p>
      )}
    </div>
  )
}

