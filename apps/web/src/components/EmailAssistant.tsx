"use client"

import { Thread } from "@assistant-ui/react"
import { useState } from "react"
import EmailList from "./EmailList"
import EmailView from "./EmailView"

export default function EmailAssistant() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)

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
                  message: "Hi! I'm your email assistant. I can help you compose emails, summarize threads, search your inbox, and manage your email tasks. How can I help you today?",
                  suggestions: [
                    {
                      prompt: "Summarize my unread emails",
                      text: "Summarize unread"
                    },
                    {
                      prompt: "Compose a professional email",
                      text: "Compose email"
                    },
                    {
                      prompt: "Show important emails from this week",
                      text: "Important this week"
                    },
                    {
                      prompt: "Help me organize my inbox",
                      text: "Organize inbox"
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