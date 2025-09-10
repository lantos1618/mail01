import nodemailer from "nodemailer"

// Gmail configuration
interface GmailConfig {
  user: string
  pass: string // App-specific password
}

// Initialize Gmail config from environment
const gmailConfig: GmailConfig = {
  user: process.env.GMAIL_USER || "",
  pass: process.env.GMAIL_APP_PASSWORD || ""
}

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null

if (gmailConfig.user && gmailConfig.pass) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailConfig.user,
      pass: gmailConfig.pass
    }
  })
}

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
  saveToInbox?: boolean
}

export async function receiveEmail(email: {
  from: string
  to: string
  subject: string
  body: string
  html?: string
  attachments?: any[]
  messageId?: string
  threadId?: string
}) {
  // Mock implementation for receiving emails
  const receivedEmail = {
    ...email,
    id: `received_${Date.now()}`,
    timestamp: new Date().toISOString(),
    folder: 'received',
    status: 'unread'
  }
  
  console.log('Email received:', receivedEmail)
  return receivedEmail
}

export async function getInboxEmails(folder: string = 'received') {
  // Mock implementation - returns empty array
  console.log(`Getting emails from ${folder} folder`)
  return []
}

export async function archiveEmail(emailId: string, fromFolder: string = 'received') {
  // Mock implementation
  console.log(`Archiving email ${emailId} from ${fromFolder}`)
  return {
    id: emailId,
    folder: 'archived',
    archivedFrom: fromFolder,
    archivedAt: new Date().toISOString()
  }
}

export async function sendEmail(options: EmailOptions) {
  const { 
    to, 
    subject, 
    text, 
    html, 
    from = gmailConfig.user || "agent@lambda.run", 
    cc, 
    bcc
  } = options
  
  const mailOptions = {
    from,
    to,
    subject,
    text,
    html: html || text,
    ...(cc && { cc }),
    ...(bcc && { bcc }),
  }
  
  try {
    if (transporter && gmailConfig.user && gmailConfig.pass) {
      // Send via Gmail
      const info = await transporter.sendMail(mailOptions)
      console.log(`Email sent successfully via Gmail: ${info.messageId}`)
      return { 
        success: true, 
        messageId: info.messageId || `gmail_${Date.now()}`
      }
    } else {
      // Fallback: log if Gmail not configured
      console.log("Gmail not configured, email would be sent:", mailOptions)
      return { 
        success: true, 
        messageId: `local_${Date.now()}`
      }
    }
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}