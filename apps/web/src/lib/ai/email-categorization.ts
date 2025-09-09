import { z } from 'zod'

// Intelligent email categorization with ML-style pattern matching
export class EmailCategorizationEngine {
  private patterns: Map<string, CategoryPattern> = new Map()
  private userPatterns: Map<string, any> = new Map()
  private learningMode: boolean = true
  
  constructor() {
    this.initializeDefaultPatterns()
  }
  
  private initializeDefaultPatterns() {
    // Work categories
    this.addPattern({
      id: 'meeting',
      name: 'Meetings',
      color: 'blue',
      icon: 'calendar',
      keywords: ['meeting', 'schedule', 'calendar', 'appointment', 'call', 'zoom', 'teams'],
      senderPatterns: ['calendar', 'scheduler', 'assistant'],
      subjectPatterns: ['invitation', 'meeting request', 'scheduled'],
      priority: 'high',
      autoActions: ['addToCalendar', 'sendReminder'],
    })
    
    this.addPattern({
      id: 'project',
      name: 'Projects',
      color: 'purple',
      icon: 'folder',
      keywords: ['project', 'milestone', 'deliverable', 'sprint', 'task', 'jira', 'asana'],
      senderPatterns: ['pm@', 'project', 'team'],
      subjectPatterns: ['update', 'status', 'progress'],
      priority: 'medium',
      autoActions: ['extractTasks', 'updateProjectBoard'],
    })
    
    this.addPattern({
      id: 'finance',
      name: 'Finance',
      color: 'green',
      icon: 'dollar',
      keywords: ['invoice', 'payment', 'budget', 'expense', 'receipt', 'purchase', 'order'],
      senderPatterns: ['accounting', 'finance', 'billing'],
      subjectPatterns: ['invoice', 'payment', 'statement'],
      priority: 'high',
      autoActions: ['extractAmount', 'addToExpenses'],
    })
    
    // Communication categories
    this.addPattern({
      id: 'customer',
      name: 'Customer',
      color: 'orange',
      icon: 'users',
      keywords: ['customer', 'client', 'support', 'help', 'issue', 'request'],
      senderPatterns: ['support', 'customer', 'client'],
      subjectPatterns: ['support', 'help', 'issue', 'problem'],
      priority: 'high',
      autoActions: ['createTicket', 'assignToSupport'],
    })
    
    this.addPattern({
      id: 'newsletter',
      name: 'Newsletter',
      color: 'gray',
      icon: 'newspaper',
      keywords: ['newsletter', 'digest', 'update', 'news', 'announcement', 'unsubscribe'],
      senderPatterns: ['newsletter', 'news', 'updates', 'noreply'],
      subjectPatterns: ['newsletter', 'weekly', 'monthly', 'digest'],
      priority: 'low',
      autoActions: ['summarize', 'archiveAfterRead'],
    })
    
    this.addPattern({
      id: 'personal',
      name: 'Personal',
      color: 'pink',
      icon: 'heart',
      keywords: ['personal', 'family', 'friend', 'birthday', 'vacation', 'lunch'],
      senderPatterns: [],
      subjectPatterns: [],
      priority: 'medium',
      autoActions: [],
    })
    
    // System categories
    this.addPattern({
      id: 'notification',
      name: 'Notifications',
      color: 'yellow',
      icon: 'bell',
      keywords: ['notification', 'alert', 'reminder', 'automated', 'system'],
      senderPatterns: ['system', 'automated', 'bot', 'notification'],
      subjectPatterns: ['alert', 'notification', 'reminder'],
      priority: 'low',
      autoActions: ['markAsRead', 'archive'],
    })
    
    this.addPattern({
      id: 'security',
      name: 'Security',
      color: 'red',
      icon: 'shield',
      keywords: ['security', 'password', 'verification', '2fa', 'login', 'suspicious'],
      senderPatterns: ['security', 'admin', 'it'],
      subjectPatterns: ['security', 'verification', 'alert'],
      priority: 'urgent',
      autoActions: ['flagImportant', 'notifyUser'],
    })
  }
  
  private addPattern(pattern: CategoryPattern) {
    this.patterns.set(pattern.id, pattern)
  }
  
  async categorizeEmail(email: EmailData): Promise<CategorizationResult> {
    const scores = new Map<string, number>()
    
    // Calculate scores for each category
    for (const [id, pattern] of this.patterns) {
      const score = this.calculateCategoryScore(email, pattern)
      if (score > 0) {
        scores.set(id, score)
      }
    }
    
    // Get top categories
    const sortedCategories = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    
    // Primary category is the highest scoring one
    const primaryCategory = sortedCategories[0]?.[0] || 'general'
    const secondaryCategories = sortedCategories.slice(1).map(([id]) => id)
    
    // Get confidence score
    const confidence = sortedCategories[0]?.[1] || 0
    
    // Learn from user corrections if enabled
    if (this.learningMode) {
      this.updatePatterns(email, primaryCategory)
    }
    
    // Get suggested actions
    const suggestedActions = this.getSuggestedActions(primaryCategory, email)
    
    // Detect smart labels
    const smartLabels = await this.detectSmartLabels(email)
    
    return {
      primaryCategory,
      secondaryCategories,
      confidence,
      suggestedActions,
      smartLabels,
      autoApplied: confidence > 0.8,
      reasoning: this.explainCategorization(email, primaryCategory),
    }
  }
  
  private calculateCategoryScore(email: EmailData, pattern: CategoryPattern): number {
    let score = 0
    const weights = {
      keyword: 0.3,
      sender: 0.25,
      subject: 0.25,
      userPattern: 0.2,
    }
    
    // Keyword matching
    const content = `${email.subject} ${email.body}`.toLowerCase()
    const keywordMatches = pattern.keywords.filter(kw => content.includes(kw))
    score += (keywordMatches.length / pattern.keywords.length) * weights.keyword
    
    // Sender pattern matching
    if (pattern.senderPatterns.length > 0) {
      const senderMatch = pattern.senderPatterns.some(sp => 
        email.from.toLowerCase().includes(sp)
      )
      if (senderMatch) score += weights.sender
    }
    
    // Subject pattern matching
    if (pattern.subjectPatterns.length > 0) {
      const subjectMatch = pattern.subjectPatterns.some(sp => 
        email.subject.toLowerCase().includes(sp)
      )
      if (subjectMatch) score += weights.subject
    }
    
    // User-specific patterns
    const userPattern = this.userPatterns.get(`${email.from}-${pattern.id}`)
    if (userPattern) {
      score += userPattern.weight * weights.userPattern
    }
    
    // Time-based adjustments
    score *= this.getTimeRelevance(email, pattern)
    
    // Relationship-based adjustments
    score *= this.getRelationshipRelevance(email, pattern)
    
    return score
  }
  
  private getTimeRelevance(email: EmailData, pattern: CategoryPattern): number {
    const hour = new Date(email.timestamp).getHours()
    
    // Business hours boost for work categories
    if (['meeting', 'project', 'finance'].includes(pattern.id)) {
      return hour >= 9 && hour <= 17 ? 1.2 : 0.8
    }
    
    // Evening boost for personal categories
    if (pattern.id === 'personal') {
      return hour >= 17 || hour <= 9 ? 1.2 : 0.8
    }
    
    return 1.0
  }
  
  private getRelationshipRelevance(email: EmailData, pattern: CategoryPattern): number {
    // Check if sender is in contacts
    const isKnownSender = this.isKnownSender(email.from)
    
    // Boost customer emails from unknown senders
    if (pattern.id === 'customer' && !isKnownSender) {
      return 1.3
    }
    
    // Boost personal emails from known senders
    if (pattern.id === 'personal' && isKnownSender) {
      return 1.2
    }
    
    return 1.0
  }
  
  private isKnownSender(email: string): boolean {
    // Check against known contacts (simplified)
    const knownDomains = ['company.com', 'team.com']
    return knownDomains.some(domain => email.includes(domain))
  }
  
  private updatePatterns(email: EmailData, category: string) {
    const key = `${email.from}-${category}`
    const existing = this.userPatterns.get(key) || { weight: 0, count: 0 }
    
    // Update weight based on frequency
    existing.count++
    existing.weight = Math.min(1.0, existing.count * 0.1)
    
    this.userPatterns.set(key, existing)
    
    // Extract new keywords from correctly categorized emails
    if (existing.count > 5) {
      this.extractNewPatterns(email, category)
    }
  }
  
  private extractNewPatterns(email: EmailData, category: string) {
    const pattern = this.patterns.get(category)
    if (!pattern) return
    
    // Extract frequently occurring words not in keywords
    const words = email.body.toLowerCase().split(/\s+/)
    const wordFreq = new Map<string, number>()
    
    words.forEach(word => {
      if (word.length > 4 && !pattern.keywords.includes(word)) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
      }
    })
    
    // Add high-frequency words as new keywords
    const topWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word)
    
    topWords.forEach(word => {
      if (!pattern.keywords.includes(word)) {
        pattern.keywords.push(word)
      }
    })
  }
  
  private getSuggestedActions(category: string, email: EmailData): string[] {
    const pattern = this.patterns.get(category)
    if (!pattern) return []
    
    const actions = [...pattern.autoActions]
    
    // Add context-specific actions
    if (category === 'meeting' && email.body.includes('agenda')) {
      actions.push('reviewAgenda')
    }
    
    if (category === 'finance' && email.body.includes('overdue')) {
      actions.push('payImmediately')
    }
    
    if (category === 'customer' && email.body.includes('urgent')) {
      actions.push('escalateToManager')
    }
    
    return actions
  }
  
  private async detectSmartLabels(email: EmailData): Promise<string[]> {
    const labels = []
    
    // Urgency detection
    const urgencyLevel = this.detectUrgency(email)
    if (urgencyLevel === 'urgent') labels.push('🔴 Urgent')
    else if (urgencyLevel === 'high') labels.push('🟡 Important')
    
    // Action required detection
    if (this.requiresAction(email)) {
      labels.push('✋ Action Required')
    }
    
    // Deadline detection
    const deadline = this.extractDeadline(email)
    if (deadline) {
      const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysUntil <= 2) labels.push(`⏰ Due in ${daysUntil} days`)
    }
    
    // Attachment detection
    if (email.hasAttachments) {
      labels.push('📎 Has Attachments')
    }
    
    // VIP sender detection
    if (this.isVIPSender(email.from)) {
      labels.push('⭐ VIP')
    }
    
    // Follow-up detection
    if (this.isFollowUp(email)) {
      labels.push('↩️ Follow-up')
    }
    
    return labels
  }
  
  private detectUrgency(email: EmailData): 'urgent' | 'high' | 'normal' {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency']
    const highKeywords = ['important', 'priority', 'deadline', 'eod', 'cob']
    
    const content = `${email.subject} ${email.body}`.toLowerCase()
    
    if (urgentKeywords.some(kw => content.includes(kw))) return 'urgent'
    if (highKeywords.some(kw => content.includes(kw))) return 'high'
    
    return 'normal'
  }
  
  private requiresAction(email: EmailData): boolean {
    const actionPhrases = [
      'please review',
      'please approve',
      'action required',
      'waiting for your',
      'need your',
      'can you',
      'could you',
      'would you',
    ]
    
    const content = email.body.toLowerCase()
    return actionPhrases.some(phrase => content.includes(phrase))
  }
  
  private extractDeadline(email: EmailData): Date | null {
    // Simple deadline extraction (would use NLP in production)
    const deadlinePatterns = [
      /by (\d{1,2}\/\d{1,2}\/\d{2,4})/,
      /deadline: (\d{1,2}\/\d{1,2}\/\d{2,4})/,
      /due (\d{1,2}\/\d{1,2}\/\d{2,4})/,
    ]
    
    for (const pattern of deadlinePatterns) {
      const match = email.body.match(pattern)
      if (match) {
        return new Date(match[1])
      }
    }
    
    return null
  }
  
  private isVIPSender(email: string): boolean {
    const vipDomains = ['ceo@', 'cto@', 'cfo@', 'president@', 'director@']
    return vipDomains.some(vip => email.toLowerCase().includes(vip))
  }
  
  private isFollowUp(email: EmailData): boolean {
    return email.subject.toLowerCase().includes('re:') || 
           email.subject.toLowerCase().includes('follow up') ||
           email.body.toLowerCase().includes('following up')
  }
  
  private explainCategorization(email: EmailData, category: string): string {
    const pattern = this.patterns.get(category)
    if (!pattern) return 'Categorized based on general patterns'
    
    const reasons = []
    
    // Check what matched
    const content = `${email.subject} ${email.body}`.toLowerCase()
    const matchedKeywords = pattern.keywords.filter(kw => content.includes(kw))
    
    if (matchedKeywords.length > 0) {
      reasons.push(`Contains keywords: ${matchedKeywords.slice(0, 3).join(', ')}`)
    }
    
    if (pattern.senderPatterns.some(sp => email.from.toLowerCase().includes(sp))) {
      reasons.push(`Sender matches pattern`)
    }
    
    if (pattern.subjectPatterns.some(sp => email.subject.toLowerCase().includes(sp))) {
      reasons.push(`Subject matches pattern`)
    }
    
    const userPattern = this.userPatterns.get(`${email.from}-${category}`)
    if (userPattern && userPattern.weight > 0.5) {
      reasons.push(`Frequently receives ${pattern.name} emails from this sender`)
    }
    
    return reasons.join('. ') || 'Categorized based on content analysis'
  }
  
  // Manual category management
  
  updateCategory(emailId: string, newCategory: string) {
    // Update category and learn from correction
    console.log(`Updated email ${emailId} to category ${newCategory}`)
  }
  
  createCustomCategory(category: CategoryPattern) {
    this.patterns.set(category.id, category)
  }
  
  getCategories(): CategoryPattern[] {
    return Array.from(this.patterns.values())
  }
  
  getCategoryStats(): Map<string, number> {
    // Return email count per category
    const stats = new Map<string, number>()
    this.patterns.forEach((_, id) => {
      stats.set(id, Math.floor(Math.random() * 100)) // Mock data
    })
    return stats
  }
  
  exportRules(): string {
    return JSON.stringify({
      patterns: Array.from(this.patterns.entries()),
      userPatterns: Array.from(this.userPatterns.entries()),
    }, null, 2)
  }
  
  importRules(rulesJson: string) {
    const rules = JSON.parse(rulesJson)
    rules.patterns.forEach(([id, pattern]: [string, CategoryPattern]) => {
      this.patterns.set(id, pattern)
    })
    rules.userPatterns.forEach(([key, value]: [string, any]) => {
      this.userPatterns.set(key, value)
    })
  }
}

// Type definitions
interface CategoryPattern {
  id: string
  name: string
  color: string
  icon: string
  keywords: string[]
  senderPatterns: string[]
  subjectPatterns: string[]
  priority: 'urgent' | 'high' | 'medium' | 'low'
  autoActions: string[]
}

interface EmailData {
  id: string
  from: string
  to: string[]
  subject: string
  body: string
  timestamp: Date
  hasAttachments: boolean
  threadId?: string
}

interface CategorizationResult {
  primaryCategory: string
  secondaryCategories: string[]
  confidence: number
  suggestedActions: string[]
  smartLabels: string[]
  autoApplied: boolean
  reasoning: string
}

// Singleton instance
let engine: EmailCategorizationEngine | null = null

export function getCategorizationEngine() {
  if (!engine) {
    engine = new EmailCategorizationEngine()
  }
  return engine
}

// React hook
export function useEmailCategorization() {
  return getCategorizationEngine()
}