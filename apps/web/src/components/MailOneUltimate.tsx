'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  useAssistantTool
} from '@assistant-ui/react'
import { Thread, Composer } from '@assistant-ui/react-ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Users, 
  BarChart3, 
  Mail, 
  Send,
  Mic,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Archive,
  Trash2,
  Star,
  Filter,
  Settings,
  Bot,
  Workflow,
  Network,
  Activity
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRevolutionaryEmailRuntime, emailTools } from '@/lib/ai/assistant-runtime'

interface Email {
  id: string
  from: string
  to: string
  subject: string
  content: string
  timestamp: Date
  folder: 'inbox' | 'sent' | 'drafts' | 'archived'
  priority: 'high' | 'medium' | 'low'
  sentiment?: number
  urgency?: number
  quantumState?: any
  aiSummary?: string
  suggestedActions?: string[]
  thread?: string[]
}

interface SwarmResult {
  consensus: string
  confidence: number
  agents: any[]
  alternatives: string[]
}

export default function MailOneUltimate() {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [activeMode, setActiveMode] = useState<'quantum' | 'swarm' | 'hyper' | 'stream'>('quantum')
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiInsights, setAiInsights] = useState<any[]>([])
  const [automations, setAutomations] = useState<any[]>([])
  const [swarmResults, setSwarmResults] = useState<SwarmResult | null>(null)
  const [quantumAnalysis, setQuantumAnalysis] = useState<any>(null)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  
  const { 
    runtime, 
    processEmail, 
    swarmProcess, 
    predictActions,
    generateReplies,
    createAutomation 
  } = useRevolutionaryEmailRuntime()

  // Initialize with sample emails
  useEffect(() => {
    const sampleEmails: Email[] = [
      {
        id: '1',
        from: 'ceo@company.com',
        to: 'agent@lambda.run',
        subject: 'Q4 Strategy Review - Urgent',
        content: 'We need to review our Q4 strategy immediately. The market conditions have changed significantly.',
        timestamp: new Date(),
        folder: 'inbox',
        priority: 'high',
        sentiment: 0.3,
        urgency: 0.9
      },
      {
        id: '2',
        from: 'team@project.com',
        to: 'agent@lambda.run',
        subject: 'Project Update: Milestone Achieved',
        content: 'Great news! We have successfully completed the first milestone ahead of schedule.',
        timestamp: new Date(Date.now() - 3600000),
        folder: 'inbox',
        priority: 'medium',
        sentiment: 0.8,
        urgency: 0.4
      },
      {
        id: '3',
        from: 'client@business.com',
        to: 'agent@lambda.run',
        subject: 'Meeting Request: Product Demo',
        content: 'Would love to schedule a demo of your new AI features. Available next week?',
        timestamp: new Date(Date.now() - 7200000),
        folder: 'inbox',
        priority: 'high',
        sentiment: 0.7,
        urgency: 0.6
      }
    ]
    setEmails(sampleEmails)
  }, [])

  const handleQuantumProcess = useCallback(async (email: Email) => {
    setIsProcessing(true)
    try {
      const quantum = await processEmail(email)
      setQuantumAnalysis(quantum)
      
      // Generate AI insights
      const insights = [
        `Quantum state: ${quantum.quantumState}`,
        `Emotional resonance: ${(quantum.dimensions.emotionalTone * 100).toFixed(0)}%`,
        `Action probability: ${(quantum.dimensions.actionability * 100).toFixed(0)}%`,
        `Complexity index: ${(quantum.dimensions.complexity * 100).toFixed(0)}%`
      ]
      setAiInsights(insights)
      
      // Generate suggested actions
      const actions = await predictActions({ currentEmail: email })
      setSelectedEmail({
        ...email,
        quantumState: quantum,
        suggestedActions: actions
      })
    } catch (error) {
      console.error('Quantum processing failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [processEmail, predictActions])

  const handleSwarmProcess = useCallback(async (task: string) => {
    setIsProcessing(true)
    try {
      const result = await swarmProcess(task, { emails, selectedEmail })
      setSwarmResults({
        consensus: result.consensus || 'Swarm processing complete',
        confidence: result.confidence || 0.85,
        agents: result.agents || [],
        alternatives: result.alternatives || []
      })
    } catch (error) {
      console.error('Swarm processing failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [swarmProcess, emails, selectedEmail])

  const handleCreateAutomation = useCallback(async () => {
    const automation = await createAutomation(
      'High priority email received',
      ['Analyze sentiment', 'Generate reply', 'Schedule follow-up']
    )
    setAutomations([...automations, automation])
  }, [createAutomation, automations])

  const handleVoiceCommand = useCallback(async () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser')
      return
    }
    
    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    
    recognition.onresult = async (event: any) => {
      const command = event.results[0][0].transcript
      console.log('Voice command:', command)
      
      // Process voice command with AI
      await handleSwarmProcess(`Voice command: ${command}`)
    }
    
    recognition.start()
  }, [handleSwarmProcess])

  const assistantRuntime = useLocalRuntime({
    run: async ({ messages }) => {
      // Process messages with quantum intelligence
      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.role === 'user') {
        // Process with swarm intelligence
        const messageText = lastMessage.content
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join(' ')
        await handleSwarmProcess(messageText)
        
        return {
          content: [{
            type: 'text',
            text: swarmResults?.consensus || 'I am processing your request with quantum intelligence. How else can I help you today?'
          }]
        }
      }
      
      return {
        content: [{
          type: 'text',
          text: 'Welcome to Mail-01 Ultimate! I am your hyper-intelligent email assistant with quantum processing, swarm intelligence, and autonomous capabilities. How can I revolutionize your email experience today?'
        }]
      }
    }
  })

  return (
    <AssistantRuntimeProvider runtime={assistantRuntime}>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Sidebar */}
        <div className="w-80 border-r bg-white dark:bg-gray-900 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-8 h-8 text-purple-600 animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Mail-01 Ultimate
              </h1>
            </div>
            
            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={activeMode === 'quantum' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveMode('quantum')}
                className="flex items-center gap-1"
              >
                <Sparkles className="w-4 h-4" />
                Quantum
              </Button>
              <Button
                variant={activeMode === 'swarm' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveMode('swarm')}
                className="flex items-center gap-1"
              >
                <Users className="w-4 h-4" />
                Swarm
              </Button>
              <Button
                variant={activeMode === 'hyper' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveMode('hyper')}
                className="flex items-center gap-1"
              >
                <Zap className="w-4 h-4" />
                Hyper
              </Button>
              <Button
                variant={activeMode === 'stream' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveMode('stream')}
                className="flex items-center gap-1"
              >
                <Activity className="w-4 h-4" />
                Stream
              </Button>
            </div>
          </div>

          {/* Email List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {emails.map((email) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedEmail(email)}
                  className={`p-3 rounded-lg cursor-pointer mb-2 transition-all ${
                    selectedEmail?.id === email.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 border'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-sm truncate">{email.from}</span>
                    <Badge 
                      variant={email.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {email.priority}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium mb-1">{email.subject}</div>
                  <div className="text-xs text-gray-500 truncate">{email.content}</div>
                  <div className="flex items-center gap-2 mt-2">
                    {email.sentiment && (
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          email.sentiment > 0.6 ? 'bg-green-500' : 
                          email.sentiment > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-xs">Sentiment</span>
                      </div>
                    )}
                    {email.urgency && email.urgency > 0.7 && (
                      <AlertCircle className="w-3 h-3 text-orange-500" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          {/* AI Insights Panel */}
          <div className="p-4 border-t bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-sm">AI Insights</span>
            </div>
            <div className="space-y-1">
              {aiInsights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-xs text-gray-600 dark:text-gray-400"
                >
                  • {insight}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-white dark:bg-gray-900 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleVoiceCommand}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Mic className="w-4 h-4" />
                Voice Command
              </Button>
              <Button
                onClick={handleCreateAutomation}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Workflow className="w-4 h-4" />
                Create Automation
              </Button>
              <Button
                onClick={() => selectedEmail && handleQuantumProcess(selectedEmail)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={!selectedEmail || isProcessing}
              >
                <Sparkles className="w-4 h-4" />
                Quantum Analyze
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {isProcessing && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600" />
                  <span className="text-sm text-gray-500">Processing...</span>
                </div>
              )}
              <Badge variant="outline" className="animate-pulse">
                {activeMode.toUpperCase()} MODE
              </Badge>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-auto">
            <Tabs defaultValue="assistant" className="h-full">
              <TabsList className="mb-4">
                <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
                <TabsTrigger value="email">Email View</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="automations">Automations</TabsTrigger>
              </TabsList>

              <TabsContent value="assistant" className="h-[calc(100%-3rem)]">
                <Card className="h-full border-2 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-0 h-full flex flex-col">
                    <ScrollArea className="flex-1 p-4">
                      <Thread />
                    </ScrollArea>
                    <div className="p-4 border-t">
                      <Composer />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                {selectedEmail ? (
                  <Card className="border-2 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{selectedEmail.subject}</span>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost">
                            <Star className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{selectedEmail.from}</div>
                            <div className="text-sm text-gray-500">To: {selectedEmail.to}</div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {selectedEmail.timestamp.toLocaleString()}
                          </div>
                        </div>
                        <Separator />
                        <div className="prose dark:prose-invert max-w-none">
                          {selectedEmail.content}
                        </div>
                        
                        {selectedEmail.quantumState && (
                          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                            <CardHeader>
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Quantum Analysis
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-2 gap-4">
                                {Object.entries(selectedEmail.quantumState.dimensions).map(([key, value]) => (
                                  <div key={key} className="flex items-center justify-between">
                                    <span className="text-sm capitalize">{key}:</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-20 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                          style={{ width: `${(value as number) * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-sm font-semibold">
                                        {((value as number) * 100).toFixed(0)}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {selectedEmail.suggestedActions && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-sm flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                Suggested Actions
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {selectedEmail.suggestedActions.map((action, i) => (
                                  <Button key={i} variant="outline" className="w-full justify-start">
                                    {action}
                                  </Button>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Select an email to view
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Email Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-purple-600">{emails.length}</div>
                          <div className="text-sm text-gray-500">Total Emails</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-green-600">
                            {emails.filter(e => e.priority === 'high').length}
                          </div>
                          <div className="text-sm text-gray-500">High Priority</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-blue-600">
                            {automations.length}
                          </div>
                          <div className="text-sm text-gray-500">Active Automations</div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="automations">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Workflow className="w-5 h-5" />
                      Email Automations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {automations.map((automation, i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold">Automation #{i + 1}</span>
                              <Badge variant={automation.active ? 'default' : 'secondary'}>
                                {automation.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              Trigger: {automation.trigger}
                            </div>
                            <div className="text-sm">
                              Actions:
                              <ul className="list-disc list-inside mt-1">
                                {automation.actions.map((action: string, j: number) => (
                                  <li key={j}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Swarm Results Panel */}
          {swarmResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border-t bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">Swarm Intelligence Results</span>
                <Badge variant="outline">
                  Confidence: {(swarmResults.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
              <div className="text-sm mb-2">{swarmResults.consensus}</div>
              {swarmResults.alternatives.length > 0 && (
                <div className="text-xs text-gray-500">
                  Alternative suggestions: {swarmResults.alternatives.join(', ')}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </AssistantRuntimeProvider>
  )
}