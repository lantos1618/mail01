"use client"

import { AssistantRuntimeProvider } from "@assistant-ui/react"
import { useChatRuntime } from "@assistant-ui/react-ai-sdk"
import { ReactNode } from "react"

export function AssistantProvider({ children }: { children: ReactNode }) {
  const runtime = useChatRuntime({
    api: "/api/assistant",
    initialMessages: [],
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  )
}