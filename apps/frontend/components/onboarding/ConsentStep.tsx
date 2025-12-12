'use client'

import { Shield } from 'lucide-react'

interface ConsentStepProps {
  consentGiven: boolean
  onConsentChange: (value: boolean) => void
}

export default function ConsentStep({ consentGiven, onConsentChange }: ConsentStepProps) {
  return (
    <div>
      <div className="w-16 h-16 bg-linka-blue rounded-full flex items-center justify-center mx-auto mb-6">
        <Shield className="w-8 h-8 text-linka-emerald" />
      </div>
      <h2 className="text-xl font-bold text-linka-black mb-4 text-center">Data Consent</h2>
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
        <p className="mb-3">
          To provide you with the best experience, Synkio collects and processes:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>Email address and name for account creation</li>
          <li>Wallet address for onchain transactions</li>
          <li>Optional Google account data (if you choose to connect)</li>
          <li>Chat history for improving our service</li>
        </ul>
        <p className="mt-3 text-gray-600">
          Your data is encrypted and stored securely. We never share your personal information.
        </p>
      </div>
      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consentGiven}
          onChange={(e) => onConsentChange(e.target.checked)}
          className="mt-1 w-4 h-4 text-linka-emerald border-gray-300 rounded focus:ring-linka-emerald"
        />
        <span className="text-sm text-gray-700">
          I consent to Synkio collecting and processing my data as described above.
        </span>
      </label>
    </div>
  )
}

