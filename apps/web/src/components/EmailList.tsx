"use client"

import { useState, useEffect } from "react"
import { Mail, Star, Archive, Trash2, Send, Circle, AlertCircle, TrendingUp, Hash } from "lucide-react"
import { getMockEmails } from "@/lib/email/mock-data"
import { emailIntelligence, EmailMessage } from "@/lib/ai/email-intelligence"
import { Badge } from "@/components/ui/badge"

interface EmailListProps {
  onSelectEmail: (id: string) => void
  folder?: 'received' | 'sent' | 'drafts' | 'archived'
}

const priorityColors = {
  urgent: 'text-red-500 bg-red-50 dark:bg-red-950',
  high: 'text-orange-500 bg-orange-50 dark:bg-orange-950',
  normal: 'text-blue-500 bg-blue-50 dark:bg-blue-950',
  low: 'text-gray-500 bg-gray-50 dark:bg-gray-950',
}

const categoryIcons = {
  work: '💼',
  personal: '👤',
  newsletter: '📰',
  promotional: '🏷️',
  social: '👥',
  finance: '💰',
  travel: '✈️',
  support: '🎫',
  other: '📧',
}

export default function EmailList({ onSelectEmail, folder = 'received' }: EmailListProps) {
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzedEmails, setAnalyzedEmails] = useState<Map<string, any>>(new Map())

  useEffect(() => {
    const fetchEmails = async () => {
      setLoading(true)
      try {
        const mockEmails = getMockEmails(folder)
        setEmails(mockEmails)
        
        // Analyze emails with AI
        const analyzed = new Map()
        for (const email of mockEmails) {
          const analysis = await emailIntelligence.analyzeEmail(email)
          analyzed.set(email.id, analysis)
        }
        setAnalyzedEmails(analyzed)
      } catch (error) {
        console.error('Failed to fetch emails:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchEmails()
  }, [folder])

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-pulse">Analyzing emails with AI...</div>
          </div>
        )}
        {!loading && emails.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No emails in {folder}
          </div>
        )}
        {emails.map((email) => {
          const analysis = analyzedEmails.get(email.id)
          return (
            <button
              key={email.id}
              onClick={() => onSelectEmail(email.id)}
              className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border-b border-gray-100 dark:border-gray-800 text-left group"
            >
              <div className="flex items-start gap-3">
                {!email.isRead && (
                  <Circle className="w-2 h-2 mt-2 fill-blue-500 text-blue-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {analysis && (
                      <span className="text-lg">{categoryIcons[analysis.category as keyof typeof categoryIcons]}</span>
                    )}
                    <span className={`text-sm truncate ${!email.isRead ? "font-semibold text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"}`}>
                      {email.from.split('@')[0]}
                    </span>
                    {email.isStarred && <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />}
                    {analysis?.requiresAction && (
                      <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                        Action
                      </Badge>
                    )}
                    {analysis?.meetingDetected && (
                      <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                        Meeting
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm truncate ${!email.isRead ? "font-medium text-gray-800 dark:text-gray-200" : "text-gray-600 dark:text-gray-400"}`}>
                    {email.subject}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-1">
                    {analysis?.summary || email.body.substring(0, 100)}
                  </p>
                  {analysis && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-1.5 py-0 h-5 ${priorityColors[analysis.priority as keyof typeof priorityColors]}`}
                      >
                        {analysis.priority}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs px-1.5 py-0 h-5"
                      >
                        {analysis.sentiment}
                      </Badge>
                      {analysis.estimatedResponseTime && (
                        <span className="text-xs text-gray-400">
                          ~{analysis.estimatedResponseTime}m reply
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs text-gray-400">{formatDate(email.timestamp)}</span>
                  {email.attachments && email.attachments.length > 0 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      📎 {email.attachments.length}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}