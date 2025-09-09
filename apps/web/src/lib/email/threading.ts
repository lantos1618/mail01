import { z } from "zod"

// Email Thread Schema
export const EmailThreadSchema = z.object({
  id: z.string(),
  subject: z.string(),
  participants: z.array(z.string()),
  emails: z.array(z.object({
    id: z.string(),
    from: z.string(),
    to: z.array(z.string()),
    subject: z.string(),
    body: z.string(),
    timestamp: z.string(),
    inReplyTo: z.string().optional(),
    references: z.array(z.string()).optional(),
  })),
  lastActivity: z.string(),
  unreadCount: z.number(),
  tags: z.array(z.string()),
})

export type EmailThread = z.infer<typeof EmailThreadSchema>

// Email Threading Engine
export class ThreadingEngine {
  // Group emails into threads based on subject and references
  groupIntoThreads(emails: any[]): EmailThread[] {
    const threads = new Map<string, EmailThread>()
    
    // Sort emails by timestamp
    const sortedEmails = [...emails].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    for (const email of sortedEmails) {
      // Extract thread subject (remove Re:, Fwd:, etc.)
      const threadSubject = this.normalizeSubject(email.subject)
      
      // Find or create thread
      let thread = threads.get(threadSubject)
      
      if (!thread) {
        thread = {
          id: `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          subject: threadSubject,
          participants: [],
          emails: [],
          lastActivity: email.timestamp,
          unreadCount: 0,
          tags: [],
        }
        threads.set(threadSubject, thread)
      }

      // Add email to thread
      thread.emails.push(email)
      thread.lastActivity = email.timestamp
      
      // Update participants
      if (!thread.participants.includes(email.from)) {
        thread.participants.push(email.from)
      }
      for (const recipient of email.to || []) {
        if (!thread.participants.includes(recipient)) {
          thread.participants.push(recipient)
        }
      }

      // Update unread count
      if (!email.read) {
        thread.unreadCount++
      }
    }

    return Array.from(threads.values())
  }

  // Normalize subject line for threading
  private normalizeSubject(subject: string): string {
    return subject
      .replace(/^(Re|RE|Fwd|FWD|Fw|FW):\s*/gi, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
  }

  // Generate thread summary
  async generateThreadSummary(thread: EmailThread): Promise<{
    summary: string
    keyPoints: string[]
    decisions: string[]
    actionItems: string[]
    sentiment: string
  }> {
    // Analyze thread content
    const allContent = thread.emails.map(e => `${e.from}: ${e.body}`).join("\n")
    
    // Simple extraction (in production, use AI)
    const keyPoints = []
    const decisions = []
    const actionItems = []

    // Look for patterns
    if (allContent.includes("meeting")) {
      keyPoints.push("Meeting discussed")
    }
    if (allContent.includes("agreed") || allContent.includes("decided")) {
      decisions.push("Agreement reached on key points")
    }
    if (allContent.includes("will") || allContent.includes("action")) {
      actionItems.push("Follow-up actions identified")
    }

    return {
      summary: `Thread with ${thread.participants.length} participants discussing "${thread.subject}"`,
      keyPoints: keyPoints.length > 0 ? keyPoints : ["General discussion"],
      decisions: decisions.length > 0 ? decisions : ["No formal decisions"],
      actionItems: actionItems.length > 0 ? actionItems : ["No specific actions"],
      sentiment: "neutral",
    }
  }

  // Find related threads
  findRelatedThreads(thread: EmailThread, allThreads: EmailThread[]): EmailThread[] {
    const related = []
    
    for (const otherThread of allThreads) {
      if (otherThread.id === thread.id) continue
      
      // Check for common participants
      const commonParticipants = thread.participants.filter(p => 
        otherThread.participants.includes(p)
      )
      
      // Check for similar subjects
      const similarity = this.calculateSimilarity(thread.subject, otherThread.subject)
      
      if (commonParticipants.length > 0 || similarity > 0.5) {
        related.push(otherThread)
      }
    }
    
    return related.slice(0, 5) // Return top 5 related threads
  }

  // Calculate string similarity
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(/\s+/)
    const words2 = str2.toLowerCase().split(/\s+/)
    
    const common = words1.filter(w => words2.includes(w))
    return common.length / Math.max(words1.length, words2.length)
  }

  // Extract thread timeline
  extractTimeline(thread: EmailThread): Array<{
    timestamp: string
    sender: string
    action: string
    preview: string
  }> {
    return thread.emails.map(email => ({
      timestamp: email.timestamp,
      sender: email.from,
      action: email.inReplyTo ? "replied" : "started thread",
      preview: email.body.substring(0, 100) + "...",
    }))
  }

  // Predict next action
  predictNextAction(thread: EmailThread): {
    action: string
    confidence: number
    suggestedResponse?: string
  } {
    const lastEmail = thread.emails[thread.emails.length - 1]
    
    // Simple heuristics (in production, use ML)
    if (lastEmail.body.includes("?")) {
      return {
        action: "reply_needed",
        confidence: 0.9,
        suggestedResponse: "Answer the question asked",
      }
    }
    
    if (lastEmail.body.includes("thank")) {
      return {
        action: "thread_complete",
        confidence: 0.8,
      }
    }
    
    return {
      action: "monitor",
      confidence: 0.5,
    }
  }
}

export const threadingEngine = new ThreadingEngine()