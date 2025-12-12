import type { User } from '../types'

const STORAGE_KEY = 'linka_user'

export class AuthService {
  static getUser(): User | null {
    if (typeof window === 'undefined') {
      return null
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        return null
      }
      return JSON.parse(stored) as User
    } catch (error) {
      console.error('Error parsing stored user data:', error)
      return null
    }
  }

  static setUser(user: User): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } catch (error) {
      console.error('Error storing user data:', error)
    }
  }

  static clearUser(): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing user data:', error)
    }
  }

  static hasUser(): boolean {
    if (typeof window === 'undefined') {
      return false
    }

    return !!localStorage.getItem(STORAGE_KEY)
  }

  static formatUserFromResponse(responseData: {
    email: string
    username: string
    walletAddress: string
    profile: { name: string }
    onboardingCompleted: boolean
  }): User {
    return {
      email: responseData.email,
      username: responseData.username,
      name: responseData.profile.name,
      walletAddress: responseData.walletAddress,
      onboardingCompleted: responseData.onboardingCompleted
    }
  }
}

