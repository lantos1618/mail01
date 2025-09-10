import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { analyzeEmailAdvanced } from "./emailAIEnhanced"

export interface EmailRule {
  id: string
  name: string
  enabled: boolean
  conditions: {
    from?: string[]
    to?: string[]
    subject?: string[]
    content?: string[]
    sentiment?: string[]
    priority?: number[]
    category?: string[]
  }
  actions: {
    type: 'reply' | 'forward' | 'archive' | 'label' | 'flag' | 'draft'
    template?: string
    to?: string
    label?: string
    flag?: string
  }[]
  requiresApproval: boolean
}

export interface AgentConfig {
  autoReply: boolean
  smartCategorization: boolean
  taskExtraction: boolean
  priorityFiltering: boolean
  learningMode: boolean
  rules: EmailRule[]
}

export class EmailAgentEnhanced {
  private config: AgentConfig
  private learningData: Map<string, any>
  private processedEmails: Set<string>
  private pendingApprovals: Map<string, any>

  constructor(config: Partial<AgentConfig> = {}) {
    this.config = {
      autoReply: false,
      smartCategorization: true,
      taskExtraction: true,
      priorityFiltering: true,
      learningMode: true,
      rules: [],
      ...config
    }
    this.learningData = new Map()
    this.processedEmails = new Set()
    this.pendingApprovals = new Map()
  }

  // Process incoming email with agent rules
  async processEmail(email: any) {
    // Prevent duplicate processing
    if (this.processedEmails.has(email.messageId)) {
      return { processed: false, reason: 'Already processed' }
    }

    // Analyze email first
    const analysis = await analyzeEmailAdvanced(email.content)
    
    // Store for learning if enabled
    if (this.config.learningMode) {
      this.learnFromEmail(email, analysis)
    }

    // Apply rules
    const appliedRules = await this.applyRules(email, analysis)

    // Smart categorization
    if (this.config.smartCategorization) {
      email.category = analysis.category
      email.labels = this.generateLabels(analysis)
    }

    // Extract tasks
    if (this.config.taskExtraction && analysis.actionItems.length > 0) {
      email.tasks = analysis.actionItems
    }

    // Priority filtering
    if (this.config.priorityFiltering) {
      email.priority = analysis.priority
      email.urgency = analysis.urgency
    }

    // Mark as processed
    this.processedEmails.add(email.messageId)

    return {
      processed: true,
      email,
      analysis,
      appliedRules,
      pendingApprovals: Array.from(this.pendingApprovals.values())
    }
  }

  // Apply agent rules to email
  private async applyRules(email: any, analysis: any) {
    const appliedRules = []

    for (const rule of this.config.rules) {
      if (!rule.enabled) continue

      if (this.matchesConditions(email, analysis, rule.conditions)) {
        for (const action of rule.actions) {
          const result = await this.executeAction(email, action, rule)
          appliedRules.push({
            rule: rule.name,
            action: action.type,
            result,
            requiresApproval: rule.requiresApproval
          })
        }
      }
    }

    return appliedRules
  }

  // Check if email matches rule conditions
  private matchesConditions(email: any, analysis: any, conditions: any): boolean {
    if (conditions.from && !conditions.from.some((f: string) => email.from.includes(f))) {
      return false
    }
    
    if (conditions.subject && !conditions.subject.some((s: string) => 
      email.subject.toLowerCase().includes(s.toLowerCase())
    )) {
      return false
    }

    if (conditions.sentiment && !conditions.sentiment.includes(analysis.sentiment)) {
      return false
    }

    if (conditions.priority && !conditions.priority.includes(analysis.priority)) {
      return false
    }

    if (conditions.category && !conditions.category.includes(analysis.category)) {
      return false
    }

    return true
  }

  // Execute action based on rule
  private async executeAction(email: any, action: any, rule: EmailRule) {
    switch (action.type) {
      case 'reply':
        return await this.draftAutoReply(email, action.template, rule.requiresApproval)
      
      case 'forward':
        return await this.forwardEmail(email, action.to, rule.requiresApproval)
      
      case 'archive':
        return { archived: true, folder: 'archived' }
      
      case 'label':
        return { labeled: true, label: action.label }
      
      case 'flag':
        return { flagged: true, flag: action.flag }
      
      case 'draft':
        return await this.createDraft(email, action.template, rule.requiresApproval)
      
      default:
        return { error: 'Unknown action type' }
    }
  }

  // Draft automatic reply
  private async draftAutoReply(email: any, template?: string, requiresApproval = true) {
    const { text: reply } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Draft a professional reply to this email:
      
      From: ${email.from}
      Subject: ${email.subject}
      Content: ${email.content}
      
      ${template ? `Use this template as guidance: ${template}` : ''}
      
      Make it professional, helpful, and concise.`,
      temperature: 0.7,
    })

    const draft = {
      id: `draft-${Date.now()}`,
      to: email.from,
      subject: `Re: ${email.subject}`,
      body: reply,
      inReplyTo: email.messageId,
      status: requiresApproval ? 'pending_approval' : 'ready_to_send'
    }

    if (requiresApproval) {
      this.pendingApprovals.set(draft.id, draft)
    }

    return draft
  }

  // Forward email
  private async forwardEmail(email: any, to: string, requiresApproval = true) {
    const forward = {
      id: `forward-${Date.now()}`,
      to,
      subject: `Fwd: ${email.subject}`,
      body: `
---------- Forwarded message ---------
From: ${email.from}
Date: ${email.date}
Subject: ${email.subject}

${email.content}
      `,
      status: requiresApproval ? 'pending_approval' : 'ready_to_send'
    }

    if (requiresApproval) {
      this.pendingApprovals.set(forward.id, forward)
    }

    return forward
  }

  // Create draft based on template
  private async createDraft(email: any, template: string, requiresApproval = true) {
    const { text: draftContent } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Create an email draft based on this template and context:
      
      Template: ${template}
      
      Context from received email:
      From: ${email.from}
      Subject: ${email.subject}
      Content: ${email.content}
      
      Personalize the template based on the context.`,
      temperature: 0.7,
    })

    const draft = {
      id: `draft-${Date.now()}`,
      to: email.from,
      subject: `Re: ${email.subject}`,
      body: draftContent,
      status: requiresApproval ? 'pending_approval' : 'ready_to_send'
    }

    if (requiresApproval) {
      this.pendingApprovals.set(draft.id, draft)
    }

    return draft
  }

  // Generate smart labels based on analysis
  private generateLabels(analysis: any): string[] {
    const labels = []
    
    if (analysis.urgency === 'high') labels.push('urgent')
    if (analysis.priority >= 8) labels.push('important')
    if (analysis.actionItems.length > 0) labels.push('action-required')
    if (analysis.category) labels.push(analysis.category)
    if (analysis.sentiment === 'negative') labels.push('needs-attention')
    
    return labels
  }

  // Learn from processed emails
  private learnFromEmail(email: any, analysis: any) {
    const sender = email.from
    
    if (!this.learningData.has(sender)) {
      this.learningData.set(sender, {
        emails: [],
        patterns: {},
        averageResponseTime: null,
        preferredTone: null,
        commonTopics: []
      })
    }

    const senderData = this.learningData.get(sender)
    senderData.emails.push({
      date: email.date,
      sentiment: analysis.sentiment,
      category: analysis.category,
      priority: analysis.priority
    })

    // Update patterns
    this.updatePatterns(senderData, analysis)
  }

  // Update learned patterns
  private updatePatterns(senderData: any, analysis: any) {
    // Update sentiment pattern
    if (!senderData.patterns.sentiment) {
      senderData.patterns.sentiment = {}
    }
    senderData.patterns.sentiment[analysis.sentiment] = 
      (senderData.patterns.sentiment[analysis.sentiment] || 0) + 1

    // Update category pattern
    if (!senderData.patterns.category) {
      senderData.patterns.category = {}
    }
    senderData.patterns.category[analysis.category] = 
      (senderData.patterns.category[analysis.category] || 0) + 1
  }

  // Get agent insights
  async getInsights() {
    const insights: any = {
      totalProcessed: this.processedEmails.size,
      pendingApprovals: this.pendingApprovals.size,
      learnedPatterns: {},
      recommendations: []
    }

    // Compile learned patterns
    for (const [sender, data] of this.learningData.entries()) {
      insights.learnedPatterns[sender] = {
        emailCount: data.emails.length,
        dominantSentiment: this.getDominant(data.patterns.sentiment),
        dominantCategory: this.getDominant(data.patterns.category),
        averagePriority: this.getAveragePriority(data.emails)
      }
    }

    // Generate recommendations
    insights.recommendations = await this.generateRecommendations(insights.learnedPatterns)

    return insights
  }

  // Get dominant value from pattern
  private getDominant(pattern: any): string {
    if (!pattern) return 'unknown'
    return Object.entries(pattern)
      .sort(([,a]: any, [,b]: any) => b - a)[0]?.[0] || 'unknown'
  }

  // Calculate average priority
  private getAveragePriority(emails: any[]): number {
    if (emails.length === 0) return 0
    const sum = emails.reduce((acc, e) => acc + (e.priority || 0), 0)
    return Math.round(sum / emails.length)
  }

  // Generate AI recommendations
  private async generateRecommendations(patterns: any) {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `Based on these email patterns, suggest automation rules:
      
      ${JSON.stringify(patterns, null, 2)}
      
      Suggest 3-5 specific automation rules in JSON format:
      [
        {
          "rule": "rule description",
          "condition": "when to apply",
          "action": "what to do",
          "benefit": "expected benefit"
        }
      ]`,
      temperature: 0.6,
    })

    return JSON.parse(text)
  }

  // Approve pending action
  async approvePending(id: string) {
    const pending = this.pendingApprovals.get(id)
    if (!pending) return { error: 'Pending action not found' }

    pending.status = 'approved'
    this.pendingApprovals.delete(id)
    
    return { approved: true, action: pending }
  }

  // Reject pending action
  async rejectPending(id: string) {
    const pending = this.pendingApprovals.get(id)
    if (!pending) return { error: 'Pending action not found' }

    this.pendingApprovals.delete(id)
    
    return { rejected: true, action: pending }
  }

  // Add new rule
  addRule(rule: EmailRule) {
    this.config.rules.push(rule)
    return { added: true, totalRules: this.config.rules.length }
  }

  // Update rule
  updateRule(ruleId: string, updates: Partial<EmailRule>) {
    const ruleIndex = this.config.rules.findIndex(r => r.id === ruleId)
    if (ruleIndex === -1) return { error: 'Rule not found' }

    this.config.rules[ruleIndex] = {
      ...this.config.rules[ruleIndex],
      ...updates
    }

    return { updated: true, rule: this.config.rules[ruleIndex] }
  }

  // Delete rule
  deleteRule(ruleId: string) {
    const initialLength = this.config.rules.length
    this.config.rules = this.config.rules.filter(r => r.id !== ruleId)
    
    return { 
      deleted: initialLength !== this.config.rules.length,
      totalRules: this.config.rules.length 
    }
  }

  // Get configuration
  getConfig() {
    return this.config
  }

  // Update configuration
  updateConfig(updates: Partial<AgentConfig>) {
    this.config = { ...this.config, ...updates }
    return this.config
  }
}

// Export singleton instance
export const emailAgent = new EmailAgentEnhanced()