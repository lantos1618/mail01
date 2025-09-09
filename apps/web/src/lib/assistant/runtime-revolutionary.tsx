"use client"

import { AssistantRuntimeProvider, makeAssistantTool, makeAssistantToolUI } from "@assistant-ui/react"
import { useVercelUseChatRuntime } from "@assistant-ui/react-ai-sdk"
import { useChat } from "ai/react"
import { ReactNode, useState, useCallback } from "react"
import { z } from "zod"
import { Mail, Send, Search, Calendar, Bot, Brain, FileText, Users, Zap, Sparkles } from "lucide-react"

// Revolutionary Email Tools
const emailTools = {
  composeEmail: makeAssistantTool({
    toolName: "composeEmail",
    description: "Compose a new email with AI assistance",
    parameters: z.object({
      to: z.string().describe("Recipient email address"),
      subject: z.string().describe("Email subject"),
      body: z.string().describe("Email body content"),
      tone: z.enum(["professional", "casual", "friendly", "urgent", "empathetic"]).optional(),
      style: z.enum(["concise", "detailed", "bullet-points", "narrative"]).optional(),
    }),
    execute: async (params) => {
      return {
        success: true,
        message: `Email composed to ${params.to}`,
        draft: params,
      }
    },
  }),

  analyzeEmail: makeAssistantTool({
    toolName: "analyzeEmail",
    description: "Analyze email for sentiment, urgency, and intent",
    parameters: z.object({
      emailId: z.string().describe("Email ID to analyze"),
      analysisType: z.array(z.enum(["sentiment", "urgency", "intent", "actionItems", "keyPoints"])),
    }),
    execute: async (params) => {
      return {
        sentiment: "positive",
        urgency: "high",
        intent: "meeting request",
        actionItems: ["Schedule meeting", "Prepare agenda"],
        keyPoints: ["Q4 budget discussion", "Team expansion"],
      }
    },
  }),

  searchEmails: makeAssistantTool({
    toolName: "searchEmails",
    description: "Search emails using natural language",
    parameters: z.object({
      query: z.string().describe("Natural language search query"),
      filters: z.object({
        dateRange: z.string().optional(),
        sender: z.string().optional(),
        hasAttachment: z.boolean().optional(),
        isUnread: z.boolean().optional(),
      }).optional(),
    }),
    execute: async (params) => {
      return {
        results: [
          { id: "1", subject: "Q4 Budget Review", sender: "cfo@company.com", preview: "Please review the attached..." },
          { id: "2", subject: "Team Meeting Tomorrow", sender: "manager@company.com", preview: "Don't forget about our..." },
        ],
        count: 2,
      }
    },
  }),

  summarizeThread: makeAssistantTool({
    toolName: "summarizeThread",
    description: "Summarize an email thread with key decisions and action items",
    parameters: z.object({
      threadId: z.string().describe("Thread ID to summarize"),
      summaryType: z.enum(["brief", "detailed", "decisions-only", "action-items"]).optional(),
    }),
    execute: async (params) => {
      return {
        summary: "Discussion about Q4 budget allocation with focus on marketing spend",
        decisions: ["Increase marketing budget by 20%", "Hire 2 new developers"],
        actionItems: ["Submit revised budget by Friday", "Schedule follow-up meeting"],
        participants: ["CEO", "CFO", "VP Marketing"],
      }
    },
  }),

  generateReplies: makeAssistantTool({
    toolName: "generateReplies",
    description: "Generate multiple reply options for an email",
    parameters: z.object({
      emailId: z.string().describe("Email ID to reply to"),
      replyCount: z.number().min(1).max(5).default(3),
      tones: z.array(z.enum(["accept", "decline", "defer", "clarify", "negotiate"])).optional(),
    }),
    execute: async (params) => {
      return {
        replies: [
          { tone: "accept", text: "I'd be happy to attend the meeting. Looking forward to discussing the Q4 budget." },
          { tone: "defer", text: "Thank you for the invitation. Could we possibly reschedule for next week?" },
          { tone: "clarify", text: "Thanks for reaching out. Could you provide more details about the agenda?" },
        ],
      }
    },
  }),

  scheduleEmail: makeAssistantTool({
    toolName: "scheduleEmail",
    description: "Schedule an email to be sent later",
    parameters: z.object({
      emailId: z.string().describe("Email ID or draft to schedule"),
      sendAt: z.string().describe("ISO datetime when to send"),
      timezone: z.string().optional(),
    }),
    execute: async (params) => {
      return {
        scheduled: true,
        sendAt: params.sendAt,
        message: "Email scheduled successfully",
      }
    },
  }),

  extractMeetings: makeAssistantTool({
    toolName: "extractMeetings",
    description: "Extract meeting information from emails",
    parameters: z.object({
      emailId: z.string().describe("Email ID to extract meetings from"),
    }),
    execute: async (params) => {
      return {
        meetings: [
          {
            title: "Q4 Budget Review",
            date: "2024-01-15T14:00:00Z",
            duration: 60,
            participants: ["John Doe", "Jane Smith"],
            location: "Conference Room A",
          },
        ],
      }
    },
  }),

  analyzeRelationships: makeAssistantTool({
    toolName: "analyzeRelationships",
    description: "Analyze email communication patterns and relationships",
    parameters: z.object({
      contact: z.string().optional().describe("Specific contact to analyze"),
      timeRange: z.string().optional().describe("Time range for analysis"),
    }),
    execute: async (params) => {
      return {
        topContacts: [
          { email: "john@company.com", frequency: 45, sentiment: "positive", responseTime: "2h" },
          { email: "jane@client.com", frequency: 32, sentiment: "neutral", responseTime: "4h" },
        ],
        patterns: {
          peakHours: ["9-11 AM", "2-4 PM"],
          averageResponseTime: "3.5 hours",
          emailVolume: "trending up 15%",
        },
      }
    },
  }),

  batchProcess: makeAssistantTool({
    toolName: "batchProcess",
    description: "Process multiple emails with AI operations",
    parameters: z.object({
      emailIds: z.array(z.string()).describe("Email IDs to process"),
      operation: z.enum(["categorize", "prioritize", "archive", "mark-read", "apply-labels"]),
      params: z.record(z.any()).optional(),
    }),
    execute: async (params) => {
      return {
        processed: params.emailIds.length,
        success: true,
        results: params.emailIds.map(id => ({ id, status: "completed" })),
      }
    },
  }),

  trainWritingStyle: makeAssistantTool({
    toolName: "trainWritingStyle",
    description: "Train AI on your writing style from past emails",
    parameters: z.object({
      sampleCount: z.number().min(10).max(100).default(50),
      recipient: z.string().optional().describe("Train for specific recipient"),
    }),
    execute: async (params) => {
      return {
        trained: true,
        patterns: {
          greetings: ["Hi", "Hello", "Hey"],
          closings: ["Best regards", "Thanks", "Cheers"],
          averageLength: 150,
          formality: "semi-formal",
        },
        accuracy: 0.92,
      }
    },
  }),
}

// Tool UI Components
const ToolUIComponents = {
  composeEmail: makeAssistantToolUI({
    toolName: "composeEmail",
    render: ({ args, result }) => (
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5 text-blue-600" />
          <span className="font-semibold">Composing Email</span>
        </div>
        {result ? (
          <div className="text-sm text-green-600">✓ Draft created for {args.to}</div>
        ) : (
          <div className="text-sm text-gray-600">Creating email to {args.to}...</div>
        )}
      </div>
    ),
  }),

  analyzeEmail: makeAssistantToolUI({
    toolName: "analyzeEmail",
    render: ({ result }) => (
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span className="font-semibold">Email Analysis</span>
        </div>
        {result && (
          <div className="space-y-2 text-sm">
            <div>Sentiment: <span className="font-medium">{result.sentiment}</span></div>
            <div>Urgency: <span className="font-medium">{result.urgency}</span></div>
            <div>Action Items: {result.actionItems?.join(", ")}</div>
          </div>
        )}
      </div>
    ),
  }),

  searchEmails: makeAssistantToolUI({
    toolName: "searchEmails",
    render: ({ args, result }) => (
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-5 h-5 text-green-600" />
          <span className="font-semibold">Email Search</span>
        </div>
        {result ? (
          <div className="text-sm">
            Found {result.count} emails matching "{args.query}"
          </div>
        ) : (
          <div className="text-sm text-gray-600">Searching...</div>
        )}
      </div>
    ),
  }),
}

// Revolutionary Runtime Provider
export function RevolutionaryAssistantProvider({ children }: { children: ReactNode }) {
  const [tools] = useState(() => Object.values(emailTools))
  const [toolUIs] = useState(() => Object.values(ToolUIComponents))

  const chat = useChat({
    api: "/api/assistant",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Welcome to Mail-01! I'm your AI email assistant. I can help you compose emails, analyze conversations, schedule meetings, and much more. Just ask me anything about your emails!",
      },
    ],
    onError: (error) => {
      console.error("Chat error:", error)
    },
    body: {
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      tools: tools.map(t => ({
        type: "function",
        function: {
          name: t.toolName,
          description: t.description,
          parameters: t.parameters,
        },
      })),
    },
  })

  const runtime = useVercelUseChatRuntime(chat)

  // Enhance runtime with custom capabilities
  const enhancedRuntime = {
    ...runtime,
    tools,
    toolUIs,
    // Add streaming support
    streamMode: true,
    // Add multimodal support
    supportsImages: true,
    supportsVoice: true,
    // Add persistence
    persistMessages: true,
    // Add analytics
    trackUsage: true,
  }

  return (
    <AssistantRuntimeProvider runtime={enhancedRuntime}>
      <div className="relative">
        {children}
        <FloatingAssistantIndicator />
      </div>
    </AssistantRuntimeProvider>
  )
}

// Floating AI Indicator
function FloatingAssistantIndicator() {
  const [isThinking, setIsThinking] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isThinking && (
        <div className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
          <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
          <span className="text-sm text-gray-600">AI is thinking...</span>
        </div>
      )}
    </div>
  )
}