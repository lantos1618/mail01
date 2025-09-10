import { z } from 'zod'

const EmailSchema = z.object({
  to: z.string().email(),
  from: z.string().email(),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  replyTo: z.string().email().optional(),
  attachments: z.array(z.object({
    content: z.string(),
    filename: z.string(),
    type: z.string().optional(),
    disposition: z.string().optional(),
  })).optional(),
})

export type EmailData = z.infer<typeof EmailSchema>

export class SendGridService {
  private apiKey: string
  private baseUrl = 'https://api.sendgrid.com/v3'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SENDGRID_API_KEY || ''
    if (!this.apiKey) {
      console.warn('SendGrid API key not configured')
    }
  }

  async sendEmail(data: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const validated = EmailSchema.parse(data)
      
      const response = await fetch(`${this.baseUrl}/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: validated.to }],
            cc: validated.cc?.map(email => ({ email })),
            bcc: validated.bcc?.map(email => ({ email })),
          }],
          from: { email: validated.from },
          subject: validated.subject,
          content: [
            ...(validated.text ? [{ type: 'text/plain', value: validated.text }] : []),
            ...(validated.html ? [{ type: 'text/html', value: validated.html }] : []),
          ],
          reply_to: validated.replyTo ? { email: validated.replyTo } : undefined,
          attachments: validated.attachments,
        }),
      })

      if (response.ok) {
        const messageId = response.headers.get('X-Message-Id')
        return { success: true, messageId: messageId || undefined }
      } else {
        const error = await response.text()
        return { success: false, error }
      }
    } catch (error) {
      console.error('SendGrid error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      }
    }
  }

  async sendBulkEmails(emails: EmailData[]): Promise<Array<{ email: string; success: boolean; error?: string }>> {
    const results = await Promise.all(
      emails.map(async (email) => {
        const result = await this.sendEmail(email)
        return {
          email: email.to,
          success: result.success,
          error: result.error,
        }
      })
    )
    return results
  }

  async validateEmail(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/validations/email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.result?.verdict === 'valid'
      }
      return false
    } catch {
      return false
    }
  }
}

export const sendgrid = new SendGridService()