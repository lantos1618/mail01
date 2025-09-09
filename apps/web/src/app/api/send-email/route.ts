import { NextRequest, NextResponse } from 'next/server'
import { sendgrid } from '@/lib/email/sendgrid'
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
    
    // Use SendGrid to send the email
    const result = await sendgrid.sendEmail(validated)
    
    if (result.success) {
      // Save to sent folder (in production, this would save to database)
      const sentEmail = {
        ...validated,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
        folder: 'sent',
      }
      
      // For now, just log it
      console.log('Email sent successfully:', sentEmail)
      
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully',
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send email',
        },
        { status: 400 }
      )
    }
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