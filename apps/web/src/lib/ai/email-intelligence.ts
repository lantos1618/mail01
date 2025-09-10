import { z } from 'zod'

export const EmailPrioritySchema = z.enum(['urgent', 'high', 'normal', 'low'])
export const EmailCategorySchema = z.enum([
  'work', 'personal', 'newsletter', 'promotional', 
  'social', 'finance', 'travel', 'support', 'other'
])
export const EmailSentimentSchema = z.enum(['positive', 'neutral', 'negative', 'mixed'])
export const EmailToneSchema = z.enum(['formal', 'casual', 'friendly', 'professional', 'urgent'])

export interface EmailAnalysis {
  priority: z.infer<typeof EmailPrioritySchema>
  category: z.infer<typeof EmailCategorySchema>
  sentiment: z.infer<typeof EmailSentimentSchema>
  summary: string
  actionItems: string[]
  keyPeople: string[]
  topics: string[]
  suggestedResponse?: string
  estimatedResponseTime?: number // in minutes
  requiresAction: boolean
  meetingDetected: boolean
  meetingDetails?: {
    date?: string
    time?: string
    location?: string
    attendees?: string[]
  }
}

export interface EmailThread {
  id: string
  subject: string
  participants: string[]
  messages: EmailMessage[]
  lastActivity: Date
  unreadCount: number
  analysis?: EmailAnalysis
}

export interface EmailMessage {
  id: string
  from: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  html?: string
  attachments?: Attachment[]
  timestamp: Date
  isRead: boolean
  isStarred: boolean
  labels: string[]
  threadId: string
  analysis?: EmailAnalysis
}

export interface Attachment {
  id: string
  filename: string
  mimeType: string
  size: number
  url?: string
}

export class EmailIntelligenceService {
  async analyzeEmail(email: EmailMessage): Promise<EmailAnalysis> {
    // In production, this would call an AI API
    // For now, returning a sophisticated mock analysis
    
    const hasUrgentKeywords = /urgent|asap|immediately|critical|emergency/i.test(email.subject + email.body)
    const hasMeetingKeywords = /meeting|call|schedule|appointment|calendar/i.test(email.body)
    const hasActionKeywords = /please|could you|can you|need|require|must/i.test(email.body)
    
    const analysis: EmailAnalysis = {
      priority: hasUrgentKeywords ? 'urgent' : 'normal',
      category: this.detectCategory(email),
      sentiment: this.detectSentiment(email.body),
      summary: this.generateSummary(email.body),
      actionItems: await this.extractActionItems(email.body),
      keyPeople: this.extractPeople(email),
      topics: this.extractTopics(email.body),
      requiresAction: hasActionKeywords,
      meetingDetected: hasMeetingKeywords,
      estimatedResponseTime: hasUrgentKeywords ? 15 : 60,
    }

    if (hasMeetingKeywords) {
      analysis.meetingDetails = this.extractMeetingDetails(email.body)
    }

    return analysis
  }

  async generateSmartReply(email: EmailMessage, tone: z.infer<typeof EmailToneSchema>): Promise<string> {
    // In production, this would use AI to generate context-aware replies
    const templates = {
      formal: `Dear ${email.from.split('@')[0]},\n\nThank you for your email regarding "${email.subject}". I have reviewed your message and will respond with the necessary information shortly.\n\nBest regards,`,
      casual: `Hi ${email.from.split('@')[0]},\n\nThanks for reaching out about "${email.subject}". Let me get back to you on this.\n\nCheers,`,
      friendly: `Hey ${email.from.split('@')[0]}!\n\nGot your message about "${email.subject}" - thanks for letting me know! I'll look into this and get back to you soon.\n\nBest,`,
      professional: `Hello ${email.from.split('@')[0]},\n\nI acknowledge receipt of your email regarding "${email.subject}". I will review and provide a comprehensive response at the earliest opportunity.\n\nSincerely,`,
      urgent: `${email.from.split('@')[0]},\n\nReceived your urgent message about "${email.subject}". I'm on it immediately and will update you as soon as possible.\n\nRegards,`,
    }

    return templates[tone] || templates.professional
  }

  async improveEmailDraft(draft: string, improvements: string[]): Promise<string> {
    // In production, this would use AI to improve the draft
    let improved = draft

    if (improvements.includes('clarity')) {
      improved = improved.replace(/\bvery\b/gi, '').replace(/\s+/g, ' ')
    }

    if (improvements.includes('conciseness')) {
      improved = improved.split('.').slice(0, 3).join('.') + '.'
    }

    if (improvements.includes('tone')) {
      improved = `I hope this email finds you well.\n\n${improved}\n\nPlease let me know if you need any additional information.`
    }

    return improved
  }

  async summarizeThread(thread: EmailThread): Promise<string> {
    const messageCount = thread.messages.length
    const participants = thread.participants.join(', ')
    const topics = thread.messages
      .flatMap(m => m.analysis?.topics || [])
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 3)
      .join(', ')

    return `Thread with ${messageCount} messages between ${participants}. Main topics: ${topics}. Last activity: ${thread.lastActivity.toLocaleDateString()}.`
  }

  async extractActionItems(emailBody: string): Promise<string[]> {
    const actionPatterns = [
      /please\s+([^.]+)/gi,
      /could you\s+([^.]+)/gi,
      /can you\s+([^.]+)/gi,
      /need to\s+([^.]+)/gi,
      /must\s+([^.]+)/gi,
      /action required:\s*([^.]+)/gi,
      /todo:\s*([^.]+)/gi,
    ]

    const items: string[] = []
    for (const pattern of actionPatterns) {
      const matches = emailBody.matchAll(pattern)
      for (const match of matches) {
        if (match[1]) {
          items.push(match[1].trim())
        }
      }
    }

    return items.slice(0, 5) // Limit to 5 items
  }

  private detectCategory(email: EmailMessage): z.infer<typeof EmailCategorySchema> {
    const body = (email.subject + ' ' + email.body).toLowerCase()
    
    if (/invoice|payment|receipt|transaction|billing/i.test(body)) return 'finance'
    if (/flight|hotel|booking|reservation|itinerary/i.test(body)) return 'travel'
    if (/newsletter|unsubscribe|digest|weekly|monthly/i.test(body)) return 'newsletter'
    if (/sale|discount|offer|deal|promo/i.test(body)) return 'promotional'
    if (/linkedin|facebook|twitter|instagram/i.test(body)) return 'social'
    if (/support|ticket|issue|problem|help/i.test(body)) return 'support'
    if (/meeting|project|deadline|report|presentation/i.test(body)) return 'work'
    
    return 'other'
  }

  private detectSentiment(text: string): z.infer<typeof EmailSentimentSchema> {
    const positive = /thank|appreciate|great|excellent|wonderful|happy|pleased|glad/i.test(text)
    const negative = /sorry|apologize|unfortunately|problem|issue|concern|disappointed|frustrated/i.test(text)
    
    if (positive && !negative) return 'positive'
    if (negative && !positive) return 'negative'
    if (positive && negative) return 'mixed'
    return 'neutral'
  }

  private generateSummary(body: string): string {
    const sentences = body.match(/[^.!?]+[.!?]+/g) || []
    return sentences.slice(0, 2).join(' ').substring(0, 200) + '...'
  }

  private extractPeople(email: EmailMessage): string[] {
    const people = new Set<string>()
    people.add(email.from)
    email.to.forEach(p => people.add(p))
    email.cc?.forEach(p => people.add(p))
    
    return Array.from(people).map(email => email.split('@')[0])
  }

  private extractTopics(body: string): string[] {
    // Simple keyword extraction - in production, use NLP
    const keywords = body
      .toLowerCase()
      .match(/\b[a-z]{4,}\b/g) || []
    
    const commonWords = new Set(['this', 'that', 'with', 'from', 'have', 'will', 'your', 'been', 'more'])
    const topics = keywords
      .filter(word => !commonWords.has(word))
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    
    return Object.entries(topics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word)
  }

  private extractMeetingDetails(body: string): EmailAnalysis['meetingDetails'] {
    // Simple extraction - in production, use AI
    const dateMatch = body.match(/\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/)
    const timeMatch = body.match(/\b(\d{1,2}:\d{2}\s*[ap]m)\b/i)
    
    return {
      date: dateMatch?.[1],
      time: timeMatch?.[1],
    }
  }
}

export const emailIntelligence = new EmailIntelligenceService()