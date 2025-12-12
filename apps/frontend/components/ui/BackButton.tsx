'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BackButton() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const returnTo = searchParams?.get('returnTo')
    const hasValidBack = returnTo || (typeof window !== 'undefined' && window.history.length > 1)
    setShowButton(!!hasValidBack)
  }, [searchParams])

  if (!showButton) return null

  const returnTo = searchParams?.get('returnTo')

  return (
    <motion.button
      onClick={() => {
        if (returnTo === 'landing') {
          router.push('/?showLanding=true')
        } else if (returnTo) {
          router.push(returnTo)
        } else {
          router.back()
        }
      }}
      className="flex items-center gap-2 text-gray-600 hover:text-linka-emerald transition-colors mb-6 group"
      whileHover={{ x: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="group-hover:underline">Back</span>
    </motion.button>
  )
}

