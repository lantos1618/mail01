"use client"

import { useState, useCallback } from "react"
import { useAssistant } from "@assistant-ui/react"
import { Button } from "@/components/ui/button"
import { 
  Send, 
  Sparkles, 
  FileText, 
  Zap, 
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface EmailComposerProps {
  onSend?: (email: any) => void
  replyTo?: any
  mode?: 'compose' | 'reply' | 'forward'
}

export default function EmailComposer({ onSend, replyTo, mode = 'compose' }: EmailComposerProps) {
  const [to, setTo] = useState(replyTo?.from || '')
  const [subject, setSubject] = useState(
    mode === 'reply' ? `Re: ${replyTo?.subject}` : 
    mode === 'forward' ? `Fwd: ${replyTo?.subject}` : ''
  )
  const [body, setBody] = useState('')
  const [bulletPoints, setBulletPoints] = useState<string[]>([])
  const [tone, setTone] = useState<'formal' | 'casual' | 'friendly' | 'professional'>('professional')
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  
  const assistant = useAssistant()

  const generateFromBullets = useCallback(async () => {
    if (bulletPoints.length === 0) return
    
    setIsGenerating(true)
    try {
      await assistant.append({
        role: "user",
        content: `Compose an email to ${to} with these points: ${bulletPoints.join(', ')}. Use a ${tone} tone.`
      })
      
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
      await assistant.append({
        role: "user",
        content: `Improve this email draft for clarity and ${tone} tone: "${body}"`
      })
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
      await assistant.append({
        role: "user",
        content: `Generate a ${tone} reply to this email: "${replyTo.body}"`
      })
    } catch (error) {
      console.error('Failed to generate reply:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [replyTo, tone, assistant])

  const handleSend = useCallback(async () => {
    const email = {
      to,
      subject,
      body,
      tone,
      timestamp: new Date().toISOString()
    }
    
    try {
      await assistant.append({
        role: "user",
        content: `Send this email - To: ${to}, Subject: ${subject}, Body: ${body}`
      })
      
      onSend?.(email)
      
      // Reset form
      setTo('')
      setSubject('')
      setBody('')
      setBulletPoints([])
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }, [to, subject, body, tone, assistant, onSend])

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">
          {mode === 'reply' ? 'Reply to Email' : 
           mode === 'forward' ? 'Forward Email' : 
           'Compose New Email'}
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Recipients */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700"
            placeholder="recipient@example.com"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700"
            placeholder="Email subject"
          />
        </div>

        {/* Tone Selector */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tone</label>
          <div className="mt-1 flex gap-2">
            {(['formal', 'casual', 'friendly', 'professional'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1 rounded-md text-sm ${
                  tone === t 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* AI Actions */}
        <div className="flex gap-2 flex-wrap">
          {mode === 'reply' && (
            <Button
              onClick={generateReply}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Generate Reply
            </Button>
          )}
          
          <Button
            onClick={() => {
              const point = prompt('Add a bullet point:')
              if (point) setBulletPoints([...bulletPoints, point])
            }}
            variant="outline"
            size="sm"
          >
            <FileText className="w-4 h-4 mr-1" />
            Add Bullet Point
          </Button>
          
          {bulletPoints.length > 0 && (
            <Button
              onClick={generateFromBullets}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-1" />
              Generate from Bullets
            </Button>
          )}
          
          {body && (
            <Button
              onClick={improveEmail}
              disabled={isGenerating}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Improve Draft
            </Button>
          )}
        </div>

        {/* Bullet Points Display */}
        {bulletPoints.length > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm font-medium mb-2">Bullet Points:</p>
            <ul className="text-sm space-y-1">
              {bulletPoints.map((point, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Email Body */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 w-full h-64 px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700"
            placeholder="Type your message here..."
          />
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
            <p className="text-sm font-medium mb-2 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              AI Suggestions:
            </p>
            <ul className="text-sm space-y-1">
              {suggestions.map((suggestion, i) => (
                <li key={i} className="cursor-pointer hover:underline" onClick={() => setBody(body + '\n\n' + suggestion)}>
                  • {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t flex justify-between">
        <Button variant="outline">Save Draft</Button>
        <div className="flex gap-2">
          <Button variant="outline">Cancel</Button>
          <Button 
            onClick={handleSend}
            disabled={!to || !subject || !body}
          >
            <Send className="w-4 h-4 mr-1" />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}