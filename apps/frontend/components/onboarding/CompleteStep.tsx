'use client'

import { CheckCircle } from 'lucide-react'

interface CompleteStepProps {
  walletAddress: string
  accountData?: {
    email?: string
    name?: string
    username?: string
    walletAddress?: string
    profile?: {
      name?: string
    }
  }
  formData: {
    email: string
    name: string
    username: string
    walletAddress: string
  }
  onComplete: (userData: any) => void
}

export default function CompleteStep({ walletAddress, accountData, formData, onComplete }: CompleteStepProps) {
  const handleComplete = () => {
    const userData = {
      ...formData,
      email: accountData?.email || formData.email,
      name: accountData?.profile?.name || formData.name,
      username: accountData?.username || formData.username,
      walletAddress: accountData?.walletAddress || formData.walletAddress
    }
    onComplete(userData)
  }

  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-linka-emerald rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-linka-black mb-4">Welcome to Synkio!</h2>
      <p className="text-gray-600 mb-6">
        Your account has been created successfully. Your wallet address is:
      </p>
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <code className="text-sm text-gray-700 break-all">
          {walletAddress}
        </code>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        You can now start discovering vendors and securely making payments.
      </p>
      <button
        onClick={handleComplete}
        className="w-full bg-linka-emerald text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
      >
        Start Using Synkio
      </button>
    </div>
  )
}

