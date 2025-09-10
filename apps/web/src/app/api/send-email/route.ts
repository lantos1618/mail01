import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/services/email-universal'
import { z } from 'zod'

const SendEmailSchema = z.object({
  to: z.string().email(),
  from: z.string().email().default('agent@lambda.run'),
  subject: z.string(),
  content: z.string().optional(),
  text: z.string().optional(),
  html: z.string().optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validated = SendEmailSchema.parse(body)
    
    // If content is provided but not text, use content as text
    if (validated.content && !validated.text) {
      validated.text = validated.content
    }
    
    // Ensure text is always provided
    if (!validated.text) {
      validated.text = validated.html || ''
    }
    
    // Use universal email service to send the email
    const result = await sendEmail({
      to: validated.to,
      from: validated.from,
      subject: validated.subject,
      text: validated.text,
      html: validated.html,
      cc: validated.cc?.join(', '),
      bcc: validated.bcc?.join(', ')
    })
    
    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      provider: result.provider,
      message: `Email sent successfully via ${result.provider}`,
      savedEmail: result.savedEmail
    })
  } catch (error) {
    console.error('Send email error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email data',
          details: error.errors,
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}