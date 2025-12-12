'use client'

import { ArrowRight } from 'lucide-react'

interface NavigationButtonsProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  onNext: () => void
  showBack?: boolean
}

export default function NavigationButtons({ 
  currentStep, 
  totalSteps, 
  onBack, 
  onNext,
  showBack = true 
}: NavigationButtonsProps) {
  return (
    <div className="flex space-x-3">
      {showBack && (
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      )}
      <button
        onClick={onNext}
        className="flex-1 bg-linka-emerald text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
      >
        <span>Proceed</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

