"use client"

import { Thread, ThreadList, AssistantModal } from "@assistant-ui/react"
import { useState, useCallback } from "react"
import EmailList from "./EmailList"
import EmailView from "./EmailView"
import { Button } from "@/components/ui/button"
import { Sparkles, Mail, Search, Calendar, CheckSquare } from "lucide-react"

export default function EmailAssistant() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [showAssistant, setShowAssistant] = useState(true)
  const [aiMode, setAiMode] = useState<'chat' | 'compose' | 'analyze'>('chat')

  return (
    <div className="flex w-full h-full">
      {/* Email List Sidebar */}
      <div className="w-80 border-r bg-gray-50 dark:bg-gray-900">
        <EmailList onSelectEmail={setSelectedEmail} />
      </div>

      {/* Email View */}
      <div className="flex-1 flex">
        <div className="flex-1">
          <EmailView emailId={selectedEmail} />
        </div>

        {/* AI Assistant Chat */}
        <div className="w-96 border-l bg-white dark:bg-gray-950">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <p className="text-sm text-gray-500">Ask me anything about your emails</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <Thread 
                welcome={{
                  message: "Hi! I'm your AI email assistant powered by assistant-ui. I can help you:
\n• 📧 Compose and reply to emails
• 📊 Analyze email patterns and sentiment
• 🔍 Search emails with natural language
• 📅 Extract meetings and tasks
• 🎯 Prioritize your inbox
• 🤖 Automate email workflows\n\nHow can I help you today?",
                  suggestions: [
                    {
                      prompt: "Analyze sentiment and priority of my unread emails",
                      text: "📊 Analyze unread"
                    },
                    {
                      prompt: "Draft a professional response to the selected email",
                      text: "✍️ Draft reply"
                    },
                    {
                      prompt: "Extract all action items and meetings from today's emails",
                      text: "📅 Extract tasks"
                    },
                    {
                      prompt: "Show emails that need urgent response",
                      text: "🚨 Urgent emails"
                    },
                    {
                      prompt: "Summarize long email threads",
                      text: "📝 Summarize threads"
                    },
                    {
                      prompt: "Help me write a follow-up email",
                      text: "📮 Write follow-up"
                    }
                  ]
                }}
                config={{
                  runtime: {
                    adapters: {
                      attachments: true,
                      feedback: true
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}