"use client"

import { 
  Thread, 
  Composer, 
  BranchPicker
} from "@assistant-ui/react-ui"
// ThreadMessages, AssistantMessage, UserMessage, ThreadWelcome, ThreadSuggestion 
// are not available in @assistant-ui/react-ui v0.11.0
import { 
  useAssistantRuntime,
  useThreadRuntime
} from "@assistant-ui/react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, Loader2, Zap, Brain, MessageSquare, 
  TrendingUp, AlertCircle, CheckCircle2, Clock,
  Mail, Send, Archive, Star, Reply, Forward,
  FileText, Image, Paperclip, Mic, Video,
  Shield, Lock, Eye, EyeOff, Bot, Users,
  BarChart3, Calendar, Trash
} from "lucide-react"
import { emailToolUIs } from "@/lib/assistant/tool-ui"
import { useEmailFrame } from "@/lib/assistant/frame-api"
import { EmailDashboard, EmailWorkflow, PriorityInbox } from "@/lib/assistant/generative-ui"
import { useEmailThreadList, useSyncStatus } from "@/lib/assistant/cloud-persistence"

interface EmailStream {
  id: string
  type: "incoming" | "outgoing" | "draft" | "analysis"
  subject: string
  from: string
  to: string
  timestamp: Date
  priority: "urgent" | "high" | "normal" | "low"
  category: string
  sentiment: "positive" | "neutral" | "negative"
  content: string
  aiProcessing?: {
    status: "pending" | "processing" | "complete"
    summary?: string
    actionItems?: string[]
    suggestedResponse?: string
    relatedEmails?: string[]
    insights?: string[]
  }
  attachments?: Array<{
    name: string
    type: string
    size: number
  }>
}

// Real-time Email Stream Component
function EmailStreamViewer({ streams }: { streams: EmailStream[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [streams])
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600 bg-red-50"
      case "high": return "text-orange-600 bg-orange-50"
      case "normal": return "text-blue-600 bg-blue-50"
      case "low": return "text-gray-600 bg-gray-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }
  
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "negative": return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />
    }
  }
  
  return (
    <div ref={scrollRef} className="space-y-3 max-h-[600px] overflow-y-auto p-4">
      {streams.map((stream) => (
        <Card key={stream.id} className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-sm">{stream.subject}</span>
              {stream.aiProcessing?.status === "processing" && (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {getSentimentIcon(stream.sentiment)}
              <Badge className={getPriorityColor(stream.priority)}>
                {stream.priority}
              </Badge>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mb-2">
            From: {stream.from} → To: {stream.to}
          </div>
          
          <div className="text-sm text-gray-700 mb-3 line-clamp-2">
            {stream.content}
          </div>
          
          {stream.aiProcessing?.status === "complete" && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium">AI Analysis</span>
              </div>
              
              {stream.aiProcessing.summary && (
                <p className="text-xs text-gray-700 mb-2">{stream.aiProcessing.summary}</p>
              )}
              
              {stream.aiProcessing.actionItems && stream.aiProcessing.actionItems.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-medium">Action Items:</span>
                  {stream.aiProcessing.actionItems.map((item, idx) => (
                    <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {item}
                    </div>
                  ))}
                </div>
              )}
              
              {stream.aiProcessing.suggestedResponse && (
                <Button size="sm" variant="outline" className="mt-2 text-xs">
                  <Reply className="w-3 h-3 mr-1" />
                  Use Suggested Response
                </Button>
              )}
            </div>
          )}
          
          {stream.attachments && stream.attachments.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Paperclip className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">
                {stream.attachments.length} attachment(s)
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">
              {stream.timestamp.toLocaleTimeString()}
            </span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-7 px-2">
                <Star className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2">
                <Archive className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2">
                <Reply className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// AI Email Intelligence Dashboard
function EmailIntelligenceDashboard() {
  const [metrics, setMetrics] = useState({
    totalEmails: 1247,
    unread: 23,
    flagged: 8,
    responseTime: "1.2h avg",
    sentimentScore: 72,
    productivityScore: 85,
  })
  
  const [insights, setInsights] = useState([
    { icon: TrendingUp, text: "Email volume up 15% this week", color: "text-green-600" },
    { icon: Clock, text: "Best response time: 9-11 AM", color: "text-blue-600" },
    { icon: Users, text: "Top sender: product-team@", color: "text-purple-600" },
    { icon: Zap, text: "12 emails need urgent response", color: "text-orange-600" },
  ])
  
  return (
    <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          Email Intelligence
        </h3>
        <Badge variant="outline" className="bg-white">
          Live
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600">{metrics.totalEmails}</div>
          <div className="text-xs text-gray-600">Total Emails</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{metrics.unread}</div>
          <div className="text-xs text-gray-600">Unread</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{metrics.productivityScore}%</div>
          <div className="text-xs text-gray-600">Productivity</div>
        </div>
      </div>
      
      <div className="space-y-2">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <insight.icon className={`w-4 h-4 ${insight.color}`} />
            <span className="text-gray-700">{insight.text}</span>
          </div>
        ))}
      </div>
      
      <Button className="w-full mt-4" variant="outline">
        <Sparkles className="w-4 h-4 mr-2" />
        Generate Weekly Report
      </Button>
    </Card>
  )
}

// Multi-modal Email Composer
function MultiModalComposer() {
  const [mode, setMode] = useState<"text" | "voice" | "video" | "draw">("text")
  const [isRecording, setIsRecording] = useState(false)
  const [attachments, setAttachments] = useState<any[]>([])
  
  const handleVoiceInput = useCallback(() => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Start voice recording
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          // Handle audio stream
          setTimeout(() => {
            setIsRecording(false)
            // Simulate transcription
            console.log("Voice transcribed to text")
          }, 3000)
        })
        .catch(err => console.error("Microphone access denied:", err))
    }
  }, [isRecording])
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Compose Email</h3>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={mode === "text" ? "default" : "ghost"}
            onClick={() => setMode("text")}
          >
            <FileText className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={mode === "voice" ? "default" : "ghost"}
            onClick={() => setMode("voice")}
          >
            <Mic className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={mode === "video" ? "default" : "ghost"}
            onClick={() => setMode("video")}
          >
            <Video className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={mode === "draw" ? "default" : "ghost"}
            onClick={() => setMode("draw")}
          >
            <Image className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {mode === "text" && (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="To..."
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="Subject..."
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <textarea
            placeholder="Type your message or let AI help you compose..."
            className="w-full px-3 py-2 border rounded-lg text-sm h-32 resize-none"
          />
        </div>
      )}
      
      {mode === "voice" && (
        <div className="flex flex-col items-center justify-center py-8">
          <Button
            size="lg"
            variant={isRecording ? "destructive" : "default"}
            onClick={handleVoiceInput}
            className="rounded-full w-20 h-20"
          >
            {isRecording ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </Button>
          <p className="text-sm text-gray-600 mt-3">
            {isRecording ? "Recording... Speak now" : "Click to start voice input"}
          </p>
        </div>
      )}
      
      {mode === "video" && (
        <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg">
          <Video className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">Video messages coming soon</p>
        </div>
      )}
      
      {mode === "draw" && (
        <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg">
          <Image className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600">Draw & annotate coming soon</p>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Bot className="w-4 h-4 mr-1" />
            AI Enhance
          </Button>
        </div>
        <Button size="sm">
          <Send className="w-4 h-4 mr-1" />
          Send
        </Button>
      </div>
    </Card>
  )
}

// Helper component for streaming content
function EmailStreamingContent({ mode, setMode, suggestions }: any) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Email Stream</h2>
        <div className="flex gap-2">
          <Button
            variant={mode === "stream" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("stream")}
          >
            Stream
          </Button>
          <Button
            variant={mode === "compose" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("compose")}
          >
            Compose
          </Button>
          <Button
            variant={mode === "analyze" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("analyze")}
          >
            Analyze
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {/* Content based on mode */}
      </div>
    </div>
  )
}

// Enhanced Streaming Assistant with Cloud Persistence
function EnhancedStreamingAssistant() {
  // These hooks would need proper implementation from assistant-ui
  // For now, using placeholder implementations
  const assistant = { status: 'idle' } as any
  const thread = { switchToThread: (id: string) => {} } as any
  const { frame, connected } = useEmailFrame()
  const syncStatus = useSyncStatus()
  const threadList = useEmailThreadList()
  
  const [mode, setMode] = useState<"stream" | "compose" | "analyze">("stream")
  
  // AI-powered suggestions
  const suggestions = [
    { text: "Summarize unread emails", icon: FileText },
    { text: "Show priority inbox", icon: AlertCircle },
    { text: "Draft responses", icon: Reply },
    { text: "Analyze patterns", icon: BarChart3 }
  ]
  
  return (
    <div className="flex h-full">
      {/* Enhanced Thread Sidebar */}
      <div className="w-80 border-r bg-white/50 dark:bg-black/20">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Email Threads</h2>
            <div className="flex items-center gap-1">
              {syncStatus.syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              )}
              <span className="text-xs text-muted-foreground">
                {syncStatus.syncing ? "Syncing" : "Synced"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-4 space-y-2 overflow-y-auto">
          {threadList.threads.map((t: any) => (
            <Card 
              key={t.id}
              className="p-3 cursor-pointer hover:shadow-md"
              onClick={() => thread.switchToThread(t.id)}
            >
              <div className="font-medium text-sm">{t.title}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(t.updatedAt).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        <EmailStreamingContent mode={mode} setMode={setMode} suggestions={suggestions} />
      </div>
    </div>
  )
}

// Main Streaming Assistant Component
export default function EmailStreamingAssistant() {
  const [emailStreams, setEmailStreams] = useState<EmailStream[]>([])
  const [isLiveMode, setIsLiveMode] = useState(true)
  
  // Simulate real-time email streaming
  useEffect(() => {
    if (!isLiveMode) return
    
    const generateRandomEmail = (): EmailStream => {
      const subjects = [
        "Q4 Budget Review - Urgent",
        "Team Meeting Tomorrow at 3 PM",
        "New Feature Request from Customer",
        "Weekly Status Update",
        "Invoice #12345 - Payment Due",
      ]
      
      const senders = [
        "ceo@company.com",
        "team@product.com",
        "support@customer.com",
        "hr@company.com",
        "finance@company.com",
      ]
      
      const priorities: EmailStream["priority"][] = ["urgent", "high", "normal", "low"]
      const sentiments: EmailStream["sentiment"][] = ["positive", "neutral", "negative"]
      
      const email: EmailStream = {
        id: `email_${Date.now()}_${Math.random()}`,
        type: Math.random() > 0.5 ? "incoming" : "outgoing",
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        from: senders[Math.floor(Math.random() * senders.length)],
        to: "you@company.com",
        timestamp: new Date(),
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        category: ["Work", "Personal", "Newsletter", "Promotional"][Math.floor(Math.random() * 4)],
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
        content: "This is an important email that requires your attention. Please review and respond accordingly.",
        aiProcessing: {
          status: "pending",
        },
      }
      
      // Simulate AI processing
      setTimeout(() => {
        setEmailStreams(prev => prev.map(e => 
          e.id === email.id 
            ? {
                ...e,
                aiProcessing: {
                  status: "processing",
                },
              }
            : e
        ))
        
        setTimeout(() => {
          setEmailStreams(prev => prev.map(e => 
            e.id === email.id 
              ? {
                  ...e,
                  aiProcessing: {
                    status: "complete",
                    summary: "This email discusses important business matters that need immediate attention.",
                    actionItems: [
                      "Review attached document",
                      "Provide feedback by EOD",
                      "Schedule follow-up meeting",
                    ],
                    suggestedResponse: "Thank you for bringing this to my attention. I'll review and get back to you shortly.",
                    insights: [
                      "Sender typically expects response within 2 hours",
                      "Similar emails in the past required 30 min to resolve",
                    ],
                  },
                }
              : e
          ))
        }, 2000)
      }, 1000)
      
      return email
    }
    
    // Add initial emails
    const initialEmails = Array.from({ length: 3 }, generateRandomEmail)
    setEmailStreams(initialEmails)
    
    // Stream new emails periodically
    const interval = setInterval(() => {
      setEmailStreams(prev => [generateRandomEmail(), ...prev].slice(0, 10))
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isLiveMode])
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-8 h-8 text-blue-600" />
            Mail-01 Streaming Assistant
          </h1>
          <div className="flex items-center gap-3">
            <Badge 
              variant={isLiveMode ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setIsLiveMode(!isLiveMode)}
            >
              {isLiveMode ? (
                <>
                  <Zap className="w-3 h-3 mr-1" />
                  Live Mode
                </>
              ) : (
                "Paused"
              )}
            </Badge>
            <Button variant="outline" size="sm">
              <Shield className="w-4 h-4 mr-1" />
              Privacy Mode
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Email Stream</h2>
              <Badge variant="outline">
                {emailStreams.length} emails
              </Badge>
            </div>
            <EmailStreamViewer streams={emailStreams} />
          </Card>
          
          <MultiModalComposer />
        </div>
        
        <div className="space-y-4">
          <EmailIntelligenceDashboard />
          
          <Card className="p-4">
            <Thread>
              <div className="mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-600" />
                  AI Assistant
                </h3>
                <BranchPicker />
              </div>
              {/* ThreadWelcome and ThreadSuggestion components would be here if available */}
              <div className="text-center space-y-3 p-4">
                <Sparkles className="w-8 h-8 text-purple-500 mx-auto" />
                <p className="text-sm text-muted-foreground">AI-powered email assistant</p>
                <div className="grid grid-cols-2 gap-2">
                  <button className="text-xs p-2 border rounded hover:bg-muted">Summarize emails</button>
                  <button className="text-xs p-2 border rounded hover:bg-muted">Find important</button>
                  <button className="text-xs p-2 border rounded hover:bg-muted">Draft reply</button>
                  <button className="text-xs p-2 border rounded hover:bg-muted">Schedule send</button>
                </div>
              </div>
              {/* ThreadMessages component would be here if available */}
              <div 
                className="h-[300px] overflow-y-auto p-4">
                {/* Messages would appear here */}
              </div>
              {/*components={{
                  ...emailToolUIs,
                  EmailDashboard,
                  EmailWorkflow,
                  PriorityInbox
                }}*/}
              <Composer 
                placeholder="Ask me anything about your emails..."
              />
            </Thread>
          </Card>
        </div>
      </div>
    </div>
  )
}