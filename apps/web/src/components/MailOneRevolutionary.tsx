"use client"

import { Thread, Composer, AssistantModal, ThreadMessages, BranchPicker, ThreadSuggestion } from "@assistant-ui/react"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mail, Send, Inbox, Archive, Trash, Star, Clock, Bot, Brain, Mic, BarChart3,
  Sparkles, Zap, Users, Calendar, FileText, Search, Settings, Plus, CheckSquare,
  TrendingUp, AlertCircle, MessageSquare, Layers, Globe, Shield, Cpu
} from "lucide-react"
import { RevolutionaryAssistantProvider } from "@/lib/assistant/runtime-revolutionary"

// AI-Powered Email List with Smart Categorization
function SmartInbox({ onSelectEmail }: { onSelectEmail: (email: any) => void }) {
  const [emails, setEmails] = useState([
    {
      id: "1",
      subject: "Q4 Budget Review - Urgent",
      sender: "CFO",
      preview: "Please review the attached budget proposal for Q4...",
      time: "2 min ago",
      category: "urgent",
      sentiment: "neutral",
      priority: 10,
      hasAttachment: true,
      aiSummary: "Budget approval needed for Q4 marketing spend increase",
    },
    {
      id: "2",
      subject: "Team Meeting Tomorrow",
      sender: "Manager",
      preview: "Don't forget about our team sync tomorrow at 10 AM...",
      time: "1 hour ago",
      category: "meetings",
      sentiment: "positive",
      priority: 8,
      hasAttachment: false,
      aiSummary: "Team sync meeting reminder with agenda items",
    },
  ])

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      urgent: "bg-red-100 text-red-800",
      meetings: "bg-blue-100 text-blue-800",
      newsletters: "bg-green-100 text-green-800",
      social: "bg-purple-100 text-purple-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <h2 className="text-xl font-bold mb-2">Smart Inbox</h2>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-white/20 text-white">
            <TrendingUp className="w-3 h-3 mr-1" />
            15% less emails today
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Avg response: 2.5h
          </Badge>
        </div>
      </div>

      <div className="divide-y">
        {emails.map((email) => (
          <div
            key={email.id}
            onClick={() => onSelectEmail(email)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{email.sender}</span>
                  {email.priority > 8 && (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  {email.hasAttachment && (
                    <FileText className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <h3 className="font-medium text-gray-900">{email.subject}</h3>
                <p className="text-sm text-gray-600 mt-1">{email.preview}</p>
                
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  AI: {email.aiSummary}
                </div>
              </div>
              <div className="text-right ml-4">
                <span className="text-xs text-gray-500">{email.time}</span>
                <div className="mt-2">
                  <Badge className={getCategoryColor(email.category)}>
                    {email.category}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Conversational Email Interface
function ConversationalEmail() {
  const [mode, setMode] = useState<"chat" | "compose" | "agent">("chat")
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* Mode Selector */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={mode === "chat" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("chat")}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Chat
            </Button>
            <Button
              variant={mode === "compose" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("compose")}
            >
              <Mail className="w-4 h-4 mr-1" />
              Compose
            </Button>
            <Button
              variant={mode === "agent" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("agent")}
            >
              <Bot className="w-4 h-4 mr-1" />
              Agent
            </Button>
          </div>
          <Button
            variant={voiceEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Thread */}
      <div className="flex-1 overflow-hidden">
        <Thread>
          <ThreadMessages />
          <ThreadSuggestion
            prompt="Show me urgent emails from this week"
            method="replace"
          />
          <ThreadSuggestion
            prompt="Draft a response to the budget review email"
            method="replace"
          />
          <ThreadSuggestion
            prompt="Summarize all meeting requests"
            method="replace"
          />
          <ThreadSuggestion
            prompt="What's my email productivity score?"
            method="replace"
          />
        </Thread>
      </div>

      {/* Enhanced Composer */}
      <div className="border-t p-4 bg-white">
        <div className="mb-2 flex gap-2">
          <Button variant="outline" size="sm">
            <Brain className="w-4 h-4 mr-1" />
            Smart Compose
          </Button>
          <Button variant="outline" size="sm">
            <Zap className="w-4 h-4 mr-1" />
            Quick Reply
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-1" />
            Schedule
          </Button>
        </div>
        <Composer placeholder="Ask me anything about your emails or tell me what to do..." />
      </div>
    </div>
  )
}

// Analytics Dashboard
function EmailAnalytics() {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-purple-600" />
        Email Intelligence
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">87%</div>
          <div className="text-sm text-gray-600">Response Rate</div>
        </div>
        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">2.3h</div>
          <div className="text-sm text-gray-600">Avg Response Time</div>
        </div>
        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">142</div>
          <div className="text-sm text-gray-600">Emails Processed</div>
        </div>
        <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">24</div>
          <div className="text-sm text-gray-600">AI Automations</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium mb-2">Top Contacts</div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>john@company.com</span>
            <span className="text-gray-500">45 emails</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>sarah@client.com</span>
            <span className="text-gray-500">32 emails</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

// AI Agent Control Panel
function AgentControlPanel() {
  const [agents, setAgents] = useState([
    { id: "inbox-manager", name: "Inbox Manager", status: "active", tasks: 24 },
    { id: "meeting-scheduler", name: "Meeting Scheduler", status: "active", tasks: 5 },
    { id: "follow-up", name: "Follow-up Bot", status: "paused", tasks: 12 },
    { id: "newsletter", name: "Newsletter Filter", status: "active", tasks: 8 },
  ])

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Bot className="w-5 h-5 text-indigo-600" />
        AI Agents
      </h3>
      
      <div className="space-y-3">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                agent.status === "active" ? "bg-green-500" : "bg-yellow-500"
              }`} />
              <div>
                <div className="font-medium text-sm">{agent.name}</div>
                <div className="text-xs text-gray-500">{agent.tasks} tasks completed</div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <Button className="w-full mt-4" variant="outline">
        <Plus className="w-4 h-4 mr-1" />
        Create Custom Agent
      </Button>
    </Card>
  )
}

// Main Revolutionary Email Client
export default function MailOneRevolutionary() {
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("inbox")

  return (
    <RevolutionaryAssistantProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mail-01
            </h1>
            <p className="text-xs text-gray-500 mt-1">AI-Powered Email Revolution</p>
          </div>
          
          <div className="flex-1 p-4">
            <div className="space-y-1">
              <Button
                variant={activeTab === "inbox" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("inbox")}
              >
                <Inbox className="w-4 h-4 mr-2" />
                Smart Inbox
                <Badge className="ml-auto" variant="secondary">12</Badge>
              </Button>
              <Button
                variant={activeTab === "compose" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("compose")}
              >
                <Send className="w-4 h-4 mr-2" />
                Compose
              </Button>
              <Button
                variant={activeTab === "analytics" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("analytics")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button
                variant={activeTab === "agents" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("agents")}
              >
                <Bot className="w-4 h-4 mr-2" />
                AI Agents
              </Button>
            </div>
          </div>

          <div className="p-4 border-t">
            <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">AI Status</span>
              </div>
              <div className="text-xs text-gray-600">
                4 agents active • 142 emails processed
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Email List */}
          <div className="w-96 border-r bg-white">
            {activeTab === "inbox" && <SmartInbox onSelectEmail={setSelectedEmail} />}
            {activeTab === "analytics" && (
              <div className="p-4">
                <EmailAnalytics />
              </div>
            )}
            {activeTab === "agents" && (
              <div className="p-4">
                <AgentControlPanel />
              </div>
            )}
          </div>

          {/* Conversational Interface */}
          <div className="flex-1">
            <ConversationalEmail />
          </div>
        </div>

        {/* Floating Assistant Modal */}
        <AssistantModal />
      </div>
    </RevolutionaryAssistantProvider>
  )
}