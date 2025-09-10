'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth/auth-service'

interface User {
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser({
        email: currentUser.email,
        name: currentUser.name
      })
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const result = await authService.authenticate(email, password)
    
    if (!result.success) {
      throw new Error(result.error || 'Authentication failed')
    }
    
    if (result.user) {
      setUser(result.user)
      router.push('/')
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login, 
        logout, 
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}