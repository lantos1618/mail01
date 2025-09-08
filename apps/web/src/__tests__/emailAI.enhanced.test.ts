import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  analyzeEmailAdvanced,
  analyzeEmailThread,
  generateContextualTemplate,
  improveEmailWithFocus,
  analyzeRelationships
} from '../lib/services/emailAIEnhanced'

// Mock the AI SDK
vi.mock('ai', () => ({
  generateText: vi.fn(),
  streamText: vi.fn()
}))

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => 'mocked-model')
}))

describe('EmailAI Enhanced Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('analyzeEmailAdvanced', () => {
    it('should analyze email with multiple dimensions', async () => {
      const mockAnalysis = {
        sentiment: 'positive',
        urgency: 'high',
        intent: 'request',
        category: 'work',
        keyPoints: ['meeting request', 'project update'],
        actionItems: ['schedule meeting', 'review documents'],
        suggestedResponse: 'Accept meeting and confirm availability',
        priority: 8,
        estimatedResponseTime: '15',
        relationshipContext: 'existing',
        emotionalTone: 'professional and friendly',
        professionalismScore: 9
      }

      const { generateText } = await import('ai')
      vi.mocked(generateText).mockResolvedValue({
        text: JSON.stringify(mockAnalysis)
      } as any)

      const result = await analyzeEmailAdvanced('Test email content')
      
      expect(result).toEqual(mockAnalysis)
      expect(result.sentiment).toBe('positive')
      expect(result.urgency).toBe('high')
      expect(result.priority).toBe(8)
    })
  })

  describe('analyzeEmailThread', () => {
    it('should provide comprehensive thread analysis', async () => {
      const mockEmails = [
        { from: 'alice@example.com', date: '2024-01-01', content: 'Initial email' },
        { from: 'bob@example.com', date: '2024-01-02', content: 'Reply' }
      ]

      const mockThreadAnalysis = {
        summary: 'Discussion about project timeline',
        participants: ['alice@example.com', 'bob@example.com'],
        mainTopic: 'project timeline',
        decisions: ['Move deadline to Q2'],
        openQuestions: ['Budget approval needed'],
        nextSteps: ['Schedule follow-up meeting'],
        sentiment: 'collaborative',
        threadLength: 2,
        responsePattern: 'quick back-and-forth',
        urgency: 'medium',
        completionStatus: 'ongoing'
      }

      const { generateText } = await import('ai')
      vi.mocked(generateText).mockResolvedValue({
        text: JSON.stringify(mockThreadAnalysis)
      } as any)

      const result = await analyzeEmailThread(mockEmails)
      
      expect(result.participants).toHaveLength(2)
      expect(result.mainTopic).toBe('project timeline')
      expect(result.completionStatus).toBe('ongoing')
    })
  })

  describe('generateContextualTemplate', () => {
    it('should generate email templates for scenario', async () => {
      const mockTemplates = {
        templates: [
          {
            name: 'Formal Follow-up',
            subject: 'Following up on our discussion',
            body: 'Dear [Name], I wanted to follow up...',
            tone: 'formal',
            useCase: 'Professional follow-up after meeting'
          },
          {
            name: 'Quick Check-in',
            subject: 'Quick check-in',
            body: 'Hi [Name], Just checking in...',
            tone: 'casual',
            useCase: 'Informal follow-up with colleague'
          }
        ]
      }

      const { generateText } = await import('ai')
      vi.mocked(generateText).mockResolvedValue({
        text: JSON.stringify(mockTemplates)
      } as any)

      const result = await generateContextualTemplate('follow-up', 'after team meeting')
      
      expect(result.templates).toHaveLength(2)
      expect(result.templates[0].name).toBe('Formal Follow-up')
      expect(result.templates[0].tone).toBe('formal')
    })
  })

  describe('improveEmailWithFocus', () => {
    it('should improve email draft with specific focus areas', async () => {
      const mockImprovement = {
        improvedDraft: 'Improved email text with better clarity',
        changes: [
          {
            area: 'clarity',
            original: 'We need to do the thing',
            improved: 'We need to complete the project deliverables',
            reason: 'More specific and clear'
          }
        ],
        overallScore: {
          before: 6,
          after: 9
        },
        tips: ['Use active voice', 'Be specific about deadlines']
      }

      const { generateText } = await import('ai')
      vi.mocked(generateText).mockResolvedValue({
        text: JSON.stringify(mockImprovement)
      } as any)

      const result = await improveEmailWithFocus(
        'Original draft text',
        ['clarity', 'brevity']
      )
      
      expect(result.overallScore.after).toBeGreaterThan(result.overallScore.before)
      expect(result.changes).toHaveLength(1)
      expect(result.tips).toContain('Use active voice')
    })
  })

  describe('analyzeRelationships', () => {
    it('should analyze email relationships and patterns', async () => {
      const mockEmails = [
        { from: 'alice@example.com', to: 'me@example.com', timestamp: '2024-01-01', subject: 'Test' },
        { from: 'me@example.com', to: 'alice@example.com', timestamp: '2024-01-02', subject: 'Re: Test' }
      ]

      const mockRelationshipAnalysis = {
        topContacts: [
          {
            email: 'alice@example.com',
            name: 'Alice',
            frequency: 'daily',
            relationship: 'colleague',
            lastContact: '2024-01-02',
            responseTime: '24',
            sentiment: 'positive'
          }
        ],
        communicationPatterns: {
          peakHours: ['9am', '2pm'],
          peakDays: ['Monday', 'Tuesday'],
          averageResponseTime: '24 hours',
          initiatedVsReceived: '1:1'
        },
        insights: [
          'Quick response time with key contacts',
          'Most active during business hours'
        ],
        recommendations: [
          'Schedule emails for morning delivery',
          'Set up auto-responder for off-hours'
        ]
      }

      const { generateText } = await import('ai')
      vi.mocked(generateText).mockResolvedValue({
        text: JSON.stringify(mockRelationshipAnalysis)
      } as any)

      const result = await analyzeRelationships(mockEmails)
      
      expect(result.topContacts).toHaveLength(1)
      expect(result.topContacts[0].email).toBe('alice@example.com')
      expect(result.communicationPatterns.peakHours).toContain('9am')
      expect(result.recommendations).toHaveLength(2)
    })
  })
})