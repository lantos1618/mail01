import { describe, it, expect, beforeEach, vi } from 'vitest'
import { quantumIntelligence, mindReader } from '@/lib/ai/quantum-intelligence'

describe('QuantumEmailIntelligence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('predictNextEmail', () => {
    it('should predict email with high confidence', async () => {
      const context = {
        sender: 'test@example.com',
        recipient: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test email body',
        timestamp: new Date(),
        sentiment: 0.7,
        urgency: 0.5,
        importance: 0.8,
        relationships: new Map([['colleague', 0.9]]),
        topics: ['project', 'deadline'],
        actionItems: ['Review document'],
        deadlines: [new Date()]
      }

      const prediction = await quantumIntelligence.predictNextEmail(context)

      expect(prediction).toHaveProperty('subject')
      expect(prediction).toHaveProperty('body')
      expect(prediction).toHaveProperty('recipients')
      expect(prediction).toHaveProperty('sendTime')
      expect(prediction).toHaveProperty('confidence')
      expect(prediction.confidence).toBeGreaterThan(0.5)
      expect(prediction.recipients).toBeInstanceOf(Array)
      expect(prediction.sendTime).toBeInstanceOf(Date)
    })

    it('should generate context-aware content', async () => {
      const context = {
        sender: 'urgent@example.com',
        recipient: 'boss@example.com',
        subject: 'Urgent: Project Update',
        body: 'Need immediate attention',
        timestamp: new Date(),
        sentiment: 0.3,
        urgency: 0.9,
        importance: 0.95,
        relationships: new Map([['manager', 0.8]]),
        topics: ['urgent', 'deadline', 'critical'],
        actionItems: ['Immediate action required'],
        deadlines: [new Date()]
      }

      const prediction = await quantumIntelligence.predictNextEmail(context)

      expect(prediction.body).toBeTruthy()
      expect(prediction.body.length).toBeGreaterThan(50)
      expect(prediction.confidence).toBeGreaterThan(0.8)
    })
  })

  describe('generateHyperIntelligentContent', () => {
    it('should adapt to writing style', async () => {
      const context = {
        sender: 'formal@example.com',
        recipient: 'client@example.com',
        subject: 'Business Proposal',
        body: 'Formal business communication',
        timestamp: new Date(),
        sentiment: 0.6,
        urgency: 0.4,
        importance: 0.7,
        relationships: new Map([['client', 0.6]]),
        topics: ['business', 'proposal'],
        actionItems: [],
        deadlines: []
      }

      const prediction = { subject: 'Re: Business Proposal', recipients: ['client@example.com'], confidence: 0.9 }
      const content = await quantumIntelligence.generateHyperIntelligentContent(context, prediction)

      expect(content).toBeTruthy()
      expect(content).toContain('Dear')
      expect(content.length).toBeGreaterThan(20)
    })
  })
})

describe('EmailMindReader', () => {
  describe('readIntentions', () => {
    it('should detect primary intent', async () => {
      const email = 'Can we schedule a meeting to discuss the project deadline?'
      const intentions = await mindReader.readIntentions(email)

      expect(intentions).toHaveProperty('primaryIntent')
      expect(intentions).toHaveProperty('hiddenIntents')
      expect(intentions).toHaveProperty('emotionalState')
      expect(intentions).toHaveProperty('urgencyLevel')
      expect(intentions).toHaveProperty('responseExpectation')
      expect(intentions.primaryIntent).toBe('scheduling')
    })

    it('should detect urgency level', async () => {
      const urgentEmail = 'URGENT: Need this done ASAP! The deadline is tomorrow!'
      const intentions = await mindReader.readIntentions(urgentEmail)

      expect(intentions.urgencyLevel).toBeGreaterThan(0.7)
      expect(intentions.primaryIntent).toBe('urgent-action')
    })

    it('should identify hidden intents', async () => {
      const email = 'Just wanted to share that we completed the project successfully!'
      const intentions = await mindReader.readIntentions(email)

      expect(intentions.hiddenIntents).toBeInstanceOf(Array)
      expect(intentions.emotionalState).toBeTruthy()
    })

    it('should predict response expectation', async () => {
      const questionEmail = 'What do you think about this proposal? Can you review it?'
      const intentions = await mindReader.readIntentions(questionEmail)

      expect(intentions.responseExpectation).toBe('answer-expected')
    })

    it('should handle complex emotional context', async () => {
      const complexEmail = 'I am concerned about the project timeline. Could we discuss alternatives?'
      const intentions = await mindReader.readIntentions(complexEmail)

      expect(intentions).toHaveProperty('emotionalState')
      expect(intentions).toHaveProperty('hiddenIntents')
      expect(intentions.urgencyLevel).toBeGreaterThan(0)
      expect(intentions.urgencyLevel).toBeLessThan(1)
    })
  })
})

describe('Quantum Pattern Recognition', () => {
  it('should identify email patterns', async () => {
    const context = {
      sender: 'pattern@example.com',
      recipient: 'test@example.com',
      subject: 'Weekly Status Update',
      body: 'This is our weekly status update',
      timestamp: new Date(),
      sentiment: 0.6,
      urgency: 0.3,
      importance: 0.5,
      relationships: new Map([['team', 0.7]]),
      topics: ['status', 'update', 'weekly'],
      actionItems: [],
      deadlines: []
    }

    const prediction = await quantumIntelligence.predictNextEmail(context)
    
    expect(prediction).toBeTruthy()
    expect(prediction.confidence).toBeGreaterThan(0)
  })
})

describe('Integration Tests', () => {
  it('should process email end-to-end', async () => {
    const testEmail = 'Please review the attached document and provide feedback by Friday.'
    
    // Mind reader analysis
    const intentions = await mindReader.readIntentions(testEmail)
    expect(intentions.primaryIntent).toBe('review-request')
    expect(intentions.urgencyLevel).toBeGreaterThan(0.5)
    
    // Quantum prediction
    const context = {
      sender: 'manager@example.com',
      recipient: 'employee@example.com',
      subject: 'Document Review Request',
      body: testEmail,
      timestamp: new Date(),
      sentiment: 0.5,
      urgency: intentions.urgencyLevel,
      importance: 0.7,
      relationships: new Map([['manager', 0.8]]),
      topics: ['review', 'document', 'feedback'],
      actionItems: ['Review document', 'Provide feedback'],
      deadlines: [new Date(Date.now() + 86400000 * 5)] // Friday
    }
    
    const prediction = await quantumIntelligence.predictNextEmail(context)
    
    expect(prediction).toBeTruthy()
    expect(prediction.body).toBeTruthy()
    expect(prediction.confidence).toBeGreaterThan(0.7)
    expect(prediction.sendTime).toBeInstanceOf(Date)
  })
})