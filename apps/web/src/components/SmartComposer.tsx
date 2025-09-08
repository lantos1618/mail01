"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { streamSmartCompose } from "@/lib/services/emailAIEnhanced"
import { 
  Sparkles, Send, X, Mic, Image, Paperclip, 
  Clock, Users, Hash, Zap, RefreshCw, Check
} from "lucide-react"

interface SmartComposerProps {
  onSend: (email: any) => void
  onClose: () => void
  replyTo?: any
  initialTo?: string
  initialSubject?: string
}

export default function SmartComposer({ 
  onSend, 
  onClose, 
  replyTo,
  initialTo = "",
  initialSubject = ""
}: SmartComposerProps) {
  const [to, setTo] = useState(initialTo || replyTo?.from || "")
  const [subject, setSubject] = useState(
    initialSubject || (replyTo ? `Re: ${replyTo.subject}` : "")
  )
  const [body, setBody] = useState("")
  const [bulletPoints, setBulletPoints] = useState<string[]>([])
  const [currentBullet, setCurrentBullet] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [tone, setTone] = useState<'formal' | 'casual' | 'friendly' | 'professional'>('professional')
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  // Stream compose from bullet points
  const handleSmartCompose = async () => {
    if (bulletPoints.length === 0) return

    setIsStreaming(true)
    setBody("") // Clear existing body

    try {
      const context = replyTo 
        ? `Replying to email from ${replyTo.from}: ${replyTo.content}`
        : `New email to ${to}`

      let fullText = ""
      for await (const chunk of streamSmartCompose(context, bulletPoints, tone)) {
        fullText += chunk
        setBody(fullText)
        
        // Auto-scroll to bottom
        if (bodyRef.current) {
          bodyRef.current.scrollTop = bodyRef.current.scrollHeight
        }
      }
    } catch (error) {
      console.error("Streaming error:", error)
    } finally {
      setIsStreaming(false)
    }
  }

  // Add bullet point
  const addBulletPoint = () => {
    if (currentBullet.trim()) {
      setBulletPoints([...bulletPoints, currentBullet.trim()])
      setCurrentBullet("")
    }
  }

  // Remove bullet point
  const removeBulletPoint = (index: number) => {
    setBulletPoints(bulletPoints.filter((_, i) => i !== index))
  }

  // Generate AI suggestions based on context
  useEffect(() => {
    if (replyTo) {
      // Generate contextual suggestions
      const suggestions = [
        "Thank you for reaching out",
        "I've reviewed your message",
        "I'll get back to you shortly",
        "Please find my response below",
        "I appreciate your patience"
      ]
      setAiSuggestions(suggestions)
    }
  }, [replyTo])

  // Simulate voice recording
  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      setTimeout(() => {
        setCurrentBullet("Schedule a meeting next week to discuss the project timeline")
        setIsRecording(false)
      }, 2000)
    }
  }

  // Handle send
  const handleSend = () => {
    const email = {
      to,
      subject,
      body,
      timestamp: new Date().toISOString(),
      inReplyTo: replyTo?.messageId
    }
    onSend(email)
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Smart Compose</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tone selector */}
        <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-lg">
          {(['professional', 'friendly', 'casual', 'formal'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`flex-1 px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${
                tone === t
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Recipients */}
      <div className="px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 w-12">To:</span>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 px-2 py-1 text-sm bg-transparent border-none outline-none"
            placeholder="recipient@example.com"
          />
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Users className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Subject */}
      <div className="px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 w-12">Subject:</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 px-2 py-1 text-sm bg-transparent border-none outline-none"
            placeholder="Email subject"
          />
        </div>
      </div>

      {/* Bullet Points Section */}
      <div className="px-4 py-3 border-b bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/10 dark:to-purple-950/10">
        <div className="mb-2">
          <h3 className="text-sm font-medium mb-2">Key Points (AI will expand these)</h3>
          
          {/* Bullet points list */}
          {bulletPoints.length > 0 && (
            <div className="space-y-1 mb-2">
              {bulletPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-3.5 h-3.5 text-green-600 mt-0.5" />
                  <span className="flex-1">{point}</span>
                  <button
                    onClick={() => removeBulletPoint(index)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add bullet point input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={currentBullet}
              onChange={(e) => setCurrentBullet(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addBulletPoint()}
              className="flex-1 px-3 py-1.5 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
              placeholder="Add a key point..."
            />
            <Button
              variant="outline"
              size="icon"
              onClick={toggleRecording}
              className={`h-8 w-8 ${isRecording ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
            >
              <Mic className={`w-3.5 h-3.5 ${isRecording ? 'text-red-600 animate-pulse' : ''}`} />
            </Button>
            <Button 
              onClick={addBulletPoint}
              size="sm"
              variant="outline"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Generate button */}
        {bulletPoints.length > 0 && (
          <Button
            onClick={handleSmartCompose}
            disabled={isStreaming}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isStreaming ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Email from Points
              </>
            )}
          </Button>
        )}
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div className="px-4 py-2 border-b">
          <p className="text-xs text-gray-500 mb-1">Quick suggestions:</p>
          <div className="flex flex-wrap gap-1">
            {aiSuggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setBody(body + (body ? '\n\n' : '') + suggestion)}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Email Body */}
      <div className="flex-1 p-4 overflow-y-auto">
        <textarea
          ref={bodyRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full h-full resize-none bg-transparent outline-none"
          placeholder={
            bulletPoints.length > 0 
              ? "Click 'Generate Email' to create content from your bullet points..." 
              : "Write your email or add bullet points above for AI assistance..."
          }
          disabled={isStreaming}
        />
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Image className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Clock className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Hash className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend}
              disabled={!to || !subject || !body}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}