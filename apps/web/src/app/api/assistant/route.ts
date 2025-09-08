import { streamText, tool } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import * as fs from "fs/promises"
import * as path from "path"

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
    system: `You are an intelligent email assistant. You help users manage their emails efficiently.
    
    You can:
    - Search and filter emails
    - Compose and send emails
    - Summarize email threads
    - Categorize and organize emails
    - Provide insights about email patterns
    - Help with email productivity
    
    Be concise, helpful, and proactive in suggesting ways to manage emails better.`,
  })

  return result.toDataStreamResponse()
}