"use client"

import { AssistantRuntimeProvider } from "@assistant-ui/react"
import { useVercelUseChatRuntime } from "@assistant-ui/react-ai-sdk"
import { useChat } from "ai/react"
import EmailAssistant from "@/components/EmailAssistant"

export default function Home() {
  const chat = useChat({
    api: "/api/assistant",
  })
  
  const runtime = useVercelUseChatRuntime(chat)

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <main className="flex h-screen">
        <EmailAssistant />
      </main>
    </AssistantRuntimeProvider>
  )
}