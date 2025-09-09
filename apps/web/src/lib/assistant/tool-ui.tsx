"use client"

import { makeAssistantToolUI } from "@assistant-ui/react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Send, Archive, Star, Reply, Forward, Trash, 
  Calendar, Clock, CheckCircle, XCircle, AlertCircle 
} from "lucide-react"
import { useState } from "react"

// Email Action Tool UI
const SendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  body: z.string(),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  priority: z.enum(["low", "normal", "high"]).optional(),
  schedule: z.string().optional()
})

export const SendEmailToolUI = makeAssistantToolUI<z.infer<typeof SendEmailSchema>>({
  name: "send_email",
  description: "Send an email with AI enhancement",
  parameters: SendEmailSchema,
  render: ({ args, status, result }) => {
    const [expanded, setExpanded] = useState(false)
    
    return (
      <Card className="p-4 my-2 border-l-4 border-l-blue-500">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-4 h-4 text-blue-500" />
              <span className="font-semibold">Sending Email</span>
              {status === "pending" && <Badge variant="secondary">Preparing</Badge>}
              {status === "streaming" && <Badge variant="default">Sending</Badge>}
              {status === "complete" && <Badge variant="success">Sent</Badge>}
              {status === "error" && <Badge variant="destructive">Failed</Badge>}
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground">To:</span>
                <span className="font-medium">{args.to}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Subject:</span>
                <span>{args.subject}</span>
              </div>
              
              {expanded && (
                <>
                  <div className="mt-3 p-3 bg-muted/50 rounded-md">
                    <pre className="whitespace-pre-wrap text-xs">{args.body}</pre>
                  </div>
                  {args.schedule && (
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">Scheduled for {args.schedule}</span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="mt-2"
            >
              {expanded ? "Show less" : "Show more"}
            </Button>
            
            {result && status === "complete" && (
              <div className="mt-3 p-2 bg-green-50 dark:bg-green-950/20 rounded">
                <CheckCircle className="w-4 h-4 text-green-600 inline mr-2" />
                <span className="text-sm text-green-700 dark:text-green-400">
                  Email sent successfully
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }
})

// Email Search Tool UI
const SearchEmailsSchema = z.object({
  query: z.string(),
  filters: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    dateRange: z.string().optional(),
    hasAttachment: z.boolean().optional(),
    isUnread: z.boolean().optional()
  }).optional()
})

export const SearchEmailsToolUI = makeAssistantToolUI<z.infer<typeof SearchEmailsSchema>>({
  name: "search_emails",
  description: "Search emails with natural language",
  parameters: SearchEmailsSchema,
  render: ({ args, status, result }) => {
    return (
      <Card className="p-4 my-2 border-l-4 border-l-purple-500">
        <div className="flex items-center gap-2 mb-2">
          <Search className="w-4 h-4 text-purple-500" />
          <span className="font-semibold">Searching Emails</span>
          {status === "streaming" && (
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-100" />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-200" />
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          Query: "{args.query}"
        </div>
        
        {result && (
          <div className="mt-3 space-y-2">
            {result.emails?.map((email: any, idx: number) => (
              <div key={idx} className="p-2 bg-muted/30 rounded flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{email.subject}</div>
                  <div className="text-xs text-muted-foreground">
                    From: {email.from} • {email.date}
                  </div>
                </div>
                <Badge variant="outline">{email.score}% match</Badge>
              </div>
            ))}
            {result.totalCount && (
              <div className="text-xs text-center text-muted-foreground mt-2">
                Found {result.totalCount} emails
              </div>
            )}
          </div>
        )}
      </Card>
    )
  }
})

// Email Categorization Tool UI
const CategorizeEmailSchema = z.object({
  emailId: z.string(),
  suggestedCategories: z.array(z.string())
})

export const CategorizeEmailToolUI = makeAssistantToolUI<z.infer<typeof CategorizeEmailSchema>>({
  name: "categorize_email",
  description: "AI-powered email categorization",
  parameters: CategorizeEmailSchema,
  render: ({ args, status, result }) => {
    const categoryIcons: Record<string, any> = {
      important: AlertCircle,
      work: Calendar,
      personal: Star,
      newsletter: Archive,
      spam: Trash
    }
    
    return (
      <Card className="p-3 my-2 border-l-4 border-l-orange-500">
        <div className="flex items-center gap-2 mb-2">
          <Archive className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-sm">Categorizing Email</span>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {args.suggestedCategories.map((cat) => {
            const Icon = categoryIcons[cat.toLowerCase()] || Archive
            return (
              <Badge key={cat} variant="secondary" className="text-xs">
                <Icon className="w-3 h-3 mr-1" />
                {cat}
              </Badge>
            )
          })}
        </div>
        
        {result && (
          <div className="mt-2 text-xs text-muted-foreground">
            Applied: {result.appliedCategory}
          </div>
        )}
      </Card>
    )
  }
})

// Email Summary Tool UI
const SummarizeThreadSchema = z.object({
  threadId: z.string(),
  style: z.enum(["brief", "detailed", "action-items"]).optional()
})

export const SummarizeThreadToolUI = makeAssistantToolUI<z.infer<typeof SummarizeThreadSchema>>({
  name: "summarize_thread",
  description: "Generate AI summary of email thread",
  parameters: SummarizeThreadSchema,
  render: ({ args, status, result }) => {
    return (
      <Card className="p-4 my-2 border-l-4 border-l-green-500">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-green-500" />
          <span className="font-semibold">Thread Summary</span>
          {status === "streaming" && <Badge>Analyzing</Badge>}
        </div>
        
        {result && (
          <div className="space-y-3 mt-3">
            <div className="text-sm">{result.summary}</div>
            
            {result.actionItems && result.actionItems.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground">Action Items:</div>
                {result.actionItems.map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
            
            {result.participants && (
              <div className="flex gap-2 items-center text-xs text-muted-foreground">
                <span>Participants:</span>
                {result.participants.map((p: string) => (
                  <Badge key={p} variant="outline" className="text-xs">
                    {p}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    )
  }
})

// Compose all tool UIs
export const emailToolUIs = [
  SendEmailToolUI,
  SearchEmailsToolUI,
  CategorizeEmailToolUI,
  SummarizeThreadToolUI
]