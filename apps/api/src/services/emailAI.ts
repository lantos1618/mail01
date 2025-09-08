import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

interface EmailAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent'
  priority: 'high' | 'medium' | 'low'
  category: string
  suggestedActions: string[]
  keyPoints: string[]
  estimatedResponseTime?: string
}

interface EmailDraft {
  subject: string
  body: string
  tone: 'formal' | 'casual' | 'friendly' | 'professional'
  suggestions?: string[]
}

export async function analyzeEmail(content: string): Promise<EmailAnalysis> {
  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Analyze this email and provide insights:
      
Email content:
${content}

Provide analysis in JSON format with:
- sentiment: positive/neutral/negative/urgent
- priority: high/medium/low
- category: (e.g., Business, Personal, Support, Marketing)
- suggestedActions: array of recommended actions
- keyPoints: array of key points from the email
- estimatedResponseTime: if action needed`,
      system: "You are an email analysis AI. Provide concise, actionable insights."
    })
    
    return JSON.parse(text)
  } catch (error) {
    console.error('Email analysis failed:', error)
    return {
      sentiment: 'neutral',
      priority: 'medium',
      category: 'General',
      suggestedActions: [],
      keyPoints: []
    }
  }
}

export async function generateSmartReply(
  originalEmail: string,
  context?: string,
  tone: 'formal' | 'casual' | 'friendly' | 'professional' = 'professional'
): Promise<EmailDraft> {
  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Generate a reply to this email:
      
Original email:
${originalEmail}

${context ? `Context: ${context}` : ''}

Generate a ${tone} reply that:
- Addresses all points raised
- Is concise and clear
- Maintains appropriate tone
- Includes any necessary follow-up questions

Return as JSON with:
- subject: Reply subject line
- body: Email body
- suggestions: Array of alternative phrases or additions`,
      system: "You are an expert email composer. Create professional, effective responses."
    })
    
    return JSON.parse(text)
  } catch (error) {
    console.error('Smart reply generation failed:', error)
    return {
      subject: 'Re: Your message',
      body: 'Thank you for your email. I will review and respond shortly.',
      tone: 'professional'
    }
  }
}

export async function summarizeEmailThread(emails: any[]): Promise<{
  summary: string
  participants: string[]
  keyDecisions: string[]
  actionItems: string[]
  timeline: string
}> {
  const emailTexts = emails.map(e => `From: ${e.from}\nDate: ${e.date}\n${e.content}`).join('\n---\n')
  
  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Summarize this email thread:
      
${emailTexts}

Provide a comprehensive summary including:
- Overall summary (2-3 sentences)
- List of participants
- Key decisions made
- Action items identified
- Timeline of discussion`,
      system: "You are an expert at summarizing email conversations. Be concise and highlight key information."
    })
    
    return JSON.parse(text)
  } catch (error) {
    console.error('Thread summarization failed:', error)
    return {
      summary: 'Unable to generate summary',
      participants: [],
      keyDecisions: [],
      actionItems: [],
      timeline: ''
    }
  }
}

export async function extractTasksFromEmails(emails: any[]): Promise<{
  tasks: Array<{
    task: string
    from: string
    dueDate?: string
    priority: 'high' | 'medium' | 'low'
  }>
  meetings: Array<{
    title: string
    date: string
    time?: string
    attendees: string[]
  }>
}> {
  const emailTexts = emails.map(e => `From: ${e.from}\nDate: ${e.date}\n${e.content}`).join('\n---\n')
  
  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Extract tasks and meetings from these emails:
      
${emailTexts}

Identify and extract:
1. Tasks/action items with who requested them and any due dates
2. Meetings mentioned with dates, times, and attendees

Return as JSON with:
- tasks: array of task objects
- meetings: array of meeting objects`,
      system: "You are an expert at extracting actionable items from emails."
    })
    
    return JSON.parse(text)
  } catch (error) {
    console.error('Task extraction failed:', error)
    return {
      tasks: [],
      meetings: []
    }
  }
}