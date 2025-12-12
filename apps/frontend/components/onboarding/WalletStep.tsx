'use client'

import { Wallet } from 'lucide-react'

interface WalletStepProps {
  isLoading: boolean
  onCreateAccount: () => void
}

export default function WalletStep({ isLoading, onCreateAccount }: WalletStepProps) {

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-linka-blue rounded-full flex items-center justify-center mx-auto mb-6">
        <Wallet className="w-8 h-8 text-linka-emerald" />
      </div>
      <h2 className="text-xl font-bold text-linka-black mb-4">Almost There!</h2>
      <p className="text-gray-600 mb-6">
        Complete your onboarding to enjoy all of Synkio's features.
      </p>
      <button
        onClick={onCreateAccount}
        disabled={isLoading}
        className="w-full bg-linka-emerald text-white py-3 rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Loading...' : 'Continue'}
      </button>
    </div>
  )
}

