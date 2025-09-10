"use client"

import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react"
import { ReactNode } from "react"

export function AssistantProvider({ children }: { children: ReactNode }) {
  const runtime = useLocalRuntime({
    run: async ({ messages }) => {
      // Simple local runtime for basic chat functionality
      const lastMessage = messages[messages.length - 1]
      
      if (!lastMessage || lastMessage.role !== 'user') {
        return {
          content: [{
            type: "text",
            text: "Hello! I'm your email assistant. How can I help you today?"
          }]
        }
      }
      
      return {
        content: [{
          type: "text",
          text: "I'm processing your request. This is a basic response."
        }]
      }
    }
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}