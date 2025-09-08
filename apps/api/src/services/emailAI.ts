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

export async function generateEmailFromBulletPoints(
  points: string[],
  recipient: string,
  context?: string,
  tone: 'formal' | 'casual' | 'friendly' | 'professional' = 'professional'
): Promise<EmailDraft> {
  try {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Create a complete email from these bullet points:
      
Recipient: ${recipient}
Tone: ${tone}
${context ? `Context: ${context}` : ''}

Key points to cover:
${points.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Create a natural, flowing email that:
- Incorporates all points seamlessly
- Uses appropriate greeting and closing
- Maintains consistent ${tone} tone
- Is concise but complete

Return as JSON with:
- subject: Compelling subject line
- body: Complete email body
- suggestions: Alternative phrasings`,
      system: "You are an expert email writer who creates clear, engaging emails from bullet points."
    })
    
    return JSON.parse(text)
  } catch (error) {
    console.error('Email generation from bullets failed:', error)
    return {
      subject: 'Important Message',
      body: points.join('\n\n'),
      tone: 'professional'
    }
  }
}

export async function detectEmailIntent(
  content: string
): Promise<{
  primaryIntent: string
  subIntents: string[]
  requiredActions: string[]
  urgency: 'immediate' | 'today' | 'this_week' | 'no_rush'
  emotionalTone: string
}> {
  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Analyze the intent and urgency of this email:
      
${content}

Determine:
1. Primary intent (request, information, complaint, etc.)
2. Sub-intents if any
3. Required actions from recipient
4. Urgency level
5. Emotional tone of sender

Return as structured JSON.`,
      system: "You are an expert at understanding email communication intent and urgency."
    })
    
    return JSON.parse(text)
  } catch (error) {
    console.error('Intent detection failed:', error)
    return {
      primaryIntent: 'general',
      subIntents: [],
      requiredActions: [],
      urgency: 'no_rush',
      emotionalTone: 'neutral'
    }
  }
}

export async function suggestEmailTemplates(
  scenario: string,
  previousEmails?: any[]
): Promise<{
  templates: Array<{
    name: string
    subject: string
    body: string
    useCase: string
  }>
}> {
  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: `Generate email templates for this scenario: ${scenario}
      
${previousEmails ? `Based on these previous emails:\n${JSON.stringify(previousEmails.slice(0, 3))}` : ''}

Create 3-4 reusable templates with:
- Template name
- Subject line template
- Body template with [placeholders]
- Use case description

Return as JSON.`,
      system: "You are an expert at creating reusable, professional email templates."
    })
    
    return JSON.parse(text)
  } catch (error) {
    console.error('Template suggestion failed:', error)
    return { templates: [] }
  }
}

export async function improveEmailDraft(
  draft: string,
  improvements: ('clarity' | 'tone' | 'grammar' | 'conciseness' | 'persuasiveness')[]
): Promise<{
  improved: string
  changes: string[]
  suggestions: string[]
}> {
  try {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: `Improve this email draft:
      
${draft}

Focus on improving: ${improvements.join(', ')}

Provide:
1. Improved version
2. List of changes made
3. Additional suggestions

Return as JSON.`,
      system: "You are an expert email editor focused on clarity and effectiveness."
    })
    
    return JSON.parse(text)
  } catch (error) {
    console.error('Email improvement failed:', error)
    return {
      improved: draft,
      changes: [],
      suggestions: []
    }
  }
}