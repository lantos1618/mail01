import { z } from "zod"

// Email sending schema
export const SendEmailSchema = z.object({
  to: z.union([z.string(), z.array(z.string())]),
  from: z.string().default("agent@lambda.run"),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional(),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),
  replyTo: z.string().optional(),
  attachments: z.array(z.object({
    content: z.string(),
    filename: z.string(),
    type: z.string().optional(),
    disposition: z.string().optional(),
  })).optional(),
})

export type SendEmailParams = z.infer<typeof SendEmailSchema>

// SendGrid Service
export class SendGridService {
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY
  }

  // Send email via SendGrid API
  async sendEmail(params: SendEmailParams): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    if (!this.apiKey) {
      console.error("SendGrid API key not configured")
      return {
        success: false,
        error: "SendGrid API key not configured",
      }
    }

    try {
      // Prepare email data for SendGrid
      const emailData = {
        personalizations: [{
          to: Array.isArray(params.to) 
            ? params.to.map(email => ({ email }))
            : [{ email: params.to }],
          ...(params.cc && { cc: params.cc.map(email => ({ email })) }),
          ...(params.bcc && { bcc: params.bcc.map(email => ({ email })) }),
        }],
        from: { email: params.from },
        subject: params.subject,
        content: [
          ...(params.text ? [{ type: "text/plain", value: params.text }] : []),
          ...(params.html ? [{ type: "text/html", value: params.html }] : []),
        ],
        ...(params.replyTo && { reply_to: { email: params.replyTo } }),
        ...(params.attachments && { attachments: params.attachments }),
      }

      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      })

      if (response.ok) {
        const messageId = response.headers.get("x-message-id") || undefined
        
        // Save to sent folder
        await this.saveToSentFolder(params, messageId)
        
        return {
          success: true,
          messageId,
        }
      } else {
        const error = await response.text()
        console.error("SendGrid API error:", error)
        return {
          success: false,
          error: `SendGrid API error: ${response.status}`,
        }
      }
    } catch (error) {
      console.error("Failed to send email:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      }
    }
  }

  // Save email to sent folder
  private async saveToSentFolder(email: SendEmailParams, messageId?: string): Promise<void> {
    try {
      const sentEmail = {
        id: messageId || `sent-${Date.now()}`,
        from: email.from,
        to: email.to,
        subject: email.subject,
        body: email.html || email.text || "",
        timestamp: new Date().toISOString(),
        folder: "sent",
        attachments: email.attachments,
      }

      // Save to file system (agent/inbox/sent/)
      const fs = await import("fs/promises")
      const path = await import("path")
      
      const sentDir = path.join(process.cwd(), "agent", "inbox", "sent")
      await fs.mkdir(sentDir, { recursive: true })
      
      const filename = `${sentEmail.id}.json`
      await fs.writeFile(
        path.join(sentDir, filename),
        JSON.stringify(sentEmail, null, 2)
      )
      
      console.log(`Email saved to sent folder: ${filename}`)
    } catch (error) {
      console.error("Failed to save email to sent folder:", error)
    }
  }

  // Send email with AI enhancement
  async sendEnhancedEmail(params: SendEmailParams & {
    enhance?: boolean
    tone?: string
    style?: string
  }): Promise<{
    success: boolean
    messageId?: string
    enhancements?: string[]
    error?: string
  }> {
    let finalParams = { ...params }
    const enhancements = []

    if (params.enhance) {
      // Enhance subject line
      if (!params.subject.includes("Re:") && !params.subject.includes("Fwd:")) {
        finalParams.subject = this.enhanceSubject(params.subject)
        enhancements.push("Enhanced subject line")
      }

      // Enhance email body
      if (params.text) {
        finalParams.text = this.enhanceBody(params.text, params.tone, params.style)
        enhancements.push("Enhanced email body")
      }

      // Add professional signature
      finalParams.html = this.addSignature(finalParams.html || finalParams.text || "")
      enhancements.push("Added professional signature")
    }

    const result = await this.sendEmail(finalParams)
    
    return {
      ...result,
      enhancements: enhancements.length > 0 ? enhancements : undefined,
    }
  }

  // Enhance subject line
  private enhanceSubject(subject: string): string {
    // Simple enhancement (in production, use AI)
    if (subject.length < 5) {
      return `${subject} - Follow-up`
    }
    return subject
  }

  // Enhance email body
  private enhanceBody(body: string, tone?: string, style?: string): string {
    let enhanced = body
    
    // Add greeting if missing
    if (!body.match(/^(hi|hello|dear|hey)/i)) {
      enhanced = `Hello,\n\n${enhanced}`
    }
    
    // Add closing if missing
    if (!body.match(/(regards|sincerely|thanks|best|cheers)$/i)) {
      enhanced = `${enhanced}\n\nBest regards`
    }
    
    return enhanced
  }

  // Add email signature
  private addSignature(content: string): string {
    const signature = `
      <br><br>
      <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 20px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Sent via Mail-01 - AI-Powered Email Client
        </p>
      </div>
    `
    
    if (content.includes("</html>")) {
      return content.replace("</body>", `${signature}</body>`)
    }
    
    return `<html><body>${content}${signature}</body></html>`
  }

  // Schedule email for later sending
  async scheduleEmail(params: SendEmailParams & {
    sendAt: Date
  }): Promise<{
    scheduled: boolean
    scheduledId?: string
    error?: string
  }> {
    try {
      // In production, integrate with a job queue
      // For now, save to drafts with schedule metadata
      const scheduledEmail = {
        ...params,
        id: `scheduled-${Date.now()}`,
        scheduledFor: params.sendAt.toISOString(),
        status: "scheduled",
      }

      const fs = await import("fs/promises")
      const path = await import("path")
      
      const draftsDir = path.join(process.cwd(), "agent", "inbox", "drafts")
      await fs.mkdir(draftsDir, { recursive: true })
      
      await fs.writeFile(
        path.join(draftsDir, `${scheduledEmail.id}.json`),
        JSON.stringify(scheduledEmail, null, 2)
      )
      
      return {
        scheduled: true,
        scheduledId: scheduledEmail.id,
      }
    } catch (error) {
      return {
        scheduled: false,
        error: error instanceof Error ? error.message : "Failed to schedule email",
      }
    }
  }

  // Get email sending statistics
  async getStatistics(): Promise<{
    sent: number
    scheduled: number
    failed: number
    averageResponseTime?: number
  }> {
    try {
      const fs = await import("fs/promises")
      const path = await import("path")
      
      const sentDir = path.join(process.cwd(), "agent", "inbox", "sent")
      const files = await fs.readdir(sentDir).catch(() => [])
      
      return {
        sent: files.length,
        scheduled: 0, // Would count scheduled emails
        failed: 0, // Would track failed sends
        averageResponseTime: 2.5, // hours (simulated)
      }
    } catch {
      return {
        sent: 0,
        scheduled: 0,
        failed: 0,
      }
    }
  }
}

// Export singleton instance
export const sendGridService = new SendGridService()