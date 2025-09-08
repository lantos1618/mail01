import { describe, it, expect, beforeEach, vi } from 'vitest'
import { EmailAgentEnhanced } from '../lib/services/emailAgentEnhanced'

// Mock the AI services
vi.mock('../lib/services/emailAIEnhanced', () => ({
  analyzeEmailAdvanced: vi.fn().mockResolvedValue({
    sentiment: 'positive',
    urgency: 'high',
    category: 'work',
    priority: 8,
    actionItems: ['Review document', 'Schedule meeting']
  })
}))

vi.mock('ai', () => ({
  generateText: vi.fn().mockResolvedValue({
    text: JSON.stringify([
      {
        rule: 'Auto-categorize work emails',
        condition: 'When email is from work domain',
        action: 'Label as work and prioritize',
        benefit: 'Better organization'
      }
    ])
  })
}))

describe('EmailAgentEnhanced', () => {
  let agent: EmailAgentEnhanced

  beforeEach(() => {
    agent = new EmailAgentEnhanced({
      autoReply: false,
      smartCategorization: true,
      taskExtraction: true,
      priorityFiltering: true,
      learningMode: true,
      rules: []
    })
  })

  describe('processEmail', () => {
    it('should process email and apply categorization', async () => {
      const testEmail = {
        messageId: 'test-123',
        from: 'sender@example.com',
        to: 'me@example.com',
        subject: 'Test Email',
        content: 'This is a test email content',
        date: new Date().toISOString()
      }

      const result = await agent.processEmail(testEmail)

      expect(result.processed).toBe(true)
      expect(result.email.category).toBe('work')
      expect(result.email.priority).toBe(8)
      expect(result.email.tasks).toEqual(['Review document', 'Schedule meeting'])
      expect(result.analysis.sentiment).toBe('positive')
    })

    it('should prevent duplicate processing', async () => {
      const testEmail = {
        messageId: 'duplicate-123',
        from: 'sender@example.com',
        to: 'me@example.com',
        subject: 'Test',
        content: 'Content',
        date: new Date().toISOString()
      }

      const firstResult = await agent.processEmail(testEmail)
      expect(firstResult.processed).toBe(true)

      const secondResult = await agent.processEmail(testEmail)
      expect(secondResult.processed).toBe(false)
      expect(secondResult.reason).toBe('Already processed')
    })
  })

  describe('rule management', () => {
    it('should add new rule', () => {
      const newRule = {
        id: 'rule-1',
        name: 'Test Rule',
        enabled: true,
        conditions: {
          from: ['test@example.com']
        },
        actions: [{
          type: 'label' as const,
          label: 'important'
        }],
        requiresApproval: false
      }

      const result = agent.addRule(newRule)
      expect(result.added).toBe(true)
      expect(result.totalRules).toBe(1)

      const config = agent.getConfig()
      expect(config.rules).toHaveLength(1)
      expect(config.rules[0].name).toBe('Test Rule')
    })

    it('should update existing rule', () => {
      const rule = {
        id: 'rule-1',
        name: 'Original Rule',
        enabled: true,
        conditions: {},
        actions: [],
        requiresApproval: false
      }

      agent.addRule(rule)
      
      const updateResult = agent.updateRule('rule-1', {
        name: 'Updated Rule',
        enabled: false
      })

      expect(updateResult.updated).toBe(true)
      expect(updateResult.rule?.name).toBe('Updated Rule')
      expect(updateResult.rule?.enabled).toBe(false)
    })

    it('should delete rule', () => {
      const rule = {
        id: 'rule-to-delete',
        name: 'Delete Me',
        enabled: true,
        conditions: {},
        actions: [],
        requiresApproval: false
      }

      agent.addRule(rule)
      expect(agent.getConfig().rules).toHaveLength(1)

      const deleteResult = agent.deleteRule('rule-to-delete')
      expect(deleteResult.deleted).toBe(true)
      expect(deleteResult.totalRules).toBe(0)
    })
  })

  describe('pending approvals', () => {
    it('should handle pending approval workflow', async () => {
      // Add a rule that requires approval
      const ruleWithApproval = {
        id: 'approval-rule',
        name: 'Auto Reply Rule',
        enabled: true,
        conditions: {
          from: ['vip@example.com']
        },
        actions: [{
          type: 'reply' as const,
          template: 'Thank you for your email'
        }],
        requiresApproval: true
      }

      agent.addRule(ruleWithApproval)

      const testEmail = {
        messageId: 'vip-email',
        from: 'vip@example.com',
        to: 'me@example.com',
        subject: 'Important',
        content: 'VIP message',
        date: new Date().toISOString()
      }

      const result = await agent.processEmail(testEmail)
      
      expect(result.processed).toBe(true)
      expect(result.pendingApprovals).toHaveLength(1)
      expect(result.appliedRules[0].requiresApproval).toBe(true)
    })
  })

  describe('insights generation', () => {
    it('should generate insights from processed emails', async () => {
      // Process a few emails to build learning data
      const emails = [
        {
          messageId: 'insight-1',
          from: 'alice@example.com',
          to: 'me@example.com',
          subject: 'Project Update',
          content: 'Update on project',
          date: new Date().toISOString()
        },
        {
          messageId: 'insight-2',
          from: 'alice@example.com',
          to: 'me@example.com',
          subject: 'Meeting Request',
          content: 'Can we meet?',
          date: new Date().toISOString()
        }
      ]

      for (const email of emails) {
        await agent.processEmail(email)
      }

      const insights = await agent.getInsights()

      expect(insights.totalProcessed).toBe(2)
      expect(insights.learnedPatterns).toBeDefined()
      expect(insights.recommendations).toBeDefined()
      expect(insights.recommendations).toHaveLength(1)
    })
  })

  describe('configuration management', () => {
    it('should update configuration', () => {
      const initialConfig = agent.getConfig()
      expect(initialConfig.autoReply).toBe(false)

      const updatedConfig = agent.updateConfig({
        autoReply: true,
        smartCategorization: false
      })

      expect(updatedConfig.autoReply).toBe(true)
      expect(updatedConfig.smartCategorization).toBe(false)
      expect(updatedConfig.taskExtraction).toBe(true) // Unchanged
    })
  })
})