"use client"

import { 
  AssistantRuntimeProvider,
  makeAssistantTool,
  makeAssistantToolUI,
  useLocalRuntime,
  useExternalStoreRuntime,
} from "@assistant-ui/react"
import { z } from "zod"
import { ReactNode, useState, useEffect } from "react"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Loader2, Send, Search, Archive, Trash2, Star, Reply, Forward, Brain, Sparkles } from "lucide-react"

// Advanced Email Tools with UI
const searchEmailsTool = makeAssistantTool({
  toolName: "searchEmails",
  description: "Search through emails with advanced AI filtering",
  parameters: z.object({
    query: z.string().describe("Search query"),
    filters: z.object({
      from: z.string().optional(),
      to: z.string().optional(),
      subject: z.string().optional(),
      dateRange: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
      }).optional(),
      hasAttachment: z.boolean().optional(),
      isUnread: z.boolean().optional(),
      priority: z.enum(["high", "medium", "low"]).optional(),
      sentiment: z.enum(["positive", "neutral", "negative"]).optional(),
    }).optional(),
    aiAnalysis: z.boolean().default(true).describe("Use AI to understand intent"),
  }),
  execute: async ({ query, filters, aiAnalysis }) => {
    // Simulate AI-powered email search
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const results = [
      {
        id: "1",
        subject: "Q4 Revenue Report - Action Required",
        from: "cfo@company.com",
        preview: "Please review the attached Q4 revenue report and provide feedback by EOD...",
        date: new Date().toISOString(),
        priority: "high",
        sentiment: "neutral",
        relevanceScore: 0.95,
      },
      {
        id: "2", 
        subject: "Team Meeting Notes - Project Alpha",
        from: "pm@company.com",
        preview: "Following up on our discussion about Project Alpha timeline...",
        date: new Date(Date.now() - 86400000).toISOString(),
        priority: "medium",
        sentiment: "positive",
        relevanceScore: 0.87,
      },
    ]
    
    return {
      results,
      totalCount: results.length,
      aiInsights: aiAnalysis ? {
        summary: `Found ${results.length} emails matching "${query}"`,
        suggestedActions: ["Review Q4 report urgently", "Schedule follow-up on Project Alpha"],
        patterns: ["High priority items from management", "Project updates requiring response"],
      } : null,
    }
  },
})

const searchEmailsToolUI = makeAssistantToolUI({
  toolName: "searchEmails",
  render: (toolCallMessage) => {
    const { query, filters } = toolCallMessage.args as any
    const result = toolCallMessage.result as any
    const status = toolCallMessage.status?.type
    
    return (
      <Card className="p-4 my-2">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-blue-500" />
          <span className="font-medium">Email Search</span>
          {status === "running" && <Loader2 className="w-4 h-4 animate-spin" />}
        </div>
        
        <div className="text-sm text-gray-600 mb-2">
          Query: "{query}"
          {filters?.from && <span className="ml-2">From: {filters.from}</span>}
        </div>
        
        {result && (
          <div className="space-y-2">
            {result.results.map((email: any) => (
              <div key={email.id} className="p-2 bg-gray-50 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{email.subject}</span>
                  <Badge variant={email.priority === "high" ? "destructive" : "default"}>
                    {email.priority}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  From: {email.from} • Relevance: {(email.relevanceScore * 100).toFixed(0)}%
                </div>
              </div>
            ))}
            
            {result.aiInsights && (
              <div className="mt-3 p-2 bg-blue-50 rounded">
                <div className="flex items-center gap-1 mb-1">
                  <Brain className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">AI Insights</span>
                </div>
                <p className="text-xs text-blue-800">{result.aiInsights.summary}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    )
  },
})

const composeEmailTool = makeAssistantTool({
  toolName: "composeEmail",
  description: "Compose emails with AI assistance",
  parameters: z.object({
    to: z.string().describe("Recipient email"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body"),
    tone: z.enum(["formal", "casual", "friendly", "professional"]).default("professional"),
    aiEnhance: z.boolean().default(true).describe("Enhance with AI"),
    suggestions: z.boolean().default(true).describe("Provide alternative versions"),
  }),
  execute: async ({ to, subject, body, tone, aiEnhance, suggestions }) => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const enhanced = aiEnhance ? {
      subject: `${subject} - Strategic Update`,
      body: `Dear Team,\n\n${body}\n\nI look forward to your thoughts and feedback.\n\nBest regards`,
      improvements: [
        "Added professional greeting",
        "Structured content for clarity",
        "Added call-to-action",
        "Professional sign-off",
      ],
    } : { subject, body }
    
    const alternatives = suggestions ? [
      {
        tone: "casual",
        subject: `Quick update: ${subject}`,
        preview: "Hey team, just wanted to drop a quick note about...",
      },
      {
        tone: "formal",
        subject: `Official Communication: ${subject}`,
        preview: "Dear Colleagues, I am writing to inform you regarding...",
      },
    ] : []
    
    return {
      draft: enhanced,
      alternatives,
      readabilityScore: 8.5,
      estimatedReadTime: "2 min",
      sentimentAnalysis: "professional and positive",
    }
  },
})

const analyzeEmailTool = makeAssistantTool({
  toolName: "analyzeEmail",
  description: "Deep AI analysis of email content and context",
  parameters: z.object({
    emailId: z.string().describe("Email to analyze"),
    analysisType: z.enum([
      "sentiment",
      "priority",
      "actionItems",
      "summary",
      "relationships",
      "full",
    ]).default("full"),
  }),
  execute: async ({ emailId, analysisType }) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return {
      emailId,
      sentiment: {
        overall: "neutral-positive",
        confidence: 0.85,
        emotions: ["professional", "inquiring", "collaborative"],
      },
      priority: {
        level: "high",
        reasons: ["Executive sender", "Deadline mentioned", "Action required"],
        suggestedDeadline: "2025-09-10",
      },
      actionItems: [
        { task: "Review Q4 report", deadline: "EOD today", assigned: "You" },
        { task: "Provide feedback", deadline: "Tomorrow", assigned: "You" },
        { task: "Schedule follow-up meeting", deadline: "This week", assigned: "Team" },
      ],
      summary: "Executive request for Q4 revenue report review with feedback needed by end of day. Contains financial data and strategic implications.",
      relationships: {
        sender: {
          role: "CFO",
          communicationFrequency: "weekly",
          importance: "high",
          history: "15 previous emails, mostly reports and approvals",
        },
        mentioned: ["CEO", "Sales Director", "Board"],
      },
      suggestedResponse: {
        template: "I've reviewed the Q4 report and have the following observations...",
        keyPoints: ["Acknowledge receipt", "Provide timeline", "Ask clarifying questions"],
      },
    }
  },
})

const emailAutomationTool = makeAssistantTool({
  toolName: "emailAutomation",
  description: "Set up intelligent email automation rules",
  parameters: z.object({
    trigger: z.enum(["receive", "send", "schedule", "pattern"]),
    conditions: z.array(z.object({
      field: z.string(),
      operator: z.enum(["contains", "equals", "startsWith", "matches"]),
      value: z.string(),
    })),
    actions: z.array(z.enum([
      "autoReply",
      "forward",
      "categorize",
      "flag",
      "archive",
      "createTask",
      "notify",
      "summarize",
    ])),
    aiProcessing: z.boolean().default(true),
  }),
  execute: async ({ trigger, conditions, actions, aiProcessing }) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      ruleId: `rule_${Date.now()}`,
      status: "active",
      trigger,
      conditions,
      actions,
      aiEnhanced: aiProcessing,
      estimatedImpact: {
        emailsPerWeek: 47,
        timeSaved: "2.5 hours",
        accuracy: "95%",
      },
      suggestions: [
        "Consider adding exception for VIP senders",
        "Add time-based conditions for better filtering",
        "Enable learning mode to improve over time",
      ],
    }
  },
})

// Enhanced Runtime Provider with multiple AI models
export function EnhancedAssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Use local runtime with advanced configuration
  const runtime = useLocalRuntime({
    run: async ({ messages }) => {
      setIsProcessing(true)
      
      // Get the last user message
      const lastMessage = messages[messages.length - 1]
      
      let responseText = "I'm your AI email assistant powered by Mail-01. "
      
      if (lastMessage && lastMessage.role === 'user') {
        // Process user message
        const userText = lastMessage.content
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join(' ')
        
        responseText = `Processing your request: "${userText}". I can help you search, compose, analyze, and automate your emails.`
      } else {
        responseText += "I can help you search, compose, analyze, and automate your emails with advanced AI capabilities. What would you like to do?"
      }
      
      setIsProcessing(false)
      
      return {
        content: [{ 
          type: "text", 
          text: responseText
        }]
      }
    }
  })
  
  // Add advanced features
  useEffect(() => {
    // Email pattern learning
    const learnPatterns = () => {
      const patterns = {
        responseTime: "Usually responds within 2 hours",
        writingStyle: "Professional, concise",
        commonPhrases: ["Looking forward", "Please review", "Thanks for"],
        preferredTone: "professional",
      }
      
      // Store patterns for personalization
      localStorage.setItem("emailPatterns", JSON.stringify(patterns))
    }
    
    // Predictive text
    const setupPredictiveText = () => {
      const predictions = [
        "Thank you for your email",
        "I'll look into this and get back to you",
        "Please find attached",
        "Let me know if you need anything else",
      ]
      
      localStorage.setItem("predictiveText", JSON.stringify(predictions))
    }
    
    learnPatterns()
    setupPredictiveText()
  }, [])
  
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="relative">
        {isProcessing && (
          <div className="absolute top-2 right-2 flex items-center gap-2 text-sm text-blue-600">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>AI Processing...</span>
          </div>
        )}
        {children}
      </div>
    </AssistantRuntimeProvider>
  )
}

// Export tool UIs for use in components
export const emailToolUIs = [
  searchEmailsToolUI,
]

// Export tools for external use
export const emailTools = {
  searchEmails: searchEmailsTool,
  composeEmail: composeEmailTool,
  analyzeEmail: analyzeEmailTool,
  emailAutomation: emailAutomationTool,
}