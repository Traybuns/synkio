export enum KYCStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum PrivacyLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FRIENDS = 'friends'
}

export interface User {
  email: string
  name: string
  username?: string
  walletAddress: string
  onboardingCompleted: boolean
}

export interface CreateIdentityRequest {
  email: string
  username: string
  password: string
  profile?: {
    name?: string
    bio?: string
    categories?: string[]
    location?: string
    website?: string
  }
  consentGiven: boolean
}

export interface SignInRequest {
  email?: string
  username?: string
  password: string
}

export type OnboardingStep = 'welcome' | 'consent' | 'identity' | 'wallet' | 'complete'

export interface OnboardingModalProps {
  onComplete: (userData: any) => void
  onSignIn: (email: string) => void
  isNewUser?: boolean
  onClose?: () => void
}

