import { streamText, generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Streaming smart compose with real-time suggestions
export async function* streamSmartCompose(
  context: string,
  bulletPoints: string[],
  tone: 'formal' | 'casual' | 'friendly' | 'professional' = 'professional'
) {
  const prompt = `
    Write an email based on these bullet points:
    ${bulletPoints.map(point => `• ${point}`).join('\n')}
    
    Context: ${context}
    Tone: ${tone}
    
    Write a complete, well-structured email.
  `

  const result = await streamText({
    model: openai("gpt-4o"),
    prompt,
    temperature: 0.7,
  })

  for await (const chunk of result.textStream) {
    yield chunk
  }
}

// Advanced email analysis with multiple dimensions
export async function analyzeEmailAdvanced(content: string) {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt: `Analyze this email across multiple dimensions:
    
    Email: ${content}
    
    Provide analysis in JSON format:
    {
      "sentiment": "positive/negative/neutral",
      "urgency": "high/medium/low",
      "intent": "request/information/complaint/appreciation/other",
      "category": "work/personal/marketing/support/other",
      "keyPoints": ["point1", "point2"],
      "actionItems": ["action1", "action2"],
      "suggestedResponse": "brief suggestion",
      "priority": 1-10,
      "estimatedResponseTime": "minutes",
      "relationshipContext": "new/existing/important",
      "emotionalTone": "description",
      "professionalismScore": 1-10
    }`,
    temperature: 0.3,
  })

  return JSON.parse(text)
}

// Email thread intelligence
export async function analyzeEmailThread(emails: any[]) {
  const threadContext = emails.map(e => 
    `From: ${e.from}\nDate: ${e.date}\nContent: ${e.content}`
  ).join('\n---\n')

  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt: `Analyze this email thread and provide comprehensive insights:
    
    Thread:
    ${threadContext}
    
    Provide analysis in JSON format:
    {
      "summary": "concise thread summary",
      "participants": ["name1", "name2"],
      "mainTopic": "topic",
      "decisions": ["decision1", "decision2"],
      "openQuestions": ["question1", "question2"],
      "nextSteps": ["step1", "step2"],
      "sentiment": "overall sentiment",
      "threadLength": number,
      "responsePattern": "description of communication pattern",
      "urgency": "high/medium/low",
      "completionStatus": "ongoing/resolved/stalled"
    }`,
    temperature: 0.3,
  })

  return JSON.parse(text)
}

// Smart email templates based on context
export async function generateContextualTemplate(
  scenario: string,
  context?: string
) {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt: `Generate email templates for scenario: ${scenario}
    ${context ? `Context: ${context}` : ''}
    
    Provide 3 different templates in JSON format:
    {
      "templates": [
        {
          "name": "template name",
          "subject": "subject line",
          "body": "email body",
          "tone": "formal/casual/friendly",
          "useCase": "when to use this"
        }
      ]
    }`,
    temperature: 0.8,
  })

  return JSON.parse(text)
}

// Relationship intelligence from email history
export async function analyzeRelationships(emails: any[]) {
  const emailData = emails.map(e => ({
    from: e.from,
    to: e.to,
    date: e.timestamp,
    subject: e.subject
  }))

  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt: `Analyze email relationships and communication patterns:
    
    ${JSON.stringify(emailData, null, 2)}
    
    Provide relationship analysis in JSON format:
    {
      "topContacts": [
        {
          "email": "email@example.com",
          "name": "Contact Name",
          "frequency": "daily/weekly/monthly",
          "relationship": "colleague/client/friend",
          "lastContact": "date",
          "responseTime": "average hours",
          "sentiment": "positive/neutral/negative"
        }
      ],
      "communicationPatterns": {
        "peakHours": ["9am", "2pm"],
        "peakDays": ["Monday", "Tuesday"],
        "averageResponseTime": "hours",
        "initiatedVsReceived": "ratio"
      },
      "insights": ["insight1", "insight2"],
      "recommendations": ["recommendation1", "recommendation2"]
    }`,
    temperature: 0.4,
  })

  return JSON.parse(text)
}

// Email improvement with specific focus areas
export async function improveEmailWithFocus(
  draft: string,
  focusAreas: ('clarity' | 'persuasion' | 'brevity' | 'tone' | 'structure')[]
) {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt: `Improve this email draft focusing on: ${focusAreas.join(', ')}
    
    Original draft:
    ${draft}
    
    Provide improved version with explanations in JSON format:
    {
      "improvedDraft": "improved email text",
      "changes": [
        {
          "area": "focus area",
          "original": "original text",
          "improved": "improved text",
          "reason": "why this change"
        }
      ],
      "overallScore": {
        "before": 1-10,
        "after": 1-10
      },
      "tips": ["tip1", "tip2"]
    }`,
    temperature: 0.6,
  })

  return JSON.parse(text)
}

// Voice-to-email transcription enhancement
export async function enhanceVoiceTranscript(
  transcript: string,
  emailType: 'formal' | 'casual' | 'quick'
) {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt: `Convert this voice transcript into a well-structured ${emailType} email:
    
    Transcript: ${transcript}
    
    Rules:
    - Fix grammar and punctuation
    - Structure into paragraphs
    - Add appropriate greeting and closing
    - Maintain the speaker's intent
    - Make it sound natural and professional
    
    Return the formatted email.`,
    temperature: 0.5,
  })

  return text
}

// Email pattern learning
export async function learnWritingStyle(emails: any[]) {
  const userEmails = emails.filter(e => e.from === 'agent@lambda.run')
    .map(e => e.body)
    .slice(0, 10) // Last 10 emails

  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt: `Analyze these emails to learn the writing style:
    
    ${userEmails.join('\n---\n')}
    
    Extract writing patterns in JSON format:
    {
      "style": {
        "greeting": "common greeting",
        "closing": "common closing",
        "tone": "overall tone",
        "formalityLevel": 1-10,
        "sentenceLength": "short/medium/long",
        "vocabulary": "simple/moderate/complex"
      },
      "patterns": [
        "pattern1",
        "pattern2"
      ],
      "commonPhrases": ["phrase1", "phrase2"],
      "signature": "detected signature"
    }`,
    temperature: 0.3,
  })

  return JSON.parse(text)
}

// Smart scheduling suggestions
export async function suggestMeetingTimes(emailContent: string) {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    prompt: `Extract meeting context and suggest optimal times:
    
    Email: ${emailContent}
    
    Current time: ${new Date().toISOString()}
    
    Provide suggestions in JSON format:
    {
      "meetingContext": {
        "purpose": "meeting purpose",
        "duration": "estimated minutes",
        "urgency": "high/medium/low",
        "participants": number
      },
      "suggestedTimes": [
        {
          "date": "YYYY-MM-DD",
          "time": "HH:MM",
          "timezone": "timezone",
          "reason": "why this time is good"
        }
      ],
      "preparationNeeded": ["item1", "item2"],
      "agendaItems": ["item1", "item2"]
    }`,
    temperature: 0.4,
  })

  return JSON.parse(text)
}

// Batch email operations with AI
export async function batchProcessEmails(
  emails: any[],
  operation: 'categorize' | 'prioritize' | 'summarize'
) {
  const results = []
  
  for (const email of emails) {
    let result
    
    switch (operation) {
      case 'categorize':
        result = await analyzeEmailAdvanced(email.content)
        results.push({ ...email, category: result.category })
        break
      case 'prioritize':
        result = await analyzeEmailAdvanced(email.content)
        results.push({ ...email, priority: result.priority })
        break
      case 'summarize':
        const { text } = await generateText({
          model: openai("gpt-4o"),
          prompt: `Summarize this email in one sentence: ${email.content}`,
          temperature: 0.3,
        })
        results.push({ ...email, summary: text })
        break
    }
  }
  
  return results
}

// Export all enhanced functions
export const emailAIEnhanced = {
  streamSmartCompose,
  analyzeEmailAdvanced,
  analyzeEmailThread,
  generateContextualTemplate,
  analyzeRelationships,
  improveEmailWithFocus,
  enhanceVoiceTranscript,
  learnWritingStyle,
  suggestMeetingTimes,
  batchProcessEmails,
}