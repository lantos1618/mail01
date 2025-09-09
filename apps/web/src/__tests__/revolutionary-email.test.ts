import { describe, it, expect, vi } from "vitest"
import { emailIntelligence } from "@/lib/ai/revolutionary-intelligence"
import { threadingEngine } from "@/lib/email/threading"
import { sendGridService } from "@/lib/email/sendgrid-service"

describe("Revolutionary Email Intelligence", () => {
  describe("Email Categorization", () => {
    it("should categorize urgent emails correctly", async () => {
      const email = {
        id: "1",
        from: "boss@company.com",
        to: ["me@company.com"],
        subject: "URGENT: Budget approval needed ASAP",
        body: "Please review and approve the Q4 budget immediately.",
        timestamp: new Date().toISOString(),
      }

      const result = await emailIntelligence.categorizeEmail(email)
      
      expect(result.category).toBe("urgent")
      expect(result.confidence).toBeGreaterThan(0.5)
      expect(result.reasoning).toContain("urgent")
    })

    it("should detect meeting emails", async () => {
      const email = {
        id: "2",
        from: "colleague@company.com",
        to: ["me@company.com"],
        subject: "Meeting tomorrow at 10 AM",
        body: "Let's discuss the project timeline in the conference room.",
        timestamp: new Date().toISOString(),
      }

      const result = await emailIntelligence.categorizeEmail(email)
      
      expect(result.category).toBe("meetings")
      expect(result.subcategories).toContain("actionable")
    })
  })

  describe("Sentiment Analysis", () => {
    it("should analyze email sentiment with emotions", async () => {
      const email = {
        id: "3",
        from: "client@external.com",
        to: ["me@company.com"],
        subject: "Thank you for your excellent work",
        body: "I really appreciate your help with the project. Great job!",
        timestamp: new Date().toISOString(),
      }

      const result = await emailIntelligence.analyzeSentiment(email)
      
      expect(result.overall).toBe("positive")
      expect(result.score).toBeGreaterThan(0)
      expect(result.tone).toBe("friendly")
      expect(result.emotions.joy).toBeGreaterThan(0)
    })

    it("should detect urgency in emails", async () => {
      const email = {
        id: "4",
        from: "manager@company.com",
        to: ["me@company.com"],
        subject: "Critical issue - need immediate response",
        body: "There's an urgent problem that needs to be resolved ASAP.",
        timestamp: new Date().toISOString(),
      }

      const result = await emailIntelligence.analyzeSentiment(email)
      
      expect(result.urgency).toBeGreaterThan(0.5)
      expect(result.tone).toBe("urgent")
    })
  })

  describe("Action Item Extraction", () => {
    it("should extract action items from emails", async () => {
      const email = {
        id: "5",
        from: "pm@company.com",
        to: ["me@company.com"],
        subject: "Project tasks for this week",
        body: "Please complete the following: 1. Review the design docs 2. Could you update the timeline? 3. Schedule a meeting with the team",
        timestamp: new Date().toISOString(),
      }

      const result = await emailIntelligence.extractActionItems(email)
      
      expect(result.items).toHaveLength(1)
      expect(result.items[0].action).toContain("Review and respond")
      expect(result.meetings).toHaveLength(1)
    })
  })

  describe("Response Generation", () => {
    it("should generate contextual email responses", async () => {
      const email = {
        id: "6",
        from: "colleague@company.com",
        to: ["me@company.com"],
        subject: "Meeting request for project discussion",
        body: "Would you be available for a meeting next Tuesday at 2 PM?",
        timestamp: new Date().toISOString(),
      }

      const responses = await emailIntelligence.generateResponses(email, 3)
      
      expect(responses).toHaveLength(3)
      expect(responses.some(r => r.type === "accept")).toBe(true)
      expect(responses.some(r => r.type === "defer")).toBe(true)
      expect(responses.every(r => r.confidence > 0.5)).toBe(true)
    })
  })

  describe("Writing Style Learning", () => {
    it("should learn writing patterns from email examples", async () => {
      const emails = [
        {
          id: "7",
          from: "me@company.com",
          to: ["colleague@company.com"],
          subject: "Project update",
          body: "Hi John,\n\nHere's the weekly update...\n\nBest regards,\nMe",
          timestamp: new Date().toISOString(),
        },
      ]

      const style = await emailIntelligence.learnWritingStyle(emails)
      
      expect(style.patterns.greetings).toContain("Hi")
      expect(style.patterns.closings).toContain("Best regards")
      expect(style.formality).toBeGreaterThan(0.5)
    })
  })
})

describe("Email Threading Engine", () => {
  describe("Thread Grouping", () => {
    it("should group emails into threads by subject", () => {
      const emails = [
        {
          id: "1",
          from: "alice@company.com",
          to: ["bob@company.com"],
          subject: "Project Update",
          body: "Here's the latest update...",
          timestamp: "2024-01-01T10:00:00Z",
        },
        {
          id: "2",
          from: "bob@company.com",
          to: ["alice@company.com"],
          subject: "Re: Project Update",
          body: "Thanks for the update...",
          timestamp: "2024-01-01T11:00:00Z",
          inReplyTo: "1",
        },
      ]

      const threads = threadingEngine.groupIntoThreads(emails)
      
      expect(threads).toHaveLength(1)
      expect(threads[0].emails).toHaveLength(2)
      expect(threads[0].participants).toContain("alice@company.com")
      expect(threads[0].participants).toContain("bob@company.com")
    })

    it("should normalize subject lines for threading", () => {
      const emails = [
        {
          id: "1",
          from: "alice@company.com",
          to: ["bob@company.com"],
          subject: "Meeting Tomorrow",
          body: "Let's meet...",
          timestamp: "2024-01-01T10:00:00Z",
        },
        {
          id: "2",
          from: "bob@company.com",
          to: ["alice@company.com"],
          subject: "Re: Meeting Tomorrow",
          body: "Sounds good...",
          timestamp: "2024-01-01T11:00:00Z",
        },
        {
          id: "3",
          from: "charlie@company.com",
          to: ["alice@company.com", "bob@company.com"],
          subject: "Fwd: Meeting Tomorrow",
          body: "Including Charlie...",
          timestamp: "2024-01-01T12:00:00Z",
        },
      ]

      const threads = threadingEngine.groupIntoThreads(emails)
      
      expect(threads).toHaveLength(1)
      expect(threads[0].emails).toHaveLength(3)
      expect(threads[0].participants).toHaveLength(3)
    })
  })

  describe("Thread Analysis", () => {
    it("should generate thread summary", async () => {
      const thread = {
        id: "thread-1",
        subject: "Budget Discussion",
        participants: ["alice@company.com", "bob@company.com"],
        emails: [
          {
            id: "1",
            from: "alice@company.com",
            to: ["bob@company.com"],
            subject: "Budget Discussion",
            body: "We need to discuss the Q4 budget. I've decided to increase marketing spend.",
            timestamp: "2024-01-01T10:00:00Z",
          },
        ],
        lastActivity: "2024-01-01T10:00:00Z",
        unreadCount: 0,
        tags: [],
      }

      const summary = await threadingEngine.generateThreadSummary(thread)
      
      expect(summary.summary).toContain("2 participants")
      expect(summary.decisions).toHaveLength(1)
      expect(summary.sentiment).toBe("neutral")
    })

    it("should predict next action for thread", () => {
      const thread = {
        id: "thread-1",
        subject: "Question about project",
        participants: ["alice@company.com", "bob@company.com"],
        emails: [
          {
            id: "1",
            from: "alice@company.com",
            to: ["bob@company.com"],
            subject: "Question about project",
            body: "What's the status of the project? When can we expect completion?",
            timestamp: "2024-01-01T10:00:00Z",
          },
        ],
        lastActivity: "2024-01-01T10:00:00Z",
        unreadCount: 1,
        tags: [],
      }

      const prediction = threadingEngine.predictNextAction(thread)
      
      expect(prediction.action).toBe("reply_needed")
      expect(prediction.confidence).toBeGreaterThan(0.5)
      expect(prediction.suggestedResponse).toBeTruthy()
    })
  })
})

describe("SendGrid Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Email Sending", () => {
    it("should validate email parameters", async () => {
      const invalidEmail = {
        to: "", // Invalid
        subject: "Test",
        text: "Test email",
      }

      await expect(async () => {
        await sendGridService.sendEmail(invalidEmail as any)
      }).rejects.toThrow()
    })

    it("should enhance email content when requested", async () => {
      const email = {
        to: "test@example.com",
        from: "sender@example.com",
        subject: "Test",
        text: "This is a test email",
        enhance: true,
        tone: "professional",
      }

      // Mock the API call
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ "x-message-id": "test-123" }),
      })

      const result = await sendGridService.sendEnhancedEmail(email)
      
      expect(result.enhancements).toBeTruthy()
      expect(result.enhancements).toContain("Enhanced email body")
    })

    it("should schedule emails for later sending", async () => {
      const email = {
        to: "test@example.com",
        subject: "Scheduled email",
        text: "This will be sent later",
        sendAt: new Date(Date.now() + 3600000), // 1 hour from now
      }

      const result = await sendGridService.scheduleEmail(email)
      
      expect(result.scheduled).toBe(true)
      expect(result.scheduledId).toBeTruthy()
    })
  })
})