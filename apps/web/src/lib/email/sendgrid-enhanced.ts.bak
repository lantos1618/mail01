// Enhanced SendGrid service with localStorage
export class SendGridEnhanced {
  private apiKey: string
  
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_SENDGRID_API_KEY || process.env.SENDGRID_API_KEY || ''
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
      // Save to localStorage in browser
      if (typeof window !== 'undefined') {
        const emailData = {
          ...email,
          folder: 'sent',
          timestamp: new Date().toISOString(),
          messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
        const emails = JSON.parse(localStorage.getItem('mail01-emails') || '[]')
        emails.push(emailData)
        localStorage.setItem('mail01-emails', JSON.stringify(emails))
      }

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
    if (typeof window === 'undefined') return
    
    const folder = email.folder || 'sent'
    const storageKey = `mail01-${folder}`
    
    // Get existing emails
    const emails = JSON.parse(localStorage.getItem(storageKey) || '[]')
    
    // Add new email
    emails.push({
      ...email,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: email.timestamp || new Date().toISOString()
    })
    
    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(emails))
  }

  async getEmails(folder: string = 'inbox'): Promise<any[]> {
    if (typeof window === 'undefined') return []
    
    const storageKey = `mail01-${folder}`
    
    try {
      const emails = JSON.parse(localStorage.getItem(storageKey) || '[]')
      
      return emails.sort((a: any, b: any) => 
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