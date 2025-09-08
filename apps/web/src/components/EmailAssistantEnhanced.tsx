"use client"

import { Thread, Composer, AssistantModal, BranchPicker, ThreadMessages, ThreadSuggestion } from "@assistant-ui/react"
import { useState, useCallback } from "react"
import EmailList from "./EmailList"
import EmailView from "./EmailView"
import EmailComposer from "./EmailComposer"
import { Button } from "@/components/ui/button"
import { 
  Sparkles, Mail, Search, Calendar, CheckSquare, Plus, 
  Inbox, Archive, Send, Bot, Mic, BarChart3, Users,
  Zap, Brain, FileText, MessageSquare, PenTool
} from "lucide-react"
import { AssistantProvider } from "@/lib/assistant/runtime"

// Email Agent Panel - for autonomous email handling
function EmailAgentPanel() {
  const [agentEnabled, setAgentEnabled] = useState(false)
  const [rules, setRules] = useState([
    { id: 1, name: "Auto-reply to meeting requests", enabled: true },
    { id: 2, name: "Categorize newsletters", enabled: true },
    { id: 3, name: "Flag urgent emails", enabled: true },
    { id: 4, name: "Draft responses for approval", enabled: false },
  ])

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold">Email Agent</h3>
        </div>
        <Button 
          variant={agentEnabled ? "default" : "outline"}
          size="sm"
          onClick={() => setAgentEnabled(!agentEnabled)}
        >
          {agentEnabled ? "Active" : "Inactive"}
        </Button>
      </div>
      
      <div className="space-y-2">
        {rules.map(rule => (
          <label key={rule.id} className="flex items-center gap-2 text-sm cursor-pointer">
            <input 
              type="checkbox" 
              checked={rule.enabled}
              onChange={() => {
                setRules(rules.map(r => 
                  r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                ))
              }}
              className="rounded"
            />
            <span className={rule.enabled ? "" : "text-gray-500"}>{rule.name}</span>
          </label>
        ))}
      </div>
      
      <Button variant="outline" size="sm" className="mt-3 w-full">
        <Plus className="w-4 h-4 mr-1" />
        Add Custom Rule
      </Button>
    </div>
  )
}

// Quick Actions Bar
function QuickActionsBar({ onAction }: { onAction: (action: string) => void }) {
  const actions = [
    { icon: Brain, label: "Analyze Inbox", action: "analyze" },
    { icon: PenTool, label: "Smart Compose", action: "compose" },
    { icon: MessageSquare, label: "Generate Replies", action: "replies" },
    { icon: FileText, label: "Summarize Threads", action: "summarize" },
    { icon: BarChart3, label: "Email Analytics", action: "analytics" },
    { icon: Users, label: "Relationship Map", action: "relationships" },
  ]

  return (
    <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-b">
      <div className="flex items-center gap-2 overflow-x-auto">
        {actions.map(({ icon: Icon, label, action }) => (
          <Button
            key={action}
            variant="ghost"
            size="sm"
            onClick={() => onAction(action)}
            className="flex items-center gap-1 whitespace-nowrap hover:bg-white/50 dark:hover:bg-white/10"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}

// Voice Input Component
function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false)

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Start recording logic
      setTimeout(() => {
        onTranscript("This is a simulated voice transcript. In production, this would use Web Speech API or a service like Whisper.")
        setIsRecording(false)
      }, 2000)
    }
  }

  return (
    <Button
      variant={isRecording ? "destructive" : "outline"}
      size="icon"
      onClick={toggleRecording}
      className={isRecording ? "animate-pulse" : ""}
    >
      <Mic className={`w-4 h-4 ${isRecording ? "animate-pulse" : ""}`} />
    </Button>
  )
}

export default function EmailAssistantEnhanced() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [showComposer, setShowComposer] = useState(false)
  const [currentFolder, setCurrentFolder] = useState<'received' | 'sent' | 'drafts' | 'archived'>('received')
  const [assistantMode, setAssistantMode] = useState<'chat' | 'compose' | 'agent'>('chat')

  const handleQuickAction = useCallback((action: string) => {
    // Handle quick actions by sending them to the assistant
    console.log("Quick action:", action)
  }, [])

  const suggestions = [
    { prompt: "Analyze sentiment and priority of my unread emails", text: "📊 Analyze unread" },
    { prompt: "Draft a professional response to the selected email", text: "✍️ Draft reply" },
    { prompt: "Extract all action items and meetings from today's emails", text: "📅 Extract tasks" },
    { prompt: "Show emails that need urgent response", text: "🚨 Urgent emails" },
    { prompt: "Summarize long email threads", text: "📝 Summarize threads" },
    { prompt: "Create a daily digest of important emails", text: "📰 Daily digest" },
    { prompt: "Analyze my email patterns and suggest improvements", text: "📈 Email insights" },
    { prompt: "Help me achieve inbox zero", text: "🎯 Inbox zero" },
  ]

  const folders = [
    { id: 'received', icon: Inbox, label: 'Inbox', count: 23 },
    { id: 'sent', icon: Send, label: 'Sent', count: 12 },
    { id: 'drafts', icon: Mail, label: 'Drafts', count: 3 },
    { id: 'archived', icon: Archive, label: 'Archived', count: 156 },
  ]

  return (
    <AssistantProvider>
      <div className="flex w-full h-full bg-gray-50 dark:bg-gray-950">
        {/* Enhanced Sidebar */}
        <div className="w-80 border-r bg-white dark:bg-gray-900 flex flex-col">
          <div className="p-4 border-b">
            <Button 
              onClick={() => setShowComposer(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Compose with AI
            </Button>
            
            <div className="mt-4 space-y-1">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setCurrentFolder(folder.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                    currentFolder === folder.id 
                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <folder.icon className="w-4 h-4" />
                    {folder.label}
                  </div>
                  {folder.count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      currentFolder === folder.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {folder.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Email Agent Panel */}
          <div className="p-4 border-b">
            <EmailAgentPanel />
          </div>
          
          {/* Email List */}
          <div className="flex-1 overflow-y-auto">
            <EmailList 
              onSelectEmail={setSelectedEmail} 
              folder={currentFolder}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Quick Actions Bar */}
          <QuickActionsBar onAction={handleQuickAction} />
          
          {/* Email View or Composer */}
          <div className="flex-1 flex">
            <div className="flex-1 bg-white dark:bg-gray-900">
              {showComposer ? (
                <EmailComposer 
                  onSend={() => setShowComposer(false)}
                />
              ) : (
                <EmailView 
                  emailId={selectedEmail}
                  onReply={() => setShowComposer(true)}
                />
              )}
            </div>

            {/* Enhanced AI Assistant Panel */}
            <div className="w-[450px] border-l bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
              <div className="h-full flex flex-col">
                {/* Assistant Header with Mode Switcher */}
                <div className="p-4 border-b bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">Mail-01 AI</h2>
                        <p className="text-xs text-gray-500">Powered by assistant-ui</p>
                      </div>
                    </div>
                    <VoiceInput onTranscript={console.log} />
                  </div>
                  
                  {/* Mode Tabs */}
                  <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {[
                      { id: 'chat', label: 'Chat', icon: MessageSquare },
                      { id: 'compose', label: 'Compose', icon: PenTool },
                      { id: 'agent', label: 'Agent', icon: Bot },
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setAssistantMode(mode.id as any)}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                          assistantMode === mode.id
                            ? 'bg-white dark:bg-gray-700 shadow-sm'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <mode.icon className="w-3.5 h-3.5" />
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Assistant Thread */}
                <div className="flex-1 overflow-hidden">
                  <Thread 
                    welcome={{
                      message: `🚀 Welcome to Mail-01 AI Assistant!

I'm your intelligent email companion powered by cutting-edge AI. I can help you:

**📧 Email Management**
• Compose emails from bullet points or voice
• Generate smart replies with perfect tone
• Improve drafts for clarity and impact

**🧠 Intelligence Features**
• Analyze sentiment and detect urgency
• Extract tasks, meetings, and action items
• Summarize long threads instantly
• Track relationship patterns

**🤖 Automation**
• Set up email agents for auto-handling
• Create smart filters and rules
• Schedule emails for optimal timing
• Achieve inbox zero with AI

**📊 Analytics**
• Email pattern insights
• Communication effectiveness metrics
• Response time optimization

How can I transform your email experience today?`,
                      suggestions: suggestions
                    }}
                    assistantMessage={{
                      components: {
                        Text: ({ text }) => (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            {text}
                          </div>
                        ),
                        ToolUI: ({ tool, args, result }) => (
                          <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium">{tool}</span>
                            </div>
                            {result && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {JSON.stringify(result, null, 2)}
                              </div>
                            )}
                          </div>
                        ),
                      }
                    }}
                  >
                    <ThreadMessages />
                    <div className="flex gap-2 p-4 border-t">
                      <BranchPicker />
                      <Composer 
                        placeholder={
                          assistantMode === 'compose' 
                            ? "Describe the email you want to write..."
                            : assistantMode === 'agent'
                            ? "Set up an email automation rule..."
                            : "Ask me anything about your emails..."
                        }
                      />
                    </div>
                  </Thread>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AssistantProvider>
  )
}