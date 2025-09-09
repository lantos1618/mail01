import { NextRequest } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

export async function POST(request: NextRequest) {
  try {
    const { prompt, context, mode = 'compose' } = await request.json()

    if (!prompt) {
      return new Response('Prompt required', { status: 400 })
    }

    let systemPrompt = ''
    
    switch (mode) {
      case 'compose':
        systemPrompt = `You are an expert email writer. Generate professional, clear, and engaging emails based on the user's requirements. Consider tone, audience, and purpose.`
        break
      
      case 'reply':
        systemPrompt = `You are an expert at crafting email replies. Generate contextually appropriate responses that address all points raised in the original email.`
        break
      
      case 'summarize':
        systemPrompt = `You are an expert at email summarization. Create concise, informative summaries that capture key points, action items, and decisions.`
        break
      
      case 'analyze':
        systemPrompt = `You are an expert email analyst. Provide deep insights into sentiment, urgency, intent, and recommended actions for emails.`
        break
      
      case 'brainstorm':
        systemPrompt = `You are a creative email strategist. Generate innovative ideas and approaches for email communication based on the context.`
        break
      
      default:
        systemPrompt = `You are a hyper-intelligent email assistant with quantum processing capabilities.`
    }

    const fullPrompt = context ? `${systemPrompt}\n\nContext: ${JSON.stringify(context)}\n\nUser request: ${prompt}` : `${systemPrompt}\n\n${prompt}`

    const result = await streamText({
      model: openai('gpt-4-turbo'),
      prompt: fullPrompt,
      temperature: mode === 'brainstorm' ? 0.9 : 0.7,
      maxTokens: 1000
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Email streaming error:', error)
    return new Response(
      JSON.stringify({ error: 'Streaming failed', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function GET(request: NextRequest) {
  return new Response(
    JSON.stringify({
      service: 'Email Streaming API',
      status: 'active',
      modes: ['compose', 'reply', 'summarize', 'analyze', 'brainstorm'],
      features: [
        'Real-time token streaming',
        'Multi-mode processing',
        'Context-aware generation',
        'Temperature adjustment',
        'GPT-4 Turbo powered'
      ]
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}