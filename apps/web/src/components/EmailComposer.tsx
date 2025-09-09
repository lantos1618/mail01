"use client"

import { useState, useCallback } from "react"
import { useAssistantRuntime } from "@assistant-ui/react"
import { Button } from "@/components/ui/button"
import { 
  Send, 
  Sparkles, 
  FileText, 
  Zap, 
  MessageSquare,
  Plus,
  X
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface EmailComposerProps {
  onSend?: (email: { to: string; subject: string; body: string }) => void
  replyTo?: string
  defaultTo?: string
}

export default function EmailComposer({ onSend, replyTo, defaultTo = "" }: EmailComposerProps) {
  const [to, setTo] = useState(defaultTo)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [bulletPoints, setBulletPoints] = useState<string[]>([])
  const [currentBullet, setCurrentBullet] = useState("")
  const [tone, setTone] = useState<'formal' | 'casual' | 'friendly' | 'professional'>('professional')
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  
  const assistant = useAssistantRuntime()

  const generateFromBullets = useCallback(async () => {
    if (bulletPoints.length === 0) return
    
    setIsGenerating(true)
    try {
      // In v0.11.0, use thread runtime for sending messages
      const thread = assistant.thread
      if (thread) {
        thread.append({
          role: "user",
          content: [{ 
            type: "text", 
            text: `Compose an email to ${to} with these points: ${bulletPoints.join(', ')}. Use a ${tone} tone.` 
          }]
        })
      }
      
      // The response will be handled through the assistant's streaming
    } catch (error) {
      console.error('Failed to generate email:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [bulletPoints, to, tone, assistant])

  const improveEmail = useCallback(async () => {
    if (!body) return
    
    setIsGenerating(true)
    try {
      // In v0.11.0, use thread runtime for sending messages
      const thread = assistant.thread
      if (thread) {
        thread.append({
          role: "user",
          content: [{ 
            type: "text", 
            text: `Improve this email draft for clarity and ${tone} tone: "${body}"` 
          }]
        })
      }
    } catch (error) {
      console.error('Failed to improve email:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [body, tone, assistant])

  const generateReply = useCallback(async () => {
    if (!replyTo) return
    
    setIsGenerating(true)
    try {
      // In v0.11.0, use thread runtime for sending messages
      const thread = assistant.thread
      if (thread) {
        thread.append({
          role: "user",
          content: [{ 
            type: "text", 
            text: `Generate a ${tone} reply to this email: "${replyTo}"` 
          }]
        })
      }
    } catch (error) {
      console.error('Failed to generate reply:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [replyTo, tone, assistant])

  const addBulletPoint = () => {
    if (currentBullet.trim()) {
      setBulletPoints([...bulletPoints, currentBullet])
      setCurrentBullet("")
    }
  }

  const removeBulletPoint = (index: number) => {
    setBulletPoints(bulletPoints.filter((_, i) => i !== index))
  }

  const handleSend = () => {
    if (onSend && to && subject && body) {
      onSend({ to, subject, body })
      // Clear form after sending
      setTo("")
      setSubject("")
      setBody("")
      setBulletPoints([])
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Compose Email
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* To Field */}
        <div>
          <label className="text-sm font-medium mb-1 block">To</label>
          <Input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            className="w-full"
          />
        </div>

        {/* Subject Field */}
        <div>
          <label className="text-sm font-medium mb-1 block">Subject</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject..."
            className="w-full"
          />
        </div>

        {/* Tone Selector */}
        <div>
          <label className="text-sm font-medium mb-2 block">Tone</label>
          <div className="flex gap-2">
            {(['formal', 'casual', 'friendly', 'professional'] as const).map((t) => (
              <Badge
                key={t}
                variant={tone === t ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTone(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Bullet Points */}
        <div>
          <label className="text-sm font-medium mb-2 block">Key Points</label>
          <div className="space-y-2">
            {bulletPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <span className="flex-1 text-sm">{point}</span>
                <button
                  onClick={() => removeBulletPoint(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={currentBullet}
                onChange={(e) => setCurrentBullet(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addBulletPoint()}
                placeholder="Add a key point..."
                className="flex-1"
              />
              <Button onClick={addBulletPoint} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* AI Actions */}
        <div className="flex gap-2">
          {bulletPoints.length > 0 && (
            <Button
              onClick={generateFromBullets}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate from Points
            </Button>
          )}
          {replyTo && (
            <Button
              onClick={generateReply}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Generate Reply
            </Button>
          )}
          {body && (
            <Button
              onClick={improveEmail}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Improve Draft
            </Button>
          )}
        </div>

        {/* Email Body */}
        <div>
          <label className="text-sm font-medium mb-1 block">Message</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your message here..."
            className="w-full min-h-[200px]"
          />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Suggestions</label>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-sm cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  onClick={() => setBody(body + "\n" + suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>
        <Button 
          onClick={handleSend}
          disabled={!to || !subject || !body}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Email
        </Button>
      </div>
    </div>
  )
}