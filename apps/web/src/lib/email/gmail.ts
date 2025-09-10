import { sendEmail as sendGmailEmail } from '../services/gmail'

interface EmailOptions {
  to: string
  from?: string
  subject: string
  text?: string
  html?: string
  content?: string
  cc?: string[]
  bcc?: string[]
}

class GmailService {
  async sendEmail(options: EmailOptions) {
    try {
      // Convert arrays to strings for cc/bcc
      const ccString = options.cc?.join(', ')
      const bccString = options.bcc?.join(', ')
      
      // Use content as text if text not provided
      const emailText = options.text || options.content || ''
      
      const result = await sendGmailEmail({
        to: options.to,
        from: options.from,
        subject: options.subject,
        text: emailText,
        html: options.html || emailText,
        cc: ccString,
        bcc: bccString,
        saveToInbox: true
      })
      
      return {
        success: result.success,
        messageId: result.messageId,
        savedEmail: result.savedEmail
      }
    } catch (error) {
      console.error('Gmail send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      }
    }
  }
  
  async getEmails(folder: 'sent' | 'received' | 'drafts' | 'archived' = 'received') {
    try {
      const { getInboxEmails } = await import('../services/gmail')
      return await getInboxEmails(folder)
    } catch (error) {
      console.error('Gmail fetch error:', error)
      return []
    }
  }
}

export const gmail = new GmailService()