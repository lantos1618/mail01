'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  useAssistantTool,
  useAssistantRuntime,
  MessagePrimitive,
  ThreadPrimitive,
  ComposerPrimitive,
  BranchPickerPrimitive,
  ActionBarPrimitive
} from '@assistant-ui/react'
import { Thread, Composer } from '@assistant-ui/react-ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Mail, Send, Archive, Trash2, Star, Reply, ReplyAll, Forward,
  Search, Filter, Settings, Bot, Sparkles, Zap, Brain,
  Mic, MicOff, Volume2, VolumeX, Clock, AlertCircle,
  CheckCircle, Info, X, Plus, Edit, Save, Download,
  Upload, Paperclip, Calendar, Users, BarChart3
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { gmail } from '@/lib/email/gmail'
import { useRevolutionaryEmailRuntime } from '@/lib/ai/assistant-runtime'

interface Email {
  id: string
  from: string
  to: string | string[]
  subject: string
  content: string
  html?: string
  timestamp: string
  folder: 'inbox' | 'sent' | 'drafts' | 'archived'
  priority?: 'high' | 'medium' | 'low'
  labels?: string[]
  thread?: string[]
  attachments?: any[]
  aiAnalysis?: {
    sentiment: number
    urgency: number
    category: string
    summary: string
    suggestedActions: string[]
  }
}

export default function Mail01Enhanced() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'drafts' | 'archived'>('inbox')
  const [composeMode, setComposeMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [aiMode, setAiMode] = useState<'assistant' | 'compose' | 'analyze'>('assistant')
  const [isProcessing, setIsProcessing] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  
  // Compose state
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeContent, setComposeContent] = useState('')
  const [composeHtml, setComposeHtml] = useState('')
  
  // AI Runtime
  const { runtime, processEmail, swarmProcess, predictActions, generateReplies } = useRevolutionaryEmailRuntime()
  
  // Assistant-UI Runtime
  const assistantRuntime = useLocalRuntime({
    run: async ({ messages }) => {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.role === 'user') {
        // Process user message with AI
        const messageText = lastMessage.content
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join(' ')
        const response = await handleAIQuery(messageText)
        return {
          content: [{
            type: 'text',
            text: response || 'Processing your request...'
          }]
        }
      }
      
      return {
        content: [{
          type: 'text',
          text: 'Welcome to Mail-01! I can help you manage emails, compose messages, and analyze your inbox using advanced AI. How can I assist you today?'
        }]
      }
    }
  })

  // Load emails on mount
  useEffect(() => {
    loadEmails()
  }, [selectedFolder])

  const loadEmails = async () => {
    try {
      // For now, load sample emails
      // In production, this would fetch from Gmail API or local storage
      setEmails(generateSampleEmails())
    } catch (error) {
      console.error('Error loading emails:', error)
      setEmails(generateSampleEmails())
    }
  }

  const generateSampleEmails = (): Email[] => {
    return [
      {
        id: '1',
        from: 'ceo@company.com',
        to: 'agent@lambda.run',
        subject: 'Q4 Strategy Review - Urgent',
        content: 'We need to review our Q4 strategy immediately. The market conditions have changed.',
        timestamp: new Date().toISOString(),
        folder: 'inbox',
        priority: 'high',
        labels: ['Important', 'Strategy']
      },
      {
        id: '2',
        from: 'team@startup.com',
        to: 'agent@lambda.run',
        subject: 'Product Launch Update',
        content: 'Great news! Our product launch was successful. Here are the metrics...',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        folder: 'inbox',
        priority: 'medium',
        labels: ['Product', 'Update']
      },
      {
        id: '3',
        from: 'agent@lambda.run',
        to: 'client@business.com',
        subject: 'Re: Project Proposal',
        content: 'Thank you for your proposal. We have reviewed it and have some feedback...',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        folder: 'sent',
        priority: 'medium'
      }
    ]
  }

  const handleAIQuery = async (query: string): Promise<string> => {
    setIsProcessing(true)
    
    try {
      // Determine intent and process accordingly
      if (query.toLowerCase().includes('compose') || query.toLowerCase().includes('write')) {
        // AI-assisted composition
        const result = await swarmProcess(query, { emails, currentFolder: selectedFolder })
        setComposeMode(true)
        return `I'm helping you compose an email. ${result?.result || 'Please provide more details.'}`
      } else if (query.toLowerCase().includes('analyze') || query.toLowerCase().includes('summary')) {
        // Email analysis
        const analysis = await processEmail(selectedEmail || emails[0])
        return `Email analysis complete: ${JSON.stringify(analysis?.dimensions || {})}`
      } else {
        // General assistance
        const response = await swarmProcess(query, { emails, selectedEmail })
        return response?.result || 'I can help you with email management, composition, and analysis. What would you like to do?'
      }
    } catch (error) {
      console.error('AI processing error:', error)
      return 'I encountered an error processing your request. Please try again.'
    } finally {
      setIsProcessing(false)
    }
  }

  const sendEmail = async () => {
    setIsProcessing(true)
    
    try {
      // Send email via API route
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          text: composeContent,
          html: composeHtml || undefined
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Clear compose form
        setComposeTo('')
        setComposeSubject('')
        setComposeContent('')
        setComposeHtml('')
        setComposeMode(false)
        
        // Reload emails
        await loadEmails()
        
        alert('Email sent successfully!')
      } else {
        alert(`Failed to send email: ${result.error}`)
      }
    } catch (error) {
      console.error('Send error:', error)
      alert('Failed to send email')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVoiceInput = async () => {
    if (!voiceEnabled) {
      // Start voice recognition
      setVoiceEnabled(true)
      // Implementation would use Web Speech API
    } else {
      setVoiceEnabled(false)
    }
  }

  const filteredEmails = emails.filter(email => 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AssistantRuntimeProvider runtime={assistantRuntime}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-600" />
              Mail-01
            </h1>
            <p className="text-sm text-gray-500 mt-1">AI-Powered Email Client</p>
          </div>

          <Button 
            className="w-full mb-4" 
            onClick={() => setComposeMode(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Compose
          </Button>

          <nav className="space-y-2">
            {(['inbox', 'sent', 'drafts', 'archived'] as const).map(folder => (
              <Button
                key={folder}
                variant={selectedFolder === folder ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedFolder(folder)}
              >
                <Mail className="w-4 h-4 mr-2" />
                {folder.charAt(0).toUpperCase() + folder.slice(1)}
                {folder === 'inbox' && (
                  <Badge className="ml-auto" variant="secondary">
                    {emails.filter(e => e.folder === 'inbox').length}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>

          <Separator className="my-4" />

          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <Brain className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Sparkles className="w-4 h-4 mr-2" />
              Smart Compose
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Zap className="w-4 h-4 mr-2" />
              Automations
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleVoiceInput}
              >
                {voiceEnabled ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex">
            {/* Email List */}
            <div className="w-96 bg-white border-r border-gray-200">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                  {filteredEmails.map(email => (
                    <Card
                      key={email.id}
                      className={`cursor-pointer transition-colors ${
                        selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedEmail(email)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {email.from.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{email.from}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(email.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {email.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              High
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{email.subject}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {email.content}
                        </p>
                        {email.labels && (
                          <div className="flex gap-1 mt-2">
                            {email.labels.map(label => (
                              <Badge key={label} variant="outline" className="text-xs">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Email View / Compose / AI Assistant */}
            <div className="flex-1 bg-white">
              {composeMode ? (
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Compose Email</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">To</label>
                      <Input
                        value={composeTo}
                        onChange={(e) => setComposeTo(e.target.value)}
                        placeholder="recipient@example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Subject</label>
                      <Input
                        value={composeSubject}
                        onChange={(e) => setComposeSubject(e.target.value)}
                        placeholder="Email subject"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Message</label>
                      <Textarea
                        value={composeContent}
                        onChange={(e) => setComposeContent(e.target.value)}
                        placeholder="Type your message..."
                        rows={10}
                        className="resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button onClick={sendEmail} disabled={isProcessing}>
                        <Send className="w-4 h-4 mr-2" />
                        {isProcessing ? 'Sending...' : 'Send'}
                      </Button>
                      <Button variant="outline" onClick={() => setComposeMode(false)}>
                        Cancel
                      </Button>
                      <Button variant="outline">
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Enhance
                      </Button>
                      <Button variant="outline">
                        <Paperclip className="w-4 h-4 mr-2" />
                        Attach
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Tabs defaultValue="view" className="h-full">
                  <TabsList className="w-full justify-start rounded-none border-b">
                    <TabsTrigger value="view">Email</TabsTrigger>
                    <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  </TabsList>

                  <TabsContent value="view" className="p-6">
                    {selectedEmail ? (
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>From: {selectedEmail.from}</span>
                              <span>To: {Array.isArray(selectedEmail.to) ? selectedEmail.to.join(', ') : selectedEmail.to}</span>
                              <span>{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="icon">
                              <Reply className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <Forward className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <Archive className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <Separator className="mb-4" />
                        
                        <div className="prose max-w-none">
                          {selectedEmail.html ? (
                            <div dangerouslySetInnerHTML={{ __html: selectedEmail.html }} />
                          ) : (
                            <p className="whitespace-pre-wrap">{selectedEmail.content}</p>
                          )}
                        </div>

                        {selectedEmail.aiAnalysis && (
                          <Card className="mt-6">
                            <CardHeader>
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Brain className="w-4 h-4" />
                                AI Analysis
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm">
                                <div>Summary: {selectedEmail.aiAnalysis.summary}</div>
                                <div>Category: {selectedEmail.aiAnalysis.category}</div>
                                <div>Sentiment: {(selectedEmail.aiAnalysis.sentiment * 100).toFixed(0)}% positive</div>
                                <div>Urgency: {(selectedEmail.aiAnalysis.urgency * 100).toFixed(0)}%</div>
                                {selectedEmail.aiAnalysis.suggestedActions.length > 0 && (
                                  <div>
                                    <p className="font-medium">Suggested Actions:</p>
                                    <ul className="list-disc list-inside">
                                      {selectedEmail.aiAnalysis.suggestedActions.map((action, i) => (
                                        <li key={i}>{action}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                          <Mail className="w-12 h-12 mx-auto mb-4" />
                          <p>Select an email to view</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="assistant" className="h-full p-0">
                    <Thread />
                  </TabsContent>

                  <TabsContent value="analysis" className="p-6">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Email Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold">{emails.length}</p>
                              <p className="text-sm text-gray-600">Total Emails</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold">
                                {emails.filter(e => e.priority === 'high').length}
                              </p>
                              <p className="text-sm text-gray-600">High Priority</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold">
                                {emails.filter(e => e.folder === 'inbox').length}
                              </p>
                              <p className="text-sm text-gray-600">Unread</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>AI Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-sm">
                              <CheckCircle className="w-4 h-4 inline mr-2 text-green-500" />
                              3 emails require immediate attention
                            </p>
                            <p className="text-sm">
                              <Info className="w-4 h-4 inline mr-2 text-blue-500" />
                              5 emails can be auto-archived
                            </p>
                            <p className="text-sm">
                              <Clock className="w-4 h-4 inline mr-2 text-yellow-500" />
                              2 pending responses detected
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
    </AssistantRuntimeProvider>
  )
}