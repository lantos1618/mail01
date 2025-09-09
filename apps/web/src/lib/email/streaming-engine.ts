import { EventEmitter } from 'events'
import { z } from 'zod'

// Email streaming engine for real-time updates
export class EmailStreamingEngine extends EventEmitter {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private aiProcessingQueue: Map<string, any> = new Map()

  constructor(private config: {
    wsUrl?: string
    aiEnabled?: boolean
    autoReconnect?: boolean
  } = {}) {
    super()
    this.config = {
      wsUrl: config.wsUrl || process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
      aiEnabled: config.aiEnabled ?? true,
      autoReconnect: config.autoReconnect ?? true,
    }
  }

  connect() {
    try {
      this.ws = new WebSocket(this.config.wsUrl!)
      
      this.ws.onopen = () => {
        console.log('Email streaming connected')
        this.reconnectAttempts = 0
        this.emit('connected')
      }

      this.ws.onmessage = async (event) => {
        const data = JSON.parse(event.data)
        await this.handleMessage(data)
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.emit('error', error)
      }

      this.ws.onclose = () => {
        console.log('Email streaming disconnected')
        this.emit('disconnected')
        
        if (this.config.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++
            this.connect()
          }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts))
        }
      }
    } catch (error) {
      console.error('Failed to connect:', error)
      this.emit('error', error)
    }
  }

  private async handleMessage(data: any) {
    const { type, payload } = data

    switch (type) {
      case 'email:new':
        await this.processNewEmail(payload)
        break
      case 'email:updated':
        this.emit('emailUpdated', payload)
        break
      case 'email:deleted':
        this.emit('emailDeleted', payload)
        break
      case 'thread:updated':
        await this.processThreadUpdate(payload)
        break
      case 'ai:suggestion':
        this.emit('aiSuggestion', payload)
        break
      case 'analytics:update':
        this.emit('analyticsUpdate', payload)
        break
      default:
        console.warn('Unknown message type:', type)
    }
  }

  private async processNewEmail(email: any) {
    // Add to AI processing queue if enabled
    if (this.config.aiEnabled) {
      this.aiProcessingQueue.set(email.id, email)
      
      // Process with AI
      const analysis = await this.analyzeEmail(email)
      email.aiAnalysis = analysis
      
      // Check for urgent actions
      if (analysis.priority === 'urgent') {
        this.emit('urgentEmail', email)
      }
      
      // Auto-categorize
      if (analysis.category) {
        email.category = analysis.category
      }
      
      this.aiProcessingQueue.delete(email.id)
    }

    this.emit('newEmail', email)
  }

  private async processThreadUpdate(thread: any) {
    if (this.config.aiEnabled) {
      // Generate thread summary
      const summary = await this.summarizeThread(thread)
      thread.summary = summary
      
      // Extract action items
      const actionItems = await this.extractActionItems(thread)
      thread.actionItems = actionItems
    }

    this.emit('threadUpdated', thread)
  }

  private async analyzeEmail(email: any) {
    // Simulate AI analysis (would call actual AI service)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      priority: this.detectPriority(email),
      sentiment: this.analyzeSentiment(email),
      category: this.categorizeEmail(email),
      suggestedActions: this.suggestActions(email),
      keyPhrases: this.extractKeyPhrases(email),
      entities: this.extractEntities(email),
    }
  }

  private detectPriority(email: any): 'urgent' | 'high' | 'normal' | 'low' {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency']
    const highKeywords = ['important', 'priority', 'deadline', 'eod', 'cob']
    
    const content = `${email.subject} ${email.body}`.toLowerCase()
    
    if (urgentKeywords.some(kw => content.includes(kw))) return 'urgent'
    if (highKeywords.some(kw => content.includes(kw))) return 'high'
    if (email.from?.includes('ceo') || email.from?.includes('cto')) return 'high'
    
    return 'normal'
  }

  private analyzeSentiment(email: any): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['great', 'excellent', 'happy', 'pleased', 'thank']
    const negativeWords = ['concern', 'issue', 'problem', 'disappointed', 'urgent']
    
    const content = email.body?.toLowerCase() || ''
    
    const positiveCount = positiveWords.filter(w => content.includes(w)).length
    const negativeCount = negativeWords.filter(w => content.includes(w)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  private categorizeEmail(email: any): string {
    const categories = {
      meeting: ['meeting', 'schedule', 'calendar', 'appointment'],
      project: ['project', 'milestone', 'deliverable', 'sprint'],
      finance: ['invoice', 'payment', 'budget', 'expense'],
      support: ['help', 'issue', 'problem', 'bug'],
      newsletter: ['newsletter', 'update', 'digest', 'weekly'],
    }
    
    const content = `${email.subject} ${email.body}`.toLowerCase()
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => content.includes(kw))) {
        return category
      }
    }
    
    return 'general'
  }

  private suggestActions(email: any): string[] {
    const actions = []
    const content = `${email.subject} ${email.body}`.toLowerCase()
    
    if (content.includes('meeting') || content.includes('schedule')) {
      actions.push('Schedule meeting')
    }
    if (content.includes('review') || content.includes('feedback')) {
      actions.push('Review and provide feedback')
    }
    if (content.includes('approve') || content.includes('approval')) {
      actions.push('Review for approval')
    }
    if (content.includes('?')) {
      actions.push('Answer question')
    }
    
    return actions
  }

  private extractKeyPhrases(email: any): string[] {
    // Simple keyword extraction (would use NLP in production)
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an']
    const words = email.body?.split(/\s+/) || []
    
    return words
      .filter((w: string) => w.length > 3 && !stopWords.includes(w.toLowerCase()))
      .slice(0, 5)
  }

  private extractEntities(email: any): any {
    const entities: any = {
      people: [],
      organizations: [],
      dates: [],
      urls: [],
    }
    
    // Extract email addresses
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g
    entities.people = email.body?.match(emailRegex) || []
    
    // Extract URLs
    const urlRegex = /https?:\/\/[^\s]+/g
    entities.urls = email.body?.match(urlRegex) || []
    
    // Extract dates (simple pattern)
    const dateRegex = /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}/g
    entities.dates = email.body?.match(dateRegex) || []
    
    return entities
  }

  private async summarizeThread(thread: any): Promise<string> {
    // Simulate AI summarization
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const emailCount = thread.emails?.length || 0
    const participants = new Set(thread.emails?.map((e: any) => e.from) || [])
    
    return `Thread with ${emailCount} emails between ${participants.size} participants discussing ${thread.subject}`
  }

  private async extractActionItems(thread: any): Promise<any[]> {
    // Simulate action item extraction
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const items = []
    const keywords = ['todo', 'action', 'need to', 'please', 'will you', 'can you']
    
    thread.emails?.forEach((email: any) => {
      const content = email.body?.toLowerCase() || ''
      keywords.forEach(kw => {
        if (content.includes(kw)) {
          const index = content.indexOf(kw)
          const snippet = content.substring(index, index + 100)
          items.push({
            text: snippet,
            from: email.from,
            date: email.date,
            completed: false,
          })
        }
      })
    })
    
    return items
  }

  // Public methods for manual actions
  
  sendEmail(email: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'email:send',
        payload: email,
      }))
    }
  }

  markAsRead(emailId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'email:markRead',
        payload: { id: emailId },
      }))
    }
  }

  deleteEmail(emailId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'email:delete',
        payload: { id: emailId },
      }))
    }
  }

  archiveEmail(emailId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'email:archive',
        payload: { id: emailId },
      }))
    }
  }

  subscribeToFolder(folder: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe:folder',
        payload: { folder },
      }))
    }
  }

  requestAISuggestion(context: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'ai:requestSuggestion',
        payload: context,
      }))
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  getConnectionStatus() {
    if (!this.ws) return 'disconnected'
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'connected'
      case WebSocket.CLOSING: return 'closing'
      case WebSocket.CLOSED: return 'closed'
      default: return 'unknown'
    }
  }

  getAIQueueSize() {
    return this.aiProcessingQueue.size
  }
}

// Singleton instance
let streamingEngine: EmailStreamingEngine | null = null

export function getEmailStreamingEngine(config?: any) {
  if (!streamingEngine) {
    streamingEngine = new EmailStreamingEngine(config)
  }
  return streamingEngine
}

// React hook for using the streaming engine
export function useEmailStreaming() {
  const engine = getEmailStreamingEngine()
  return engine
}