import { streamText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import * as fs from "fs/promises"
import * as path from "path"

// Helper to ensure directory exists
async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true })
}

// Helper to read emails from inbox
async function readInbox(folder: 'sent' | 'received' | 'drafts' = 'received') {
  const inboxPath = path.join(process.cwd(), ".agent", "inbox", folder)
  await ensureDir(inboxPath)
  try {
    const files = await fs.readdir(inboxPath)
    const emails = await Promise.all(
      files
        .filter(f => f.endsWith('.json'))
        .map(async f => {
          const content = await fs.readFile(path.join(inboxPath, f), 'utf-8')
          return JSON.parse(content)
        })
    )
    return emails
  } catch {
    return []
  }
}

// Email tools for the assistant
const emailTools = {
  searchEmails: tool({
    description: "Search emails by query",
    parameters: z.object({
      query: z.string().describe("Search query"),
      folder: z.string().optional().describe("Folder to search in"),
    }),
    execute: async ({ query, folder }) => {
      // Mock implementation - will be replaced with real email search
      return {
        results: [
          {
            id: "1",
            from: "user@example.com",
            subject: "Meeting tomorrow",
            preview: "Don't forget about our meeting...",
            date: "2024-12-20",
          },
        ],
      }
    },
  }),

  composeEmail: tool({
    description: "Compose a new email",
    parameters: z.object({
      to: z.string().describe("Recipient email address"),
      subject: z.string().describe("Email subject"),
      body: z.string().describe("Email body"),
      cc: z.string().optional().describe("CC recipients"),
      bcc: z.string().optional().describe("BCC recipients"),
    }),
    execute: async ({ to, subject, body, cc, bcc }) => {
      // Save draft to file system for now
      const draft = {
        to,
        subject,
        body,
        cc,
        bcc,
        createdAt: new Date().toISOString(),
        id: Date.now().toString(),
      }
      
      const draftsPath = path.join(process.cwd(), ".agent", "inbox", "drafts")
      await fs.mkdir(draftsPath, { recursive: true })
      await fs.writeFile(
        path.join(draftsPath, `${draft.id}.json`),
        JSON.stringify(draft, null, 2)
      )
      
      return { success: true, draftId: draft.id }
    },
  }),

  summarizeThread: tool({
    description: "Summarize an email thread",
    parameters: z.object({
      threadId: z.string().describe("Thread ID to summarize"),
    }),
    execute: async ({ threadId }) => {
      // Mock implementation
      return {
        summary: "This thread discusses the upcoming product launch with 5 participants over 12 messages.",
        keyPoints: [
          "Launch date set for January 15th",
          "Marketing campaign ready",
          "Technical issues resolved",
        ],
        sentiment: "positive",
        urgency: "medium",
        actionItems: [
          "Review final marketing materials",
          "Confirm server capacity"
        ]
      }
    },
  }),

  analyzeEmailSentiment: tool({
    description: "Analyze the sentiment and tone of an email",
    parameters: z.object({
      emailContent: z.string().describe("Email content to analyze"),
    }),
    execute: async ({ emailContent }) => {
      // Mock sentiment analysis
      return {
        sentiment: "professional",
        tone: "friendly",
        urgency: "normal",
        emotions: ["confident", "helpful"],
        suggestedResponse: "professional-acknowledgment"
      }
    },
  }),

  extractTasks: tool({
    description: "Extract action items and tasks from emails",
    parameters: z.object({
      timeRange: z.string().optional().describe("Time range (today, this-week, all)"),
    }),
    execute: async ({ timeRange = "today" }) => {
      // Mock task extraction
      return {
        tasks: [
          {
            task: "Review Q4 budget proposal",
            from: "finance@company.com",
            dueDate: "2024-12-25",
            priority: "high"
          },
          {
            task: "Send project status update",
            from: "manager@company.com",
            dueDate: "2024-12-22",
            priority: "medium"
          }
        ],
        meetings: [
          {
            title: "Team sync",
            date: "2024-12-21",
            time: "2:00 PM",
            attendees: ["team@company.com"]
          }
        ]
      }
    },
  }),

  smartReply: tool({
    description: "Generate smart reply suggestions",
    parameters: z.object({
      emailId: z.string().describe("Email ID to reply to"),
      tone: z.string().optional().describe("Desired tone (formal, casual, friendly)"),
    }),
    execute: async ({ emailId, tone = "professional" }) => {
      return {
        suggestions: [
          {
            type: "acknowledge",
            text: "Thank you for your email. I've reviewed the information and will get back to you shortly."
          },
          {
            type: "accept",
            text: "I appreciate your proposal and would be happy to move forward with the discussed plan."
          },
          {
            type: "schedule",
            text: "I'd be glad to discuss this further. Would you be available for a call next week?"
          }
        ]
      }
    },
  }),

  categorizeEmail: tool({
    description: "Categorize an email",
    parameters: z.object({
      emailId: z.string().describe("Email ID"),
      category: z.string().describe("Category name"),
    }),
    execute: async ({ emailId, category }) => {
      return { success: true, emailId, category }
    },
  }),
}

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
    tools: emailTools,
    system: `You are Mail-01, an advanced AI email assistant powered by assistant-ui. You help users manage their emails with intelligence and efficiency.
    
    Your capabilities:
    - 🔍 Natural language email search and filtering
    - ✍️ Smart email composition with context awareness
    - 📊 Email sentiment and priority analysis
    - 📝 Thread summarization with key insights
    - 📅 Meeting and task extraction from emails
    - 🎯 Intelligent categorization and organization
    - 🤖 Proactive email management suggestions
    - 📨 Smart reply generation
    - 📊 Pattern analysis and productivity insights
    
    Guidelines:
    - Be concise and actionable
    - Proactively suggest improvements
    - Learn from user preferences
    - Prioritize privacy and security
    - Use natural, conversational language
    - Provide clear reasoning for suggestions
    
    Remember: You're not just managing emails, you're enhancing communication productivity.`,
  })

  return result.toDataStreamResponse()
}