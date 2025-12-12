'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '../libs/types'
import { AuthService } from '../libs/services/auth.service'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  signOut: () => void
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = AuthService.getUser()
    setUserState(storedUser)
    setIsLoading(false)
  }, [])

  const setUser = (newUser: User | null) => {
    if (newUser) {
      AuthService.setUser(newUser)
      setUserState(newUser)
    } else {
      AuthService.clearUser()
      setUserState(null)
    }
  }

  const signOut = () => {
    AuthService.clearUser()
    setUserState(null)
    router.push('/login')
  }

  const refreshUser = () => {
    const storedUser = AuthService.getUser()
    setUserState(storedUser)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    setUser,
    signOut,
    refreshUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

