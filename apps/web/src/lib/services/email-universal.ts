import nodemailer from "nodemailer"
import * as fs from "fs/promises"
import * as path from "path"
import { authService } from '@/lib/auth/auth-service'

interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
  from?: string
  cc?: string
  bcc?: string
  priority?: 'high' | 'normal' | 'low'
  labels?: string[]
  threadId?: string
  saveToInbox?: boolean
}

interface EmailProvider {
  name: string
  send: (options: EmailOptions) => Promise<{ success: boolean; messageId: string; provider: string }>
  isConfigured: () => boolean
}

// Gmail Provider - uses authenticated user's credentials
class GmailProvider implements EmailProvider {
  name = "gmail"
  private transporter: nodemailer.Transporter | null = null
  
  constructor() {
    this.initializeTransporter()
  }
  
  private initializeTransporter() {
    // Try to get credentials from authenticated user first
    const userCredentials = authService.getEmailCredentials()
    
    if (userCredentials) {
      // Use authenticated user's credentials
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: userCredentials.user,
          pass: userCredentials.pass
        }
      })
    } else {
      // Fall back to environment variables if available
      const envUser = process.env.GMAIL_USER
      const envPass = process.env.GMAIL_APP_PASSWORD
      
      if (envUser && envPass) {
        this.transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: envUser,
            pass: envPass
          }
        })
      }
    }
  }
  
  isConfigured(): boolean {
    return !!this.transporter
  }
  
  async send(options: EmailOptions): Promise<{ success: boolean; messageId: string; provider: string }> {
    // Re-initialize transporter to get latest user credentials
    this.initializeTransporter()
    
    if (!this.transporter) {
      throw new Error("Gmail not configured. Please log in with your Gmail credentials.")
    }
    
    // Get the authenticated user's email for the from field
    const userCredentials = authService.getEmailCredentials()
    const fromEmail = userCredentials?.user || process.env.GMAIL_USER || "agent@lambda.run"
    
    const { to, subject, text, html, from = fromEmail, cc, bcc } = options
    
    const mailOptions = {
      from,
      to,
      subject,
      text,
      html: html || text,
      ...(cc && { cc }),
      ...(bcc && { bcc })
    }
    
    try {
      const info = await this.transporter.sendMail(mailOptions)
      const messageId = info.messageId || `gmail_${Date.now()}`
      console.log(`Email sent successfully via Gmail: ${messageId}`)
      return { success: true, messageId, provider: "gmail" }
    } catch (error) {
      console.error("Gmail send error:", error)
      throw error
    }
  }
}

// Local File System Provider (fallback)
class LocalProvider implements EmailProvider {
  name = "local"
  
  isConfigured(): boolean {
    return true // Always available
  }
  
  async send(options: EmailOptions): Promise<{ success: boolean; messageId: string; provider: string }> {
    const messageId = `local_${Date.now()}`
    console.log("Email saved locally (no external provider configured)")
    return { success: true, messageId, provider: "local" }
  }
}

// Universal Email Service
class UniversalEmailService {
  private providers: EmailProvider[] = []
  
  constructor() {
    // Initialize Gmail as primary provider with local fallback
    this.providers = [
      new GmailProvider(),
      new LocalProvider()
    ]
  }
  
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId: string; provider: string; savedEmail?: any }> {
    let lastError: Error | null = null
    
    // Try each provider in order
    for (const provider of this.providers) {
      if (provider.isConfigured()) {
        try {
          console.log(`Attempting to send email via ${provider.name}...`)
          const result = await provider.send(options)
          
          // Save to local inbox if requested
          let savedEmail = null
          if (options.saveToInbox !== false) {
            savedEmail = await this.saveEmailToFile({
              ...options,
              messageId: result.messageId,
              provider: result.provider,
              folder: "sent",
              timestamp: new Date().toISOString()
            })
          }
          
          return { ...result, savedEmail }
        } catch (error) {
          console.error(`Failed to send via ${provider.name}:`, error)
          lastError = error as Error
          // Continue to next provider
        }
      } else {
        console.log(`${provider.name} provider not configured, skipping...`)
      }
    }
    
    // If all providers failed, save to drafts and throw error
    if (lastError) {
      await this.saveEmailToFile({
        ...options,
        folder: "drafts",
        timestamp: new Date().toISOString(),
        error: lastError.message,
        status: "failed"
      })
      throw lastError
    }
    
    throw new Error("No email providers available")
  }
  
  private async saveEmailToFile(email: any): Promise<any> {
    const folder = email.folder || "sent"
    const inboxPath = path.join(process.cwd(), "agent", "inbox", folder)
    await fs.mkdir(inboxPath, { recursive: true })
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const recipient = email.to.replace(/[^a-zA-Z0-9]/g, "_")
    const filename = `${timestamp}_${recipient}.json`
    
    const emailRecord = {
      id: `${folder}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      folder,
      status: email.status || "sent",
      from: email.from || "agent@lambda.run",
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
      messageId: email.messageId,
      provider: email.provider,
      metadata: {
        sender: email.from || "agent@lambda.run",
        recipient: email.to,
        subject: email.subject,
        hasAttachments: false,
        threadId: email.threadId || null,
        labels: email.labels || [],
        priority: email.priority || 'normal',
        error: email.error
      }
    }
    
    await fs.writeFile(
      path.join(inboxPath, filename),
      JSON.stringify(emailRecord, null, 2)
    )
    
    console.log(`Email saved to ${folder}: ${filename}`)
    return emailRecord
  }
  
  // OAuth2 helper methods
  async initiateOAuth2Flow(): Promise<string> {
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) {
      throw new Error("Google Client ID not configured")
    }
    
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/callback/google"
    const scope = "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly"
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`
    
    return authUrl
  }
  
  async handleOAuth2Callback(code: string): Promise<{ access_token: string; refresh_token: string }> {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/callback/google"
    
    if (!clientId || !clientSecret) {
      throw new Error("Google OAuth2 credentials not configured")
    }
    
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OAuth2 token exchange failed: ${error}`)
    }
    
    const tokens = await response.json()
    
    // Save tokens securely (in production, use secure storage)
    // For now, we'll save to a local file
    const configPath = path.join(process.cwd(), ".agent", "oauth_tokens.json")
    await fs.mkdir(path.dirname(configPath), { recursive: true })
    await fs.writeFile(configPath, JSON.stringify(tokens, null, 2))
    
    return tokens
  }
  
  getConfiguredProviders(): string[] {
    return this.providers
      .filter(p => p.isConfigured())
      .map(p => p.name)
  }
}

// Export singleton instance
export const emailService = new UniversalEmailService()

// Export for backwards compatibility
export const sendEmail = emailService.sendEmail.bind(emailService)
export const initiateOAuth2Flow = emailService.initiateOAuth2Flow.bind(emailService)
export const handleOAuth2Callback = emailService.handleOAuth2Callback.bind(emailService)
export const getConfiguredProviders = emailService.getConfiguredProviders.bind(emailService)