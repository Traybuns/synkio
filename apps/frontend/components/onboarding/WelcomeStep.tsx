'use client'

import { Heart } from 'lucide-react'

export default function WelcomeStep() {
  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-linka-emerald rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Synkio!</h2>
      <p className="text-gray-600 mb-6">
        I'm your conversational marketplace assistant. I help you discover vendors, 
        manage payments, and make onchain transactions through natural chat.
      </p>
      <p className="text-sm text-gray-500">
        Let's get you set up in just a few steps.
      </p>
    </div>
  )
}

