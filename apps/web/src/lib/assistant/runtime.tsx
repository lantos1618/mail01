"use client"

import { AssistantRuntimeProvider } from "@assistant-ui/react"
import { useVercelUseChatRuntime } from "@assistant-ui/react-ai-sdk"
import { useChat } from "ai/react"
import { ReactNode } from "react"

export function AssistantProvider({ children }: { children: ReactNode }) {
  const chat = useChat({
    api: "/api/assistant",
    initialMessages: [],
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  const runtime = useVercelUseChatRuntime(chat)

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}