'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

// Demo users for testing - in production, this would be a proper database
const DEMO_USERS = [
  { email: 'l.leong1618@gmail.com', password: 'demo123', name: 'Lyndon' },
  { email: 'agent@lambda.run', password: 'agent123', name: 'Agent' },
  { email: 'demo@example.com', password: 'demo123', name: 'Demo User' }
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('mail01_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('mail01_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Simple email/password validation
    const validUser = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )

    if (!validUser) {
      throw new Error('Invalid email or password')
    }

    const userData = { email: validUser.email, name: validUser.name }
    setUser(userData)
    localStorage.setItem('mail01_user', JSON.stringify(userData))
    
    // Store email for SMTP if needed
    localStorage.setItem('mail01_user_email', validUser.email)
    
    router.push('/')
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('mail01_user')
    localStorage.removeItem('mail01_user_email')
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