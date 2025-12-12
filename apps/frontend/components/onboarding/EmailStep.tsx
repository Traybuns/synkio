'use client'

import { Mail } from 'lucide-react'

interface EmailStepProps {
  email: string
  onEmailChange: (email: string) => void
  onGoogleSignIn: () => void
  onContinue: () => void
}

export default function EmailStep({ email, onEmailChange, onGoogleSignIn, onContinue }: EmailStepProps) {
  return (
    <div>
      <div className="w-12 h-12 bg-linka-blue rounded-full flex items-center justify-center mx-auto mb-4">
        <Mail className="w-6 h-6 text-linka-emerald" />
      </div>
      <h2 className="text-lg font-bold text-linka-black mb-3 text-center">
        Your Email
      </h2>
      <p className="text-xs text-gray-600 text-center mb-4">
        We'll use this to create your account and send important updates
      </p>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-linka-emerald focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
            onKeyPress={(e) => e.key === 'Enter' && email && onContinue()}
          />
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onContinue}
          disabled={!email}
          className="w-full bg-linka-emerald text-white py-2.5 rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Continue with Email
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <button
          onClick={onGoogleSignIn}
          className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  )
}

