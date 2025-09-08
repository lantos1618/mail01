import EmailStreamingAssistant from "@/components/EmailStreamingAssistant"
import VoiceEmailComposer from "@/components/VoiceEmailComposer"
import { EnhancedAssistantProvider } from "@/lib/assistant/runtime-enhanced"

export default function EnhancedMailPage() {
  return (
    <EnhancedAssistantProvider>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <EmailStreamingAssistant />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <VoiceEmailComposer />
        </div>
      </main>
    </EnhancedAssistantProvider>
  )
}