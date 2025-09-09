import { promises as fs } from 'fs'
import path from 'path'

// Enhanced SendGrid service with file storage
export class SendGridEnhanced {
  private apiKey: string
  private inboxPath: string
  
  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || ''
    this.inboxPath = path.join(process.cwd(), 'agent', 'inbox')
  }

  async sendEmail(email: {
    to: string | string[]
    from: string
    subject: string
    text?: string
    html?: string
    cc?: string[]
    bcc?: string[]
    replyTo?: string
    attachments?: any[]
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Save to local storage first
      await this.saveEmail({
        ...email,
        folder: 'sent',
        timestamp: new Date().toISOString(),
        messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })

      // If no API key, just save locally
      if (!this.apiKey) {
        console.log('No SendGrid API key - email saved locally only')
        return { success: true, messageId: 'local-only' }
      }

      // Send via SendGrid API
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: Array.isArray(email.to) 
              ? email.to.map(e => ({ email: e }))
              : [{ email: email.to }],
            cc: email.cc?.map(e => ({ email: e })),
            bcc: email.bcc?.map(e => ({ email: e }))
          }],
          from: { email: email.from },
          subject: email.subject,
          content: [
            email.text && { type: 'text/plain', value: email.text },
            email.html && { type: 'text/html', value: email.html }
          ].filter(Boolean),
          reply_to: email.replyTo ? { email: email.replyTo } : undefined,
          attachments: email.attachments
        })
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
      return { success: false, error: String(error) }
    }
  }

  async saveEmail(email: any): Promise<void> {
    const folder = email.folder || 'sent'
    const folderPath = path.join(this.inboxPath, folder)
    
    // Ensure folder exists
    await fs.mkdir(folderPath, { recursive: true })
    
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${timestamp}_${email.subject?.replace(/[^a-z0-9]/gi, '_') || 'email'}.json`
    
    // Save email
    await fs.writeFile(
      path.join(folderPath, filename),
      JSON.stringify(email, null, 2)
    )
  }

  async getEmails(folder: string = 'inbox'): Promise<any[]> {
    const folderPath = path.join(this.inboxPath, folder)
    
    try {
      const files = await fs.readdir(folderPath)
      const emails = []
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(folderPath, file), 'utf-8')
          emails.push(JSON.parse(content))
        }
      }
      
      return emails.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    } catch (error) {
      console.error(`Error reading ${folder}:`, error)
      return []
    }
  }

  async sendSummaryEmail(summary: {
    project: string
    achievements: string[]
    technologies: string[]
    features: string[]
    improvements?: string[]
  }): Promise<any> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a1a1a; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">
          ${summary.project} - Project Summary
        </h1>
        
        <section style="margin: 20px 0;">
          <h2 style="color: #333;">Key Achievements</h2>
          <ul style="color: #555; line-height: 1.8;">
            ${summary.achievements.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </section>

        <section style="margin: 20px 0;">
          <h2 style="color: #333;">Technologies Used</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
            ${summary.technologies.map(t => 
              `<span style="background: #f0f0f0; padding: 4px 12px; border-radius: 16px; font-size: 14px;">${t}</span>`
            ).join('')}
          </div>
        </section>

        <section style="margin: 20px 0;">
          <h2 style="color: #333;">Features Implemented</h2>
          <ul style="color: #555; line-height: 1.8;">
            ${summary.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </section>

        ${summary.improvements ? `
        <section style="margin: 20px 0;">
          <h2 style="color: #333;">Improvements Over Original</h2>
          <ul style="color: #555; line-height: 1.8;">
            ${summary.improvements.map(i => `<li>${i}</li>`).join('')}
          </ul>
        </section>
        ` : ''}

        <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 14px;">
          <p>Generated by Mail-01 AI Assistant</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        </footer>
      </div>
    `

    return this.sendEmail({
      to: 'l.leong1618@gmail.com',
      from: 'agent@lambda.run',
      subject: `ralph-mail01-${summary.project.toLowerCase().replace(/\s+/g, '-')}`,
      html,
      text: `${summary.project} Summary\n\n` + 
            `Achievements:\n${summary.achievements.join('\n')}\n\n` +
            `Technologies: ${summary.technologies.join(', ')}\n\n` +
            `Features:\n${summary.features.join('\n')}`
    })
  }
}

// Export singleton instance
export const sendGridService = new SendGridEnhanced()