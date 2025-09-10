"use client"

import { Reply, ReplyAll, Forward, Archive, Trash2, Star, MoreVertical, Mail, Sparkles, Clock, AlertCircle, Calendar, Users, FileText, CheckCircle } from "lucide-react"
import { useAssistantRuntime } from "@assistant-ui/react"
import { useState, useEffect } from "react"
import { getMockEmailById } from "@/lib/email/mock-data"
import { emailIntelligence, EmailMessage, EmailAnalysis } from "@/lib/ai/email-intelligence"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface EmailViewProps {
  emailId: string | null
  onReply?: () => void
}

const sentimentColors = {
  positive: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  negative: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  mixed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
}

const priorityIcons = {
  urgent: <AlertCircle className="w-4 h-4 text-red-500" />,
  high: <Clock className="w-4 h-4 text-orange-500" />,
  normal: <CheckCircle className="w-4 h-4 text-blue-500" />,
  low: <CheckCircle className="w-4 h-4 text-gray-400" />,
}

export default function EmailView({ emailId, onReply }: EmailViewProps) {
  const assistant = useAssistantRuntime()
  const [email, setEmail] = useState<EmailMessage | null>(null)
  const [analysis, setAnalysis] = useState<EmailAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  useEffect(() => {
    if (emailId) {
      const fetchEmail = async () => {
        const emailData = getMockEmailById(emailId)
        if (emailData) {
          setEmail(emailData)
          setIsAnalyzing(true)
          const emailAnalysis = await emailIntelligence.analyzeEmail(emailData)
          setAnalysis(emailAnalysis)
          setIsAnalyzing(false)
        }
      }
      fetchEmail()
    }
  }, [emailId])
  
  const analyzeEmail = async () => {
    if (!email) return
    
    // Using switchToNewThread for assistant-ui v0.11
    assistant.switchToNewThread()
  }
  
  const generateReply = async () => {
    if (!email) return
    
    // Using switchToNewThread for assistant-ui v0.11
    assistant.switchToNewThread()
    
    onReply?.()
  }
  if (!emailId || !email) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>Select an email to view</p>
        </div>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* AI Analysis Bar */}
      {analysis && !isAnalyzing && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {priorityIcons[analysis.priority]}
                <span className="text-sm font-medium capitalize">{analysis.priority} Priority</span>
              </div>
              <Badge className={sentimentColors[analysis.sentiment]}>
                {analysis.sentiment}
              </Badge>
              {analysis.requiresAction && (
                <Badge variant="destructive">Action Required</Badge>
              )}
              {analysis.meetingDetected && (
                <Badge variant="outline">
                  <Calendar className="w-3 h-3 mr-1" />
                  Meeting Detected
                </Badge>
              )}
            </div>
            {analysis.estimatedResponseTime && (
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                ~{analysis.estimatedResponseTime}m to reply
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Email Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">{email.subject}</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Archive className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <Star className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="font-medium">{email.from}</p>
            <p className="text-gray-500">to {email.to.join(', ')}</p>
            {email.cc && email.cc.length > 0 && (
              <p className="text-gray-500">cc {email.cc.join(', ')}</p>
            )}
          </div>
          <p className="text-gray-500">{formatDate(email.timestamp)}</p>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* AI Insights Panel */}
        {analysis && !isAnalyzing && (
          <div className="mb-6 space-y-4">
            {/* Summary Card */}
            <Card className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-850 border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                AI Summary
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{analysis.summary}</p>
            </Card>
            
            {/* Action Items */}
            {analysis.actionItems.length > 0 && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Action Items
                </h3>
                <ul className="space-y-1">
                  {analysis.actionItems.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            
            {/* Meeting Details */}
            {analysis.meetingDetected && analysis.meetingDetails && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  Meeting Details
                </h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  {analysis.meetingDetails.date && (
                    <p>Date: {analysis.meetingDetails.date}</p>
                  )}
                  {analysis.meetingDetails.time && (
                    <p>Time: {analysis.meetingDetails.time}</p>
                  )}
                </div>
              </Card>
            )}
            
            {/* Key People & Topics */}
            <div className="flex gap-4">
              {analysis.keyPeople.length > 0 && (
                <Card className="p-4 flex-1">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Key People
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {analysis.keyPeople.map((person, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {person}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
              
              {analysis.topics.length > 0 && (
                <Card className="p-4 flex-1">
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-500" />
                    Topics
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {analysis.topics.map((topic, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
        
        {/* Original Email Content */}
        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
          {email.body}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="border-t p-4">
        <div className="flex gap-2 justify-between">
          <div className="flex gap-2">
            <button 
              onClick={generateReply}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <ReplyAll className="w-4 h-4" />
              Reply All
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <Forward className="w-4 h-4" />
              Forward
            </button>
          </div>
          <button 
            onClick={analyzeEmail}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Sparkles className="w-4 h-4" />
            AI Analyze
          </button>
        </div>
      </div>
    </div>
  )
}