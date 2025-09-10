'use client'

import { useState, useEffect } from 'react'
import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Mail, Send, Inbox, Archive, Trash2, Star, 
  Bot, Sparkles, Search, Plus, RefreshCw
} from 'lucide-react'

interface Email {
  id: string
  from: string
  to: string
  subject: string
  content: string
  timestamp: string
  folder: 'inbox' | 'sent' | 'drafts' | 'archived'
  priority?: 'high' | 'medium' | 'low'
  aiSummary?: string
}

export default function Mail01Simple() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'drafts' | 'archived'>('inbox')
  const [composeMode, setComposeMode] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Compose state
  const [composeTo, setComposeTo] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeContent, setComposeContent] = useState('')
  
  // AI Assistant Runtime
  const runtime = useLocalRuntime({} as any)

  // Initialize with sample emails
  useEffect(() => {
    const sampleEmails: Email[] = [
      {
        id: '1',
        from: 'team@company.com',
        to: 'agent@lambda.run',
        subject: 'Project Update - Q4 2025',
        content: 'The project is progressing well. We have completed the initial phase and are moving into testing.',
        timestamp: new Date().toISOString(),
        folder: 'inbox',
        priority: 'high',
        aiSummary: 'Project on track, moving to testing phase'
      },
      {
        id: '2',
        from: 'client@example.com',
        to: 'agent@lambda.run',
        subject: 'Meeting Tomorrow',
        content: 'Can we reschedule our meeting to 3 PM instead of 2 PM?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        folder: 'inbox',
        priority: 'medium',
        aiSummary: 'Meeting reschedule request: 2PM → 3PM'
      },
      {
        id: '3',
        from: 'agent@lambda.run',
        to: 'team@company.com',
        subject: 'Re: Project Update',
        content: 'Thanks for the update. Looking forward to the testing results.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        folder: 'sent',
        priority: 'low'
      }
    ]
    setEmails(sampleEmails)
  }, [])

  const sendEmail = async () => {
    if (!composeTo || !composeSubject || !composeContent) {
      alert('Please fill in all fields')
      return
    }

    setIsProcessing(true)
    
    try {
      // Call Gmail API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          content: composeContent,
          from: 'agent@lambda.run'
        })
      })

      if (response.ok) {
        const newEmail: Email = {
          id: Date.now().toString(),
          from: 'agent@lambda.run',
          to: composeTo,
          subject: composeSubject,
          content: composeContent,
          timestamp: new Date().toISOString(),
          folder: 'sent'
        }
        
        setEmails([...emails, newEmail])
        setComposeMode(false)
        setComposeTo('')
        setComposeSubject('')
        setComposeContent('')
      }
    } catch (error) {
      console.error('Failed to send email:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const enhanceWithAI = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Enhance this email: Subject: ${composeSubject}, Content: ${composeContent}`
          }]
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Update compose content with AI enhancement
        if (data.enhanced) {
          setComposeContent(data.enhanced)
        }
      }
    } catch (error) {
      console.error('AI enhancement failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredEmails = emails.filter(email => email.folder === selectedFolder)

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r">
          <div className="p-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Mail className="w-6 h-6" />
              Mail-01
            </h1>
            <p className="text-sm text-gray-500 mt-1">AI-Powered Email</p>
          </div>
          
          <div className="p-4">
            <Button 
              className="w-full mb-4"
              onClick={() => {
                setComposeMode(true)
                setSelectedEmail(null)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Compose
            </Button>
            
            <div className="space-y-2">
              <Button
                variant={selectedFolder === 'inbox' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedFolder('inbox')}
              >
                <Inbox className="w-4 h-4 mr-2" />
                Inbox
                <Badge className="ml-auto">{emails.filter(e => e.folder === 'inbox').length}</Badge>
              </Button>
              
              <Button
                variant={selectedFolder === 'sent' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedFolder('sent')}
              >
                <Send className="w-4 h-4 mr-2" />
                Sent
                <Badge className="ml-auto">{emails.filter(e => e.folder === 'sent').length}</Badge>
              </Button>
              
              <Button
                variant={selectedFolder === 'drafts' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedFolder('drafts')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Drafts
                <Badge className="ml-auto">{emails.filter(e => e.folder === 'drafts').length}</Badge>
              </Button>
              
              <Button
                variant={selectedFolder === 'archived' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedFolder('archived')}
              >
                <Archive className="w-4 h-4 mr-2" />
                Archived
                <Badge className="ml-auto">{emails.filter(e => e.folder === 'archived').length}</Badge>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Email List */}
          <div className="w-96 bg-white border-r">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search emails..." 
                  className="flex-1"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[calc(100vh-80px)]">
              {filteredEmails.map(email => (
                <div
                  key={email.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    setSelectedEmail(email)
                    setComposeMode(false)
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{email.from}</p>
                      <p className="text-sm font-medium mt-1">{email.subject}</p>
                      {email.aiSummary && (
                        <div className="flex items-center gap-1 mt-2">
                          <Bot className="w-3 h-3 text-blue-500" />
                          <p className="text-xs text-gray-500">{email.aiSummary}</p>
                        </div>
                      )}
                    </div>
                    {email.priority === 'high' && (
                      <Badge variant="destructive">High</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(email.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Email View / Compose */}
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
                    <Button variant="outline" onClick={enhanceWithAI} disabled={isProcessing}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Enhance
                    </Button>
                  </div>
                </div>
              </div>
            ) : selectedEmail ? (
              <div className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>From: {selectedEmail.from}</span>
                    <span>To: {selectedEmail.to}</span>
                    <span>{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{selectedEmail.content}</p>
                </div>
                
                <div className="mt-6 flex items-center gap-2">
                  <Button size="sm">
                    <Send className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                  <Button size="sm" variant="outline">
                    <Send className="w-4 h-4 mr-2" />
                    Forward
                  </Button>
                  <Button size="sm" variant="outline">
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <Mail className="w-12 h-12 mx-auto mb-4" />
                  <p>Select an email to view</p>
                </div>
              </div>
            )}
          </div>

          {/* AI Assistant Panel */}
          <div className="w-80 bg-gray-50 border-l p-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">I can help you:</p>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Compose professional emails
                      </li>
                      <li className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Summarize long threads
                      </li>
                      <li className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Extract action items
                      </li>
                      <li className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        Suggest responses
                      </li>
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button 
                      className="w-full mb-2"
                      variant="outline"
                      size="sm"
                      disabled={!selectedEmail}
                    >
                      Summarize Email
                    </Button>
                    <Button 
                      className="w-full mb-2"
                      variant="outline"
                      size="sm"
                      disabled={!selectedEmail}
                    >
                      Generate Reply
                    </Button>
                    <Button 
                      className="w-full"
                      variant="outline"
                      size="sm"
                      disabled={!selectedEmail}
                    >
                      Extract Tasks
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AssistantRuntimeProvider>
  )
}