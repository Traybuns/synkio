'use client'

import { X } from 'lucide-react'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  onClose?: () => void
}

export default function ProgressBar({ currentStep, totalSteps, onClose }: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <div className="flex items-center gap-2">
          <span className="text-linka-emerald">{Math.round(progress)}%</span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-linka-emerald h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

