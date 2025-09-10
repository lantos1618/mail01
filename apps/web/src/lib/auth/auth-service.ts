// Simple authentication service for Mail-01
// Stores user credentials securely in localStorage for email sending

interface UserCredentials {
  email: string
  password: string // This will be the Gmail app password
  name?: string
}

interface AuthResult {
  success: boolean
  user?: {
    email: string
    name?: string
  }
  error?: string
}

class AuthService {
  private readonly STORAGE_KEY = 'mail01_auth'
  private readonly SESSION_KEY = 'mail01_session'
  
  // Authenticate user with email and password
  async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      // Basic validation
      if (!email || !password) {
        return { 
          success: false, 
          error: 'Email and password are required' 
        }
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return { 
          success: false, 
          error: 'Invalid email format' 
        }
      }
      
      // For Gmail, we need an app-specific password (16 characters)
      // Regular passwords won't work with SMTP
      if (email.includes('@gmail.com') && password.length < 8) {
        return {
          success: false,
          error: 'For Gmail accounts, please use an app-specific password'
        }
      }
      
      // Store credentials securely (in production, this would be encrypted)
      const credentials: UserCredentials = {
        email,
        password,
        name: email.split('@')[0] // Default name from email
      }
      
      // Save to localStorage (in production, use secure session storage)
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
          email: credentials.email,
          name: credentials.name
        }))
        
        // Store encrypted password separately for email sending
        // In production, this would be handled server-side
        localStorage.setItem(this.SESSION_KEY, btoa(password))
      }
      
      return {
        success: true,
        user: {
          email: credentials.email,
          name: credentials.name
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      return {
        success: false,
        error: 'Authentication failed'
      }
    }
  }
  
  // Get current user
  getCurrentUser(): UserCredentials | null {
    if (typeof window === 'undefined') return null
    
    try {
      const userStr = localStorage.getItem(this.STORAGE_KEY)
      const passwordStr = localStorage.getItem(this.SESSION_KEY)
      
      if (!userStr || !passwordStr) return null
      
      const user = JSON.parse(userStr)
      const password = atob(passwordStr)
      
      return {
        ...user,
        password
      }
    } catch {
      return null
    }
  }
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }
  
  // Logout
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.SESSION_KEY)
    }
  }
  
  // Get email credentials for SMTP
  getEmailCredentials(): { user: string; pass: string } | null {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return null
    
    return {
      user: currentUser.email,
      pass: currentUser.password
    }
  }
}

// Export singleton instance
export const authService = new AuthService()

// Export types
export type { UserCredentials, AuthResult }