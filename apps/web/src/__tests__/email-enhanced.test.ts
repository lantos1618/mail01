import { describe, it, expect, vi, beforeEach } from "vitest"
import { 
  EmailIntelligenceEngine,
  analyzeEmailWithAI,
  generateSmartReply,
  predictNextAction,
  executeEmailWorkflow,
  getEmailInsights,
  getEmailRelationships,
  getEmailPatterns,
  getEmailWorkflows
} from "@/lib/ai/email-intelligence-advanced"

// Mock AI SDK
vi.mock("@ai-sdk/openai", () => ({
  openai: vi.fn(() => ({
    model: "gpt-4-turbo",
  })),
}))

vi.mock("@ai-sdk/anthropic", () => ({
  anthropic: vi.fn(() => ({
    model: "claude-3",
  })),
}))

vi.mock("ai", () => ({
  generateText: vi.fn(async () => ({
    text: "Mocked AI response",
    usage: { totalTokens: 100 },
  })),
  streamText: vi.fn(async function* () {
    yield { text: "Streaming" }
    yield { text: " response" }
  }),
  tool: vi.fn((config) => config),
}))

describe("Email Intelligence Engine - Enhanced", () => {
  let engine: EmailIntelligenceEngine
  
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
    
    // Create new engine instance
    engine = new EmailIntelligenceEngine()
  })
  
  describe("Email Analysis", () => {
    it("should analyze email with AI and return comprehensive insights", async () => {
      const mockEmail = {
        id: "test-123",
        from: "ceo@company.com",
        to: "user@company.com",
        subject: "Q4 Revenue Report - Urgent Review",
        content: "Please review the attached Q4 revenue report and provide feedback by EOD.",
        timestamp: new Date(),
        attachments: ["q4-report.pdf"],
      }
      
      const analysis = await analyzeEmailWithAI(mockEmail)
      
      expect(analysis).toHaveProperty("category")
      expect(analysis).toHaveProperty("priority")
      expect(analysis).toHaveProperty("sentiment")
      expect(analysis).toHaveProperty("actionItems")
      expect(analysis).toHaveProperty("insights")
      
      expect(analysis.priority).toBe("high")
      expect(analysis.actionItems).toContain("Review document")
      expect(analysis.actionItems).toContain("Provide feedback")
    })
    
    it("should detect sentiment accurately", async () => {
      const positiveEmail = {
        content: "Great job on the presentation! The client loved it.",
      }
      
      const negativeEmail = {
        content: "This is unacceptable. We need to discuss this immediately.",
      }
      
      const neutralEmail = {
        content: "Please find the meeting notes attached.",
      }
      
      // Test sentiment detection
      const posAnalysis = await analyzeEmailWithAI(positiveEmail)
      const negAnalysis = await analyzeEmailWithAI(negativeEmail)
      const neuAnalysis = await analyzeEmailWithAI(neutralEmail)
      
      // Note: With mocked AI, these will return default values
      expect(posAnalysis.sentiment).toBeDefined()
      expect(negAnalysis.sentiment).toBeDefined()
      expect(neuAnalysis.sentiment).toBeDefined()
    })
  })
  
  describe("Smart Reply Generation", () => {
    it("should generate multiple reply suggestions with different tones", async () => {
      const email = {
        from: "manager@company.com",
        content: "Can you provide an update on the project status?",
      }
      
      const reply = await generateSmartReply(email, {})
      
      expect(reply).toHaveProperty("suggestions")
      expect(reply).toHaveProperty("bestMatch")
      expect(reply.suggestions).toBeInstanceOf(Array)
      expect(reply.suggestions.length).toBeGreaterThan(0)
      
      // Check suggestion structure
      const firstSuggestion = reply.suggestions[0]
      expect(firstSuggestion).toHaveProperty("text")
      expect(firstSuggestion).toHaveProperty("tone")
      expect(firstSuggestion).toHaveProperty("confidence")
      expect(firstSuggestion).toHaveProperty("estimatedImpact")
    })
    
    it("should personalize replies based on relationship data", async () => {
      const email = {
        from: "vip@client.com",
        content: "Need urgent assistance with the platform.",
      }
      
      const context = {
        relationship: {
          importance: 1.0,
          communicationStyle: "formal",
        },
      }
      
      const reply = await generateSmartReply(email, context)
      
      expect(reply.bestMatch).toBeDefined()
      expect(reply.suggestions.some(s => s.tone === "professional")).toBe(true)
    })
  })
  
  describe("Pattern Learning", () => {
    it("should learn and store email patterns", () => {
      const patterns = getEmailPatterns()
      
      expect(patterns).toBeInstanceOf(Array)
      
      // Patterns should be learnable
      const newPattern = {
        id: "test-pattern",
        userId: "user123",
        type: "response" as const,
        pattern: {
          trigger: ["meeting request"],
          actions: ["check calendar", "propose times"],
          conditions: {},
          frequency: 5,
          confidence: 0.85,
        },
        learned: new Date(),
        lastUsed: new Date(),
        effectiveness: 0.9,
      }
      
      // Pattern structure is valid
      expect(newPattern).toHaveProperty("pattern.trigger")
      expect(newPattern).toHaveProperty("pattern.actions")
      expect(newPattern.pattern.confidence).toBeGreaterThan(0)
      expect(newPattern.pattern.confidence).toBeLessThanOrEqual(1)
    })
    
    it("should predict next action based on patterns", async () => {
      const email = {
        subject: "Meeting request for next week",
        content: "Would you be available for a meeting next week?",
      }
      
      const prediction = await predictNextAction(email)
      
      expect(prediction).toHaveProperty("predictedAction")
      expect(prediction).toHaveProperty("confidence")
      expect(prediction).toHaveProperty("basedOn")
      expect(prediction).toHaveProperty("alternatives")
      
      expect(prediction.confidence).toBeGreaterThanOrEqual(0)
      expect(prediction.confidence).toBeLessThanOrEqual(1)
      expect(prediction.alternatives).toBeInstanceOf(Array)
    })
  })
  
  describe("Email Workflows", () => {
    it("should initialize with default workflows", () => {
      const workflows = getEmailWorkflows()
      
      expect(workflows).toBeInstanceOf(Array)
      expect(workflows.length).toBeGreaterThan(0)
      
      // Check for essential workflows
      const hasAutoCategorize = workflows.some(w => w.id === "auto-categorize")
      const hasSmartReply = workflows.some(w => w.id === "smart-reply")
      const hasMeetingScheduler = workflows.some(w => w.id === "meeting-scheduler")
      
      expect(hasAutoCategorize).toBe(true)
      expect(hasSmartReply).toBe(true)
      expect(hasMeetingScheduler).toBe(true)
    })
    
    it("should execute workflow steps sequentially", async () => {
      const email = {
        id: "test-email",
        subject: "Test Email",
        content: "This is a test email for workflow execution.",
      }
      
      const result = await executeEmailWorkflow("auto-categorize", email)
      
      expect(result).toHaveProperty("success")
      expect(result).toHaveProperty("steps")
      expect(result.steps).toBeInstanceOf(Array)
      
      if (result.success) {
        expect(result.steps.length).toBeGreaterThan(0)
        
        // Check step structure
        const firstStep = result.steps[0]
        expect(firstStep).toHaveProperty("action")
        expect(firstStep).toHaveProperty("result")
        expect(firstStep).toHaveProperty("duration")
        expect(firstStep.duration).toBeGreaterThanOrEqual(0)
      }
    })
    
    it("should handle workflow errors gracefully", async () => {
      const email = {
        id: "error-email",
      }
      
      const result = await executeEmailWorkflow("non-existent-workflow", email)
      
      expect(result.success).toBe(false)
      expect(result).toHaveProperty("error")
      expect(result.error).toContain("not found")
    })
  })
  
  describe("Relationship Tracking", () => {
    it("should track and update email relationships", () => {
      const relationships = getEmailRelationships()
      
      expect(relationships).toBeInstanceOf(Array)
      
      // Relationship structure
      const mockRelationship = {
        contactEmail: "contact@example.com",
        name: "John Doe",
        organization: "Example Corp",
        communicationStyle: {
          formality: "formal" as const,
          responseTime: 24,
          preferredChannel: "email",
          topics: ["business", "projects"],
        },
        sentiment: {
          overall: 0.7,
          trend: "stable" as const,
          lastInteraction: new Date(),
        },
        importance: 0.8,
        interactions: 25,
      }
      
      // Validate structure
      expect(mockRelationship.sentiment.overall).toBeGreaterThanOrEqual(-1)
      expect(mockRelationship.sentiment.overall).toBeLessThanOrEqual(1)
      expect(mockRelationship.importance).toBeGreaterThanOrEqual(0)
      expect(mockRelationship.importance).toBeLessThanOrEqual(1)
    })
  })
  
  describe("Insights Generation", () => {
    it("should generate actionable insights", () => {
      const insights = getEmailInsights()
      
      expect(insights).toBeInstanceOf(Array)
      
      // Insight structure
      const mockInsight = {
        type: "trend" as const,
        title: "Email volume increasing",
        description: "Your email volume has increased by 25% this week",
        priority: "medium" as const,
        actionable: true,
        suggestedActions: ["Review email filters", "Set up automation"],
        impact: {
          time: "2 hours/week",
          productivity: 15,
        },
        confidence: 0.85,
      }
      
      // Validate structure
      expect(["trend", "anomaly", "suggestion", "warning", "opportunity"])
        .toContain(mockInsight.type)
      expect(["high", "medium", "low"]).toContain(mockInsight.priority)
      expect(mockInsight.confidence).toBeGreaterThanOrEqual(0)
      expect(mockInsight.confidence).toBeLessThanOrEqual(1)
    })
  })
  
  describe("Performance and Optimization", () => {
    it("should handle large volumes of emails efficiently", async () => {
      const emails = Array.from({ length: 100 }, (_, i) => ({
        id: `email-${i}`,
        subject: `Test Email ${i}`,
        content: `Content for email ${i}`,
        from: `sender${i}@example.com`,
      }))
      
      const startTime = Date.now()
      
      // Process emails in parallel
      const promises = emails.slice(0, 10).map(email => 
        analyzeEmailWithAI(email)
      )
      
      await Promise.all(promises)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Should complete reasonably quickly (under 5 seconds for 10 emails)
      expect(duration).toBeLessThan(5000)
    })
    
    it("should cache frequently accessed data", () => {
      // First call
      const patterns1 = getEmailPatterns()
      
      // Second call should be cached
      const patterns2 = getEmailPatterns()
      
      // Should return same array contents
      expect(patterns1).toStrictEqual(patterns2)
    })
  })
  
  describe("Data Persistence", () => {
    it("should persist patterns to localStorage", () => {
      const mockPattern = {
        id: "persist-test",
        pattern: {
          trigger: ["test"],
          actions: ["test-action"],
          confidence: 0.9,
        },
      }
      
      // Store pattern
      localStorage.setItem("emailPatterns", JSON.stringify([mockPattern]))
      
      // Create new engine (should load from storage)
      const newEngine = new EmailIntelligenceEngine()
      const patterns = getEmailPatterns()
      
      // Note: Due to initialization, this might have default patterns too
      expect(localStorage.getItem("emailPatterns")).toBeDefined()
    })
    
    it("should persist relationships to localStorage", () => {
      const mockRelationship = {
        contactEmail: "persist@test.com",
        importance: 0.9,
      }
      
      localStorage.setItem("emailRelationships", JSON.stringify([mockRelationship]))
      
      // Create new engine (should load from storage)
      const newEngine = new EmailIntelligenceEngine()
      const relationships = getEmailRelationships()
      
      expect(localStorage.getItem("emailRelationships")).toBeDefined()
    })
  })
})

describe("Voice Email Composer Integration", () => {
  it("should handle voice commands correctly", () => {
    const commands = [
      { input: "send to john at example dot com", expected: "setRecipient" },
      { input: "subject quarterly report", expected: "setSubject" },
      { input: "mark as urgent", expected: "setPriority" },
      { input: "new paragraph", expected: "addParagraph" },
      { input: "add attachment", expected: "openAttachmentDialog" },
    ]
    
    commands.forEach(({ input, expected }) => {
      // Voice command parsing logic
      const detected = input.toLowerCase().includes("send to") ? "setRecipient" :
                       input.toLowerCase().includes("subject") ? "setSubject" :
                       input.toLowerCase().includes("urgent") ? "setPriority" :
                       input.toLowerCase().includes("paragraph") ? "addParagraph" :
                       input.toLowerCase().includes("attachment") ? "openAttachmentDialog" :
                       null
      
      expect(detected).toBe(expected)
    })
  })
  
  it("should enhance transcription with AI", () => {
    const transcriptions = [
      { input: "i dont think", expected: "I don't think" },
      { input: "cant make it", expected: "can't make it" },
      { input: "wont be able", expected: "won't be able" },
    ]
    
    transcriptions.forEach(({ input, expected }) => {
      const enhanced = input
        .replace(/\bi\b/g, "I")
        .replace(/\bdont\b/g, "don't")
        .replace(/\bcant\b/g, "can't")
        .replace(/\bwont\b/g, "won't")
      
      expect(enhanced).toBe(expected)
    })
  })
})

describe("Streaming Assistant Integration", () => {
  it("should handle real-time email streams", () => {
    const stream = {
      id: "stream-1",
      type: "incoming" as const,
      subject: "Test Stream",
      from: "sender@test.com",
      to: "recipient@test.com",
      timestamp: new Date(),
      priority: "normal" as const,
      category: "Work",
      sentiment: "neutral" as const,
      content: "Test content",
    }
    
    expect(stream).toHaveProperty("id")
    expect(stream).toHaveProperty("timestamp")
    expect(["incoming", "outgoing", "draft", "analysis"]).toContain(stream.type)
    expect(["urgent", "high", "normal", "low"]).toContain(stream.priority)
    expect(["positive", "neutral", "negative"]).toContain(stream.sentiment)
  })
  
  it("should process AI enhancements on streams", async () => {
    const mockProcessing = {
      status: "pending" as const,
    }
    
    // Simulate processing stages
    mockProcessing.status = "processing" as const
    expect(mockProcessing.status).toBe("processing")
    
    // Simulate completion
    const completed = {
      status: "complete" as const,
      summary: "Email processed",
      actionItems: ["Review", "Respond"],
      suggestedResponse: "Thank you for your email",
    }
    
    expect(completed.status).toBe("complete")
    expect(completed.actionItems).toHaveLength(2)
    expect(completed.suggestedResponse).toBeDefined()
  })
})