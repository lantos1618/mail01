"use client"

import { Thread, ThreadList, AssistantModal, Composer } from "@assistant-ui/react-ui"
import { useState, useCallback } from "react"
import EmailList from "./EmailList"
import EmailView from "./EmailView"
import EmailComposer from "./EmailComposer"
import { Button } from "@/components/ui/button"
import { Sparkles, Mail, Search, Calendar, CheckSquare, Plus, Inbox, Archive } from "lucide-react"

export default function EmailAssistant() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [showAssistant, setShowAssistant] = useState(true)
  const [aiMode, setAiMode] = useState<'chat' | 'compose' | 'analyze'>('chat')
  const [showComposer, setShowComposer] = useState(false)
  const [currentFolder, setCurrentFolder] = useState<'received' | 'sent' | 'drafts' | 'archived'>('received')

  return (
    <div className="flex w-full h-full">
      {/* Email List Sidebar */}
      <div className="w-80 border-r bg-gray-50 dark:bg-gray-900">
        <div className="p-4 border-b">
          <Button 
            onClick={() => setShowComposer(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Compose
          </Button>
          
          <div className="mt-4 space-y-1">
            <button
              onClick={() => setCurrentFolder('received')}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${
                currentFolder === 'received' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Inbox className="w-4 h-4 mr-2" />
              Inbox
            </button>
            <button
              onClick={() => setCurrentFolder('sent')}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${
                currentFolder === 'sent' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Sent
            </button>
            <button
              onClick={() => setCurrentFolder('drafts')}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${
                currentFolder === 'drafts' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Drafts
            </button>
            <button
              onClick={() => setCurrentFolder('archived')}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm ${
                currentFolder === 'archived' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Archive className="w-4 h-4 mr-2" />
              Archived
            </button>
          </div>
        </div>
        <EmailList 
          onSelectEmail={setSelectedEmail} 
          folder={currentFolder}
        />
      </div>

      {/* Email View or Composer */}
      <div className="flex-1 flex">
        <div className="flex-1">
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
                  message: "Hi! I'm your AI email assistant powered by assistant-ui. I can help you:\n\n• 📧 Compose and reply to emails\n• 📊 Analyze email patterns and sentiment\n• 🔍 Search emails with natural language\n• 📅 Extract meetings and tasks\n• 🎯 Prioritize your inbox\n• 🤖 Automate email workflows\n\nHow can I help you today?",
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}