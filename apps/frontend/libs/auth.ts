import type { User } from './types'

export class AuthService {
  static formatUserFromResponse(data: {
    email: string
    username?: string
    walletAddress: string
    profile?: {
      name?: string
      bio?: string
      categories?: string[]
      location?: string
      website?: string
    }
    onboardingCompleted?: boolean
  }): User {
    return {
      email: data.email,
      name: data.profile?.name || data.email.split('@')[0],
      username: data.username,
      walletAddress: data.walletAddress,
      onboardingCompleted: data.onboardingCompleted ?? false,
    }
  }

  static getUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null
    
    const storedUser = localStorage.getItem('linka_user')
    if (!storedUser) return null

    try {
      return JSON.parse(storedUser)
    } catch (error) {
      console.error('Error parsing stored user:', error)
      localStorage.removeItem('linka_user')
      return null
    }
  }

  static clearUser(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('linka_user')
  }
}
