import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { emailIntelligence } from '@/lib/ai/email-intelligence'
import { gmail } from '@/lib/email/gmail'

export const runtime = 'edge'

const systemPrompt = `You are Mail-01 AI Assistant, an advanced email management AI powered by assistant-ui.

Your capabilities include:
1. **Email Composition**: Write professional emails from bullet points or brief descriptions
2. **Smart Replies**: Generate contextually appropriate responses
3. **Email Analysis**: Analyze sentiment, priority, and extract key information
4. **Tone Adjustment**: Adapt writing style (formal, casual, friendly, professional)
5. **Meeting Detection**: Identify and extract meeting details
6. **Action Items**: Extract tasks and to-dos from emails
7. **Summarization**: Create concise summaries of long emails or threads
8. **Email Categorization**: Classify emails by type and importance
9. **Relationship Insights**: Track communication patterns

When composing emails:
- Be clear and concise
- Match the requested tone
- Include proper greetings and closings
- Structure content logically
- Check for grammar and clarity

When analyzing emails:
- Identify key points and action items
- Assess urgency and priority
- Detect sentiment and tone
- Extract relevant dates and deadlines
- Suggest appropriate responses

Always be helpful, professional, and focused on improving email productivity.`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = await streamText({
      model: openai('gpt-4-turbo'),
      system: systemPrompt,
      messages,
      tools: {
        analyzeEmail: {
          description: 'Analyze an email for sentiment, priority, and key information',
          parameters: {
            emailContent: { type: 'string', description: 'The email content to analyze' },
          },
          execute: async ({ emailContent }) => {
            const mockEmail = {
              id: 'temp',
              from: 'user@example.com',
              to: ['recipient@example.com'],
              subject: 'Email Analysis',
              body: emailContent,
              timestamp: new Date(),
              isRead: true,
              isStarred: false,
              labels: [],
              threadId: 'temp-thread',
            }
            
            const analysis = await emailIntelligence.analyzeEmail(mockEmail)
            return analysis
          },
        },
        generateSmartReply: {
          description: 'Generate a smart reply to an email',
          parameters: {
            emailContent: { type: 'string', description: 'The email to reply to' },
            tone: { 
              type: 'string', 
              enum: ['formal', 'casual', 'friendly', 'professional', 'urgent'],
              description: 'The tone of the reply' 
            },
          },
          execute: async ({ emailContent, tone }) => {
            const mockEmail = {
              id: 'temp',
              from: 'sender@example.com',
              to: ['you@example.com'],
              subject: 'Re: Your Email',
              body: emailContent,
              timestamp: new Date(),
              isRead: true,
              isStarred: false,
              labels: [],
              threadId: 'temp-thread',
            }
            
            const reply = await emailIntelligence.generateSmartReply(mockEmail, tone as any)
            return { reply }
          },
        },
        improveEmailDraft: {
          description: 'Improve an email draft for clarity and effectiveness',
          parameters: {
            draft: { type: 'string', description: 'The draft to improve' },
            improvements: {
              type: 'array',
              items: { type: 'string' },
              description: 'Types of improvements: clarity, conciseness, tone',
            },
          },
          execute: async ({ draft, improvements }) => {
            const improved = await emailIntelligence.improveEmailDraft(draft, improvements)
            return { improved }
          },
        },
        extractActionItems: {
          description: 'Extract action items from an email',
          parameters: {
            emailContent: { type: 'string', description: 'The email content' },
          },
          execute: async ({ emailContent }) => {
            const items = await emailIntelligence.extractActionItems(emailContent)
            return { actionItems: items }
          },
        },
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Assistant API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}