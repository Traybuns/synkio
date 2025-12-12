'use client'

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { createIdentity, signIn } from '../libs/backend'
import type { OnboardingModalProps, OnboardingStep } from '../libs/types'
import { useAuth } from '../contexts/AuthContext'
import { AuthService } from '../libs/auth'
import ProgressBar from './onboarding/ProgressBar'
import IdentityStep from './onboarding/IdentityStep'
import ConsentStep from './onboarding/ConsentStep'
import WalletStep from './onboarding/WalletStep'
import CompleteStep from './onboarding/CompleteStep'
import NavigationButtons from './onboarding/NavigationButtons'

export default function OnboardingModal({ onComplete, onSignIn, isNewUser = true, onClose }: OnboardingModalProps) {
  const { setUser } = useAuth()
  const [step, setStep] = useState<OnboardingStep>('identity')
  const [currentIsNewUser, setCurrentIsNewUser] = useState(isNewUser)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    consentGiven: false,
    googleId: '',
    walletAddress: '',
    encryptedPrivateKey: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [accountData, setAccountData] = useState<any>(null)

  const steps = currentIsNewUser ? [
    { id: 'identity', title: 'Identity', icon: null },
    { id: 'consent', title: 'Consent', icon: null },
    { id: 'wallet', title: 'Wallet', icon: null },
    { id: 'complete', title: 'Complete', icon: null }
  ] : [
    { id: 'identity', title: 'Sign In', icon: null },
    { id: 'complete', title: 'Complete', icon: null }
  ]

  const currentStepIndex = steps.findIndex(s => s.id === step)

  const handleFormDataChange = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (step === 'identity') {
      if (currentIsNewUser) {
        if (!formData.email || !formData.name) {
          toast.error('Please fill in all required fields')
          return
        }
        if (!formData.username || !formData.password || !formData.confirmPassword) {
          toast.error('Please fill in all required fields')
          return
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match')
          return
        }
        if (formData.password.length < 8) {
          toast.error('Password must be at least 8 characters')
          return
        }
        setStep('consent')
      } else {
        if (!formData.email && !formData.username) {
          toast.error('Please enter your email or username')
          return
        }
        if (!formData.password) {
          toast.error('Please enter your password')
          return
        }
        handleSignIn()
        return
      }
    } else if (step === 'consent') {
      if (!formData.consentGiven) {
        toast.error('Please accept the terms to continue')
        return
      }
      setStep('wallet')
    } else if (step === 'wallet') {
      setStep('complete')
    }
  }

  const handleBack = () => {
    const prevStepIndex = currentStepIndex - 1
    if (prevStepIndex >= 0) {
      setStep(steps[prevStepIndex].id as OnboardingStep)
    }
  }

  const handleGoogleSignIn = async () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!googleClientId) {
      toast.error('Google OAuth is not configured')
      return
    }

    const redirectUri = `${window.location.origin}/api/auth/google/callback`
    const scope = 'openid email profile'
    const responseType = 'code'
    const state = btoa(JSON.stringify({ type: currentIsNewUser ? 'signup' : 'signin' }))
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&state=${state}`
    
    window.location.href = googleAuthUrl
  }

  const handleCreateAccount = async () => {
    setIsLoading(true)

    try {
      const data = await createIdentity({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        profile: {
          name: formData.name,
        },
        consentGiven: formData.consentGiven,
      })

      if (!data.success) {
        throw new Error(data.error || 'Failed to create account')
      }

      toast.success('Account created successfully!')

      const updatedFormData = {
        ...formData,
        username: data.data.username,
        walletAddress: data.data.walletAddress
      }

      const user = AuthService.formatUserFromResponse({
        ...data.data,
        onboardingCompleted: true
      })
      setUser(user)

      setFormData(updatedFormData)
      setAccountData(data.data)

      setStep('complete')
    } catch (error) {
      console.error('Error creating account:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    if ((!formData.email && !formData.username) || !formData.password) {
      toast.error('Please enter your email/username and password')
      return
    }

    setIsLoading(true)

    try {
      const response = await signIn({
        ...(formData.email && { email: formData.email }),
        ...(formData.username && { username: formData.username }),
        password: formData.password,
      })

      if (!response.success) {
        // Better error message handling
        const errorMessage = response.error || 'Invalid email or password'
        toast.error(errorMessage)
        return
      }

      toast.success('Signed in successfully!')

      const user = AuthService.formatUserFromResponse(response.data)
      setUser(user)

      onSignIn(response.data.email)
    } catch (error) {
      console.error('Error signing in:', error)
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Unable to connect to server. Please check your connection and try again.')
      } else {
        toast.error('Failed to sign in. Please check your credentials and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'identity':
        return (
          <IdentityStep
            isNewUser={currentIsNewUser}
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onGoogleSignIn={handleGoogleSignIn}
          />
        )

      case 'consent':
        return (
          <ConsentStep
            consentGiven={formData.consentGiven}
            onConsentChange={(value) => handleFormDataChange({ consentGiven: value })}
          />
        )

      case 'wallet':
        return (
          <WalletStep
            isLoading={isLoading}
            onCreateAccount={handleCreateAccount}
          />
        )

      case 'complete':
        return (
          <CompleteStep
            walletAddress={formData.walletAddress}
            accountData={accountData}
            formData={formData}
            onComplete={onComplete}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overscroll-none">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto overscroll-contain relative border border-gray-100">
        <ProgressBar 
          currentStep={currentStepIndex} 
          totalSteps={steps.length}
          onClose={() => {
            if (onClose) {
              onClose()
            } else {
              window.history.back()
            }
          }}
        />

        <div className="mb-4 sm:mb-6">
          {renderStep()}
        </div>

        {step !== 'wallet' && step !== 'complete' && !(step === 'identity' && !currentIsNewUser) && (
          <NavigationButtons
            currentStep={currentStepIndex}
            totalSteps={steps.length}
            onBack={handleBack}
            onNext={handleNext}
            showBack={step !== 'identity'}
          />
        )}

        {step === 'identity' && !currentIsNewUser && (
          <div className="mt-6 space-y-4">
            <button
              onClick={handleSignIn}
              disabled={(!formData.email && !formData.username) || !formData.password || isLoading}
              className="w-full bg-linka-emerald text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">
                Don't have an account?
              </p>
              <button
                onClick={() => {
                  setCurrentIsNewUser(true)
                  setStep('identity')
                }}
                className="w-full py-3 border border-linka-emerald text-linka-emerald rounded-lg font-medium hover:bg-linka-emerald/5"
              >
                Create New Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
