import { describe, it, expect, beforeEach, vi } from 'vitest'
import { analyzeEmail, generateSmartReply, summarizeEmailThread, extractTasksFromEmails } from '../../api/src/services/emailAI'

// Mock the AI SDK
vi.mock('ai', () => ({
  generateText: vi.fn()
}))

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => 'mocked-model')
}))

describe('Email AI Services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('analyzeEmail', () => {
    it('should analyze email sentiment and priority', async () => {
      const mockEmail = "Urgent: We need to fix the production issue immediately!"
      
      const { generateText } = await import('ai')
      vi.mocked(generateText).mockResolvedValueOnce({
        text: JSON.stringify({
          sentiment: 'urgent',
          priority: 'high',
          category: 'Support',
          suggestedActions: ['Investigate issue', 'Deploy fix'],
          keyPoints: ['Production issue', 'Immediate action needed']
        })
      } as any)

      const result = await analyzeEmail(mockEmail)
      
      expect(result).toEqual({
        sentiment: 'urgent',
        priority: 'high',
        category: 'Support',
        suggestedActions: ['Investigate issue', 'Deploy fix'],
        keyPoints: ['Production issue', 'Immediate action needed']
      })
    })

    it('should handle analysis errors gracefully', async () => {
      const { generateText } = await import('ai')
      vi.mocked(generateText).mockRejectedValueOnce(new Error('AI service error'))

      const result = await analyzeEmail('Test email')
      
      expect(result).toEqual({
        sentiment: 'neutral',
        priority: 'medium',
        category: 'General',
        suggestedActions: [],
        keyPoints: []
      })
    })
  })

  describe('generateSmartReply', () => {
    it('should generate appropriate email reply', async () => {
      const originalEmail = "Can we schedule a meeting next week?"
      
      const { generateText } = await import('ai')
      vi.mocked(generateText).mockResolvedValueOnce({
        text: JSON.stringify({
          subject: 'Re: Meeting Request',
          body: 'I would be happy to meet next week. Please let me know your availability.',
          tone: 'professional',
          suggestions: ['Add specific time slots', 'Include video call link']
        })
      } as any)

      const result = await generateSmartReply(originalEmail, undefined, 'professional')
      
      expect(result.subject).toBe('Re: Meeting Request')
      expect(result.body).toContain('happy to meet next week')
      expect(result.tone).toBe('professional')
    })
  })

  describe('summarizeEmailThread', () => {
    it('should summarize email thread effectively', async () => {
      const mockThread = [
        { from: 'alice@example.com', date: '2024-01-01', content: 'Project proposal' },
        { from: 'bob@example.com', date: '2024-01-02', content: 'Looks good, approved' }
      ]
      
      const { generateText } = await import('ai')
      vi.mocked(generateText).mockResolvedValueOnce({
        text: JSON.stringify({
          summary: 'Project proposal discussion with approval',
          participants: ['alice@example.com', 'bob@example.com'],
          keyDecisions: ['Project approved'],
          actionItems: ['Begin implementation'],
          timeline: '2 days'
        })
      } as any)

      const result = await summarizeEmailThread(mockThread)
      
      expect(result.summary).toContain('Project proposal')
      expect(result.participants).toHaveLength(2)
      expect(result.keyDecisions).toContain('Project approved')
    })
  })

  describe('extractTasksFromEmails', () => {
    it('should extract tasks and meetings from emails', async () => {
      const mockEmails = [
        { from: 'manager@example.com', date: '2024-01-01', content: 'Please review the budget by Friday' },
        { from: 'team@example.com', date: '2024-01-02', content: 'Team meeting tomorrow at 2pm' }
      ]
      
      const { generateText } = await import('ai')
      vi.mocked(generateText).mockResolvedValueOnce({
        text: JSON.stringify({
          tasks: [
            {
              task: 'Review budget',
              from: 'manager@example.com',
              dueDate: 'Friday',
              priority: 'high'
            }
          ],
          meetings: [
            {
              title: 'Team meeting',
              date: 'Tomorrow',
              time: '2:00 PM',
              attendees: ['team@example.com']
            }
          ]
        })
      } as any)

      const result = await extractTasksFromEmails(mockEmails)
      
      expect(result.tasks).toHaveLength(1)
      expect(result.tasks[0].task).toBe('Review budget')
      expect(result.meetings).toHaveLength(1)
      expect(result.meetings[0].title).toBe('Team meeting')
    })
  })
})